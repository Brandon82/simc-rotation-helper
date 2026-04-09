/**
 * Seed the database with pre-generated sample guides for local development.
 * No API calls required - guide content is generated from role-based templates.
 *
 * Run with: npm run seed:sample
 */
import crypto from 'crypto';
import { getDb, insertGuide, insertAplSnapshot, markGuidesNotCurrent, insertQaApiKey, listQaApiKeys } from '../db/client.js';
import { CLASSES } from '../data/specs.js';
import type { GuideContent, PriorityItem, Guide, AplSnapshot, Role } from '@simc-helper/shared';

// ── Role-based templates ───────────────────────────────────────

interface RoleTemplate {
  overview: string;
  precombat: string[];
  st: Array<{ ability: string; condition: string; note?: string }>;
  aoe: Array<{ ability: string; condition: string; note?: string }>;
  talents: string;
  items: string;
}

const DPS_TEMPLATE: RoleTemplate = {
  overview: '${specLabel} ${classLabel} is a damage-dealing specialization that focuses on maximizing sustained and burst throughput. The spec revolves around managing resources efficiently and capitalizing on cooldown windows for peak damage output.',
  precombat: [
    'Apply your class buff before the pull',
    'Use your gap closer or pre-cast ability to engage',
    'Open with your primary cooldown for burst',
  ],
  st: [
    { ability: 'Major Cooldown', condition: 'On cooldown', note: 'Primary burst window' },
    { ability: 'Core Spender', condition: 'Resource above threshold', note: 'Main damage ability' },
    { ability: 'Proc Reaction', condition: 'Proc is active', note: 'Use before it expires' },
    { ability: 'Resource Builder', condition: 'No procs available', note: 'Generates resources' },
    { ability: 'DoT Maintenance', condition: 'DoT not active or about to expire' },
    { ability: 'Filler Ability', condition: 'Nothing else available' },
  ],
  aoe: [
    { ability: 'AoE Cooldown', condition: '3+ targets', note: 'Strong burst AoE' },
    { ability: 'Spread DoT', condition: 'Targets missing DoT' },
    { ability: 'AoE Spender', condition: 'Resource above threshold', note: 'Main AoE damage' },
    { ability: 'Cleave Filler', condition: '2+ targets' },
    { ability: 'ST Filler', condition: 'Between AoE casts' },
  ],
  talents: '${specLabel} talents should focus on throughput in your primary damage window. Look for talents that synergize with your core cooldown and resource generation cycle.',
  items: 'Prioritize Critical Strike and Haste as primary secondary stats. On-use trinkets that align with your burst cooldown windows are preferred.',
};

const TANK_TEMPLATE: RoleTemplate = {
  overview: '${specLabel} ${classLabel} is a tank specialization that excels at mitigating incoming damage through active abilities and cooldown management. The spec provides strong group utility and reliable threat generation.',
  precombat: [
    'Activate your defensive stance or presence',
    'Use your gap closer to engage and establish threat',
    'Activate your primary mitigation before melee contact',
  ],
  st: [
    { ability: 'Active Mitigation', condition: 'Not active and charges available', note: 'Core damage reduction' },
    { ability: 'Threat Builder', condition: 'On cooldown', note: 'Primary resource generator' },
    { ability: 'Defensive Cooldown', condition: 'Incoming heavy damage' },
    { ability: 'Self-Heal', condition: 'Resource above threshold or health below 60%', note: 'Primary sustain' },
    { ability: 'Resource Dump', condition: 'At resource cap' },
    { ability: 'Filler', condition: 'Nothing else available' },
  ],
  aoe: [
    { ability: 'AoE Threat', condition: 'On cooldown', note: 'Primary AoE threat and damage' },
    { ability: 'Active Mitigation', condition: 'Maintain uptime' },
    { ability: 'AoE Damage', condition: 'On cooldown or free proc', note: 'Secondary AoE' },
    { ability: 'Self-Heal', condition: 'Health below threshold or excess resource' },
    { ability: 'Filler', condition: 'Default' },
  ],
  talents: '${specLabel} talents should prioritize survivability and active mitigation uptime. Utility talents that benefit your group are also strong choices for dungeon content.',
  items: 'Prioritize Versatility and Haste as primary secondary stats. Trinkets with defensive effects or on-use absorbs are preferred over pure damage options.',
};

const HEALER_TEMPLATE: RoleTemplate = {
  overview: '${specLabel} ${classLabel} is a healer specialization focused on keeping allies alive through a mix of direct heals, HoTs, and powerful cooldowns. The spec balances mana efficiency with throughput and contributes damage during low-pressure moments.',
  precombat: [
    'Ensure mana is full and consumables are active',
    'Pre-shield or HoT the tank before the pull',
    'Position safely at range with line of sight to the group',
  ],
  st: [
    { ability: 'Emergency Heal', condition: 'Target below 30% HP', note: 'Fast, expensive heal' },
    { ability: 'Core Heal', condition: 'Target below 70% HP', note: 'Efficient single-target heal' },
    { ability: 'HoT Maintenance', condition: 'HoT not active on tank' },
    { ability: 'Healing Cooldown', condition: 'Multiple allies below 50% HP' },
    { ability: 'Mana Regeneration', condition: 'Mana below 50% during downtime' },
    { ability: 'DPS Filler', condition: 'Group is healthy', note: 'Contribute damage when safe' },
  ],
  aoe: [
    { ability: 'Raid Cooldown', condition: 'Major raid damage incoming', note: 'Coordinate with other healers' },
    { ability: 'AoE Heal', condition: '3+ allies below 70% HP', note: 'Primary group healing' },
    { ability: 'Smart Heal', condition: 'Moderate group damage' },
    { ability: 'Spread HoT', condition: 'Sustained damage phase' },
    { ability: 'DPS Filler', condition: 'Group is stable' },
  ],
  talents: '${specLabel} talents should balance throughput and mana efficiency. Prioritize talents that strengthen your core healing toolkit and provide emergency options for high-damage phases.',
  items: 'Prioritize Haste and Critical Strike as primary secondary stats. Intellect trinkets with on-use healing effects or mana restoration are preferred.',
};

const ROLE_TEMPLATES: Record<Role, RoleTemplate> = {
  dps: DPS_TEMPLATE,
  tank: TANK_TEMPLATE,
  healer: HEALER_TEMPLATE,
};

// ── Template interpolation ─────────────────────────────────────

function interpolate(template: RoleTemplate, specLabel: string, classLabel: string): RoleTemplate {
  const replace = (s: string) => s.replace(/\$\{specLabel\}/g, specLabel).replace(/\$\{classLabel\}/g, classLabel);
  return {
    overview: replace(template.overview),
    precombat: template.precombat.map(replace),
    st: template.st.map(item => ({ ...item, ability: replace(item.ability), condition: replace(item.condition), ...(item.note ? { note: replace(item.note) } : {}) })),
    aoe: template.aoe.map(item => ({ ...item, ability: replace(item.ability), condition: replace(item.condition), ...(item.note ? { note: replace(item.note) } : {}) })),
    talents: replace(template.talents),
    items: replace(template.items),
  };
}

// ── Guide assembly ─────────────────────────────────────────────

function buildGuideContent(spec: RoleTemplate): GuideContent {
  const makePriority = (items: RoleTemplate['st']): PriorityItem[] =>
    items.map((item, i) => ({
      order: i + 1,
      ability: item.ability,
      condition: item.condition,
      ...(item.note ? { note: item.note } : {}),
    }));

  return {
    sections: [
      { id: 'overview', title: 'Overview', content: spec.overview },
      { id: 'talent_notes', title: 'Talent Notes', content: spec.talents },
      { id: 'precombat', title: 'Pre-Combat', content: 'Prepare the following before engaging the boss or pull.', steps: spec.precombat },
      { id: 'single_target', title: 'Single Target Priority', content: 'Follow this priority list for single-target encounters. Always use the highest available action.', priority: makePriority(spec.st) },
      { id: 'aoe', title: 'AoE Priority', content: 'Use this priority when fighting 3 or more targets. Adjust based on target count and duration.', priority: makePriority(spec.aoe) },
      { id: 'items_and_racials', title: 'Items & Racials', content: spec.items },
    ],
  };
}

function generateSampleApl(specName: string, classLabel: string, specLabel: string, role: string): string {
  return `# ${classLabel} - ${specLabel} (${role})
# Sample APL for local development - not from SimulationCraft

actions.precombat=flask
actions.precombat+=/food
actions.precombat+=/augmentation
actions.precombat+=/snapshot_stats

actions=auto_attack
actions+=/use_items
actions+=/call_action_list,name=default

actions.default=run_action_list,name=st,if=active_enemies=1
actions.default+=/run_action_list,name=aoe,if=active_enemies>=3

actions.st=variable,name=st_priority,value=1
actions.aoe=variable,name=aoe_priority,value=1
`;
}

// ── Main seed function ─────────────────────────────────────────

export async function seedSampleData() {
  console.log('[seed] Loading role-based sample guides (no API calls required)...');

  getDb();

  const sampleSha = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
  const sampleDate = '2025-12-01T00:00:00Z';
  const generatedAt = new Date().toISOString();

  let inserted = 0;
  let skipped = 0;

  for (const cls of CLASSES) {
    for (const spec of cls.specs) {
      const existing = getDb()
        .prepare('SELECT id FROM guides WHERE spec_name = ? AND is_current = 1')
        .get(spec.name);

      if (existing) {
        console.log(`  [skip] ${spec.name} - already has a current guide`);
        skipped++;
        continue;
      }

      const template = interpolate(ROLE_TEMPLATES[spec.role], spec.label, cls.label);
      const guideId = crypto.randomUUID();
      const snapshotId = crypto.randomUUID();
      const aplContent = generateSampleApl(spec.name, cls.label, spec.label, spec.role);

      const snapshot: AplSnapshot = {
        id: snapshotId,
        spec_name: spec.name,
        commit_sha: sampleSha,
        commit_date: sampleDate,
        content: aplContent,
        checked_at: generatedAt,
      };

      try {
        await insertAplSnapshot(snapshot);
      } catch {
        // Snapshot may already exist
      }

      const guide: Guide = {
        id: guideId,
        spec_name: spec.name,
        class_name: cls.name,
        apl_content: aplContent,
        guide_content: buildGuideContent(template),
        apl_commit_sha: sampleSha,
        apl_commit_date: sampleDate,
        generated_at: generatedAt,
        is_current: true,
        model_used: 'sample-data',
        prompt_version: 'sample',
        changelog: null,
      };

      await markGuidesNotCurrent(spec.name);
      await insertGuide(guide);
      console.log(`  [ok]   ${spec.name}`);
      inserted++;
    }
  }

  // Create a dev QA API key
  const DEV_QA_KEY = 'qa_dev_000000000000000000000000000000000000000000000000';
  const existingKeys = listQaApiKeys();
  const devKeyExists = existingKeys.some(k => k.api_key === DEV_QA_KEY && k.is_active);

  if (!devKeyExists) {
    insertQaApiKey(crypto.randomUUID(), DEV_QA_KEY, 'dev');
    console.log(`\nDev QA API key created: ${DEV_QA_KEY}`);
  } else {
    console.log('\nDev QA API key already exists (skipped).');
  }

  console.log(`[seed] Sample seed complete: ${inserted} inserted, ${skipped} skipped.`);
}

// Run directly: npm run seed:sample
const isDirectRun = import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`;
if (isDirectRun) {
  seedSampleData().catch(err => {
    console.error('Sample seed failed:', err);
    process.exit(1);
  });
}
