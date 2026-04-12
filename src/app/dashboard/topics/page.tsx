'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCategoryStore } from '@/stores/categoryStore';
import type { Topic } from '@/lib/db/schema';

const statusOptions: { value: string; label: string; variant?: 'default' | 'warning' | 'success' }[] = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待创作', variant: 'default' },
  { value: 'created', label: '已创作', variant: 'warning' },
  { value: 'published', label: '已发布', variant: 'success' },
];

type SortField = 'created_at' | 'score' | 'priority';
type SortOrder = 'asc' | 'desc';

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishMessage, setPublishMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [scoringTopicIds, setScoringTopicIds] = useState<Set<string>>(new Set());
  const [showHelp, setShowHelp] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { categories } = useCategoryStore();

  // 复制选题到剪贴板
  const copyTopic = useCallback(async (topic: Topic) => {
    const text = `${topic.direction}\n\n痛点: ${topic.pain_point}\n\n增长: ${topic.growth_potential}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(topic.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // 快捷键配置
  const hotkeys = [
    { key: 'j', handler: () => setFocusedIndex(i => Math.min(i + 1, topics.length - 1)), description: '下一条' },
    { key: 'k', handler: () => setFocusedIndex(i => Math.max(i - 1, 0)), description: '上一条' },
    { key: 's', handler: () => focusedIndex >= 0 && topics[focusedIndex]?.status === 'pending' && updateStatus(topics[focusedIndex].id, 'created'), description: '标记已创作' },
    { key: 'p', handler: () => focusedIndex >= 0 && topics[focusedIndex]?.status === 'created' && pushToDraft(topics[focusedIndex].id, 'wechat'), description: '推送草稿' },
    { key: 'c', handler: () => focusedIndex >= 0 && copyTopic(topics[focusedIndex]), description: '复制选题' },
    { key: 'd', handler: () => focusedIndex >= 0 && deleteTopic(topics[focusedIndex].id), description: '删除选题' },
    { key: '?', handler: () => setShowHelp(h => !h), description: '显示帮助' },
    { key: 'Escape', handler: () => { setFocusedIndex(-1); setShowHelp(false); }, description: '关闭' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      for (const hotkey of hotkeys) {
        const keyMatch = e.key.toLowerCase() === hotkey.key.toLowerCase();
        if (keyMatch) {
          e.preventDefault();
          hotkey.handler();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [topics, focusedIndex]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterCategory) params.append('categoryId', filterCategory);

      const res = await fetch(`/api/topics?${params}`);
      const data = await res.json();
      let filteredTopics = data.topics || [];

      // 客户端搜索过滤
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        filteredTopics = filteredTopics.filter((t: Topic) =>
          t.direction.toLowerCase().includes(kw) ||
          t.pain_point.toLowerCase().includes(kw) ||
          t.growth_potential.toLowerCase().includes(kw)
        );
      }

      // 日期范围过滤
      if (dateFrom) {
        filteredTopics = filteredTopics.filter((t: Topic) =>
          new Date(t.created_at) >= new Date(dateFrom)
        );
      }
      if (dateTo) {
        filteredTopics = filteredTopics.filter((t: Topic) =>
          new Date(t.created_at) <= new Date(dateTo + 'T23:59:59')
        );
      }

      // 排序
      filteredTopics.sort((a: Topic, b: Topic) => {
        let aVal: number | string = 0;
        let bVal: number | string = 0;

        if (sortField === 'created_at') {
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
        } else if (sortField === 'score') {
          aVal = a.score ?? 0;
          bVal = b.score ?? 0;
        } else if (sortField === 'priority') {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aVal = priorityOrder[a.priority ?? 'low'];
          bVal = priorityOrder[b.priority ?? 'low'];
        }

        if (sortOrder === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });

      setTopics(filteredTopics);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [filterStatus, filterCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTopics();
  };

  // AI评分
  const scoreTopics = async (ids: string[]) => {
    setScoringTopicIds(new Set(ids));

    try {
      const res = await fetch('/api/topics/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicIds: ids }),
      });

      if (res.ok) {
        fetchTopics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScoringTopicIds(new Set());
    }
  };

  // 批量评分
  const batchScore = () => {
    if (selectedIds.size === 0) return;
    scoreTopics(Array.from(selectedIds));
  };

  // 单个评分
  const scoreSingle = (id: string) => {
    scoreTopics([id]);
  };

  const updateStatus = async (id: string, status: Topic['status']) => {
    try {
      await fetch(`/api/topics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchTopics();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTopic = async (id: string) => {
    if (!confirm('确定要删除这个选题吗？')) return;
    try {
      await fetch(`/api/topics/${id}`, { method: 'DELETE' });
      fetchTopics();
    } catch (e) {
      console.error(e);
    }
  };

  // 推送到草稿箱
  const pushToDraft = async (id: string, platform: 'wechat' | 'xiaohongshu') => {
    setPublishingId(id);
    setPublishMessage(null);

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: id, platform }),
      });
      const data = await res.json();

      if (data.success) {
        setPublishMessage({ type: 'success', text: data.message });
        fetchTopics();
      } else {
        setPublishMessage({ type: 'error', text: data.error || '推送失败' });
      }
    } catch (e) {
      setPublishMessage({ type: 'error', text: '推送失败' });
    } finally {
      setPublishingId(null);
      setTimeout(() => setPublishMessage(null), 3000);
    }
  };

  // 批量选择
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(topics.map(t => t.id)));
    }
    setSelectAll(!selectAll);
  };

  // 批量删除
  const batchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 个选题吗？`)) return;

    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/topics/${id}`, { method: 'DELETE' })
        )
      );
      setSelectedIds(new Set());
      setSelectAll(false);
      fetchTopics();
    } catch (e) {
      console.error(e);
    }
  };

  // 批量更新状态
  const batchUpdateStatus = async (status: Topic['status']) => {
    if (selectedIds.size === 0) return;

    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/topics/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          })
        )
      );
      setSelectedIds(new Set());
      setSelectAll(false);
      fetchTopics();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status: Topic['status']) => {
    const config = {
      pending: { label: '待创作', variant: 'default' as const },
      created: { label: '已创作', variant: 'warning' as const },
      published: { label: '已发布', variant: 'success' as const },
    };
    const { label, variant } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || categoryId;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">选题池</h1>
            <p className="text-sm text-gray-500 mt-1">已收录的选题将永久保留</p>
          </div>
          <button
            onClick={() => setShowHelp(true)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">?</kbd>
            快捷键
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* 搜索和筛选区域 */}
        <Card className="p-4">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* 关键词搜索 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索选题方向、痛点分析..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" variant="secondary">
                搜索
              </Button>
            </div>

            {/* 筛选条件 */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* 状态筛选 */}
              <div className="flex gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFilterStatus(opt.value)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${filterStatus === opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* 分类筛选 */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {/* 日期范围 */}
              <div className="flex gap-2 items-center text-xs text-gray-500">
                <span>日期:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-2 py-1 border border-gray-200 rounded text-xs"
                />
                <span>至</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-2 py-1 border border-gray-200 rounded text-xs"
                />
              </div>

              {/* 清空筛选 */}
              {(searchKeyword || filterStatus || filterCategory || dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword('');
                    setFilterStatus('');
                    setFilterCategory('');
                    setDateFrom('');
                    setDateTo('');
                    fetchTopics();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  清空筛选
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* 批量操作栏 */}
        {topics.length > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectAll && selectedIds.size === topics.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-gray-600">
                  全选 {selectedIds.size > 0 && `(${selectedIds.size})`}
                </span>
              </label>

              {/* 排序选项 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">排序:</span>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="px-2 py-1 border border-gray-200 rounded text-xs"
                >
                  <option value="created_at">时间</option>
                  <option value="score">评分</option>
                  <option value="priority">优先级</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            </div>

            {selectedIds.size > 0 ? (
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={batchScore}
                  disabled={scoringTopicIds.size > 0}
                >
                  {scoringTopicIds.size > 0 ? '评分中...' : 'AI评分'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => batchUpdateStatus('created')}
                >
                  批量标记已创作
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => batchUpdateStatus('published')}
                >
                  批量标记已发布
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={batchDelete}
                >
                  批量删除
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const allIds = topics.map(t => t.id);
                  setSelectedIds(new Set(allIds));
                  setSelectAll(true);
                }}
              >
                全选
              </Button>
            )}
          </div>
        )}

        {/* 选题列表 */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-medium">暂无选题</p>
            <p className="text-sm">在 AI 分析报告中点击"加入选题池"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic, idx) => (
              <Card
                key={topic.id}
                className={`p-4 cursor-pointer transition-all ${selectedIds.has(topic.id) ? 'ring-2 ring-blue-500' : ''} ${focusedIndex === idx ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'}`}
                onClick={() => setFocusedIndex(idx)}
              >
                <div className="flex items-start gap-4">
                  {/* 选择框 */}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(topic.id)}
                    onChange={() => toggleSelect(topic.id)}
                    className="mt-1 w-4 h-4 rounded border-gray-300"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getStatusBadge(topic.status)}
                      <Badge variant="info">{getCategoryName(topic.category_id)}</Badge>

                      {/* 评分显示 */}
                      {topic.score !== null ? (
                        <Badge
                          variant={topic.priority === 'high' ? 'danger' : topic.priority === 'medium' ? 'warning' : 'default'}
                        >
                          评分 {topic.score}/10 {topic.priority === 'high' ? '⭐' : ''}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => scoreSingle(topic.id)}
                          disabled={scoringTopicIds.has(topic.id)}
                          className="text-xs h-6"
                        >
                          {scoringTopicIds.has(topic.id) ? '评分中...' : 'AI评分'}
                        </Button>
                      )}

                      <span className="text-xs text-gray-400">
                        {new Date(topic.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>

                    <h3 className="font-medium text-gray-900 mb-2">
                      {topic.direction}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-xs text-gray-400">痛点分析</span>
                        <p className="text-gray-700 line-clamp-2">{topic.pain_point}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">增长空间</span>
                        <p className="text-gray-700 line-clamp-2">{topic.growth_potential}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {topic.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateStatus(topic.id, 'created')}
                      >
                        标记已创作
                      </Button>
                    )}
                    {topic.status === 'created' && (
                      <div className="flex gap-2">
                        <div className="relative group">
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={publishingId === topic.id}
                          >
                            {publishingId === topic.id ? '推送中...' : '推送草稿箱'}
                          </Button>
                          {/* 平台选择下拉 */}
                          <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => pushToDraft(topic.id, 'wechat')}
                              disabled={publishingId === topic.id}
                            >
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              微信草稿箱
                            </button>
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => pushToDraft(topic.id, 'xiaohongshu')}
                              disabled={publishingId === topic.id}
                            >
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              小红书草稿箱
                            </button>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateStatus(topic.id, 'published')}
                        >
                          标记已发布
                        </Button>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTopic(topic.id)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 快捷键帮助弹窗 */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHelp(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4">快捷键</h2>
            <div className="space-y-2">
              {[
                { key: 'J', description: '下一条' },
                { key: 'K', description: '上一条' },
                { key: 'S', description: '标记已创作' },
                { key: 'P', description: '推送草稿' },
                { key: 'C', description: '复制选题' },
                { key: 'D', description: '删除选题' },
                { key: '?', description: '显示帮助' },
                { key: 'Esc', description: '关闭' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{item.description}</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{item.key}</kbd>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-4" onClick={() => setShowHelp(false)}>
              关闭
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
