import { Router } from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import { config } from '../config.js';
import { checkAndUpdateSpec, checkAndUpdateMany, checkAndUpdateClass, checkAndUpdateAll } from '../services/guideService.js';
import { getSpecInfo, getClassInfo } from '../data/specs.js';
import { deleteOldGuides, insertQaApiKey, listQaApiKeys, deactivateQaApiKey } from '../db/client.js';

const router = Router();

function requireAdminAuth(req: Request, res: Response): boolean {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.replace('Bearer ', '');
  if (token !== config.adminSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

// POST /api/admin/refresh
// Body: { "spec": "warrior_arms" }
router.post('/refresh', async (req: Request, res: Response) => {
  if (!requireAdminAuth(req, res)) return;

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
  if (!requireAdminAuth(req, res)) return;

  const { spec } = req.body as { spec?: string };

  if (spec && !getSpecInfo(spec)) {
    res.status(400).json({ error: `Unknown spec: ${spec}` });
    return;
  }

  const deleted = await deleteOldGuides(spec);
  res.json({ deleted, spec: spec ?? 'all' });
});

// ── QA API Key management ───────────────────────────────────

// POST /api/admin/qa-keys  { "label": "Brandon" }
router.post('/qa-keys', (req: Request, res: Response) => {
  if (!requireAdminAuth(req, res)) return;

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
  if (!requireAdminAuth(req, res)) return;
  res.json({ keys: listQaApiKeys() });
});

// DELETE /api/admin/qa-keys/:id
router.delete('/qa-keys/:id', (req: Request, res: Response) => {
  if (!requireAdminAuth(req, res)) return;

  const found = deactivateQaApiKey(req.params.id);
  if (!found) {
    res.status(404).json({ error: 'Key not found' });
    return;
  }
  res.json({ deactivated: true });
});

export default router;
