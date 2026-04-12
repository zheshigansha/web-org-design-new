import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { Topic } from '@/lib/db/schema';
import { dedupeTopics, type TopicSuggestion } from '@/lib/utils/dedupe';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');

    const db = getDb();
    let sql = 'SELECT * FROM topics WHERE 1=1';
    const params: string[] = [];

    if (categoryId) {
      sql += ' AND category_id = ?';
      params.push(categoryId);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const topics = db.prepare(sql).all(...params) as Topic[];

    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Failed to fetch topics:', error);
    return NextResponse.json({ error: '获取选题失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { categoryId, direction, painPoint, growthPotential, reportId, sourceContentIds } = await request.json();

    if (!categoryId || !direction) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 检查是否重复
    const existingTopics = db.prepare(`
      SELECT * FROM topics WHERE category_id = ? ORDER BY created_at DESC
    `).all(categoryId) as Topic[];

    const newTopicSuggestion: TopicSuggestion = {
      direction,
      pain_point: painPoint || '',
      growth_potential: growthPotential || ''
    };

    // 简单字符串去重
    const normalizedDirection = direction.toLowerCase().trim();
    const isDuplicate = existingTopics.some(t =>
      t.direction.toLowerCase().trim() === normalizedDirection
    );

    if (isDuplicate) {
      return NextResponse.json({
        error: '选题已存在',
        duplicate: true
      }, { status: 409 });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO topics (id, report_id, category_id, direction, pain_point, growth_potential, status, source_content_ids)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      reportId || null,
      categoryId,
      direction,
      painPoint || '',
      growthPotential || '',
      'pending',
      sourceContentIds ? JSON.stringify(sourceContentIds) : null
    );

    const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(id) as Topic;

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Failed to create topic:', error);
    return NextResponse.json({ error: '创建选题失败' }, { status: 500 });
  }
}
