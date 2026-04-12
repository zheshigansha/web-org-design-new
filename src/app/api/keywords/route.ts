import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { Keyword } from '@/lib/db/schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const db = getDb();
    let sql = 'SELECT * FROM keywords';
    const params: string[] = [];

    if (categoryId) {
      sql += ' WHERE category_id = ?';
      params.push(categoryId);
    }

    sql += ' ORDER BY created_at DESC';

    const keywords = db.prepare(sql).all(...params) as Keyword[];

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error('Failed to fetch keywords:', error);
    return NextResponse.json({ error: '获取关键词失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { categoryId, keyword, type = 'include' } = await request.json();

    if (!categoryId || !keyword) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO keywords (id, category_id, keyword, type) VALUES (?, ?, ?, ?)
    `).run(id, categoryId, keyword.trim(), type);

    const result = db.prepare('SELECT * FROM keywords WHERE id = ?').get(id) as Keyword;

    return NextResponse.json({ keyword: result });
  } catch (error) {
    console.error('Failed to create keyword:', error);
    return NextResponse.json({ error: '创建关键词失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少关键词ID' }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare('DELETE FROM keywords WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: '关键词不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete keyword:', error);
    return NextResponse.json({ error: '删除关键词失败' }, { status: 500 });
  }
}
