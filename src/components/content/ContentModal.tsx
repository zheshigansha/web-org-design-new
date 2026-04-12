'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { Content } from '@/lib/db/schema';

interface ContentModalProps {
  content: Content | null;
  onClose: () => void;
}

export function ContentModal({ content, onClose }: ContentModalProps) {
  if (!content) return null;

  const platformLabels = {
    xiaohongshu: '小红书',
    wechat: '公众号',
  };

  const platformColors = {
    xiaohongshu: 'bg-red-100 text-red-700',
    wechat: 'bg-green-100 text-green-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${platformColors[content.platform]}`}
            >
              {platformLabels[content.platform]}
            </span>
            <span className="text-sm text-gray-500">
              {content.published_at
                ? new Date(content.published_at).toLocaleDateString('zh-CN')
                : '未知日期'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Cover Image */}
          {content.cover_image && (
            <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={content.cover_image}
                alt={content.title || '封面图'}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {content.title || '无标题'}
          </h2>

          {/* Author */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            {content.author_avatar && (
              <Image
                src={content.author_avatar}
                alt={content.author_name || '作者'}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {content.author_name || '未知作者'}
              </p>
              <p className="text-xs text-gray-500">
                {content.platform === 'xiaohongshu' ? '小红书博主' : '公众号作者'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{content.likes.toLocaleString()}</p>
              <p className="text-xs text-gray-500">点赞</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{content.reads.toLocaleString()}</p>
              <p className="text-xs text-gray-500">阅读</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{content.interactions.toLocaleString()}</p>
              <p className="text-xs text-gray-500">互动</p>
            </div>
          </div>

          {/* Summary */}
          {content.summary && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">摘要</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {content.summary}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {content.content_url && (
              <a
                href={content.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="primary" className="w-full">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  打开原文
                </Button>
              </a>
            )}
            <Button variant="secondary" onClick={onClose}>
              关闭
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
