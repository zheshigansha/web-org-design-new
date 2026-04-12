import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { ContentTemplate } from '@/lib/db/schema';

export async function GET() {
  try {
    const db = getDb();
    const templates = db.prepare(
      'SELECT * FROM content_templates ORDER BY created_at DESC'
    ).all() as ContentTemplate[];

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json({ error: '获取模板失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { name, content } = await request.json();

    if (!name || !content) {
      return NextResponse.json({ error: '名称和内容不能为空' }, { status: 400 });
    }

    const id = uuidv4();
    db.prepare(
      'INSERT INTO content_templates (id, name, content) VALUES (?, ?, ?)'
    ).run(id, name.trim(), content);

    const template = db.prepare('SELECT * FROM content_templates WHERE id = ?').get(id) as ContentTemplate;

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Failed to create template:', error);
    return NextResponse.json({ error: '创建模板失败' }, { status: 500 });
  }
}
