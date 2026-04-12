import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Topic } from '@/lib/db/schema';

// AI评分逻辑（简化版，实际可用OpenAI）
function calculateScore(topic: Pick<Topic, 'direction' | 'pain_point' | 'growth_potential'>): { score: number; priority: 'high' | 'medium' | 'low' } {
  let score = 5.0;

  // 方向标题长度适中（15-25字）加分
  const dirLen = topic.direction.length;
  if (dirLen >= 10 && dirLen <= 30) score += 0.5;

  // 痛点分析详细（>30字）加分
  if (topic.pain_point.length > 30) score += 1.0;

  // 增长空间分析详细（>30字）加分
  if (topic.growth_potential.length > 30) score += 1.0;

  // 关键词匹配度（模拟）
  const keywords = ['更年期', '红参', '情绪', '睡眠', '健康', '瑜伽', '养生'];
  const text = `${topic.direction} ${topic.pain_point} ${topic.growth_potential}`.toLowerCase();
  const matchCount = keywords.filter(k => text.includes(k.toLowerCase())).length;
  score += matchCount * 0.3;

  // 确保分数在1-10之间
  score = Math.max(1, Math.min(10, score));

  // 确定优先级
  let priority: 'high' | 'medium' | 'low';
  if (score >= 7) {
    priority = 'high';
  } else if (score >= 5) {
    priority = 'medium';
  } else {
    priority = 'low';
  }

  return { score: Math.round(score * 10) / 10, priority };
}

export async function POST(request: Request) {
  try {
    const { topicIds } = await request.json();

    if (!topicIds || !Array.isArray(topicIds)) {
      return NextResponse.json({ error: '缺少topicIds' }, { status: 400 });
    }

    const db = getDb();
    const results: { id: string; score: number; priority: string }[] = [];

    for (const id of topicIds) {
      const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(id) as Topic | undefined;

      if (!topic) continue;

      const { score, priority } = calculateScore(topic);

      db.prepare(`
        UPDATE topics SET score = ?, priority = ?, updated_at = datetime('now') WHERE id = ?
      `).run(score, priority, id);

      results.push({ id, score, priority });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Failed to score topics:', error);
    return NextResponse.json({ error: '评分失败' }, { status: 500 });
  }
}
