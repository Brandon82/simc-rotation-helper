// ── Guide Content Types ──────────────────────────────────────

export interface PriorityItem {
  order: number;
  ability: string;
  condition: string; // plain English, empty string if unconditional
  note?: string;
}

export interface GuideSection {
  id: string;
  title: string;
  content: string;
  steps?: string[];        // for precombat setup
  priority?: PriorityItem[]; // for opener, st, aoe, summary
}

export interface GuideContent {
  sections: GuideSection[];
}

// ── Changelog Types ─────────────────────────────────────────

export interface Changelog {
  items: string[];
  previousCommitSha: string;
  previousCommitDate: string;
  previousGeneratedAt: string;
}

// ── Database Record Types ────────────────────────────────────

export interface Guide {
  id: string;
  spec_name: string;
  class_name: string;
  apl_content: string;
  guide_content: GuideContent;
  apl_commit_sha: string;
  apl_commit_date: string;
  generated_at: string;
  is_current: boolean;
  model_used: string;
  prompt_version: string;
  changelog: Changelog | null;
}

export interface AplSnapshot {
  id: string;
  spec_name: string;
  commit_sha: string;
  commit_date: string;
  content: string;
  checked_at: string;
}

export interface DbSchema {
  guides: Guide[];
  apl_snapshots: AplSnapshot[];
}

// ── Spec / Class Meta ────────────────────────────────────────

export type Role = 'dps' | 'healer' | 'tank';

export interface SpecInfo {
  name: string;       // e.g. "warrior_arms" (used as API/DB key)
  aplName?: string;   // overrides name for SimC .simc filename, e.g. "deathknight_blood"
  label: string;      // e.g. "Arms"
  role: Role;
}

export interface ClassInfo {
  name: string;       // e.g. "warrior"
  label: string;      // e.g. "Warrior"
  color: string;      // hex color for the class
  specs: SpecInfo[];
}

// ── API Response Types ───────────────────────────────────────

export interface SpecsApiResponse {
  classes: (ClassInfo & { specs: (SpecInfo & { hasGuide: boolean })[] })[];
}

export interface GuideApiResponse {
  id: string;
  specName: string;
  className: string;
  aplFileName: string;
  aplCommitSha: string;
  aplCommitDate: string;
  generatedAt: string;
  modelUsed: string;
  guide: GuideContent;
  changelog: Changelog | null;
}

export interface GuideHistoryItem {
  id: string;
  aplCommitSha: string;
  aplCommitDate: string;
  generatedAt: string;
}

export interface GuideHistoryApiResponse {
  history: GuideHistoryItem[];
}

export interface RankingItem {
  specName: string;    // e.g. "warrior_arms"
  className: string;   // e.g. "warrior"
  label: string;       // e.g. "Arms"
  classLabel: string;  // e.g. "Warrior"
  color: string;       // hex color e.g. "#C69B3A"
  rank: number;
  actionCount: number;
}

export interface RankingsApiResponse {
  singleTarget: RankingItem[];
  aoe: RankingItem[];
}

export interface GuideSummaryItem {
  id: string;
  specName: string;
  specLabel: string;
  className: string;
  classLabel: string;
  aplCommitSha: string;
  aplCommitDate: string;
  generatedAt: string;
  isCurrent: boolean;
  modelUsed: string;
  changelog: Changelog | null;
}

export interface AllGuidesApiResponse {
  guides: GuideSummaryItem[];
}

// ── Changelog (Project) Types ───────────────────────────────

export interface ChangelogCommit {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  date: string;       // ISO 8601
  url: string;        // GitHub commit URL
}

export interface ChangelogApiResponse {
  commits: ChangelogCommit[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// ── Q&A Types ───────────────────────────────────────────────

export interface QARequest {
  specName: string;
  question: string;
}

export interface QAResponse {
  answer: string;
  specName: string;
}

export interface QAValidateResponse {
  valid: boolean;
}

export interface QAKeyInfo {
  id: string;
  label: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}
