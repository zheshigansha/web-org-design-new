import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { Content, Report, CategorySettings } from '@/lib/db/schema';
import { analyzeContents } from '@/lib/ai/openai';

const MIN_CONTENT_COUNT = 10;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const db = getDb();
    let sql = 'SELECT * FROM reports WHERE 1=1';
    const params: string[] = [];

    if (categoryId) {
      sql += ' AND category_id = ?';
      params.push(categoryId);
    }

    sql += ' ORDER BY created_at DESC';

    const reports = db.prepare(sql).all(...params) as Report[];

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json({ error: '获取报告失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { categoryId } = await request.json();

    if (!categoryId) {
      return NextResponse.json({ error: '缺少categoryId' }, { status: 400 });
    }

    // 获取分类设置
    const settings = db.prepare(`
      SELECT * FROM category_settings WHERE category_id = ?
    `).get(categoryId) as CategorySettings | undefined;

    const heatMetric = settings?.heat_metric || 'composite';

    // 获取内容
    const contents = db.prepare(`
      SELECT * FROM contents WHERE category_id = ? ORDER BY heat_score DESC
    `).all(categoryId) as Content[];

    // 冷启动保护
    if (contents.length < MIN_CONTENT_COUNT) {
      return NextResponse.json({
        success: false,
        isEmpty: true,
        error: `内容不足，无法生成报告。请先采集至少${MIN_CONTENT_COUNT}条内容。当前有 ${contents.length} 条。`,
        contentCount: contents.length,
        requiredCount: MIN_CONTENT_COUNT
      }, { status: 400 });
    }

    // 调用AI分析
    const result = await analyzeContents(contents, heatMetric);

    const id = uuidv4();
    const today = new Date().toISOString().split('T')[0];

    // 保存报告
    db.prepare(`
      INSERT INTO reports (id, category_id, report_date, top_contents, analysis, topics)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      categoryId,
      today,
      JSON.stringify(contents.slice(0, 10).map(c => c.id)),
      result.analysis,
      JSON.stringify(result.topics)
    );

    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(id) as Report;

    return NextResponse.json({
      success: true,
      report: {
        ...report,
        analysis: result.analysis,
        topics: result.topics
      }
    });
  } catch (error) {
    console.error('Failed to generate report:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '生成报告失败'
    }, { status: 500 });
  }
}
