'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Topic {
  direction: string;
  pain_point: string;
  growth_potential: string;
}

interface TopicSuggestionProps {
  topic: Topic;
  categoryId: string;
  reportId?: string;
  sourceContentIds?: string[];
  onAdded?: () => void;
}

export function TopicSuggestion({
  topic,
  categoryId,
  reportId,
  sourceContentIds,
  onAdded,
}: TopicSuggestionProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToPool = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          direction: topic.direction,
          painPoint: topic.pain_point,
          growthPotential: topic.growth_potential,
          reportId,
          sourceContentIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.duplicate) {
          setError('选题已存在');
        } else {
          setError(data.error || '添加失败');
        }
        return;
      }

      setAdded(true);
      onAdded?.();
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-2">
            {topic.direction}
          </h3>

          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-gray-500">痛点分析</span>
              <p className="text-sm text-gray-700">{topic.pain_point}</p>
            </div>

            <div>
              <span className="text-xs font-medium text-gray-500">爆点与增长空间</span>
              <p className="text-sm text-gray-700">{topic.growth_potential}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {added ? (
            <Badge variant="success">已加入</Badge>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddToPool}
              disabled={loading}
            >
              {loading ? '添加中...' : '加入选题池'}
            </Button>
          )}
          {error && (
            <span className="text-xs text-red-500">{error}</span>
          )}
        </div>
      </div>
    </Card>
  );
}
