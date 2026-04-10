import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';
import { validateQaApiKey } from '../db/client.js';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.replace('Bearer ', '');
  if (token !== config.adminSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

export function requireQaKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-qa-key'] as string | undefined;
  if (!apiKey || !validateQaApiKey(apiKey)) {
    res.status(401).json({ error: 'Invalid or missing QA API key' });
    return;
  }
  next();
}
