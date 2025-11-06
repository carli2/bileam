import test from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const NIQQUD_REGEX = /[\u0591-\u05C7]/;

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

test('source files contain no niqqud characters', () => {
  const files = collectFiles('.', file => file.endsWith('.js'));
  const failures = [];
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (NIQQUD_REGEX.test(line)) {
        failures.push(`${file}:${index + 1}`);
      }
    });
  }
  assert.equal(failures.length, 0, `Niqqud detected in:\n${failures.join('\n')}`);
});
