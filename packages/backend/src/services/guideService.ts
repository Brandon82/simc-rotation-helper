import { v4 as uuidv4 } from 'uuid';
import type { Guide, AplSnapshot } from '@simc-helper/shared';
import { config } from '../config.js';
import * as db from '../db/client.js';
import * as github from './githubService.js';
import { generateGuide } from './llmService.js';
import { getSpecInfo, getClassForSpec, ALL_SPECS } from '../data/specs.js';

/**
 * Checks if the APL for a spec has changed since last generation.
 * If so, fetches the new APL, generates a guide via LLM, and stores it.
 * Returns 'updated' | 'skipped' | 'error'.
 */
export async function checkAndUpdateSpec(specName: string, force = false): Promise<'updated' | 'skipped' | 'error'> {
  try {
    const specInfo = getSpecInfo(specName);
    const classInfo = getClassForSpec(specName);
    if (!specInfo || !classInfo) {
      console.warn(`[guideService] Unknown spec: ${specName}`);
      return 'error';
    }

    const aplFileName = specInfo.aplName ?? specName;

    // 1. Get latest commit info from GitHub
    const { sha, date } = await github.getLatestCommitInfo(aplFileName);

    // 2. Check if we already have a guide for this SHA (skip if force)
    const existing = await db.getCurrentGuide(specName);
    if (!force && existing?.apl_commit_sha === sha) {
      console.log(`[guideService] ${specName}: up-to-date (sha=${sha.slice(0, 8)})`);
      return 'skipped';
    }
    if (force) {
      console.log(`[guideService] ${specName}: force regenerate (sha=${sha.slice(0, 8)})`);
    }

    console.log(`[guideService] ${specName}: change detected (${existing?.apl_commit_sha?.slice(0, 8) ?? 'none'} → ${sha.slice(0, 8)})`);

    // 3. Fetch raw APL content
    const aplContent = await github.fetchAplContent(aplFileName);

    // 4. Store APL snapshot
    const snapshot: AplSnapshot = {
      id: uuidv4(),
      spec_name: specName,
      commit_sha: sha,
      commit_date: date,
      content: aplContent,
      checked_at: new Date().toISOString(),
    };
    await db.insertAplSnapshot(snapshot);

    // 5. Generate guide via LLM
    console.log(`[guideService] ${specName}: generating guide...`);
    const guideContent = await generateGuide(specInfo.label, classInfo.label, aplContent);

    // 6. Mark old guides as not current
    await db.markGuidesNotCurrent(specName);

    // 7. Insert new current guide
    const guide: Guide = {
      id: uuidv4(),
      spec_name: specName,
      class_name: classInfo.name,
      apl_content: aplContent,
      guide_content: guideContent,
      apl_commit_sha: sha,
      apl_commit_date: date,
      generated_at: new Date().toISOString(),
      is_current: true,
      model_used: config.anthropicModel,
      prompt_version: config.promptVersion,
    };
    await db.insertGuide(guide);

    console.log(`[guideService] ${specName}: guide saved (id=${guide.id})`);
    return 'updated';
  } catch (err) {
    console.error(`[guideService] Error processing ${specName}:`, err);
    return 'error';
  }
}

/**
 * Runs checkAndUpdateSpec for all known specs sequentially.
 * Used by the daily cron job only — not exposed via the admin API.
 */
export async function checkAndUpdateAll(delayMs = 2000): Promise<void> {
  console.log(`[guideService] Starting full update for ${ALL_SPECS.length} specs`);
  for (const spec of ALL_SPECS) {
    await checkAndUpdateSpec(spec.name);
    if (delayMs > 0) {
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  console.log('[guideService] Full update complete');
}
