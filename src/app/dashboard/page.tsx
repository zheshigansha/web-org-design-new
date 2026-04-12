'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCategoryStore } from '@/stores/categoryStore';

export default function DashboardPage() {
  const router = useRouter();
  const { categories, activeCategoryId, setActiveCategory } = useCategoryStore();

  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategory(categories[0].id);
      router.replace(`/dashboard/${categories[0].id}`);
    } else if (activeCategoryId) {
      router.replace(`/dashboard/${activeCategoryId}`);
    }
  }, [categories, activeCategoryId, setActiveCategory, router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-400">加载中...</div>
    </div>
  );
}
