/**
 * Generates a QA API key for a user.
 * Usage: npx tsx src/scripts/createQaKey.ts <label>
 * Example: npx tsx src/scripts/createQaKey.ts "Brandon"
 */
import crypto from 'crypto';
import { getDb, insertQaApiKey, listQaApiKeys } from '../db/client.js';

const label = process.argv.slice(2).join(' ').trim();

if (!label) {
  console.log('Usage: npx tsx src/scripts/createQaKey.ts <label>');
  console.log('  label: A name to identify the key holder (e.g. "Brandon")\n');

  // Show existing keys if DB exists
  try {
    getDb();
    const keys = listQaApiKeys();
    if (keys.length > 0) {
      console.log('Existing keys:');
      for (const k of keys) {
        const status = k.is_active ? 'active' : 'revoked';
        const lastUsed = k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'never';
        console.log(`  ${k.label} — ${k.api_key.slice(0, 12)}... (${status}, last used: ${lastUsed})`);
      }
    }
  } catch { /* DB may not exist yet */ }

  process.exit(1);
}

getDb();

const id = crypto.randomUUID();
const apiKey = `qa_${crypto.randomBytes(24).toString('hex')}`;
insertQaApiKey(id, apiKey, label);

console.log(`\nQA API key created for "${label}":\n`);
console.log(`  ${apiKey}\n`);
console.log('Enter this key in the "Ask AI" panel on any spec guide page.');
