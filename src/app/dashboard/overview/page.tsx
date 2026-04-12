'use client';

import { useEffect, useState } from 'react';
import {
  KPICard,
  TrendChart,
  PlatformDonut,
  CategoryBar,
  AIAnalysisPanel,
  ContentTable,
  StatCard,
} from '@/components/dashboard';
import { ContentModal } from '@/components/content/ContentModal';
import { useCategoryStore } from '@/stores/categoryStore';
import type { Content, Report, Topic } from '@/lib/db/schema';

// 模拟数据（实际从API获取）
function generateMockData() {
  // 7天趋势数据
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      xiaohongshu: Math.floor(Math.random() * 500) + 200,
      wechat: Math.floor(Math.random() * 300) + 100,
    };
  });

  // 平台占比
  const platformData = [
    { name: '小红书', value: 342, color: '#ef4444' },
    { name: '公众号', value: 158, color: '#22c55e' },
  ];

  // 分类占比
  const categoryData = [
    { name: '更年期心理/情感', value: 145, color: '#3b82f6' },
    { name: '红参（产品/转化）', value: 98, color: '#f59e0b' },
    { name: '更年期知识/科普', value: 124, color: '#8b5cf6' },
    { name: '生活方式/锻炼', value: 133, color: '#ec4899' },
  ];

  // AI热点话题
  const hotTopics = [
    { rank: 1, title: '更年期情绪管理技巧', heat: 98, trend: 'up' as const },
    { rank: 2, title: '红参的最佳服用时间', heat: 85, trend: 'up' as const },
    { rank: 3, title: '睡眠质量改善方法', heat: 79, trend: 'stable' as const },
    { rank: 4, title: '更年期综合症表现', heat: 72, trend: 'down' as const },
    { rank: 5, title: '瑜伽练习注意事项', heat: 68, trend: 'up' as const },
  ];

  // AI趋势发现
  const aiTrends = [
    { keyword: '红参产品推荐', change: 24 },
    { keyword: '更年期食谱', change: 18 },
    { keyword: '骨密度检测', change: -5 },
    { keyword: '雌激素变化', change: 12 },
  ];

  // 内容列表
  const contentList = [
    { id: '1', title: '45岁以后，这些症状可能是更年期来了', platform: 'xiaohongshu' as const, category: '更年期知识/科普', author: '健康达人', likes: 2340, reads: 15600, interactions: 456, date: '04-10' },
    { id: '2', title: '红参怎么吃效果最好？教你3种搭配', platform: 'wechat' as const, category: '红参（产品/转化）', author: '养生专家', likes: 1890, reads: 12300, interactions: 321, date: '04-10' },
    { id: '3', title: '更年期情绪低落怎么办？心理医生这样说', platform: 'xiaohongshu' as const, category: '更年期心理/情感', author: '心理顾问', likes: 3200, reads: 21000, interactions: 580, date: '04-09' },
    { id: '4', title: '每天10分钟瑜伽，改善更年期不适', platform: 'xiaohongshu' as const, category: '生活方式/锻炼', author: '瑜伽老师', likes: 1560, reads: 9800, interactions: 234, date: '04-09' },
    { id: '5', title: '红参液喝了1个月，记录真实感受', platform: 'xiaohongshu' as const, category: '红参（产品/转化）', author: '用户体验', likes: 2890, reads: 18500, interactions: 412, date: '04-08' },
    { id: '6', title: '更年期后骨质疏松预防指南', platform: 'wechat' as const, category: '更年期知识/科普', author: '医学科普', likes: 980, reads: 7600, interactions: 156, date: '04-08' },
  ];

  return { trendData, platformData, categoryData, hotTopics, aiTrends, contentList };
}

export default function DashboardOverview() {
  const { categories } = useCategoryStore();
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const mock = generateMockData();

  // 计算总计
  const totalContent = mock.platformData.reduce((sum, d) => sum + d.value, 0);
  const totalHeat = mock.contentList.reduce((sum, c) => sum + c.likes, 0);
  const totalReads = mock.contentList.reduce((sum, c) => sum + c.reads, 0);
  const totalInteractions = mock.contentList.reduce((sum, c) => sum + c.interactions, 0);

  // 爆款数（点赞>1500）
  const hotContentCount = mock.contentList.filter((c) => c.likes > 1500).length;

  // 互动率
  const interactionRate = totalReads > 0 ? ((totalInteractions / totalReads) * 100).toFixed(1) : '0';

  // AI报告摘要
  const latestReport = {
    date: '04-10',
    summary: '今日热度集中在"情绪管理"和"红参产品"话题，预计下周"睡眠问题"将迎来增长...',
    topicCount: 5,
  };

  useEffect(() => {
    // 模拟加载
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">数据看板</h1>
        <p className="text-sm text-gray-500 mt-1">实时监控内容热度与选题趋势</p>
      </div>

      {/* KPI 卡片行 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="内容量"
          value={totalContent}
          trend={12.5}
          trendData={[280, 320, 290, 350, 380, 420, 500]}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <KPICard
          title="总热度"
          value={totalHeat.toLocaleString()}
          trend={8.3}
          trendData={[2100, 2300, 2200, 2500, 2700, 2600, 2800]}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <KPICard
          title="总阅读"
          value={totalReads.toLocaleString()}
          trend={15.2}
          trendData={[12000, 14000, 13500, 15000, 16500, 17000, 18000]}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
        <KPICard
          title="总互动"
          value={totalInteractions.toLocaleString()}
          trend={-3.1}
          trendData={[2100, 2200, 2300, 2150, 2400, 2350, 2250]}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          }
        />
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* 左侧3/4 - 图表区域 */}
        <div className="lg:col-span-3 space-y-6">
          {/* 趋势图 */}
          <TrendChart data={mock.trendData} />

          {/* 平台和分类占比 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlatformDonut data={mock.platformData} />
            <CategoryBar data={mock.categoryData} />
          </div>

          {/* 内容列表 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">热门内容</h3>
            <ContentTable
              data={mock.contentList}
              onItemClick={(item) => setSelectedContent(item as unknown as Content)}
            />
          </div>
        </div>

        {/* 右侧1/4 - AI分析面板 */}
        <div className="lg:col-span-1">
          <AIAnalysisPanel
            hotTopics={mock.hotTopics}
            aiTrends={mock.aiTrends}
            latestReport={latestReport}
          />
        </div>
      </div>

      {/* 底部数据卡片（参考截图2） */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="总热度" value="7,680" subtitle="↑ 12.5%" highlight />
        <StatCard title="总阅读" value="76,800" subtitle="↑ 15.2%" />
        <StatCard title="爆款数" value={hotContentCount} subtitle="点赞 > 1500" />
        <StatCard title="互动率" value={`${interactionRate}%`} subtitle="互动/阅读" />
      </div>

      {/* 内容详情弹窗 */}
      <ContentModal
        content={selectedContent}
        onClose={() => setSelectedContent(null)}
      />
    </div>
  );
}
