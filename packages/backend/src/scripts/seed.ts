/**
 * One-time seeding script: generates guides for all specs.
 * Run with: npm run seed
 *
 * WARNING: This will make LLM API calls for every spec that doesn't
 * already have an up-to-date guide. Estimated cost: $1-5 depending on model.
 */
import { checkAndUpdateAll } from '../services/guideService.js';
import { getDb } from '../db/client.js';

async function seed() {
  console.log('=== SimC Rotation Helper: DB Seed ===');
  console.log('This will generate guides for all specs without current guides.');
  console.log('Starting in 3 seconds... (Ctrl+C to abort)\n');
  await new Promise(r => setTimeout(r, 3000));

  await getDb(); // ensure DB is initialized
  await checkAndUpdateAll(2000); // 2s between specs

  console.log('\nSeed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
