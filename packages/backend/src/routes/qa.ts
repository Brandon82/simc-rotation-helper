import { Router } from 'express';
import type { Request, Response } from 'express';
import { validateQaApiKey, getCurrentGuide } from '../db/client.js';
import { getSpecInfo, getClassForSpec } from '../data/specs.js';
import { answerQuestion } from '../services/llmService.js';

const router = Router();

function requireQaAuth(req: Request, res: Response): boolean {
  const apiKey = req.headers['x-qa-key'] as string | undefined;
  if (!apiKey || !validateQaApiKey(apiKey)) {
    res.status(401).json({ error: 'Invalid or missing QA API key' });
    return false;
  }
  return true;
}

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
router.post('/ask', async (req: Request, res: Response) => {
  if (!requireQaAuth(req, res)) return;

  const { specName, question } = req.body as { specName?: string; question?: string };

  if (!specName || !question) {
    res.status(400).json({ error: 'Missing specName or question' });
    return;
  }

  if (question.length > 1000) {
    res.status(400).json({ error: 'Question too long (max 1000 characters)' });
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
