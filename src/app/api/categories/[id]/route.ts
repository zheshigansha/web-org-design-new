import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Category } from '@/lib/db/schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | undefined;

    if (!category) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 });
    }

    const result = db.prepare(`
      UPDATE categories SET name = ?, updated_at = datetime('now') WHERE id = ?
    `).run(name.trim(), id);

    if (result.changes === 0) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category;

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Failed to update category:', error);
    return NextResponse.json({ error: '更新分类失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: '删除分类失败' }, { status: 500 });
  }
}
