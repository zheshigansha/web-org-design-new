import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { Content } from '@/lib/db/schema';

// API配置
const API_CONFIG = {
  baseUrl: 'http://cn8n.com',
  token: process.env.WECHAT_API_TOKEN || '',
};

// 带重试的API请求
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status !== 504) {
        return response;
      }
      console.log(`第 ${i + 1} 次请求超时，等待重试...`);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`第 ${i + 1} 次请求出错:`, error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('API请求多次超时');
}

// 公众号爆文API调用
async function fetchWechatContent(
  categoryId: string,
  keywords: string[]
): Promise<Content[]> {
  const contents: Content[] = [];
  const now = new Date();

  if (!API_CONFIG.token) {
    console.warn('WECHAT_API_TOKEN 未配置，使用模拟数据');
    return generateMockContent(categoryId, 'wechat', keywords);
  }

  for (const keyword of keywords) {
    try {
      // 计算日期范围（最近7天）
      const endDate = new Date();
      const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const formatDate = (d: Date) => d.toISOString().split('T')[0];

      const response = await fetchWithRetry(
        `${API_CONFIG.baseUrl}/p4/fbmain/monitor/v3/kw_search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_CONFIG.token}`,
          },
          body: JSON.stringify({
            kw: keyword,
            page: 1,
          }),
        },
        3, // 最多重试3次
        3000 // 每次等待3秒
      );

      if (!response.ok) {
        console.error(`API请求失败: ${response.status}`);
        continue;
      }

      const data = await response.json();

      // 解析API返回的数据（根据实际返回格式调整）
      const items = data?.data?.list || data?.list || [];

      for (const item of items) {
        const likes = item.likes || item.like_num || 0;
        const reads = item.reads || item.read_num || item.views || 0;
        const interactions = likes + Math.floor(reads * 0.1); // 估算互动

        // 综合热度评分
        const heatScore = Math.log10(likes + 1) * 2 + Math.log10(reads + 1) * 1 + Math.log10(interactions + 1) * 3;

        contents.push({
          id: uuidv4(),
          category_id: categoryId,
          platform: 'wechat',
          platform_content_id: item.id || item.content_id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: item.title || '无标题',
          summary: item.digest || item.summary || item.desc || '',
          cover_image: item.cover || item.thumb_url || null,
          author_name: item.author || item.account_name || '未知作者',
          author_avatar: item.author_icon || item.avatar || null,
          content_url: item.url || item.content_url || '',
          likes,
          reads,
          interactions,
          heat_score: heatScore,
          published_at: item.publish_time ? new Date(item.publish_time * 1000).toISOString() : now.toISOString(),
          collected_at: now.toISOString(),
        });
      }
    } catch (error) {
      console.error(`采集关键词 "${keyword}" 失败:`, error);
    }
  }

  // 如果API没有返回数据，使用模拟数据补充
  if (contents.length === 0) {
    return generateMockContent(categoryId, 'wechat', keywords);
  }

  return contents;
}

// 生成模拟数据（备用）
function generateMockContent(
  categoryId: string,
  platform: 'xiaohongshu' | 'wechat',
  keywords: string[]
): Content[] {
  const contents: Content[] = [];
  const now = new Date();

  for (const keyword of keywords) {
    const count = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < count; i++) {
      const likes = Math.floor(Math.random() * 5000);
      const reads = Math.floor(Math.random() * 20000);
      const interactions = Math.floor(Math.random() * 1000);

      const heatScore = Math.log10(likes + 1) * 2 + Math.log10(reads + 1) * 1 + Math.log10(interactions + 1) * 3;
      const publishedAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);

      contents.push({
        id: uuidv4(),
        category_id: categoryId,
        platform,
        platform_content_id: `${platform}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `关于${keyword}的${platform === 'xiaohongshu' ? '笔记' : '文章'}${i + 1}`,
        summary: `这是一篇关于${keyword}的内容摘要，包含更年期女性关心的实际问题...`,
        cover_image: `https://picsum.photos/seed/${Date.now() + i}/400/300`,
        author_name: platform === 'xiaohongshu'
          ? ['小红书用户', '健康达人', '更年期姐姐'][Math.floor(Math.random() * 3)]
          : ['健康公众号', '医学科普', '养生专家'][Math.floor(Math.random() * 3)],
        author_avatar: `https://i.pravatar.cc/100?u=${Date.now() + i}`,
        content_url: `https://${platform}.com/post/${Date.now() + i}`,
        likes,
        reads,
        interactions,
        heat_score: heatScore,
        published_at: publishedAt.toISOString(),
        collected_at: now.toISOString(),
      });
    }
  }

  return contents;
}

// 公众号指定账号采集（post_condition 接口）
async function fetchWechatAccountPosts(
  categoryId: string,
  accounts: { account_id: string; account_name: string }[]
): Promise<Content[]> {
  const contents: Content[] = [];
  const now = new Date();

  if (!API_CONFIG.token) {
    console.warn('WECHAT_API_TOKEN 未配置，跳过账号监控采集');
    return contents;
  }

  for (const account of accounts) {
    try {
      // 优先用 account_name，其次用 account_id（biz）
      const paramName = account.account_name || account.account_id;
      if (!paramName) continue;

      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetchWithRetry(
          `${API_CONFIG.baseUrl}/p4/fbmain/monitor/v3/post_condition`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${API_CONFIG.token}`,
            },
            body: JSON.stringify({
              name: account.account_name || '',
              biz: account.account_id || '',
              page,
            }),
          },
          2,
          3000
        );

        if (!response.ok) {
          console.error(`账号采集 "${paramName}" 第${page}页请求失败: ${response.status}`);
          break;
        }

        const data = await response.json();

        // 状态码非0表示业务错误
        if (data.code !== 0) {
          console.error(`账号采集 "${paramName}" 返回错误: code=${data.code} msg=${data.msg}`);
          break;
        }

        const articles = data.data || [];
        const authorName = data.mp_nickname || account.account_name || '未知公众号';
        const authorAvatar = data.head_img || null;

        for (const item of articles) {
          // 跳过已删除的文章
          if (item.is_deleted === '1' || item.msg_status === 7) continue;

          // 用文章URL做去重ID
          const contentUrl = item.url || '';
          const contentId = contentUrl ? contentUrl.replace(/[^a-zA-Z0-9]/g, '').slice(0, 64) : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          contents.push({
            id: uuidv4(),
            category_id: categoryId,
            platform: 'wechat',
            platform_content_id: contentId,
            title: item.title || '无标题',
            summary: item.digest || '',
            cover_image: item.cover_url || item.pic_cdn_url_16_9 || null,
            author_name: authorName,
            author_avatar: authorAvatar,
            content_url: contentUrl,
            likes: 0,       // post_condition 不返回互动数据
            reads: 0,
            interactions: 0,
            heat_score: 1,  // 基础分，标记为"已监控采集"
            published_at: item.post_time ? new Date(item.post_time * 1000).toISOString() : now.toISOString(),
            collected_at: now.toISOString(),
          });
        }

        // 判断是否还有下一页
        const totalPages = data.total_page || 1;
        hasMore = page < totalPages;
        page++;

        // 每次翻页间隔1秒，避免QPS超限
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`账号 "${paramName}" 采集完成，共 ${contents.length} 篇`);

    } catch (error) {
      console.error(`采集账号 "${account.account_name}" 失败:`, error);
    }
  }

  return contents;
}

// 小红书采集（暂时保留模拟）
function collectXiaohongshu(
  categoryId: string,
  keywords: string[]
): Content[] {
  return generateMockContent(categoryId, 'xiaohongshu', keywords);
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { categoryId, platform } = await request.json();

    if (!categoryId || !platform) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    if (!['xiaohongshu', 'wechat'].includes(platform)) {
      return NextResponse.json({ error: '无效的平台' }, { status: 400 });
    }

    // 获取关键词
    const keywords = db.prepare(`
      SELECT keyword FROM keywords WHERE category_id = ? AND type = 'include'
    `).all(categoryId) as { keyword: string }[];

    // 获取监控账号
    const accounts = db.prepare(`
      SELECT account_id, account_name FROM monitored_accounts
      WHERE category_id = ? AND platform = ?
    `).all(categoryId, platform) as { account_id: string; account_name: string }[];

    // 如果没有关键词和账号，返回空
    if (keywords.length === 0 && accounts.length === 0) {
      return NextResponse.json({
        success: true,
        collected: 0,
        message: '请先在监控设置中添加关键词或账号'
      });
    }

    // 根据平台采集
    let collectedContents: Content[] = [];
    const keywordList = keywords.map(k => k.keyword);

    if (platform === 'wechat') {
      // 公众号：关键词搜索 + 指定账号监控
      const keywordResults = await fetchWechatContent(categoryId, keywordList);
      const accountResults = accounts.length > 0
        ? await fetchWechatAccountPosts(categoryId, accounts)
        : [];
      collectedContents = [...keywordResults, ...accountResults];
    } else {
      // 小红书：暂时使用模拟数据
      collectedContents = collectXiaohongshu(categoryId, keywordList);
    }

    // 去重：按 platform_content_id 去重（关键词和账号可能抓到同一篇）
    const seen = new Set<string>();
    collectedContents = collectedContents.filter(c => {
      if (seen.has(c.platform_content_id)) return false;
      seen.add(c.platform_content_id);
      return true;
    });

    // 保存到数据库
    const insertStmt = db.prepare(`
      INSERT INTO contents (
        id, category_id, platform, platform_content_id, title, summary, cover_image,
        author_name, author_avatar, content_url, likes, reads, interactions,
        heat_score, published_at, collected_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((contents: Content[]) => {
      for (const c of contents) {
        insertStmt.run(
          c.id, c.category_id, c.platform, c.platform_content_id, c.title, c.summary,
          c.cover_image, c.author_name, c.author_avatar, c.content_url, c.likes,
          c.reads, c.interactions, c.heat_score, c.published_at, c.collected_at
        );
      }
    });

    insertMany(collectedContents);

    return NextResponse.json({
      success: true,
      collected: collectedContents.length,
      platform
    });
  } catch (error) {
    console.error('Failed to collect content:', error);
    return NextResponse.json({ error: '采集失败' }, { status: 500 });
  }
}
