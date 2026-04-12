import OpenAI from 'openai';
import type { Content, HeatMetric } from '@/lib/db/schema';
import { calculateHeatScore, sortByHeat } from '@/lib/utils/heat';
import type { TopicSuggestion } from '@/lib/utils/dedupe';

// 检查API Key配置
function checkApiKey(): void {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ 警告: OPENAI_API_KEY 环境变量未配置，AI分析功能将无法使用');
    console.warn('请在 .env.local 文件中设置: OPENAI_API_KEY=your-api-key');
  } else if (apiKey === 'your-api-key-here') {
    console.warn('⚠️ 警告: 请修改 .env.local 中的 OPENAI_API_KEY 为你的真实API Key');
  }
}

checkApiKey();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const SYSTEM_PROMPT = `你是一位专注于更年期女性健康赛道的内容策略专家。
根据提供的内容数据，分析以下趋势并生成选题建议。

请严格按以下JSON格式输出，不要包含任何其他文字：
{
  "analysis": "Markdown格式的分析报告，控制在200字以内",
  "topics": [
    {
      "direction": "选题方向标题，控制在20字以内",
      "pain_point": "这个选题解决的痛点，控制在50字以内",
      "growth_potential": "爆点与增长空间分析，控制在50字以内"
    }
  ]
}

要求：
- 选题针对更年期女性群体的真实需求
- 分析要有数据支撑
- 选题要具体可执行
- 输出一律使用中文
- topics数组包含3-5个选题建议`;

export interface AIAnalysisResult {
  analysis: string;
  topics: TopicSuggestion[];
}

export async function analyzeContents(
  contents: Content[],
  heatMetric: HeatMetric
): Promise<AIAnalysisResult> {
  // 获取Top 10内容
  const topContents = sortByHeat(contents, heatMetric).slice(0, 10);

  if (topContents.length === 0) {
    return {
      analysis: '暂无数据',
      topics: []
    };
  }

  // 构建Prompt
  const contentList = topContents.map((c, i) => {
    const heatScore = calculateHeatScore(c, heatMetric);
    return `[${i + 1}] ${c.title || '无标题'}
作者: ${c.author_name || '未知'}
平台: ${c.platform}
热度评分: ${heatScore.toFixed(2)}
摘要: ${c.summary || '无摘要'}
点赞: ${c.likes} | 阅读: ${c.reads} | 互动: ${c.interactions}`;
  }).join('\n\n');

  const prompt = `请分析以下内容数据，生成选题建议：\n\n${contentList}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '';

    // 尝试解析JSON
    try {
      // 尝试提取JSON（可能是markdown代码块包裹）
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonStr.trim());
      return {
        analysis: parsed.analysis || '',
        topics: parsed.topics || []
      };
    } catch {
      // JSON解析失败，返回原始文本
      return {
        analysis: content.substring(0, 500),
        topics: []
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('AI分析失败，请检查API配置');
  }
}
