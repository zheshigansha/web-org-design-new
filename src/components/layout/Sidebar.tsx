'use client';

import Link from 'next/link';
import { useCategoryStore } from '@/stores/categoryStore';

interface SidebarProps {
  activeCategoryId?: string | null;
}

export function Sidebar({ activeCategoryId }: SidebarProps) {
  const { categories, activeCategoryId: storeActiveId, setActiveCategory } = useCategoryStore();

  const displayActiveId = activeCategoryId ?? storeActiveId;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">内容监控助手</h1>
        <p className="text-xs text-gray-400 mt-1">更年期赛道专用版</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* 数据看板入口 */}
        <div className="mb-4">
          <Link
            href="/dashboard/overview"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            数据看板
          </Link>
        </div>

        <div className="mb-6">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            监控分类
          </h2>
          <nav className="space-y-1">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/dashboard/${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  block px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${displayActiveId === cat.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            导航
          </h2>
          <nav className="space-y-1">
            <Link
              href="/dashboard/topics"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              选题池
            </Link>
            <Link
              href="/dashboard/reports"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              AI 报告历史
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
