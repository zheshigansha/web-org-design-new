import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Content } from '@/lib/db/schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const platform = searchParams.get('platform');
    const date = searchParams.get('date');
    const keyword = searchParams.get('keyword');
    const limit = searchParams.get('limit');

    const db = getDb();
    let sql = 'SELECT * FROM contents WHERE 1=1';
    const params: (string | undefined)[] = [];

    if (categoryId) {
      sql += ' AND category_id = ?';
      params.push(categoryId);
    }

    if (platform) {
      sql += ' AND platform = ?';
      params.push(platform);
    }

    if (date) {
      sql += ' AND DATE(collected_at) = ?';
      params.push(date);
    }

    if (keyword) {
      sql += ' AND (title LIKE ? OR summary LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY heat_score DESC, collected_at DESC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }

    const contents = db.prepare(sql).all(...params) as Content[];

    return NextResponse.json({ contents });
  } catch (error) {
    console.error('Failed to fetch contents:', error);
    return NextResponse.json({ error: '获取内容失败' }, { status: 500 });
  }
}
