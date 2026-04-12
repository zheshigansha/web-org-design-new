'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TabNav } from '@/components/ui/TabNav';
import { PlatformToggle } from '@/components/content/PlatformToggle';
import { DateTimeline } from '@/components/content/DateTimeline';
import { ContentGrid } from '@/components/content/ContentGrid';
import { ContentModal } from '@/components/content/ContentModal';
import { ReportGenerator } from '@/components/analysis/ReportGenerator';
import { TopicSuggestion } from '@/components/analysis/TopicSuggestion';
import { HeatMetricSelector } from '@/components/settings/HeatMetricSelector';
import { ReportFrequencySelector } from '@/components/settings/ReportFrequencySelector';
import { KeywordManager } from '@/components/settings/KeywordManager';
import { AccountManager } from '@/components/settings/AccountManager';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { useCategoryStore } from '@/stores/categoryStore';
import type { Content, CategorySettings, HeatMetric } from '@/lib/db/schema';

const tabs = [
  { id: 'content', label: '内容仓库' },
  { id: 'analysis', label: 'AI 选题分析' },
  { id: 'settings', label: '监控设置' },
];

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;

  const { activeTab, activePlatform, activeDate, setActiveTab, setActivePlatform, setActiveDate } = useUIStore();
  const { categories } = useCategoryStore();

  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<CategorySettings | null>(null);
  const [reportData, setReportData] = useState<{ analysis: string; topics: any[] } | null>(null);
  const [collecting, setCollecting] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLimit, setSearchLimit] = useState<string>('20');

  const category = categories.find((c) => c.id === categoryId);

  // 加载设置
  useEffect(() => {
    if (!categoryId) return;
    fetch(`/api/settings/${categoryId}`)
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch(console.error);
  }, [categoryId]);

  // 加载内容
  const fetchContents = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ categoryId });
      if (activePlatform) params.append('platform', activePlatform);
      if (activeDate) params.append('date', activeDate);
      if (searchKeyword) params.append('keyword', searchKeyword);
      if (searchLimit) params.append('limit', searchLimit);

      const res = await fetch(`/api/contents?${params}`);
      const data = await res.json();
      setContents(data.contents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [categoryId, activePlatform, activeDate, searchKeyword, searchLimit]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  // 处理设置更新
  const updateSettings = async (updates: Partial<CategorySettings>) => {
    try {
      const res = await fetch(`/api/settings/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 触发采集
  const handleCollect = async () => {
    if (!activePlatform) {
      alert('请先选择要采集的平台');
      return;
    }

    setCollecting(true);
    try {
      const res = await fetch('/api/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, platform: activePlatform }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`成功采集 ${data.collected} 条内容`);
        fetchContents();
      } else {
        alert(data.message || '采集失败');
      }
    } catch (e) {
      alert('采集失败');
    } finally {
      setCollecting(false);
    }
  };

  // 报告生成完成
  const handleReportGenerated = () => {
    // 刷新页面或更新状态
    fetchContents();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">{category?.name || '加载中...'}</h1>
          {activePlatform && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCollect}
              disabled={collecting}
            >
              {collecting ? '采集中...' : '采集内容'}
            </Button>
          )}
        </div>
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as any)} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <PlatformToggle value={activePlatform} onChange={setActivePlatform} />
              <DateTimeline value={activeDate} onChange={setActiveDate} />
            </div>
            <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="搜索标题或摘要关键词..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchContents()}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">数量:</span>
                <select
                  value={searchLimit === '10' || searchLimit === '20' ? searchLimit : ''}
                  onChange={(e) => setSearchLimit(e.target.value || '20')}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="10">10条</option>
                  <option value="20">20条</option>
                </select>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={searchLimit !== '10' && searchLimit !== '20' ? searchLimit : ''}
                  onChange={(e) => setSearchLimit(e.target.value || '20')}
                  placeholder="自定义"
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button size="sm" variant="primary" onClick={fetchContents}>
                搜索
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  const params = new URLSearchParams({ categoryId, format: 'csv' });
                  if (searchKeyword) params.append('keyword', searchKeyword);
                  if (searchLimit) params.append('limit', searchLimit);
                  const res = await fetch(`/api/contents/export?${params}`);
                  const data = await res.json();
                  const blob = new Blob([data.content], { type: 'text/csv;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = data.filename;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                导出CSV
              </Button>
            </div>
            <ContentGrid
              contents={contents}
              loading={loading}
              onItemClick={(content) => setSelectedContent(content)}
            />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <ReportGenerator
              categoryId={categoryId}
              onGenerated={handleReportGenerated}
            />

            {reportData && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4">AI 分析报告</h3>
                <div className="prose prose-sm max-w-none text-gray-700 mb-6">
                  {reportData.analysis}
                </div>
                <h4 className="font-medium text-gray-900 mb-4">选题建议</h4>
                <div className="space-y-4">
                  {reportData.topics.map((topic, i) => (
                    <TopicSuggestion
                      key={i}
                      topic={topic}
                      categoryId={categoryId}
                      sourceContentIds={[]}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">热度评判标准</h3>
              <HeatMetricSelector
                value={settings?.heat_metric || 'composite'}
                onChange={(metric) => updateSettings({ heat_metric: metric })}
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">报告生成频率</h3>
              <ReportFrequencySelector
                value={settings?.report_frequency || 'manual'}
                onChange={(freq) => updateSettings({ report_frequency: freq })}
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <KeywordManager categoryId={categoryId} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <AccountManager categoryId={categoryId} />
            </div>
          </div>
        )}
      </div>

      {/* 内容详情弹窗 */}
      <ContentModal
        content={selectedContent}
        onClose={() => setSelectedContent(null)}
      />
    </div>
  );
}
