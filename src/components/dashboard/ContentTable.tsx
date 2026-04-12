'use client';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface ContentItem {
  id: string;
  title: string;
  platform: 'xiaohongshu' | 'wechat';
  category: string;
  author: string;
  likes: number;
  reads: number;
  interactions: number;
  date: string;
}

interface ContentTableProps {
  data: ContentItem[];
  onItemClick?: (item: ContentItem) => void;
}

export function ContentTable({ data, onItemClick }: ContentTableProps) {
  const platformLabels = {
    xiaohongshu: '小红书',
    wechat: '公众号',
  };

  const platformColors = {
    xiaohongshu: 'bg-red-100 text-red-700',
    wechat: 'bg-green-100 text-green-700',
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">平台</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">分类</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">内容</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">作者</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">点赞</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">阅读</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">互动</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onItemClick?.(item)}
              >
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      platformColors[item.platform]
                    }`}
                  >
                    {platformLabels[item.platform]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-600">{item.category}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900 line-clamp-1">{item.title}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-500">{item.author}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-gray-900">{item.likes.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-gray-900">{item.reads.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-gray-900">{item.interactions.toLocaleString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
