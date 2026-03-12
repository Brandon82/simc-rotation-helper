import axios from 'axios';
import { config } from '../config.js';

const REPO = 'simulationcraft/simc';
const BRANCH = 'midnight';
const APL_PATH = 'ActionPriorityLists/default';

const githubHeaders = config.githubToken
  ? { Authorization: `Bearer ${config.githubToken}` }
  : {};

export interface CommitInfo {
  sha: string;
  date: string; // ISO 8601
}

/**
 * Returns the latest commit SHA and date for a given spec's .simc file.
 */
export async function getLatestCommitInfo(specName: string): Promise<CommitInfo> {
  const url = `https://api.github.com/repos/${REPO}/commits`;
  const response = await axios.get(url, {
    headers: githubHeaders,
    params: {
      path: `${APL_PATH}/${specName}.simc`,
      ref: BRANCH,
      per_page: 1,
    },
  });

  const commits = response.data as Array<{
    sha: string;
    commit: { author: { date: string } };
  }>;

  if (!commits.length) {
    throw new Error(`No commits found for spec: ${specName}`);
  }

  return {
    sha: commits[0].sha,
    date: commits[0].commit.author.date,
  };
}

/**
 * Fetches the raw .simc APL content for a spec.
 */
export async function fetchAplContent(specName: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${APL_PATH}/${specName}.simc`;
  const response = await axios.get<string>(url, {
    headers: githubHeaders,
    responseType: 'text',
  });
  return response.data;
}

/**
 * Returns the directory listing of all .simc files in the APL directory.
 */
export async function listAplFiles(): Promise<string[]> {
  const url = `https://api.github.com/repos/${REPO}/contents/${APL_PATH}`;
  const response = await axios.get(url, {
    headers: githubHeaders,
    params: { ref: BRANCH },
  });

  const files = response.data as Array<{ name: string; type: string }>;
  return files
    .filter(f => f.type === 'file' && f.name.endsWith('.simc'))
    .map(f => f.name.replace('.simc', ''));
}
