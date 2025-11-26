import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ALLOWED_PAREN = /\([^)]*(gott|herr)[^)]*\)/i;
const BLACKLIST = [/gott/i, /herr/i, /terrasse/i];

function collectFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      if (entry.name === 'tests') continue;
      results.push(...collectFiles(fullPath));
    } else {
      if (fullPath.includes('levels/original')) continue;
      if (fullPath.endsWith('AGENTS.md')) continue;
      if (fullPath.endsWith('.md') || fullPath.endsWith('.js')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

test('Gott/HERR blacklist is only used in explanatory parentheses', () => {
  const offenders = [];
  collectFiles('.').forEach(file => {
    const content = readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      BLACKLIST.forEach(pattern => {
        if (!pattern.test(line)) return;
        if (ALLOWED_PAREN.test(line)) return;
        offenders.push(`${file}:${index + 1}: "${line.trim()}" -> Verwende יהוה oder אלוהים (vgl. levels/original*.txt) und füge eine erste Klammer-Erklärung ein.`);
      });
    });
  });

  assert.equal(offenders.length, 0, `Found forbidden usage of "Gott" oder "Terasse":\n${offenders.join('\n')}`);
});
