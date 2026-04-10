// Centralized external URLs and project configuration

export const GITHUB_PROJECT_URL = 'https://github.com/Brandon82/SimCRotationGuides';
export const SIMC_REPO_URL = 'https://github.com/simulationcraft/simc';
export const SIMC_WEBSITE_URL = 'https://www.simulationcraft.org';
export const ANTHROPIC_URL = 'https://www.anthropic.com/claude';
export const WOW_ICON_CDN = 'https://wow.zamimg.com/images/wow/icons';

export function simcCommitUrl(sha: string): string {
  return `${SIMC_REPO_URL}/commit/${sha}`;
}

export function simcAplFileUrl(sha: string, fileName: string): string {
  return `${SIMC_REPO_URL}/blob/${sha}/ActionPriorityLists/default/${fileName}.simc`;
}

// Role display constants
export const ROLE_LABELS: Record<string, string> = {
  dps: 'DPS',
  tank: 'Tank',
  healer: 'Healer',
};

export const ROLE_COLORS: Record<string, string> = {
  dps:    'text-red-500 dark:text-red-400',
  tank:   'text-blue-500 dark:text-blue-400',
  healer: 'text-green-500 dark:text-green-400',
};
