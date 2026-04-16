// 数据库表结构定义
export const schema = `
-- 监控分类表
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 关键词表
CREATE TABLE IF NOT EXISTS keywords (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  type TEXT DEFAULT 'include',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 监控账号表
CREATE TABLE IF NOT EXISTS monitored_accounts (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  account_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 内容表 (90天TTL)
CREATE TABLE IF NOT EXISTS contents (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  platform_content_id TEXT NOT NULL,
  title TEXT,
  summary TEXT,
  cover_image TEXT,
  author_name TEXT,
  author_avatar TEXT,
  content_url TEXT,
  likes INTEGER DEFAULT 0,
  reads INTEGER DEFAULT 0,
  interactions INTEGER DEFAULT 0,
  heat_score REAL DEFAULT 0,
  published_at TEXT,
  collected_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- AI报告表 (永久保留)
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  report_date TEXT NOT NULL,
  top_contents TEXT NOT NULL,
  analysis TEXT NOT NULL,
  topics TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 选题池表 (永久保留)
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  report_id TEXT,
  category_id TEXT NOT NULL,
  direction TEXT NOT NULL,
  pain_point TEXT NOT NULL,
  growth_potential TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  score REAL DEFAULT NULL,
  priority TEXT DEFAULT NULL,
  source_content_ids TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 分类设置表
CREATE TABLE IF NOT EXISTS category_settings (
  category_id TEXT PRIMARY KEY,
  heat_metric TEXT DEFAULT 'composite',
  report_frequency TEXT DEFAULT 'manual',
  report_time TEXT DEFAULT '09:00',
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_contents_category_platform ON contents(category_id, platform);
CREATE INDEX IF NOT EXISTS idx_contents_collected ON contents(collected_at);
CREATE INDEX IF NOT EXISTS idx_contents_heat ON contents(category_id, heat_score);
CREATE INDEX IF NOT EXISTS idx_topics_category_status ON topics(category_id, status);
CREATE INDEX IF NOT EXISTS idx_reports_category_date ON reports(category_id, report_date);

-- 报告收藏表
CREATE TABLE IF NOT EXISTS report_favorites (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- 内容模板表
CREATE TABLE IF NOT EXISTS content_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`;

export type Category = {
  id: string;
  name: string;
  order: number;
  created_at: string;
  updated_at: string;
};

export type Keyword = {
  id: string;
  category_id: string;
  keyword: string;
  type: 'include' | 'exclude';
  created_at: string;
};

export type MonitoredAccount = {
  id: string;
  category_id: string;
  platform: 'xiaohongshu' | 'wechat';
  account_id: string;
  account_name: string;
  created_at: string;
};

export type Content = {
  id: string;
  category_id: string;
  platform: 'xiaohongshu' | 'wechat';
  platform_content_id: string;
  title: string | null;
  summary: string | null;
  cover_image: string | null;
  author_name: string | null;
  author_avatar: string | null;
  content_url: string | null;
  likes: number;
  reads: number;
  interactions: number;
  heat_score: number;
  published_at: string | null;
  collected_at: string;
};

export type Report = {
  id: string;
  category_id: string;
  report_date: string;
  top_contents: string;
  analysis: string;
  topics: string;
  created_at: string;
};

export type Topic = {
  id: string;
  report_id: string | null;
  category_id: string;
  direction: string;
  pain_point: string;
  growth_potential: string;
  status: 'pending' | 'created' | 'published';
  score: number | null;
  priority: 'high' | 'medium' | 'low' | null;
  source_content_ids: string | null;
  created_at: string;
  updated_at: string;
};

export type CategorySettings = {
  category_id: string;
  heat_metric: 'likes' | 'reads' | 'interactions' | 'composite';
  report_frequency: 'daily' | 'manual';
  report_time: string;
  updated_at: string;
};

export type HeatMetric = 'likes' | 'reads' | 'interactions' | 'composite';

export type ReportFavorite = {
  id: string;
  report_id: string;
  created_at: string;
};

export type ContentTemplate = {
  id: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
};
