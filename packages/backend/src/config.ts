import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Walk up from src/ → backend/ → packages/ → root, loading the first .env found
const candidates = [
  path.resolve(__dirname, '..', '.env'),           // packages/backend/.env
  path.resolve(__dirname, '..', '..', '..', '.env'), // repo root .env
];

for (const p of candidates) {
  const result = dotenv.config({ path: p });
  if (!result.error) break;
}

function resolveAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_SECRET environment variable is required in production');
  }

  const generated = crypto.randomBytes(16).toString('hex');
  console.log(`[config] No ADMIN_SECRET set - generated dev secret: ${generated}`);
  return generated;
}

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  dbPath: process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.resolve(__dirname, '..', 'data/db.sqlite'),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
  promptVersion: process.env.PROMPT_VERSION ?? '1.0.0',
  adminSecret: resolveAdminSecret(),
  githubToken: process.env.GITHUB_TOKEN ?? '',
  cronSchedule: process.env.CRON_SCHEDULE ?? '0 3 * * *',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',

  // Rate limits (requests per minute per IP)
  rateLimitGeneral: parseInt(process.env.RATE_LIMIT_GENERAL ?? '120', 10),
  rateLimitAdmin: parseInt(process.env.RATE_LIMIT_ADMIN ?? '10', 10),
  rateLimitQa: parseInt(process.env.RATE_LIMIT_QA ?? '5', 10),

  // QA
  questionMaxLength: parseInt(process.env.QA_MAX_LENGTH ?? '1000', 10),

  // Changelog cache TTL (default 1 hour)
  changelogCacheTtlMs: parseInt(process.env.CHANGELOG_CACHE_TTL_MS ?? '3600000', 10),

  // SimulationCraft GitHub source
  simcRepo: process.env.SIMC_REPO ?? 'simulationcraft/simc',
  simcBranch: process.env.SIMC_BRANCH ?? 'midnight',
  simcAplPath: process.env.SIMC_APL_PATH ?? 'ActionPriorityLists/default',

  // This project's GitHub repo
  projectRepo: process.env.PROJECT_REPO ?? 'Brandon82/SimCRotationGuides',
};
