import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { MonitoredAccount } from '@/lib/db/schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const platform = searchParams.get('platform');

    const db = getDb();
    let sql = 'SELECT * FROM monitored_accounts WHERE 1=1';
    const params: string[] = [];

    if (categoryId) {
      sql += ' AND category_id = ?';
      params.push(categoryId);
    }

    if (platform) {
      sql += ' AND platform = ?';
      params.push(platform);
    }

    sql += ' ORDER BY created_at DESC';

    const accounts = db.prepare(sql).all(...params) as MonitoredAccount[];

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return NextResponse.json({ error: '获取账号失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { categoryId, platform, accountId, accountName } = await request.json();

    if (!categoryId || !platform || !accountId || !accountName) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    if (!['xiaohongshu', 'wechat'].includes(platform)) {
      return NextResponse.json({ error: '无效的平台' }, { status: 400 });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO monitored_accounts (id, category_id, platform, account_id, account_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, categoryId, platform, accountId.trim(), accountName.trim());

    const result = db.prepare('SELECT * FROM monitored_accounts WHERE id = ?').get(id) as MonitoredAccount;

    return NextResponse.json({ account: result });
  } catch (error) {
    console.error('Failed to create account:', error);
    return NextResponse.json({ error: '创建账号失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少账号ID' }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare('DELETE FROM monitored_accounts WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: '账号不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete account:', error);
    return NextResponse.json({ error: '删除账号失败' }, { status: 500 });
  }
}
