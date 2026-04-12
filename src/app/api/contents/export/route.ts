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
    const format = searchParams.get('format') || 'json';

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

    if (format === 'csv') {
      const headers = ['标题', '平台', '作者', '点赞', '阅读', '互动', '热度分', '发布日期', '采集时间', '链接'];
      const rows = contents.map((c) => [
        c.title || '',
        c.platform === 'xiaohongshu' ? '小红书' : '公众号',
        c.author_name || '',
        c.likes,
        c.reads,
        c.interactions,
        c.heat_score.toFixed(2),
        c.published_at ? new Date(c.published_at).toLocaleDateString('zh-CN') : '',
        new Date(c.collected_at).toLocaleDateString('zh-CN'),
        c.content_url || '',
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return NextResponse.json({ content: '\ufeff' + csvContent, filename: `内容导出_${new Date().toISOString().split('T')[0]}.csv` });
    }

    return NextResponse.json({ contents, total: contents.length });
  } catch (error) {
    console.error('Failed to export contents:', error);
    return NextResponse.json({ error: '导出失败' }, { status: 500 });
  }
}
