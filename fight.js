const DEFAULT_MAX_HP = 100;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeInput(input) {
  if (!input) return null;
  const cleaned = String(input).trim();
  if (!cleaned) return null;
  return cleaned.toLowerCase();
}

function createLifeState(max = DEFAULT_MAX_HP) {
  return {
    max,
    current: max,
  };
}

function formatLifeBar(current, max, width = 8) {
  const ratio = max > 0 ? current / max : 0;
  const filled = clamp(Math.round(ratio * width), 0, width);
  const empty = width - filled;
  const filledChar = '|';
  const emptyChar = '.';
  return filledChar.repeat(filled) + emptyChar.repeat(empty);
}

function pickOption(options, randomFn) {
  if (!options) return null;
  if (Array.isArray(options)) {
    if (options.length === 0) return null;
    const index = Math.floor(randomFn() * options.length);
    return options[index];
  }
  const keys = Object.keys(options);
  if (keys.length === 0) return null;
  const index = Math.floor(randomFn() * keys.length);
  return options[keys[index]] ?? keys[index];
}

export async function runFightLoop({
  machine,
  initialState = 'start',
  playerName = 'Bileam',
  enemyName = 'Golem',
  playerHP = DEFAULT_MAX_HP,
  enemyHP = DEFAULT_MAX_HP,
  promptPlayerSpell,
  onEvent = () => {},
  onUpdate = () => {},
  randomFn = Math.random,
}) {
  if (!machine) {
    throw new Error('Fight state machine not provided');
  }

  const states = machine;
  if (!states[initialState]) {
    throw new Error(`Unknown fight state: ${initialState}`);
  }

  const life = {
    player: createLifeState(playerHP),
    enemy: createLifeState(enemyHP),
  };

  const renderStatus = () => {
    onUpdate({
      playerHP: life.player.current,
      playerMax: life.player.max,
      enemyHP: life.enemy.current,
      enemyMax: life.enemy.max,
      barPlayer: formatLifeBar(life.player.current, life.player.max),
      barEnemy: formatLifeBar(life.enemy.current, life.enemy.max),
    });
  };

  const applyDamage = async (target, amount, message) => {
    if (!(amount > 0)) return;
    if (target === 'enemy') {
      life.enemy.current = clamp(life.enemy.current - amount, 0, life.enemy.max);
    } else {
      life.player.current = clamp(life.player.current - amount, 0, life.player.max);
    }
    if (message) {
      await onEvent({ speaker: 'narrator', text: message });
    }
    renderStatus();
  };

  const emitLine = async (speaker, text) => {
    if (!text) return;
    await onEvent({ speaker, text });
  };

  let stateKey = initialState;
  renderStatus();

  while (life.player.current > 0 && life.enemy.current > 0) {
    const state = states[stateKey];
    if (!state) {
      throw new Error(`Missing fight state definition for "${stateKey}"`);
    }

    await emitLine(state.speaker ?? 'narrator', state.text);
    if (state.text2) {
      await emitLine(state.speaker2 ?? 'narrator', state.text2);
    }

    if (state.damageOnEnter && state.targetOnEnter) {
      const targetName = state.targetOnEnter === 'enemy' ? enemyName : playerName;
      const dmgText = state.enterDamageText ?? `${targetName} erleidet ${state.damageOnEnter} Schaden.`;
      await applyDamage(state.targetOnEnter, state.damageOnEnter, dmgText);
      if (life.player.current <= 0 || life.enemy.current <= 0) break;
    }

    if (state.options) {
      stateKey = pickOption(state.options, randomFn) ?? state.next ?? 'start';
      continue;
    }

    const responses = state.counterspells || {};
    const hasResponses = Object.keys(responses).length > 0;

    if (!hasResponses) {
      stateKey = state.next ?? 'start';
      continue;
    }

    const promptText = state.prompt ?? 'Welches Wort sprichst du?';
    const allowSkip = state.allowSkip ?? false;
    const input = await promptPlayerSpell?.({
      prompt: promptText,
      allowSkip,
      state: stateKey,
      playerHP: life.player.current,
      enemyHP: life.enemy.current,
    });
    const normalized = normalizeInput(input);

    const responseKey = normalized ?? '';
    const response = responses[responseKey];

    if (response) {
      const next = typeof response === 'string' ? { next: response } : { ...response };
      await emitLine(next.speaker ?? 'player', next.text);
      if (next.text2) {
        await emitLine(next.speaker2 ?? 'narrator', next.text2);
      }
      if (next.damage && next.target) {
        const targetName = next.target === 'enemy' ? enemyName : playerName;
        const dmgText = next.damageText ?? `${targetName} erleidet ${next.damage} Schaden.`;
        await applyDamage(next.target, next.damage, dmgText);
        if (life.player.current <= 0 || life.enemy.current <= 0) break;
      }
      stateKey = next.next ?? 'start';
      continue;
    }

    const target = state.target ?? 'player';
    const targetName = target === 'enemy' ? enemyName : playerName;
    const failSpeaker = state.failSpeaker ?? (target === 'player' ? 'enemy' : 'player');
    const failText = state.failText ?? `${targetName} findet keinen passenden Zauber.`;
    await emitLine(failSpeaker, failText);
    if (state.failText2) {
      await emitLine(state.failSpeaker2 ?? 'narrator', state.failText2);
    }
    if (state.damage) {
      const dmgText = state.failDamageText ?? `${targetName} erleidet ${state.damage} Schaden.`;
      await applyDamage(target, state.damage, dmgText);
    }
    if (life.player.current <= 0 || life.enemy.current <= 0) break;

    stateKey = state.failNext ?? 'start';
  }

  return {
    winner: life.player.current > 0 ? 'player' : 'enemy',
    playerHP: life.player.current,
    enemyHP: life.enemy.current,
  };
}

export function buildLifeBarString(playerHP, playerMax, enemyHP, enemyMax) {
  const playerBar = formatLifeBar(playerHP, playerMax);
  const enemyBar = formatLifeBar(enemyHP, enemyMax);
  return `${playerBar} ${Math.max(0, Math.round(playerHP))}/${playerMax}\n${enemyBar} ${Math.max(0, Math.round(enemyHP))}/${enemyMax}`;
}
