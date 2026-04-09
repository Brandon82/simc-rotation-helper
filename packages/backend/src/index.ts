import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { getDb } from './db/client.js';
import { startCron } from './services/cronService.js';
import specsRouter from './routes/specs.js';
import guidesRouter from './routes/guides.js';
import adminRouter from './routes/admin.js';
import rankingsRouter from './routes/rankings.js';
import qaRouter from './routes/qa.js';
import changelogRouter from './routes/changelog.js';

const app = express();

// Trust first proxy hop (Railway, Vercel, etc.)
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// ── Rate Limiters ─────────────────────────────────────────────
// General: 120 requests per minute per IP for public API
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});

// Admin: 10 requests per minute per IP (auth-protected but still limit)
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many admin requests.' },
});

// QA: 5 requests per minute per IP (each request triggers a Claude call)
const qaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many Q&A requests, please slow down.' },
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/specs', generalLimiter, specsRouter);
app.use('/api/guides', generalLimiter, guidesRouter);
app.use('/api/admin', adminLimiter, adminRouter);
app.use('/api/rankings', generalLimiter, rankingsRouter);
app.use('/api/qa', qaLimiter, qaRouter);
app.use('/api/changelog', generalLimiter, changelogRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: Math.floor(process.uptime()) });
});

// ── Start ────────────────────────────────────────────────────
async function main() {
  // Initialize DB (creates file + tables if they don't exist)
  const db = getDb();
  console.log('[db] SQLite initialized');

  // Auto-seed sample data if the DB has no guides (local dev convenience)
  const { count } = db.prepare('SELECT COUNT(*) as count FROM guides').get() as { count: number };
  if (count === 0) {
    console.log('[db] No guides found, seeding sample data...');
    const { seedSampleData } = await import('./scripts/seedSample.js');
    await seedSampleData();
  }

  // Start daily cron
  startCron();

  app.listen(config.port, () => {
    console.log(`[server] Listening on http://localhost:${config.port}`);
    console.log(`[server] CORS origin: ${config.corsOrigin}`);
  });
}

main().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
