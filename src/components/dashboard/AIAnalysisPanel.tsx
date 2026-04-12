'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface HotTopic {
  rank: number;
  title: string;
  heat: number;
  trend: 'up' | 'down' | 'stable';
}

interface AITrend {
  keyword: string;
  change: number;
}

interface AIAnalysisPanelProps {
  hotTopics: HotTopic[];
  aiTrends: AITrend[];
  latestReport?: {
    date: string;
    summary: string;
    topicCount: number;
  };
}

export function AIAnalysisPanel({ hotTopics, aiTrends, latestReport }: AIAnalysisPanelProps) {
  return (
    <Card className="p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">AI 热点分析</h3>
        <Badge variant="info">实时</Badge>
      </div>

      {/* 最新报告摘要 */}
      {latestReport && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-blue-600 font-medium">
              {latestReport.date} 报告
            </span>
            <span className="text-xs text-blue-500">
              {latestReport.topicCount} 个选题
            </span>
          </div>
          <p className="text-xs text-blue-700 line-clamp-2">
            {latestReport.summary}
          </p>
        </div>
      )}

      {/* 热点话题排行 */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-500 mb-2">热点话题 TOP 5</h4>
        <div className="space-y-2">
          {hotTopics.map((topic) => (
            <div
              key={topic.rank}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
            >
              <span
                className={`
                  w-5 h-5 rounded text-xs font-bold flex items-center justify-center
                  ${topic.rank <= 3 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}
                `}
              >
                {topic.rank}
              </span>
              <span className="flex-1 text-xs text-gray-700 truncate">
                {topic.title}
              </span>
              <span
                className={`
                  text-xs font-medium
                  ${topic.trend === 'up' ? 'text-green-600' : topic.trend === 'down' ? 'text-red-600' : 'text-gray-500'}
                `}
              >
                {topic.trend === 'up' ? '↑' : topic.trend === 'down' ? '↓' : '→'}{topic.heat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI 趋势发现 */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-500 mb-2">AI 趋势发现</h4>
        <div className="space-y-2">
          {aiTrends.map((trend, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <span className="text-xs text-gray-700">{trend.keyword}</span>
              <span
                className={`text-xs font-medium ${
                  trend.change > 0 ? 'text-green-600' : trend.change < 0 ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {trend.change > 0 ? '+' : ''}{trend.change}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button variant="secondary" size="sm" className="w-full">
        查看完整报告
      </Button>
    </Card>
  );
}
