'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Keyword } from '@/lib/db/schema';

interface KeywordManagerProps {
  categoryId: string;
}

export function KeywordManager({ categoryId }: KeywordManagerProps) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState('');

  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/keywords?categoryId=${categoryId}`);
      const data = await res.json();
      setKeywords(data.keywords || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, [categoryId]);

  const handleAdd = async () => {
    if (!newKeyword.trim()) return;

    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, keyword: newKeyword.trim() }),
      });

      if (res.ok) {
        setNewKeyword('');
        fetchKeywords();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/keywords?id=${id}`, { method: 'DELETE' });
      fetchKeywords();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        监控关键词
      </label>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="输入关键词..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={!newKeyword.trim()}>
          添加
        </Button>
      </div>

      {loading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-20 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : keywords.length === 0 ? (
        <p className="text-sm text-gray-400">暂无关键词</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <Badge key={kw.id} variant="default" className="pr-1">
              {kw.keyword}
              <button
                onClick={() => handleDelete(kw.id)}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
