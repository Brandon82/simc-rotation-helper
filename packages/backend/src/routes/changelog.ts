import { Router } from 'express';
import axios from 'axios';
import { config } from '../config.js';
import type { ChangelogCommit } from '@simc-helper/shared';

const router = Router();

const PROJECT_REPO = 'Brandon82/simc-rotation-helper';

const githubHeaders: Record<string, string> = config.githubToken
  ? { Authorization: `Bearer ${config.githubToken}` }
  : {};

// Simple in-memory cache
let cache: { commits: ChangelogCommit[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function fetchCommitsFromGitHub(limit: number): Promise<ChangelogCommit[]> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS && cache.commits.length >= limit) {
    return cache.commits.slice(0, limit);
  }

  const url = `https://api.github.com/repos/${PROJECT_REPO}/commits`;
  const response = await axios.get(url, {
    headers: githubHeaders,
    params: { per_page: 100, sha: 'main' },
  });

  const raw = response.data as Array<{
    sha: string;
    commit: {
      message: string;
      author: { name: string; date: string };
    };
    html_url: string;
  }>;

  const commits: ChangelogCommit[] = raw.map(c => ({
    sha: c.sha,
    shortSha: c.sha.slice(0, 7),
    message: c.commit.message,
    author: c.commit.author.name,
    date: c.commit.author.date,
    url: c.html_url,
  }));

  cache = { commits, fetchedAt: now };
  return commits.slice(0, limit);
}

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 100);
    const commits = await fetchCommitsFromGitHub(limit);
    res.json({ commits });
  } catch (err) {
    console.error('[changelog] Failed to fetch commits:', err);
    res.status(500).json({ error: 'Failed to fetch project changelog' });
  }
});

export default router;
