import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  getCurrentGuide,
  getGuideHistory,
  getGuideById,
  getAllGuideSummaries,
} from '../db/client.js';
import { getSpecInfo, getClassForSpec, getClassInfo } from '../data/specs.js';
import type { GuideApiResponse, GuideHistoryApiResponse, AllGuidesApiResponse } from '@simc-helper/shared';

const router = Router();

// GET /api/guides — all guide entries (current + historical), metadata only
router.get('/', async (_req: Request, res: Response) => {
  try {
    const summaries = await getAllGuideSummaries();
    const response: AllGuidesApiResponse = {
      guides: summaries.map(g => {
        const specInfo = getSpecInfo(g.spec_name);
        const classInfo = getClassInfo(g.class_name);
        return {
          id: g.id,
          specName: g.spec_name,
          specLabel: specInfo?.label ?? g.spec_name,
          className: g.class_name,
          classLabel: classInfo?.label ?? g.class_name,
          aplCommitSha: g.apl_commit_sha,
          aplCommitDate: g.apl_commit_date,
          generatedAt: g.generated_at,
          isCurrent: g.is_current,
          modelUsed: g.model_used,
        };
      }),
    };
    res.json(response);
  } catch (err) {
    console.error('[GET /api/guides]', err);
    res.status(500).json({ error: 'Failed to load guide list' });
  }
});

// GET /api/guides/:specName
router.get('/:specName', async (req: Request, res: Response) => {
  const { specName } = req.params;
  try {
    const guide = await getCurrentGuide(specName);
    if (!guide) {
      res.status(404).json({ error: `No guide found for spec: ${specName}` });
      return;
    }

    const specInfo = getSpecInfo(guide.spec_name);
    const response: GuideApiResponse = {
      id: guide.id,
      specName: guide.spec_name,
      className: guide.class_name,
      aplFileName: specInfo?.aplName ?? guide.spec_name,
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

    const specInfo = getSpecInfo(guide.spec_name);
    const response: GuideApiResponse = {
      id: guide.id,
      specName: guide.spec_name,
      className: guide.class_name,
      aplFileName: specInfo?.aplName ?? guide.spec_name,
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
