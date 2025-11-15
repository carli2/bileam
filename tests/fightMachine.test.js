import test from 'node:test';
import assert from 'node:assert/strict';

import { SPELL_DUEL_MACHINE } from '../stateMachines/spellDuelMachine.js';
import { cropStateMachine } from '../fight.js';
const FIRST_FIVE_WORDS = ['אור', 'מים', 'קול', 'חיים', 'אש'];
const ALLOWED = new Set(FIRST_FIVE_WORDS);
const EXPECTED_STATES = new Set(['start', 'burning', 'flooded', 'echoing', 'radiant', 'overgrown', 'resonantTrap']);

const resolveNextState = config => {
  if (typeof config === 'string') {
    return config;
  }
  if (config && typeof config === 'object' && typeof config.next === 'string') {
    return config.next;
  }
  return 'start';
};

test('guardian machine cropped to first five words remains playable', () => {
  const cropped = cropStateMachine(SPELL_DUEL_MACHINE, FIRST_FIVE_WORDS);

  assert.ok(cropped.meta, 'cropped machine retains meta');
  assert.equal(cropped.meta.enemyAccuracy, 0.7, 'cropped machine keeps base enemy accuracy');

  const stateKeys = Object.keys(cropped).filter(key => key !== 'meta');
  assert.deepEqual(new Set(stateKeys), EXPECTED_STATES, 'cropped machine retains expected states');

  for (const stateKey of stateKeys) {
    const state = cropped[stateKey];
    assert.ok(state, `state ${stateKey} exists`);
    const transitions = state.transitions ?? {};
    const transitionWords = Object.keys(transitions);
    assert.ok(transitionWords.length > 0, `state ${stateKey} has transitions`);

    for (const word of transitionWords) {
      assert.ok(ALLOWED.has(word), `transition word ${word} must be allowed`);

      const next = resolveNextState(transitions[word]);
      assert.ok(EXPECTED_STATES.has(next), `transition ${stateKey} -> ${next} must target valid state`);
    }
  }
});
