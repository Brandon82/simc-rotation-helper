import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import type { Guide, AplSnapshot, Changelog } from '@simc-helper/shared';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dir = path.dirname(config.dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(config.dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS guides (
      id TEXT PRIMARY KEY,
      spec_name TEXT NOT NULL,
      class_name TEXT NOT NULL,
      apl_content TEXT NOT NULL,
      guide_content TEXT NOT NULL,
      apl_commit_sha TEXT NOT NULL,
      apl_commit_date TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      is_current INTEGER NOT NULL DEFAULT 0,
      model_used TEXT NOT NULL,
      prompt_version TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_guides_spec_current
      ON guides (spec_name, is_current);

    CREATE TABLE IF NOT EXISTS apl_snapshots (
      id TEXT PRIMARY KEY,
      spec_name TEXT NOT NULL,
      commit_sha TEXT NOT NULL,
      commit_date TEXT NOT NULL,
      content TEXT NOT NULL,
      checked_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_spec
      ON apl_snapshots (spec_name);

    CREATE TABLE IF NOT EXISTS qa_api_keys (
      id TEXT PRIMARY KEY,
      api_key TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      last_used_at TEXT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_qa_api_key
      ON qa_api_keys (api_key);
  `);

  // Add changelog column if not present (safe for existing DBs)
  try {
    db.exec('ALTER TABLE guides ADD COLUMN changelog TEXT');
  } catch {
    // Column already exists — ignore
  }

  return db;
}

// ── Row ↔ Guide conversion ────────────────────────────────────

function rowToGuide(row: Record<string, unknown>): Guide {
  return {
    id: row.id as string,
    spec_name: row.spec_name as string,
    class_name: row.class_name as string,
    apl_content: row.apl_content as string,
    guide_content: JSON.parse(row.guide_content as string),
    apl_commit_sha: row.apl_commit_sha as string,
    apl_commit_date: row.apl_commit_date as string,
    generated_at: row.generated_at as string,
    is_current: (row.is_current as number) === 1,
    model_used: row.model_used as string,
    prompt_version: row.prompt_version as string,
    changelog: row.changelog ? JSON.parse(row.changelog as string) : null,
  };
}

function rowToAplSnapshot(row: Record<string, unknown>): AplSnapshot {
  return {
    id: row.id as string,
    spec_name: row.spec_name as string,
    commit_sha: row.commit_sha as string,
    commit_date: row.commit_date as string,
    content: row.content as string,
    checked_at: row.checked_at as string,
  };
}

// ── Guide helpers ────────────────────────────────────────────

export async function getCurrentGuide(specName: string): Promise<Guide | null> {
  const row = getDb()
    .prepare('SELECT * FROM guides WHERE spec_name = ? AND is_current = 1 LIMIT 1')
    .get(specName) as Record<string, unknown> | undefined;
  return row ? rowToGuide(row) : null;
}

export async function getGuideById(id: string): Promise<Guide | null> {
  const row = getDb()
    .prepare('SELECT * FROM guides WHERE id = ? LIMIT 1')
    .get(id) as Record<string, unknown> | undefined;
  return row ? rowToGuide(row) : null;
}

export async function getGuideHistory(specName: string): Promise<Guide[]> {
  const rows = getDb()
    .prepare('SELECT * FROM guides WHERE spec_name = ? ORDER BY generated_at DESC')
    .all(specName) as Record<string, unknown>[];
  return rows.map(rowToGuide);
}

export async function markGuidesNotCurrent(specName: string): Promise<void> {
  getDb()
    .prepare('UPDATE guides SET is_current = 0 WHERE spec_name = ?')
    .run(specName);
}

export async function insertGuide(guide: Guide): Promise<void> {
  getDb()
    .prepare(`
      INSERT INTO guides
        (id, spec_name, class_name, apl_content, guide_content, apl_commit_sha,
         apl_commit_date, generated_at, is_current, model_used, prompt_version, changelog)
      VALUES
        (@id, @spec_name, @class_name, @apl_content, @guide_content, @apl_commit_sha,
         @apl_commit_date, @generated_at, @is_current, @model_used, @prompt_version, @changelog)
    `)
    .run({
      ...guide,
      guide_content: JSON.stringify(guide.guide_content),
      is_current: guide.is_current ? 1 : 0,
      changelog: guide.changelog ? JSON.stringify(guide.changelog) : null,
    });
}

export async function getCurrentGuideShas(): Promise<Record<string, string>> {
  const rows = getDb()
    .prepare('SELECT spec_name, apl_commit_sha FROM guides WHERE is_current = 1')
    .all() as { spec_name: string; apl_commit_sha: string }[];
  const result: Record<string, string> = {};
  for (const row of rows) result[row.spec_name] = row.apl_commit_sha;
  return result;
}

export async function getAllCurrentGuides(): Promise<Guide[]> {
  const rows = getDb()
    .prepare('SELECT * FROM guides WHERE is_current = 1')
    .all() as Record<string, unknown>[];
  return rows.map(rowToGuide);
}

// ── APL Snapshot helpers ─────────────────────────────────────

export async function insertAplSnapshot(snapshot: AplSnapshot): Promise<void> {
  getDb()
    .prepare(`
      INSERT INTO apl_snapshots
        (id, spec_name, commit_sha, commit_date, content, checked_at)
      VALUES
        (@id, @spec_name, @commit_sha, @commit_date, @content, @checked_at)
    `)
    .run(snapshot);
}

export async function getAllGuideSummaries(): Promise<Omit<Guide, 'guide_content' | 'apl_content'>[]> {
  const rows = getDb()
    .prepare(`
      SELECT id, spec_name, class_name, apl_commit_sha, apl_commit_date,
             generated_at, is_current, model_used, prompt_version
      FROM guides
      ORDER BY generated_at DESC
    `)
    .all() as Record<string, unknown>[];
  return rows.map(row => ({
    id: row.id as string,
    spec_name: row.spec_name as string,
    class_name: row.class_name as string,
    apl_content: '',
    guide_content: { sections: [] },
    apl_commit_sha: row.apl_commit_sha as string,
    apl_commit_date: row.apl_commit_date as string,
    generated_at: row.generated_at as string,
    is_current: (row.is_current as number) === 1,
    model_used: row.model_used as string,
    prompt_version: row.prompt_version as string,
    changelog: null,
  }));
}

export async function deleteOldGuides(specName?: string): Promise<number> {
  const stmt = specName
    ? getDb().prepare('DELETE FROM guides WHERE is_current = 0 AND spec_name = ?')
    : getDb().prepare('DELETE FROM guides WHERE is_current = 0');
  const result = specName ? stmt.run(specName) : stmt.run();
  return result.changes;
}

export async function updateGuideChangelog(id: string, changelog: Changelog): Promise<void> {
  getDb()
    .prepare('UPDATE guides SET changelog = ? WHERE id = ?')
    .run(JSON.stringify(changelog), id);
}

export async function getSpecsWithGuides(): Promise<Set<string>> {
  const rows = getDb()
    .prepare('SELECT DISTINCT spec_name FROM guides WHERE is_current = 1')
    .all() as { spec_name: string }[];
  return new Set(rows.map(r => r.spec_name));
}

// ── QA API Key helpers ──────────────────────────────────────

export function validateQaApiKey(apiKey: string): boolean {
  const row = getDb()
    .prepare('SELECT id FROM qa_api_keys WHERE api_key = ? AND is_active = 1')
    .get(apiKey) as { id: string } | undefined;
  if (row) {
    getDb()
      .prepare('UPDATE qa_api_keys SET last_used_at = ? WHERE id = ?')
      .run(new Date().toISOString(), row.id);
  }
  return !!row;
}

export function insertQaApiKey(id: string, apiKey: string, label: string): void {
  getDb()
    .prepare('INSERT INTO qa_api_keys (id, api_key, label, is_active, created_at) VALUES (?, ?, ?, 1, ?)')
    .run(id, apiKey, label, new Date().toISOString());
}

export function listQaApiKeys(): Array<{ id: string; api_key: string; label: string; is_active: boolean; created_at: string; last_used_at: string | null }> {
  const rows = getDb()
    .prepare('SELECT * FROM qa_api_keys ORDER BY created_at DESC')
    .all() as Array<Record<string, unknown>>;
  return rows.map(r => ({
    id: r.id as string,
    api_key: r.api_key as string,
    label: r.label as string,
    is_active: (r.is_active as number) === 1,
    created_at: r.created_at as string,
    last_used_at: (r.last_used_at as string | null),
  }));
}

export function deactivateQaApiKey(id: string): boolean {
  const result = getDb()
    .prepare('UPDATE qa_api_keys SET is_active = 0 WHERE id = ?')
    .run(id);
  return result.changes > 0;
}
