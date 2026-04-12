import { NextResponse } from 'next/server';
import { getDb, initDefaultCategories } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { Category } from '@/lib/db/schema';

// 初始化数据库和默认分类
initDefaultCategories();

export async function GET() {
  try {
    const db = getDb();
    const categories = db.prepare(`
      SELECT * FROM categories ORDER BY "order" ASC
    `).all() as Category[];

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: '分类名称不能为空' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const maxOrder = db.prepare('SELECT MAX("order") as max FROM categories').get() as { max: number | null };
    const order = (maxOrder.max ?? -1) + 1;

    db.prepare(`
      INSERT INTO categories (id, name, "order") VALUES (?, ?, ?)
    `).run(id, name.trim(), order);

    // 创建默认设置
    db.prepare(`
      INSERT INTO category_settings (category_id, heat_metric, report_frequency) VALUES (?, ?, ?)
    `).run(id, 'composite', 'manual');

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category;

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json(
      { error: '创建分类失败' },
      { status: 500 }
    );
  }
}
