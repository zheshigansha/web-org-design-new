import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Topic } from '@/lib/db/schema';

// 模拟推送到草稿箱
// 实际项目中需要对接微信公众平台API和小红书API
async function pushToWechatDraft(title: string, content: string, author: string): Promise<{ success: boolean; draftId?: string }> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 模拟成功
  return {
    success: true,
    draftId: `wx_draft_${Date.now()}`
  };
}

async function pushToXiaohongshuDraft(title: string, content: string): Promise<{ success: boolean; draftId?: string }> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 模拟成功
  return {
    success: true,
    draftId: `xhs_draft_${Date.now()}`
  };
}

export async function POST(request: Request) {
  try {
    const { topicId, platform } = await request.json();

    if (!topicId || !platform) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    if (!['wechat', 'xiaohongshu'].includes(platform)) {
      return NextResponse.json({ error: '无效的平台' }, { status: 400 });
    }

    // 获取选题信息
    const db = getDb();
    const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(topicId) as Topic | undefined;

    if (!topic) {
      return NextResponse.json({ error: '选题不存在' }, { status: 404 });
    }

    // 构建草稿内容
    const draftTitle = topic.direction;
    const draftContent = `【痛点分析】
${topic.pain_point}

【增长空间】
${topic.growth_potential}

---
来源：AI选题助手
`;

    // 推送到对应平台
    let result;
    if (platform === 'wechat') {
      result = await pushToWechatDraft(draftTitle, draftContent, 'AI助手');
    } else {
      result = await pushToXiaohongshuDraft(draftTitle, draftContent);
    }

    if (result.success) {
      // 更新选题状态为已发布
      db.prepare('UPDATE topics SET status = ?, updated_at = datetime(\'now\') WHERE id = ?')
        .run('published', topicId);

      return NextResponse.json({
        success: true,
        draftId: result.draftId,
        message: `已推送到${platform === 'wechat' ? '微信' : '小红书'}草稿箱`
      });
    } else {
      return NextResponse.json({ error: '推送失败' }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to publish:', error);
    return NextResponse.json({ error: '推送失败' }, { status: 500 });
  }
}
