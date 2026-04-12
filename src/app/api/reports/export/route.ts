import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Report } from '@/lib/db/schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');
    const format = searchParams.get('format') || 'markdown';

    if (!reportId) {
      return NextResponse.json({ error: '缺少报告ID' }, { status: 400 });
    }

    const db = getDb();
    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId) as Report | undefined;

    if (!report) {
      return NextResponse.json({ error: '报告不存在' }, { status: 404 });
    }

    const topics = JSON.parse(report.topics || '[]');
    const category = db.prepare('SELECT name FROM categories WHERE id = ?').get(report.category_id) as { name: string } | undefined;

    let content = '';
    const date = report.report_date;

    if (format === 'markdown') {
      content = `# AI 选题分析报告

**日期：** ${date}
**分类：** ${category?.name || '未知'}

---

## 分析内容

${report.analysis}

---

## 选题建议

${topics.map((t: any, i: number) => `### ${i + 1}. ${t.direction}

**痛点分析：** ${t.pain_point}

**增长空间：** ${t.growth_potential}

---`).join('\n')}

---
*由 AI 选题助手生成*
`;
    } else if (format === 'text') {
      content = `AI 选题分析报告
================

日期：${date}
分类：${category?.name || '未知'}

分析内容
--------
${report.analysis}

选题建议
--------
${topics.map((t: any, i: number) => `
${i + 1}. ${t.direction}
   痛点: ${t.pain_point}
   增长: ${t.growth_potential}
`).join('\n')}

由 AI 选题助手生成
`;
    }

    return NextResponse.json({
      content,
      filename: `报告_${date}.${format === 'markdown' ? 'md' : 'txt'}`,
    });
  } catch (error) {
    console.error('Failed to export report:', error);
    return NextResponse.json({ error: '导出失败' }, { status: 500 });
  }
}
