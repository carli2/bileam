import test from 'node:test';
import assert from 'node:assert/strict';
import { SPELL_DUEL_MACHINE } from '../stateMachines/spellDuelMachine.js';

function collectStateTransitions(machine) {
  const entries = Object.entries(machine)
    .filter(([key]) => key !== 'meta' && key !== 'start')
    .map(([, state]) => state?.transitions ?? {});
  const words = new Set();
  const counts = new Map();

  entries.forEach(transitions => {
    Object.keys(transitions).forEach(word => {
      words.add(word);
      counts.set(word, (counts.get(word) ?? 0) + 1);
    });
  });

  return { counts, words, stateCount: entries.length };
}

test('spell coverage stays balanced', () => {
  const { counts, words, stateCount } = collectStateTransitions(SPELL_DUEL_MACHINE);
  words.forEach(word => {
    const count = counts.get(word) ?? 0;
    assert.ok(
      count > 0,
      `Word ${word} is never available in any state, expected at least one counter opportunity`,
    );
    assert.ok(
      count <= 3,
      `Word ${word} appears ${count} times, but each counter word should occur in at most three states`,
    );
  });
});
