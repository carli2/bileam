import test from 'node:test';
import assert from 'node:assert/strict';
import { runFightLoop, cropStateMachine } from '../fight.js';
import { SPELL_DUEL_MACHINE } from '../stateMachines/spellDuelMachine.js';

const GOLEM_WORDS = ['אור', 'מים', 'קול', 'חיים', 'אש'];
const BALAK_WORDS = [
  'אור',
  'מים',
  'קול',
  'חיים',
  'אש',
  'לא',
  'שמע',
  'ברכה',
  'דבר',
  'אמת',
  'מלאך',
  'ארור',
  'המלחמה',
];

const GOLEM_MACHINE = cropStateMachine(SPELL_DUEL_MACHINE, GOLEM_WORDS);
GOLEM_MACHINE.meta = {
  ...(GOLEM_MACHINE.meta ?? {}),
  enemyAccuracy: 0.45,
  enemyAccuracyStreakLimit: 1,
};

const BALAK_MACHINE = cropStateMachine(SPELL_DUEL_MACHINE, BALAK_WORDS);
BALAK_MACHINE.meta = {
  ...(BALAK_MACHINE.meta ?? {}),
  enemyAccuracy: 0.88,
  enemyAccuracyStreakLimit: 3,
};

function createRng(seed = 1) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function normalizeWord(word) {
  return typeof word === 'string' ? word.trim() : '';
}

function isTransitionAllowed(entry) {
  if (!entry || typeof entry !== 'object') return true;
  if (entry.only === 'enemy') return false;
  if (Array.isArray(entry.only) && entry.only.includes('enemy')) return false;
  if (entry.forbiddenFor === 'player') return false;
  if (Array.isArray(entry.forbiddenFor) && entry.forbiddenFor.includes('player')) return false;
  return true;
}

function selectPlayerWord(machine, stateKey) {
  const state = machine[stateKey];
  if (!state) return 'אור';
  const transitions = state.transitions ?? {};
  let bestWord = null;
  let bestScore = -Infinity;
  Object.entries(transitions).forEach(([word, rawConfig]) => {
    if (!isTransitionAllowed(rawConfig)) return;
    const config = typeof rawConfig === 'string' ? { next: rawConfig } : rawConfig || {};
    const next = config.next ?? 'start';
    const damage = config.damage ?? 0;
    const damageTarget = config.damageTarget ?? 'enemy';
    let score = 0;
    if (damage > 0 && damageTarget !== 'player') score += damage * 10;
    if (damageTarget === 'player' && damage > 0) score -= damage * 20;
    if (next === 'start') score += 5;
    if (next === 'truth' || next === 'blessing' || next === 'angelic') score += 3;
    if (next === stateKey) score -= 1;
    if (word === 'שמע' || word === 'לא') score += 1;
    if (score > bestScore) {
      bestScore = score;
      bestWord = word;
    }
  });
  if (!bestWord) {
    const available = Object.keys(transitions);
    return available[0] ?? 'אור';
  }
  return bestWord;
}

async function simulateFight(machine, options = {}) {
  const victoriesNeeded = options.requiredWins ?? 1;
  const attempts = options.attempts ?? 100;
  let wins = 0;
  for (let seed = 1; seed <= attempts; seed++) {
    const rng = createRng(seed);
    const result = await runFightLoop({
      machine,
      initialState: 'start',
      initialActor: 'enemy',
      playerName: 'Bileam',
      enemyName: 'Gegner',
      promptPlayerSpell: ({ state }) => Promise.resolve(selectPlayerWord(machine, state)),
      onEvent: () => {},
      onUpdate: () => {},
      randomFn: rng,
      enemyAccuracy: machine.meta?.enemyAccuracy,
    });
    if (result.winner === 'player') {
      wins += 1;
      if (wins >= victoriesNeeded) return true;
    }
  }
  return false;
}

test('level5_5 guardian is beatable with strategic play', async () => {
  const success = await simulateFight(GOLEM_MACHINE, { attempts: 100, requiredWins: 1 });
  assert.ok(success, 'Guardian fight should be winnable within 100 simulated runs');
});

test('level10_5 balak is beatable with strategic play', async () => {
  const success = await simulateFight(BALAK_MACHINE, { attempts: 100, requiredWins: 1 });
  assert.ok(success, 'Balak fight should be winnable within 100 simulated runs');
});
