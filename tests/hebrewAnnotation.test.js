import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const TARGET_WORDS = [
  { label: 'יהוה', pattern: /יהוה/g },
  { label: 'אלוהים', pattern: /אלוהים/g },
];

const ALLOWED_PAREN = /\([^)]*(JHWH|YHWH|ELOHIM|Elohim|יהוה|אלוהים)[^)]*\)/i;

function collectMarkdownFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'tests') continue;
      results.push(...collectMarkdownFiles(fullPath));
    } else if (fullPath.endsWith('.md') && !fullPath.includes('levels/original')) {
      results.push(fullPath);
    }
  }
  return results;
}

test('first occurrences of יהוה/אלוהים include parenthetical explanation', () => {
  const offenders = [];
  const files = collectMarkdownFiles('levels');
  files.forEach(file => {
    const content = readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);

    TARGET_WORDS.forEach(({ label, pattern }) => {
      let count = 0;
      lines.forEach((line, index) => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          count += 1;
          if (count <= 2 && !ALLOWED_PAREN.test(line)) {
            offenders.push(`${file}:${index + 1}: Erstes Vorkommen von ${label} ohne Klammer-Erklärung.`);
          }
        }
      });
    });
  });

  assert.equal(offenders.length, 0, `Fehlende Klammer-Erklärung bei ersten Vorkommen:
${offenders.join('\n')}`);
});

