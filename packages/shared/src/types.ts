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
  aplCommitSha: string;
  aplCommitDate: string;
  generatedAt: string;
  modelUsed: string;
  guide: GuideContent;
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
