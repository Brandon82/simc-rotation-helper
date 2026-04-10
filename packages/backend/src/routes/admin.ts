import { Router } from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import { requireAdmin } from '../middleware/auth.js';
import { checkAndUpdateSpec, checkAndUpdateMany, checkAndUpdateClass, checkAndUpdateAll } from '../services/guideService.js';
import { getSpecInfo, getClassInfo, getClassForSpec, ALL_SPECS } from '../data/specs.js';
import { deleteOldGuides, insertQaApiKey, listQaApiKeys, deactivateQaApiKey, getCurrentGuide, getGuideHistory, updateGuideChangelog, clearAllChangelogs } from '../db/client.js';
import { generateChangelog } from '../services/llmService.js';

const router = Router();

// All admin routes require authentication
router.use(requireAdmin);

async function backfillChangelogs(
  specNames: string[],
  mode: 'current' | 'all',
): Promise<Record<string, { updated: number; skipped: number; errors: number }>> {
  const results: Record<string, { updated: number; skipped: number; errors: number }> = {};

  for (const specName of specNames) {
    const specInfo = getSpecInfo(specName);
    const classInfo = getClassForSpec(specName);
    if (!specInfo || !classInfo) continue;

    const history = await getGuideHistory(specName);
    if (history.length < 2) {
      results[specName] = { updated: 0, skipped: history.length, errors: 0 };
      continue;
    }

    // history is ordered by generated_at DESC (newest first)
    const guidesToProcess = mode === 'all' ? history : [history[0]];
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const guide of guidesToProcess) {
      if (guide.changelog) { skipped++; continue; }

      // Find the next older guide in history
      const guideIdx = history.findIndex(g => g.id === guide.id);
      const previous = history[guideIdx + 1];
      if (!previous) { skipped++; continue; }

      try {
        const items = await generateChangelog(specInfo.label, classInfo.label, previous.guide_content, guide.guide_content);
        await updateGuideChangelog(guide.id, {
          items,
          previousCommitSha: previous.apl_commit_sha,
          previousCommitDate: previous.apl_commit_date,
          previousGeneratedAt: previous.generated_at,
        });
        updated++;
        console.log(`[backfill] ${specName} guide ${guide.id.slice(0, 8)}: changelog generated (${items.length} items)`);
      } catch (err) {
        console.error(`[backfill] ${specName} guide ${guide.id.slice(0, 8)}: failed`, err);
        errors++;
      }
    }

    results[specName] = { updated, skipped, errors };
  }

  console.log('[backfill] complete:', JSON.stringify(results));
  return results;
}

// POST /api/admin/refresh
// Body: { "spec": "warrior_arms" }
router.post('/refresh', async (req: Request, res: Response) => {

  const { spec, class: className, force } = req.body as { spec?: string | string[]; class?: string; force?: boolean };

  // Class refresh → all specs for that class in parallel
  if (className) {
    if (!getClassInfo(className)) {
      res.status(400).json({ error: `Unknown class: ${className}` });
      return;
    }
    const results = await checkAndUpdateClass(className, !!force);
    res.json({ triggered: true, class: className, force: !!force, results });
    return;
  }

  if (!spec) {
    res.status(400).json({ error: 'Missing "spec" or "class" field in request body' });
    return;
  }

  // Array of specs → parallel execution
  if (Array.isArray(spec)) {
    const unknown = spec.filter(s => !getSpecInfo(s));
    if (unknown.length) {
      res.status(400).json({ error: `Unknown spec(s): ${unknown.join(', ')}` });
      return;
    }
    const results = await checkAndUpdateMany(spec, !!force);
    res.json({ triggered: true, spec, force: !!force, results });
    return;
  }

  if (spec === 'all') {
    const results = await checkAndUpdateAll(2000, !!force);
    res.json({ triggered: true, spec: 'all', force: !!force, results });
    return;
  }

  const specInfo = getSpecInfo(spec);
  if (!specInfo) {
    res.status(400).json({ error: `Unknown spec: ${spec}` });
    return;
  }

  const result = await checkAndUpdateSpec(spec, !!force);
  res.json({ triggered: true, spec, force: !!force, result });
});

// DELETE /api/admin/guides/history
// Optional body: { "spec": "warrior_arms" } to limit to one spec
router.delete('/guides/history', async (req: Request, res: Response) => {

  const { spec } = req.body as { spec?: string };

  if (spec && !getSpecInfo(spec)) {
    res.status(400).json({ error: `Unknown spec: ${spec}` });
    return;
  }

  const deleted = await deleteOldGuides(spec);
  res.json({ deleted, spec: spec ?? 'all' });
});

// POST /api/admin/backfill-changelog
// Body: { "spec": "warrior_arms" | "all", "mode": "current" | "all" }
// mode "current" (default): only backfill the current guide for each spec
// mode "all": backfill every guide in history that doesn't have a changelog
// Skips guides that already have a changelog or have no previous guide to compare against.
// For "all" specs: runs in the background to avoid request timeouts.
router.post('/backfill-changelog', async (req: Request, res: Response) => {

  const { spec, mode = 'current' } = req.body as { spec?: string; mode?: 'current' | 'all' };
  if (!spec) {
    res.status(400).json({ error: 'Missing "spec" field' });
    return;
  }

  const specNames = spec === 'all'
    ? ALL_SPECS.map(s => s.name)
    : [spec];

  if (spec !== 'all') {
    const specInfo = getSpecInfo(spec);
    if (!specInfo) {
      res.status(400).json({ error: `Unknown spec: ${spec}` });
      return;
    }
  }

  // For multiple specs, run in background to avoid timeout
  if (specNames.length > 1) {
    res.json({ accepted: true, message: `Backfilling ${specNames.length} specs in background (mode=${mode}). Check server logs for progress.` });
    backfillChangelogs(specNames, mode).catch(err =>
      console.error('[backfill] background job failed:', err)
    );
    return;
  }

  // Single spec: run inline and return results
  const results = await backfillChangelogs(specNames, mode);
  res.json({ results });
});

// DELETE /api/admin/changelogs
// Clears all changelogs from every guide.
router.delete('/changelogs', async (req: Request, res: Response) => {

  const cleared = await clearAllChangelogs();
  res.json({ cleared });
});

// ── QA API Key management ───────────────────────────────────

// POST /api/admin/qa-keys  { "label": "Brandon" }
router.post('/qa-keys', (req: Request, res: Response) => {

  const { label } = req.body as { label?: string };
  if (!label) {
    res.status(400).json({ error: 'Missing "label" field' });
    return;
  }

  const id = crypto.randomUUID();
  const apiKey = `qa_${crypto.randomBytes(24).toString('hex')}`;
  insertQaApiKey(id, apiKey, label);
  res.json({ id, apiKey, label });
});

// GET /api/admin/qa-keys
router.get('/qa-keys', (req: Request, res: Response) => {
  res.json({ keys: listQaApiKeys() });
});

// DELETE /api/admin/qa-keys/:id
router.delete('/qa-keys/:id', (req: Request, res: Response) => {

  const found = deactivateQaApiKey(req.params.id);
  if (!found) {
    res.status(404).json({ error: 'Key not found' });
    return;
  }
  res.json({ deactivated: true });
});

export default router;
