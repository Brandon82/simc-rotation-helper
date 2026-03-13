/**
 * One-time seeding script: generates guides for all specs.
 * Run with: npm run seed
 *
 * WARNING: This will make LLM API calls for every spec that doesn't
 * already have an up-to-date guide. Estimated cost: $1-5 depending on model.
 */
import * as readline from 'readline';
import { checkAndUpdateAll } from '../services/guideService.js';
import { getDb } from '../db/client.js';

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer.trim()); }));
}

async function seed() {
  console.log('=== SimC Rotation Helper: DB Seed ===');

  const forceAnswer = await ask('Force regenerate all guides (even if up-to-date)? [y/N]: ');
  const force = forceAnswer.toLowerCase() === 'y';

  if (force) {
    console.log('\nForce mode: ALL guides will be regenerated regardless of APL SHA.');
  } else {
    console.log('\nNormal mode: only specs with a changed APL will be regenerated.');
  }
  console.log('Starting in 3 seconds... (Ctrl+C to abort)\n');
  await new Promise(r => setTimeout(r, 3000));

  getDb(); // ensure DB is initialized
  await checkAndUpdateAll(2000, force); // 2s between specs

  console.log('\nSeed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
