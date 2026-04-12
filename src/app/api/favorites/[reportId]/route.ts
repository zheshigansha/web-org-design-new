import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { ReportFavorite } from '@/lib/db/schema';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const db = getDb();

    // 检查是否已收藏
    const existing = db.prepare(
      'SELECT * FROM report_favorites WHERE report_id = ?'
    ).get(reportId) as ReportFavorite | undefined;

    if (existing) {
      return NextResponse.json({ error: '已收藏' }, { status: 409 });
    }

    const id = uuidv4();
    db.prepare(
      'INSERT INTO report_favorites (id, report_id) VALUES (?, ?)'
    ).run(id, reportId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to favorite report:', error);
    return NextResponse.json({ error: '收藏失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const db = getDb();

    const result = db.prepare(
      'DELETE FROM report_favorites WHERE report_id = ?'
    ).run(reportId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to unfavorite report:', error);
    return NextResponse.json({ error: '取消收藏失败' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const db = getDb();

    const favorite = db.prepare(
      'SELECT * FROM report_favorites WHERE report_id = ?'
    ).get(reportId) as ReportFavorite | undefined;

    return NextResponse.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Failed to check favorite:', error);
    return NextResponse.json({ error: '检查失败' }, { status: 500 });
  }
}
