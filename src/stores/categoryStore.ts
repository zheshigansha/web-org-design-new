import { create } from 'zustand';
import type { Category } from '@/lib/db/schema';

interface CategoryStore {
  categories: Category[];
  activeCategoryId: string | null;
  setCategories: (cats: Category[]) => void;
  setActiveCategory: (id: string | null) => void;
  addCategory: (cat: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  removeCategory: (id: string) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  activeCategoryId: null,
  setCategories: (categories) => set({ categories }),
  setActiveCategory: (id) => set({ activeCategoryId: id }),
  addCategory: (cat) => set((state) => ({
    categories: [...state.categories, cat]
  })),
  updateCategory: (id, updates) => set((state) => ({
    categories: state.categories.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    )
  })),
  removeCategory: (id) => set((state) => ({
    categories: state.categories.filter((c) => c.id !== id),
    activeCategoryId: state.activeCategoryId === id ? null : state.activeCategoryId
  })),
}));
