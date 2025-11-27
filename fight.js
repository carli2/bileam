const DEFAULT_MAX_HP = 100;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeInput(input) {
  if (input == null) return null;
  const cleaned = String(input).trim();
  if (!cleaned) return null;
  return cleaned.toLowerCase();
}

function createLifeState(max = DEFAULT_MAX_HP) {
  return { max, current: max };
}

function formatLifeBar(current, max, width = 8) {
  const ratio = max > 0 ? current / max : 0;
  const filled = clamp(Math.round(ratio * width), 0, width);
  const empty = width - filled;
  return '|'.repeat(filled) + '.'.repeat(empty);
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
  enemyStrength,
  onStateChange,
}) {
  if (!machine) throw new Error('Fight state machine not provided');
  if (!machine[initialState]) throw new Error(`Unknown fight state: ${initialState}`);

  const strength = typeof enemyStrength === 'number'
    ? enemyStrength
    : (typeof machine.meta?.enemyStrength === 'number' ? machine.meta.enemyStrength : 0.7);

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

  const replacePlaceholders = (text, replacements) => {
    if (!text) return text;
    let out = text;
    Object.entries(replacements).forEach(([key, value]) => {
      const pattern = new RegExp(`%${key}%`, 'g');
      out = out.replace(pattern, value);
    });
    if (replacements.word) out = out.replace('%s', replacements.word);
    return out;
  };

  const resolveDamageTarget = (label, actorSide) => {
    const normalized = typeof label === 'string' ? label.toLowerCase() : 'enemy';
    if (normalized === 'player' || normalized === 'self' || normalized === 'actor') {
      return actorSide === 'player' ? 'player' : 'enemy';
    }
    return actorSide === 'player' ? 'enemy' : 'player';
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

  const resolveTransition = (stateKey, word, actor) => {
    const state = machine[stateKey];
    if (!state) return null;
    const raw = state.transitions?.[word];
    if (!raw) return null;
    if (typeof raw === 'object') {
      const only = raw.only ?? raw.allowedFor ?? null;
      if (only === 'player' && actor !== 'player') return null;
      if (only === 'enemy' && actor !== 'enemy') return null;
      const forbid = raw.forbiddenFor ?? raw.forbid ?? null;
      if (forbid === actor) return null;
      if (Array.isArray(forbid) && forbid.includes(actor)) return null;
    }
    if (typeof raw === 'string') return { next: raw };
    return {
      next: raw.next ?? initialState,
      text: raw.text ?? (actor === 'player' ? raw.text_player : raw.text_enemy),
      text2: raw.text2 ?? (actor === 'player' ? raw.text2_player : raw.text2_enemy),
      speaker: raw.speaker ?? (actor === 'player' ? 'player' : 'enemy'),
      speaker2: raw.speaker2,
      damage: raw.damage ?? 0,
      damageTarget: raw.damageTarget,
      damageText: raw.damageText,
    };
  };

  const emitTransition = async (tx, actor, replacements) => {
    const text = tx.text ? replacePlaceholders(tx.text, replacements) : null;
    const text2 = tx.text2 ? replacePlaceholders(tx.text2, replacements) : null;
    const speaker = tx.speaker ?? (actor === 'player' ? 'player' : 'enemy');
    if (text) await onEvent({ speaker, text });
    if (text2) await onEvent({ speaker: tx.speaker2 ?? speaker, text: text2 });
  };

  const emitFailure = async (state, actor, word, replacements) => {
    const damage = actor === 'player'
      ? state?.damage_player ?? state?.damage ?? 0
      : state?.damage_enemy ?? state?.damage ?? 0;
    const cfg = actor === 'player' ? state?.failure_player : state?.failure_computer;
    let text = null;
    let speaker = actor === 'player' ? 'ally' : 'enemy';
    if (typeof cfg === 'string') {
      text = replacePlaceholders(cfg, replacements);
    } else if (cfg && typeof cfg === 'object') {
      text = cfg.text ? replacePlaceholders(cfg.text, replacements) : null;
      speaker = cfg.speaker ?? speaker;
    }
    if (!text) {
      text = actor === 'player'
        ? `${playerName} findet keinen passenden Zauber.`
        : `${enemyName} findet keinen passenden Zauber.`;
    }
    await onEvent({ speaker, text });
    if (damage > 0) {
      const target = actor === 'player' ? 'player' : 'enemy';
      const template = (actor === 'player'
        ? state?.failure_player_damageText
        : state?.failure_computer_damageText) ?? state?.failure_damageText;
      const message = template
        ? replacePlaceholders(template, replacements)
        : `${target === 'player' ? playerName : enemyName} erhält ${damage} Schaden.`;
      await applyDamage(target, damage, message);
    }
  };

  const startWords = Object.keys(machine[initialState]?.transitions ?? {});
  let round = 0;
  let lastFailure = null;

  if (typeof onStateChange === 'function') {
    await onStateChange({ state: initialState, previousState: null, reason: 'init', actor: null, word: null });
  }
  renderStatus();

  while (life.player.current > 0 && life.enemy.current > 0) {
    round += 1;
    let stateKey = initialState;
    if (typeof onStateChange === 'function') {
      await onStateChange({ state: stateKey, previousState: null, reason: 'round-start', actor: null, word: null });
    }
    let turn = round % 2 === 1 ? 'player' : 'enemy';
    let active = true;

    while (active && life.player.current > 0 && life.enemy.current > 0) {
      const state = machine[stateKey] ?? {};
      const transitions = state.transitions ?? {};
      const actorName = turn === 'player' ? playerName : enemyName;
      const opponentName = turn === 'player' ? enemyName : playerName;

      let word = '';
      if (turn === 'player') {
        const promptText = state.prompt_player ?? state.prompt ?? 'Welches Wort sprichst du?';
        const input = await promptPlayerSpell?.({
          prompt: replacePlaceholders(promptText, { actor: actorName, opponent: opponentName, state: stateKey }),
          allowSkip: false,
          state: stateKey,
          playerHP: life.player.current,
          enemyHP: life.enemy.current,
        });
        word = normalizeInput(input) ?? '';
      } else {
        const validCurrent = Object.keys(transitions).filter(w => resolveTransition(stateKey, w, 'enemy'));
        const validStart = startWords.filter(w => resolveTransition(initialState, w, 'enemy'));
        const pool = randomFn() < strength ? validCurrent : validStart;
        if (pool.length > 0) {
          word = pool[Math.floor(randomFn() * pool.length)];
        } else if (validCurrent.length > 0) {
          word = validCurrent[0];
        } else if (validStart.length > 0) {
          word = validStart[0];
        } else {
          word = '';
        }
      }

      const tx = resolveTransition(stateKey, word, turn);
      const replacements = { actor: actorName, opponent: opponentName, state: stateKey, word };
      if (!tx) {
        await emitFailure(state, turn, word, replacements);
        lastFailure = { actor: turn, state: stateKey, word, transitions: Object.keys(transitions) };
        active = false;
        break;
      }

      await emitTransition(tx, turn, replacements);

      const dmg = Number.isFinite(tx.damage) ? tx.damage : Number(tx.damage) || 0;
      if (dmg > 0) {
        const target = resolveDamageTarget(tx.damageTarget ?? 'enemy', turn);
        const template = tx.damageText ?? `%actor% trifft %opponent% mit %s und fügt ${Math.round(dmg)} Schaden zu.`;
        const message = replacePlaceholders(template, replacements);
        await applyDamage(target, dmg, message);
      }

      const previous = stateKey;
      stateKey = tx.next ?? initialState;
      if (typeof onStateChange === 'function') {
        await onStateChange({ state: stateKey, previousState: previous, reason: 'transition', actor: turn, word });
      }

      turn = turn === 'player' ? 'enemy' : 'player';
    }
  }

  return {
    winner: life.player.current > 0 ? 'player' : 'enemy',
    playerHP: life.player.current,
    enemyHP: life.enemy.current,
    lastFailure,
  };
}

export function buildLifeBarString(playerHP, playerMax, enemyHP, enemyMax) {
  const playerBar = formatLifeBar(playerHP, playerMax);
  const enemyBar = formatLifeBar(enemyHP, enemyMax);
  return `${playerBar} ${Math.max(0, Math.round(playerHP))}/${playerMax}\n${enemyBar} ${Math.max(0, Math.round(enemyHP))}/${enemyMax}`;
}

export function cropStateMachine(machine, wordList = [], initialState = 'start') {
  if (!machine || typeof machine !== 'object') {
    return {};
  }

  const words = Array.isArray(wordList) ? wordList : [wordList];
  const allowed = new Set(words.map(normalizeInput).filter(Boolean));
  const shouldFilter = allowed.size > 0;

  const filteredMachine = {};
  Object.entries(machine).forEach(([stateKey, stateValue]) => {
    if (stateKey === 'meta') {
      return;
    }
    if (!stateValue || typeof stateValue !== 'object') return;
    const copy = { ...stateValue };
    const transitions = stateValue.transitions ?? {};
    const filteredTransitions = {};
    Object.entries(transitions).forEach(([word, transitionConfig]) => {
      const normalizedWord = normalizeInput(word);
      if (!shouldFilter || allowed.has(normalizedWord)) {
        filteredTransitions[word] = typeof transitionConfig === 'string'
          ? transitionConfig
          : { ...transitionConfig };
      }
    });
    copy.transitions = filteredTransitions;
    filteredMachine[stateKey] = copy;
  });

  const resolveNextState = config => {
    if (typeof config === 'string') {
      return config;
    }
    if (config && typeof config === 'object' && typeof config.next === 'string') {
      return config.next;
    }
    return 'start';
  };

  if (!filteredMachine[initialState]) {
    throw new Error(`Initial state "${initialState}" missing after cropping.`);
  }

  const visited = new Set();
  const queue = [initialState];
  visited.add(initialState);

  while (queue.length > 0) {
    const stateKey = queue.shift();
    const state = filteredMachine[stateKey];
    if (!state) continue;
    const transitions = state.transitions ?? {};
    Object.values(transitions).forEach(config => {
      const nextState = resolveNextState(config);
      if (filteredMachine[nextState] && !visited.has(nextState)) {
        visited.add(nextState);
        queue.push(nextState);
      }
    });
  }

  const result = {};
  visited.forEach(stateKey => {
    const source = filteredMachine[stateKey];
    if (!source) return;
    const transitions = source.transitions ?? {};
    const sanitizedTransitions = {};
    Object.entries(transitions).forEach(([word, config]) => {
      const nextState = resolveNextState(config);
      const resolvedState = visited.has(nextState) ? nextState : initialState;
      if (!resolvedState) return;
      sanitizedTransitions[word] = typeof config === 'string'
        ? resolvedState
        : { ...config, next: resolvedState };
    });

    if (Object.keys(sanitizedTransitions).length === 0) {
      throw new Error(`State "${stateKey}" has no transitions after cropping.`);
    }

    result[stateKey] = { ...source, transitions: sanitizedTransitions };
  });

  if (machine.meta && typeof machine.meta === 'object') {
    result.meta = { ...machine.meta };
  }

  return result;
}
