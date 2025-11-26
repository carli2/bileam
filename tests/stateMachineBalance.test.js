import test from 'node:test';
import assert from 'node:assert/strict';
import { SPELL_DUEL_MACHINE } from '../stateMachines/spellDuelMachine.js';
import { cropStateMachine } from '../fight.js';

const GOLEM_WORDS = ['אור', 'מים', 'קול', 'חיים', 'אש'];
const ADVANCED_WORDS = new Set(['לא', 'שמע', 'ברך', 'דבר', 'אמת', 'מלאך']);
const CORE_WORDS = new Set(GOLEM_WORDS);
const resolveNextState = config => {
  if (typeof config === 'string') {
    return config;
  }
  if (config && typeof config === 'object' && typeof config.next === 'string') {
    return config.next;
  }
  return 'start';
};

function collectStateTransitions(machine) {
  const entries = Object.entries(machine)
    .filter(([key]) => key !== 'meta' && key !== 'start')
    .map(([, state]) => state?.transitions ?? {});
  const counts = new Map();
  entries.forEach(transitions => {
    Object.keys(transitions).forEach(word => {
      if (!ADVANCED_WORDS.has(word)) return;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    });
  });
  return counts;
}

test('spell coverage stays balanced', () => {
  const counts = collectStateTransitions(SPELL_DUEL_MACHINE);
  ADVANCED_WORDS.forEach(word => {
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

test('core words have at least one core and one advanced reply', () => {
  Object.entries(SPELL_DUEL_MACHINE).forEach(([stateKey, state]) => {
    if (stateKey === 'meta' || stateKey === 'start') return;
    const transitions = state?.transitions ?? {};
    Object.entries(transitions).forEach(([word, cfg]) => {
      if (!CORE_WORDS.has(word)) return;
      const next = resolveNextState(cfg);
      const nextTransitions = SPELL_DUEL_MACHINE[next]?.transitions ?? {};
      const replyWords = Object.keys(nextTransitions);
      const hasCoreReply = replyWords.some(entry => CORE_WORDS.has(entry));
      const hasAdvancedReplyDirect = replyWords.some(entry => ADVANCED_WORDS.has(entry)) || next === 'negation';
      // allow a two-hop bridge into advanced replies
      const hasAdvancedReplyTwoHop = replyWords.some(entry => {
        const second = resolveNextState(nextTransitions[entry]);
        const secondTransitions = SPELL_DUEL_MACHINE[second]?.transitions ?? {};
        return Object.keys(secondTransitions).some(inner => ADVANCED_WORDS.has(inner));
      });
      const hasAdvancedReply = hasAdvancedReplyDirect || hasAdvancedReplyTwoHop;
      assert.ok(hasCoreReply, `Core word ${word} in state ${stateKey} should lead to a state that offers at least one core reply`);
      assert.ok(hasAdvancedReply, `Core word ${word} in state ${stateKey} should lead to a state that offers at least one advanced reply (directly or via negation)`);
    });
  });
});

function assertStatesHaveTransitions(machine, label) {
  Object.entries(machine).forEach(([stateKey, state]) => {
    if (stateKey === 'meta') return;
    const transitions = state?.transitions ?? {};
    assert.ok(
      Object.keys(transitions).length > 0,
      `${label}: state "${stateKey}" has no valid transitions`,
    );
  });
}

test('full duel machine states always have at least one transition', () => {
  assertStatesHaveTransitions(SPELL_DUEL_MACHINE, 'full-machine');
});

test('level5_5 cropped machine keeps transitions in every state', () => {
  const golemMachine = cropStateMachine(SPELL_DUEL_MACHINE, GOLEM_WORDS, 'start');
  assertStatesHaveTransitions(golemMachine, 'golem-machine');
});

function buildAdjacency(machine) {
  const adjacency = new Map();
  const resolveNext = config => (typeof config === 'string'
    ? config
    : (config && typeof config.next === 'string') ? config.next : 'start');
  Object.entries(machine).forEach(([stateKey, state]) => {
    if (stateKey === 'meta') return;
    const nextStates = new Set();
    Object.values(state?.transitions ?? {}).forEach(config => {
      nextStates.add(resolveNext(config));
    });
    adjacency.set(stateKey, nextStates);
  });
  return adjacency;
}

function findReachable(adjacency, start = 'start') {
  const reachable = new Set();
  if (!adjacency.has(start)) {
    return reachable;
  }
  reachable.add(start);
  const queue = [start];
  while (queue.length > 0) {
    const node = queue.shift();
    const edges = adjacency.get(node);
    if (!edges) continue;
    edges.forEach(target => {
      if (!reachable.has(target) && adjacency.has(target)) {
        reachable.add(target);
        queue.push(target);
      }
    });
  }
  return reachable;
}

test('no cycles shorter than three states exist', () => {
  const adjacency = buildAdjacency(SPELL_DUEL_MACHINE);
  const reachable = findReachable(adjacency, 'start');
  reachable.forEach(state => {
    const targets = adjacency.get(state) ?? new Set();
    assert.ok(!targets.has(state), `State "${state}" loops to itself`);
    targets.forEach(target => {
      if (!reachable.has(target)) return;
      if (target === state) return;
      const targetEdges = adjacency.get(target);
      if (targetEdges && targetEdges.has(state)) {
        assert.fail(`States "${state}" and "${target}" form a cycle shorter than three states`);
      }
    });
  });
});
