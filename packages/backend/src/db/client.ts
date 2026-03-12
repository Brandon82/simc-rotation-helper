import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import type { DbSchema, Guide, AplSnapshot } from '@simc-helper/shared';
import { config } from '../config.js';

const defaultData: DbSchema = { guides: [], apl_snapshots: [] };

let db: Low<DbSchema> | null = null;

export async function getDb(): Promise<Low<DbSchema>> {
  if (db) return db;

  const dir = path.dirname(config.dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const adapter = new JSONFile<DbSchema>(config.dbPath);
  db = new Low<DbSchema>(adapter, defaultData);
  await db.read();
  db.data.guides ??= [];
  db.data.apl_snapshots ??= [];
  await db.write();
  return db;
}

/** Re-reads the JSON file from disk before every read operation so external
 *  processes (scripts, separate runs) are always reflected. */
async function freshRead(): Promise<Low<DbSchema>> {
  const instance = await getDb();
  await instance.read();
  return instance;
}

// ── Guide helpers ────────────────────────────────────────────

export async function getCurrentGuide(specName: string): Promise<Guide | null> {
  const db = await freshRead();
  return db.data.guides.find(g => g.spec_name === specName && g.is_current) ?? null;
}

export async function getGuideById(id: string): Promise<Guide | null> {
  const db = await freshRead();
  return db.data.guides.find(g => g.id === id) ?? null;
}

export async function getGuideHistory(specName: string): Promise<Guide[]> {
  const db = await freshRead();
  return db.data.guides
    .filter(g => g.spec_name === specName)
    .sort((a, b) => b.generated_at.localeCompare(a.generated_at));
}

export async function markGuidesNotCurrent(specName: string): Promise<void> {
  const db = await freshRead();
  db.data.guides.forEach(g => {
    if (g.spec_name === specName) g.is_current = false;
  });
  await db.write();
}

export async function insertGuide(guide: Guide): Promise<void> {
  const db = await getDb();
  db.data.guides.push(guide);
  await db.write();
}

export async function getCurrentGuideShas(): Promise<Record<string, string>> {
  const db = await freshRead();
  const result: Record<string, string> = {};
  db.data.guides
    .filter(g => g.is_current)
    .forEach(g => { result[g.spec_name] = g.apl_commit_sha; });
  return result;
}

// ── APL Snapshot helpers ─────────────────────────────────────

export async function insertAplSnapshot(snapshot: AplSnapshot): Promise<void> {
  const db = await getDb();
  db.data.apl_snapshots.push(snapshot);
  await db.write();
}

export async function getSpecsWithGuides(): Promise<Set<string>> {
  const db = await freshRead();
  return new Set(db.data.guides.filter(g => g.is_current).map(g => g.spec_name));
}
