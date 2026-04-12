import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Topic } from '@/lib/db/schema';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const { status, direction, painPoint, growthPotential } = await request.json();

    const existing = db.prepare('SELECT * FROM topics WHERE id = ?').get(id) as Topic | undefined;

    if (!existing) {
      return NextResponse.json({ error: '选题不存在' }, { status: 404 });
    }

    // 更新状态
    if (status && ['pending', 'created', 'published'].includes(status)) {
      db.prepare(`
        UPDATE topics SET status = ?, updated_at = datetime('now') WHERE id = ?
      `).run(status, id);
    }

    // 更新内容
    if (direction || painPoint || growthPotential) {
      db.prepare(`
        UPDATE topics
        SET direction = COALESCE(?, direction),
            pain_point = COALESCE(?, pain_point),
            growth_potential = COALESCE(?, growth_potential),
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        direction || null,
        painPoint || null,
        growthPotential || null,
        id
      );
    }

    const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(id) as Topic;

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Failed to update topic:', error);
    return NextResponse.json({ error: '更新选题失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const result = db.prepare('DELETE FROM topics WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: '选题不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete topic:', error);
    return NextResponse.json({ error: '删除选题失败' }, { status: 500 });
  }
}
