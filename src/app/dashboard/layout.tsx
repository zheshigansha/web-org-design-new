'use client';

import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useCategoryStore } from '@/stores/categoryStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setCategories } = useCategoryStore();

  useEffect(() => {
    // 初始化加载分类
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0 && !useCategoryStore.getState().activeCategoryId) {
            useCategoryStore.getState().setActiveCategory(data.categories[0].id);
          }
        }
      })
      .catch(console.error);
  }, [setCategories]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
