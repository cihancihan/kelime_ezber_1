import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite, { schema });

// Initialize database schema manually for simplicity (in production, use migrations)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL,
    translation TEXT NOT NULL,
    part_of_speech TEXT NOT NULL,
    synonyms TEXT,
    example TEXT,
    distractors TEXT,
    level TEXT,
    next_review INTEGER NOT NULL,
    interval INTEGER NOT NULL DEFAULT 0,
    ease_factor INTEGER NOT NULL DEFAULT 2500,
    repetitions INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )
`);

try {
  sqlite.exec(`ALTER TABLE words ADD COLUMN level TEXT`);
} catch (e) {
  // Ignore if column already exists
}

export { db, schema };
