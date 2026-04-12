import Database from 'better-sqlite3';
import path from 'path';
import { schema } from './schema';

const DB_PATH = path.join(process.cwd(), 'data', 'content_monitor.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // 初始化表结构
    db.exec(schema);
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// 初始化默认分类
export function initDefaultCategories(): void {
  const database = getDb();

  const existingCategories = database.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };

  if (existingCategories.count === 0) {
    const defaultCategories = [
      { id: 'cat-1', name: '更年期心理/情感', order: 0 },
      { id: 'cat-2', name: '红参（产品/转化）', order: 1 },
      { id: 'cat-3', name: '更年期知识/科普', order: 2 },
      { id: 'cat-4', name: '生活方式/锻炼', order: 3 },
    ];

    const insertCategory = database.prepare(
      'INSERT INTO categories (id, name, "order") VALUES (?, ?, ?)'
    );

    const insertSettings = database.prepare(
      'INSERT INTO category_settings (category_id, heat_metric, report_frequency) VALUES (?, ?, ?)'
    );

    const transaction = database.transaction(() => {
      for (const cat of defaultCategories) {
        insertCategory.run(cat.id, cat.name, cat.order);
        insertSettings.run(cat.id, 'composite', 'manual');
      }
    });

    transaction();
  }
}
