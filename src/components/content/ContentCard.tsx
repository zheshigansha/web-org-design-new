'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Content } from '@/lib/db/schema';

interface ContentCardProps {
  content: Content;
  onClick?: () => void;
}

export function ContentCard({ content, onClick }: ContentCardProps) {
  const platformColors = {
    xiaohongshu: 'bg-red-100 text-red-700',
    wechat: 'bg-green-100 text-green-700',
  };

  const platformLabels = {
    xiaohongshu: '小红书',
    wechat: '公众号',
  };

  return (
    <Card hover onClick={onClick} className="overflow-hidden">
      {content.cover_image && (
        <div className="relative w-full h-40 bg-gray-100">
          <Image
            src={content.cover_image}
            alt={content.title || '封面图'}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={content.platform === 'xiaohongshu' ? 'danger' : 'success'}>
            {platformLabels[content.platform]}
          </Badge>
          <span className="text-xs text-gray-400">
            {content.published_at
              ? new Date(content.published_at).toLocaleDateString('zh-CN')
              : '未知日期'}
          </span>
        </div>

        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
          {content.title || '无标题'}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {content.summary || '无摘要'}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {content.author_avatar && (
              <Image
                src={content.author_avatar}
                alt={content.author_name || '作者'}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span className="text-xs text-gray-500">
              {content.author_name || '未知作者'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span title="点赞">赞 {content.likes}</span>
            <span title="阅读">阅 {content.reads}</span>
            <span title="互动">互 {content.interactions}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
