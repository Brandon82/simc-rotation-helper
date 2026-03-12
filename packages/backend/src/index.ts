import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { getDb } from './db/client.js';
import { startCron } from './services/cronService.js';
import specsRouter from './routes/specs.js';
import guidesRouter from './routes/guides.js';
import adminRouter from './routes/admin.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use('/api/specs', specsRouter);
app.use('/api/guides', guidesRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: Math.floor(process.uptime()) });
});

// ── Start ────────────────────────────────────────────────────
async function main() {
  // Initialize DB (creates file if it doesn't exist)
  await getDb();
  console.log('[db] LowDB initialized');

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
