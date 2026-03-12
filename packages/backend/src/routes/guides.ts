import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  getCurrentGuide,
  getGuideHistory,
  getGuideById,
} from '../db/client.js';
import type { GuideApiResponse, GuideHistoryApiResponse } from '@simc-helper/shared';

const router = Router();

// GET /api/guides/:specName
router.get('/:specName', async (req: Request, res: Response) => {
  const { specName } = req.params;
  try {
    const guide = await getCurrentGuide(specName);
    if (!guide) {
      res.status(404).json({ error: `No guide found for spec: ${specName}` });
      return;
    }

    const response: GuideApiResponse = {
      id: guide.id,
      specName: guide.spec_name,
      className: guide.class_name,
      aplCommitSha: guide.apl_commit_sha,
      aplCommitDate: guide.apl_commit_date,
      generatedAt: guide.generated_at,
      modelUsed: guide.model_used,
      guide: guide.guide_content,
    };

    res.json(response);
  } catch (err) {
    console.error(`[GET /api/guides/${specName}]`, err);
    res.status(500).json({ error: 'Failed to load guide' });
  }
});

// GET /api/guides/:specName/history
router.get('/:specName/history', async (req: Request, res: Response) => {
  const { specName } = req.params;
  try {
    const guides = await getGuideHistory(specName);

    const response: GuideHistoryApiResponse = {
      history: guides.map(g => ({
        id: g.id,
        aplCommitSha: g.apl_commit_sha,
        aplCommitDate: g.apl_commit_date,
        generatedAt: g.generated_at,
      })),
    };

    res.json(response);
  } catch (err) {
    console.error(`[GET /api/guides/${specName}/history]`, err);
    res.status(500).json({ error: 'Failed to load guide history' });
  }
});

// GET /api/guides/:specName/history/:id
router.get('/:specName/history/:id', async (req: Request, res: Response) => {
  const { specName, id } = req.params;
  try {
    const guide = await getGuideById(id);
    if (!guide || guide.spec_name !== specName) {
      res.status(404).json({ error: 'Guide not found' });
      return;
    }

    const response: GuideApiResponse = {
      id: guide.id,
      specName: guide.spec_name,
      className: guide.class_name,
      aplCommitSha: guide.apl_commit_sha,
      aplCommitDate: guide.apl_commit_date,
      generatedAt: guide.generated_at,
      modelUsed: guide.model_used,
      guide: guide.guide_content,
    };

    res.json(response);
  } catch (err) {
    console.error(`[GET /api/guides/${specName}/history/${id}]`, err);
    res.status(500).json({ error: 'Failed to load historical guide' });
  }
});

export default router;
