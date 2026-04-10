import { Router } from 'express';
import type { Request, Response } from 'express';
import { config } from '../config.js';
import { validateQaApiKey, getCurrentGuide } from '../db/client.js';
import { requireQaKey } from '../middleware/auth.js';
import { getSpecInfo, getClassForSpec } from '../data/specs.js';
import { answerQuestion } from '../services/llmService.js';

const router = Router();

// GET /api/qa/validate
router.get('/validate', (req: Request, res: Response) => {
  const apiKey = req.headers['x-qa-key'] as string | undefined;
  if (!apiKey) {
    res.json({ valid: false });
    return;
  }
  const valid = validateQaApiKey(apiKey);
  res.json({ valid });
});

// POST /api/qa/ask
router.post('/ask', requireQaKey, async (req: Request, res: Response) => {
  const { specName, question } = req.body as { specName?: string; question?: string };

  if (!specName || !question) {
    res.status(400).json({ error: 'Missing specName or question' });
    return;
  }

  if (typeof specName !== 'string' || specName.length > 100) {
    res.status(400).json({ error: 'Invalid specName' });
    return;
  }

  if (question.length > config.questionMaxLength) {
    res.status(400).json({ error: `Question too long (max ${config.questionMaxLength} characters)` });
    return;
  }

  const specInfo = getSpecInfo(specName);
  const classInfo = getClassForSpec(specName);
  if (!specInfo || !classInfo) {
    res.status(400).json({ error: `Unknown spec: ${specName}` });
    return;
  }

  const guide = await getCurrentGuide(specName);
  if (!guide) {
    res.status(404).json({ error: 'No guide available for this spec' });
    return;
  }

  try {
    const answer = await answerQuestion(
      specInfo.label,
      classInfo.label,
      guide.guide_content,
      guide.apl_content,
      question,
    );
    res.json({ answer, specName });
  } catch (err) {
    console.error('[qa] Error answering question:', err);
    res.status(500).json({ error: 'Failed to generate answer' });
  }
});

export default router;
