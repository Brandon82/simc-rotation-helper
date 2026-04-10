import { Router } from 'express';
import axios from 'axios';
import { config } from '../config.js';
import type { ChangelogCommit } from '@simc-guides/shared';

const router = Router();

const githubHeaders: Record<string, string> = config.githubToken
  ? { Authorization: `Bearer ${config.githubToken}` }
  : {};

// Cache all commits with a configurable TTL (default 1 hour)
let cache: { commits: ChangelogCommit[]; fetchedAt: number } | null = null;

async function fetchAllCommits(): Promise<ChangelogCommit[]> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < config.changelogCacheTtlMs) {
    return cache.commits;
  }

  const allCommits: ChangelogCommit[] = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/repos/${config.projectRepo}/commits`;
    const response = await axios.get(url, {
      headers: githubHeaders,
      params: { per_page: 100, sha: 'main', page },
    });

    const raw = response.data as Array<{
      sha: string;
      commit: {
        message: string;
        author: { name: string; date: string };
      };
      html_url: string;
    }>;

    if (raw.length === 0) break;

    for (const c of raw) {
      allCommits.push({
        sha: c.sha,
        shortSha: c.sha.slice(0, 7),
        message: c.commit.message,
        author: c.commit.author.name,
        date: c.commit.author.date,
        url: c.html_url,
      });
    }

    if (raw.length < 100) break;
    page++;
  }

  cache = { commits: allCommits, fetchedAt: now };
  return allCommits;
}

router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(req.query.per_page as string) || 20, 1), 100);

    const allCommits = await fetchAllCommits();
    const total = allCommits.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const commits = allCommits.slice(start, start + perPage);

    res.json({ commits, page, perPage, total, totalPages });
  } catch (err) {
    console.error('[changelog] Failed to fetch commits:', err);
    res.status(500).json({ error: 'Failed to fetch project changelog' });
  }
});

export default router;
