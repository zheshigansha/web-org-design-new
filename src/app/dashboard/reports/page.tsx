'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Report, ContentTemplate } from '@/lib/db/schema';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [reportsRes, favoritesRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/favorites')
      ]);
      const reportsData = await reportsRes.json();
      const favoritesData = await favoritesRes.json();

      setReports(reportsData.reports || []);
      setFavoritedIds(new Set(favoritesData.favoritedIds || []));
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchTemplates();
  }, []);

  const deleteReport = async (id: string) => {
    if (!confirm('确定要删除这个报告吗？')) return;
    try {
      await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      fetchReports();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const isFavorited = favoritedIds.has(id);
      if (isFavorited) {
        await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
      } else {
        await fetch(`/api/favorites/${id}`, { method: 'POST' });
      }
      fetchReports();
    } catch (e) {
      console.error(e);
    }
  };

  const copyTopics = async (report: Report) => {
    try {
      const topics = JSON.parse(report.topics);
      const text = topics.map((t: any, i: number) =>
        `${i + 1}. ${t.direction}\n   痛点: ${t.pain_point}\n   增长: ${t.growth_potential}`
      ).join('\n\n');

      await navigator.clipboard.writeText(text);
      setCopiedId(report.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const exportReport = async (report: Report, format: 'markdown' | 'text') => {
    try {
      const res = await fetch(`/api/reports/export?id=${report.id}&format=${format}`);
      const data = await res.json();

      // 创建下载
      const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const createTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) return;

    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTemplateName, content: newTemplateContent }),
      });
      setNewTemplateName('');
      setNewTemplateContent('');
      fetchTemplates();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('确定要删除这个模板吗？')) return;
    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      fetchTemplates();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI 报告历史</h1>
            <p className="text-sm text-gray-500 mt-1">报告将永久保留</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            {showTemplates ? '收起模板' : '管理模板'}
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* 模板管理区域 */}
        {showTemplates && (
          <Card className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">内容创作模板</h3>

            {/* 创建新模板 */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="模板名称"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <Button onClick={createTemplate} disabled={!newTemplateName.trim() || !newTemplateContent.trim()}>
                  添加模板
                </Button>
              </div>
              <textarea
                value={newTemplateContent}
                onChange={(e) => setNewTemplateContent(e.target.value)}
                placeholder="模板内容，支持以下变量：&#123;&#123;direction&#125;&#125; (方向)&#44; &#123;&#123;painPoint&#125;&#125; (痛点)&#44; &#123;&#123;growthPotential&#125;&#125; (增长空间)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-24"
              />
              <p className="text-xs text-gray-500 mt-1">
                可用变量：&#123;&#123;direction&#125;&#125; - 方向标题，&#123;&#123;painPoint&#125;&#125; - 痛点分析，&#123;&#123;growthPotential&#125;&#125; - 增长空间
              </p>
            </div>

            {/* 模板列表 */}
            <div className="space-y-2">
              {templates.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">暂无模板</p>
              ) : (
                templates.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{t.content}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTemplate(t.id)}
                    >
                      删除
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {/* 报告列表 */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">暂无报告</p>
            <p className="text-sm">在分类页面生成 AI 报告</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const topics = JSON.parse(report.topics || '[]');
              const isExpanded = expandedId === report.id;
              const isFavorited = favoritedIds.has(report.id);

              return (
                <Card key={report.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">
                          {report.report_date}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(report.created_at).toLocaleString('zh-CN')}
                        </span>
                        {isFavorited && (
                          <Badge variant="warning">已收藏</Badge>
                        )}
                        <Badge variant="info">{topics.length} 个选题</Badge>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {report.analysis.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4 flex-wrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleFavorite(report.id)}
                        title={isFavorited ? '取消收藏' : '收藏'}
                      >
                        {isFavorited ? (
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyTopics(report)}
                      >
                        {copiedId === report.id ? '已复制' : '复制选题'}
                      </Button>
                      <div className="relative group">
                        <Button size="sm" variant="secondary">
                          导出
                        </Button>
                        <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                          <button
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                            onClick={() => exportReport(report, 'markdown')}
                          >
                            Markdown 格式
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                            onClick={() => exportReport(report, 'text')}
                          >
                            TXT 格式
                          </button>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedId(isExpanded ? null : report.id)}
                      >
                        {isExpanded ? '收起' : '查看'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteReport(report.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">分析内容</h4>
                        <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 rounded-lg p-4">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {report.analysis}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {topics.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">选题建议</h4>
                          <div className="space-y-3">
                            {topics.map((topic: any, i: number) => (
                              <div key={i} className="bg-blue-50 rounded-lg p-4">
                                <p className="font-medium text-gray-900 mb-1">
                                  {i + 1}. {topic.direction}
                                </p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-xs text-gray-500">痛点分析</span>
                                    <p className="text-gray-700">{topic.pain_point}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">增长空间</span>
                                    <p className="text-gray-700">{topic.growth_potential}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
