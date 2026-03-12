import { Router } from 'express';
import type { Request, Response } from 'express';
import { CLASSES } from '../data/specs.js';
import { getSpecsWithGuides } from '../db/client.js';

const router = Router();

// GET /api/specs
router.get('/', async (_req: Request, res: Response) => {
  try {
    const specsWithGuides = await getSpecsWithGuides();

    const classes = CLASSES.map(cls => ({
      ...cls,
      specs: cls.specs.map(spec => ({
        ...spec,
        hasGuide: specsWithGuides.has(spec.name),
      })),
    }));

    res.json({ classes });
  } catch (err) {
    console.error('[GET /api/specs]', err);
    res.status(500).json({ error: 'Failed to load specs' });
  }
});

export default router;
