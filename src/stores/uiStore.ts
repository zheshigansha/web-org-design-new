import { create } from 'zustand';

type TabType = 'content' | 'analysis' | 'settings';
type Platform = 'xiaohongshu' | 'wechat' | null;

interface UIStore {
  activeTab: TabType;
  activePlatform: Platform;
  activeDate: string;
  setActiveTab: (tab: TabType) => void;
  setActivePlatform: (platform: Platform) => void;
  setActiveDate: (date: string) => void;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'content',
  activePlatform: null,
  activeDate: getToday(),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActivePlatform: (platform) => set({ activePlatform: platform }),
  setActiveDate: (date) => set({ activeDate: date }),
}));
