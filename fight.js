const DEFAULT_MAX_HP = 100;
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeInput(input) {
  if (!input) return null;
  const cleaned = String(input).trim();
  if (!cleaned) return null;
  return cleaned;
}

function createLifeState(max = DEFAULT_MAX_HP) {
  return {
    max,
    current: max,
  };
}

function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

function resolveNode(node, actorRole, effects) {
  if (!node) return;
  const targetKey = actorRole === 'attacker' ? 'defender' : 'attacker';
  if (isNumber(node.damage)) {
    if (node.damage > 0) {
      effects[targetKey] -= node.damage;
    } else if (node.damage < 0) {
      effects[actorRole] -= node.damage; // negative damage heals actor
    }
  }
}

function appendTexts(events, speaker, node) {
  if (!node) return;
  if (node.text) {
    events.push({ speaker, text: node.text });
  }
  if (node.text2) {
    const responder = speaker === 'player' ? 'enemy' : 'player';
    events.push({ speaker: responder, text: node.text2 });
  }
  if (node.success) {
    events.push({ speaker: 'narrator', text: node.success });
  }
}

function resolveInteraction(spellTree, attackerSpell, defenderSpell) {
  const canonicalAttack = normalizeInput(attackerSpell);
  const canonicalDefend = normalizeInput(defenderSpell);
  const events = [];
  const deltas = { attacker: 0, defender: 0 };
  let counterNode;

  const attackNode = canonicalAttack ? spellTree[canonicalAttack] : null;
  if (!attackNode) {
    events.push({ type: 'invalid', speaker: 'player', text: `Unbekannter Zauber: ${attackerSpell}` });
    deltas.attacker -= 5;
    return { events, deltas, attackSpell: canonicalAttack, counterSpell: canonicalDefend };
  }

  appendTexts(events, 'attacker', attackNode);
  resolveNode(attackNode, 'attacker', deltas);

  if (canonicalDefend && attackNode.counters && attackNode.counters[canonicalDefend]) {
    counterNode = attackNode.counters[canonicalDefend];
    appendTexts(events, 'defender', counterNode);
    resolveNode(counterNode, 'defender', deltas);
  }

  return { events, deltas, attackSpell: canonicalAttack, counterSpell: canonicalDefend };
}

function applyDeltas(state, deltas) {
  if (deltas.attacker !== 0) {
    state.attackerHP.current = clamp(state.attackerHP.current + deltas.attacker, 0, state.attackerHP.max);
  }
  if (deltas.defender !== 0) {
    state.defenderHP.current = clamp(state.defenderHP.current + deltas.defender, 0, state.defenderHP.max);
  }
}

function selectEnemyCounter(spellTree, attackKey, randomFn = Math.random) {
  const node = spellTree[normalizeInput(attackKey)];
  if (!node || !node.counters) return null;
  const keys = Object.keys(node.counters);
  if (keys.length === 0) return null;
  const index = Math.floor(randomFn() * keys.length);
  return keys[index];
}

function selectEnemyAttack(spellTree, randomFn = Math.random) {
  const keys = Object.keys(spellTree);
  if (keys.length === 0) return null;
  const index = Math.floor(randomFn() * keys.length);
  return keys[index];
}

function formatLifeBar(current, max, width = 12) {
  const ratio = max > 0 ? current / max : 0;
  const filled = clamp(Math.round(ratio * width), 0, width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

export async function runFightLoop({
  spellTree,
  playerName = 'Bileam',
  enemyName = 'Golem',
  playerHP = DEFAULT_MAX_HP,
  enemyHP = DEFAULT_MAX_HP,
  promptPlayerSpell,
  promptPlayerCounter,
  enemyAttackStrategy,
  enemyCounterStrategy,
  onEvent = () => {},
  onUpdate = () => {},
  randomFn = Math.random,
}) {
  const normalizedTree = spellTree ?? {};
  const state = {
    turn: 'player',
    attackerHP: createLifeState(playerHP),
    defenderHP: createLifeState(enemyHP),
  };

  const renderStatus = () => {
    onUpdate({
      playerHP: state.attackerHP.current,
      playerMax: state.attackerHP.max,
      enemyHP: state.defenderHP.current,
      enemyMax: state.defenderHP.max,
      barPlayer: formatLifeBar(state.attackerHP.current, state.attackerHP.max),
      barEnemy: formatLifeBar(state.defenderHP.current, state.defenderHP.max),
    });
  };

  renderStatus();

  while (state.attackerHP.current > 0 && state.defenderHP.current > 0) {
    if (state.turn === 'player') {
      const spellInput = await promptPlayerSpell?.({ playerHP: state.attackerHP.current, enemyHP: state.defenderHP.current });
      if (spellInput === 'skip') {
        onEvent({ type: 'info', speaker: 'player', text: `${playerName} zaudert.` });
        state.turn = 'enemy';
        continue;
      }
  const playerSpell = normalizeInput(spellInput);
      if (!playerSpell) {
        onEvent({ type: 'invalid', speaker: 'player', text: 'Der Zauber verfliegt wirkungslos.' });
        state.turn = 'enemy';
        continue;
      }
      const enemyCounter = enemyCounterStrategy?.(playerSpell, { playerHP: state.attackerHP.current, enemyHP: state.defenderHP.current })
        ?? selectEnemyCounter(normalizedTree, playerSpell, randomFn);

      const interaction = resolveInteraction(normalizedTree, playerSpell, enemyCounter);
      for (const evt of interaction.events) {
        const role = evt.speaker === 'attacker' ? 'player' : evt.speaker === 'defender' ? 'enemy' : evt.speaker;
        await onEvent({ ...evt, speaker: role });
      }
      applyDeltas({
        attackerHP: state.attackerHP,
        defenderHP: state.defenderHP,
        turn: state.turn,
      }, interaction.deltas);
      renderStatus();

      if (state.defenderHP.current <= 0) {
        return {
          winner: 'player',
          playerHP: state.attackerHP.current,
          enemyHP: 0,
        };
      }
      state.turn = 'enemy';
    } else {
      const enemySpell = enemyAttackStrategy?.({ playerHP: state.attackerHP.current, enemyHP: state.defenderHP.current })
        ?? selectEnemyAttack(normalizedTree, randomFn);
      if (!enemySpell) {
        onEvent({ type: 'info', speaker: 'enemy', text: `${enemyName} verharrt schweigend.` });
        state.turn = 'player';
        continue;
      }
      const playerCounterInput = await promptPlayerCounter?.({ enemySpell });
      const playerCounter = normalizeInput(playerCounterInput);
      const interaction = resolveInteraction(normalizedTree, enemySpell, playerCounter);
      for (const evt of interaction.events) {
        const role = evt.speaker === 'attacker' ? 'enemy' : evt.speaker === 'defender' ? 'player' : evt.speaker;
        await onEvent({ ...evt, speaker: role });
      }
      applyDeltas({
        attackerHP: state.defenderHP,
        defenderHP: state.attackerHP,
        turn: state.turn,
      }, interaction.deltas);
      renderStatus();

      if (state.attackerHP.current <= 0) {
        return {
          winner: 'enemy',
          playerHP: 0,
          enemyHP: state.defenderHP.current,
        };
      }
      state.turn = 'player';
    }
  }

  return {
    winner: state.attackerHP.current > state.defenderHP.current ? 'player' : 'enemy',
    playerHP: state.attackerHP.current,
    enemyHP: state.defenderHP.current,
  };
}

export function buildLifeBarString(playerHP, playerMax, enemyHP, enemyMax) {
  const playerBar = formatLifeBar(playerHP, playerMax);
  const enemyBar = formatLifeBar(enemyHP, enemyMax);
  return `${playerBar} ${Math.max(0, Math.round(playerHP))}/${playerMax}\n${enemyBar} ${Math.max(0, Math.round(enemyHP))}/${enemyMax}`;
}
