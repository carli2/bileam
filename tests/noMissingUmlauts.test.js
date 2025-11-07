import test from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const BLACKLIST = [
  'gross',
  'fliessen',
];

function collectFiles(dir, filter) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, filter));
    } else if (filter(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

test('umlaut blacklist is not violated', () => {
  const files = collectFiles('.', file => {
    if (!file.endsWith('.js')) return false;
    return !file.startsWith('tests/noMissingUmlauts.test.');
  });
  const offenders = [];
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const lower = content.toLowerCase();
    BLACKLIST.forEach(word => {
      let index = lower.indexOf(word);
      while (index !== -1) {
        // derive line number
        const snippet = content.slice(0, index);
        const line = snippet.split(/\r?\n/).length;
        offenders.push(`${file}:${line}: contains '${word}'`);
        index = lower.indexOf(word, index + word.length);
      }
    });
  }
  assert.equal(offenders.length, 0, `Blacklisted spellings detected:\n${offenders.join('\n')}`);
});
