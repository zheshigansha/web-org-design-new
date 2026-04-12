import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST() {
  try {
    const db = getDb();

    // 计算90天前的日期
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const cutoffDate = ninetyDaysAgo.toISOString();

    // 删除过期内容
    const result = db.prepare(`
      DELETE FROM contents WHERE collected_at < ?
    `).run(cutoffDate);

    return NextResponse.json({
      success: true,
      deleted: result.changes,
      cutoffDate
    });
  } catch (error) {
    console.error('Failed to cleanup:', error);
    return NextResponse.json({ error: '清理失败' }, { status: 500 });
  }
}

// GET 用于手动触发清理（可选）
export async function GET() {
  return POST();
}
