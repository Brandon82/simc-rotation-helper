import { Router } from 'express';
import type { Request, Response } from 'express';
import { getAllCurrentGuides } from '../db/client.js';
import { CLASSES } from '../data/specs.js';
import type { RankingsApiResponse, RankingItem } from '@simc-guides/shared';

const router = Router();

// Build flat lookup: specName → { label, classLabel, color, className }
const specMeta = new Map<string, { label: string; classLabel: string; color: string; className: string }>();
for (const cls of CLASSES) {
  for (const spec of cls.specs) {
    specMeta.set(spec.name, {
      label: spec.label,
      classLabel: cls.label,
      color: cls.color,
      className: cls.name,
    });
  }
}

// GET /api/rankings
router.get('/', async (_req: Request, res: Response) => {
  try {
    const guides = await getAllCurrentGuides();

    const stRaw: Omit<RankingItem, 'rank'>[] = [];
    const aoeRaw: Omit<RankingItem, 'rank'>[] = [];

    for (const guide of guides) {
      const meta = specMeta.get(guide.spec_name);
      if (!meta) continue;

      const base = { specName: guide.spec_name, ...meta };
      const stSection = guide.guide_content.sections.find(s => s.id === 'single_target');
      const aoeSection = guide.guide_content.sections.find(s => s.id === 'aoe');

      if (stSection?.priority?.length) {
        stRaw.push({ ...base, actionCount: stSection.priority.length });
      }
      if (aoeSection?.priority?.length) {
        aoeRaw.push({ ...base, actionCount: aoeSection.priority.length });
      }
    }

    const addRank = (items: Omit<RankingItem, 'rank'>[]): RankingItem[] =>
      items
        .sort((a, b) => b.actionCount - a.actionCount || a.specName.localeCompare(b.specName))
        .map((item, i) => ({ ...item, rank: i + 1 }));

    res.json({ singleTarget: addRank(stRaw), aoe: addRank(aoeRaw) } satisfies RankingsApiResponse);
  } catch (err) {
    console.error('[GET /api/rankings]', err);
    res.status(500).json({ error: 'Failed to load rankings' });
  }
});

export default router;
