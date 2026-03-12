import { Router } from 'express';
import type { Request, Response } from 'express';
import { config } from '../config.js';
import { checkAndUpdateSpec } from '../services/guideService.js';
import { getSpecInfo } from '../data/specs.js';

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

  const { spec } = req.body as { spec?: string };
  if (!spec) {
    res.status(400).json({ error: 'Missing "spec" field in request body' });
    return;
  }

  const specInfo = getSpecInfo(spec);
  if (!specInfo) {
    res.status(400).json({ error: `Unknown spec: ${spec}` });
    return;
  }

  const result = await checkAndUpdateSpec(spec);
  res.json({ triggered: true, spec, result });
});

export default router;
