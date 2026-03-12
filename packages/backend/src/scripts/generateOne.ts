/**
 * Generates (or regenerates) a guide for a single spec.
 * Usage: npx tsx src/scripts/generateOne.ts <spec_name> [--force]
 * Example: npx tsx src/scripts/generateOne.ts warrior_arms --force
 */
import { getDb } from '../db/client.js';
import { checkAndUpdateSpec } from '../services/guideService.js';
import { ALL_SPECS } from '../data/specs.js';

const args = process.argv.slice(2);
const specName = args.find(a => !a.startsWith('--'));
const force = args.includes('--force');

if (!specName) {
  console.log('Usage: npx tsx src/scripts/generateOne.ts <spec_name> [--force]');
  console.log('\nAvailable specs:');
  ALL_SPECS.forEach(s => console.log(`  ${s.name}`));
  process.exit(1);
}

if (!ALL_SPECS.find(s => s.name === specName)) {
  console.error(`Unknown spec: "${specName}"`);
  console.log('Run without arguments to see all valid spec names.');
  process.exit(1);
}

getDb();
const result = await checkAndUpdateSpec(specName, force);
console.log(`\nResult: ${result}`);
process.exit(0);
