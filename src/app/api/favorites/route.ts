import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { ReportFavorite } from '@/lib/db/schema';

export async function GET() {
  try {
    const db = getDb();

    const favorites = db.prepare(
      'SELECT report_id FROM report_favorites'
    ).all() as ReportFavorite[];

    return NextResponse.json({
      favoritedIds: favorites.map(f => f.report_id)
    });
  } catch (error) {
    console.error('Failed to fetch favorites:', error);
    return NextResponse.json({ error: '获取收藏失败' }, { status: 500 });
  }
}
