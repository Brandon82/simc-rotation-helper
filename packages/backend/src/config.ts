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

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  dbPath: path.resolve(__dirname, '..', process.env.DB_PATH ?? 'data/db.sqlite'),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
  promptVersion: process.env.PROMPT_VERSION ?? '1.0.0',
  adminSecret: process.env.ADMIN_SECRET ?? 'dev-secret',
  githubToken: process.env.GITHUB_TOKEN ?? '',
  cronSchedule: process.env.CRON_SCHEDULE ?? '0 3 * * *',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
};
