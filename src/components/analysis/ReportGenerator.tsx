'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ReportGeneratorProps {
  categoryId: string;
  onGenerated?: () => void;
}

export function ReportGenerator({ categoryId, onGenerated }: ReportGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [contentCount, setContentCount] = useState<number>(0);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setIsEmpty(false);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isEmpty) {
          setIsEmpty(true);
          setContentCount(data.contentCount || 0);
        } else {
          setError(data.error || '生成报告失败');
        }
        return;
      }

      onGenerated?.();
    } catch (e) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">AI 选题分析</h2>
      <p className="text-sm text-gray-500 mb-4">
        基于热度最高的 Top 10 内容，AI 将为你生成选题建议
      </p>

      {isEmpty && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">内容不足，无法生成报告</p>
              <p className="text-sm text-yellow-700 mt-1">
                当前有 {contentCount} 条内容，需要至少 10 条内容才能生成报告。
                <br />
                请先在"监控设置"中添加关键词或账号，然后点击"采集内容"。
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            AI 分析中...
          </span>
        ) : (
          '立即生成今日报告'
        )}
      </Button>
    </div>
  );
}
