import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { CategorySettings } from '@/lib/db/schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const db = getDb();

    const settings = db.prepare(`
      SELECT * FROM category_settings WHERE category_id = ?
    `).get(categoryId) as CategorySettings | undefined;

    if (!settings) {
      // 返回默认值
      return NextResponse.json({
        settings: {
          category_id: categoryId,
          heat_metric: 'composite',
          report_frequency: 'manual',
          report_time: '09:00',
          updated_at: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: '获取设置失败' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const db = getDb();
    const { heatMetric, reportFrequency, reportTime } = await request.json();

    const validHeatMetrics = ['likes', 'reads', 'interactions', 'composite'];
    const validFrequencies = ['daily', 'manual'];

    if (heatMetric && !validHeatMetrics.includes(heatMetric)) {
      return NextResponse.json({ error: '无效的热度指标' }, { status: 400 });
    }

    if (reportFrequency && !validFrequencies.includes(reportFrequency)) {
      return NextResponse.json({ error: '无效的报告频率' }, { status: 400 });
    }

    // 更新或插入设置
    db.prepare(`
      INSERT INTO category_settings (category_id, heat_metric, report_frequency, report_time, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(category_id) DO UPDATE SET
        heat_metric = COALESCE(excluded.heat_metric, heat_metric),
        report_frequency = COALESCE(excluded.report_frequency, report_frequency),
        report_time = COALESCE(excluded.report_time, report_time),
        updated_at = datetime('now')
    `).run(
      categoryId,
      heatMetric || 'composite',
      reportFrequency || 'manual',
      reportTime || '09:00'
    );

    const settings = db.prepare(`
      SELECT * FROM category_settings WHERE category_id = ?
    `).get(categoryId) as CategorySettings;

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: '更新设置失败' }, { status: 500 });
  }
}
