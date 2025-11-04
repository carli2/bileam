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

/**
 * Runs a spell duel driven by a declarative state machine.
 *
 * Machine contract per state (keys are canonical Hebrew words):
 * {
 *   intro_player: string | SpeechCfg,
 *   intro_enemy: string | SpeechCfg,
 *   sequence_player: string | SequenceStep | SequenceStep[],
 *   sequence_enemy: string | SequenceStep | SequenceStep[],
 *   prompt_player: string,
 *   damage: number,                    // fallback damage on failed response
 *   damage_player/damage_enemy: number // optional overrides
 *   failure_player: string | SpeechCfg,
 *   failure_enemy: string | SpeechCfg,
 *   failure_player_damageText: string,
 *   failure_enemy_damageText: string,
 *   failure_next: string,              // default next state after failure
 *   transitions: {
 *     'אש': string | {
 *       next: 'on_fire',
 *       text/text_player/text_enemy: string,
 *       text2/text2_player/text2_enemy: string,
 *       speaker/speaker_player/speaker_enemy: string,
 *       damage: number,                // optional on-hit damage
 *       damageTarget: 'player' | 'enemy',
 *       damageText: string,
  *       keepActor: boolean,            // true keeps the same actor on next turn
  *       only: 'player' | 'enemy',      // restricts transition to a single side
 *     }
 *   }
 * }
 *
 * SequenceStep: {
  *   text?: string,
  *   duration?: number,
  *   effect?: string,
  *   speaker?: string,
  *   type?: string,
  * }
  *
 * Additional params:
 * - enemyMistakeChance (0..1) controls how often the enemy deliberately
 *   chooses a non-transition word.
 * - enemyVocabulary allows overriding the word bank considered for random
 *   enemy mistakes; defaults to the union of machine transitions.
 *
 * Strings may contain %actor%, %opponent%, %state%, and %s (word) placeholders.
 */
export async function runFightLoop({
  machine,
  initialState = 'start',
  initialActor = 'player',
  playerName = 'Bileam',
  enemyName = 'Golem',
  playerHP = DEFAULT_MAX_HP,
  enemyHP = DEFAULT_MAX_HP,
  promptPlayerSpell,
  onEvent = () => {},
  onUpdate = () => {},
  randomFn = Math.random,
  enemyMistakeChance = 0.5,
  enemyVocabulary,
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

  const replacePlaceholders = (text, replacements) => {
    if (!text) return text;
    let output = text;
    Object.entries(replacements).forEach(([key, value]) => {
      const pattern = new RegExp(`%${key}%`, 'g');
      output = output.replace(pattern, value);
    });
    if (replacements.word) {
      output = output.replace('%s', replacements.word);
    }
    return output;
  };

  const emitSpeech = async config => {
    if (!config) return;
    const { speaker, text, text2, speaker2 } = config;
    if (text) {
      await onEvent({ speaker: speaker ?? 'narrator', text });
    }
    if (text2) {
      await onEvent({ speaker: speaker2 ?? speaker ?? 'narrator', text: text2 });
    }
  };

  const resolveSpeech = (value, fallbackSpeaker, replacements = {}) => {
    if (!value) return null;
    if (typeof value === 'string') {
      return {
        speaker: fallbackSpeaker,
        text: replacePlaceholders(value, replacements),
      };
    }
    const text = value.text ? replacePlaceholders(value.text, replacements) : undefined;
    const text2 = value.text2 ? replacePlaceholders(value.text2, replacements) : undefined;
    return {
      speaker: value.speaker ?? fallbackSpeaker,
      text,
      text2,
      speaker2: value.speaker2,
    };
  };

  const normalizeTransition = (entry, actor) => {
    if (!entry) return null;
    if (typeof entry === 'string') {
      return { next: entry };
    }
    const restrict = entry.only ?? entry.allowedFor ?? null;
    if (restrict === 'player' && actor !== 'player') return null;
    if (restrict === 'enemy' && actor !== 'enemy') return null;

    const forbid = entry.forbiddenFor ?? entry.forbid ?? null;
    if (forbid === actor) return null;
    if (Array.isArray(forbid) && forbid.includes(actor)) return null;

    const nextEntry = entry.next ?? 'start';
    return {
      next: nextEntry,
      text: entry.text ?? (actor === 'player' ? entry.text_player : entry.text_enemy),
      text2: entry.text2 ?? (actor === 'player' ? entry.text2_player : entry.text2_enemy),
      speaker: entry.speaker ?? (actor === 'player' ? entry.speaker_player : entry.speaker_enemy),
      speaker2: entry.speaker2 ?? (actor === 'player' ? entry.speaker2_player : entry.speaker2_enemy),
      damage: entry.damage ?? 0,
      damageTarget: entry.damageTarget,
      damageText: entry.damageText,
      keepActor: entry.keepActor ?? false,
    };
  };

  const appendDamageMarker = (text, damage) => {
    if (!text || !(damage > 0)) return text;
    return text.includes('(-') ? text : `${text} (-${damage})`;
  };

  const normalizeSequenceStep = (step, actorSide) => {
    if (!step) return null;
    if (typeof step === 'string') {
      return {
        text: step,
        speaker: 'sequence',
      };
    }
    if (typeof step !== 'object') return null;
    const copy = { ...step };
    if (!copy.speaker) {
      copy.speaker = copy.type === 'speech'
        ? actorSide === 'player' ? 'ally' : 'enemy'
        : 'sequence';
    }
    copy.type = copy.type ?? 'sequence';
    return copy;
  };

  const emitSequence = async (rawSequence, actorSide, replacements) => {
    if (!rawSequence) return;
    const steps = Array.isArray(rawSequence) ? rawSequence : [rawSequence];
    for (const rawStep of steps) {
      const step = normalizeSequenceStep(rawStep, actorSide);
      if (!step) continue;
      const payload = {
        speaker: step.speaker ?? 'sequence',
        type: step.type ?? 'sequence',
        text: step.text ? replacePlaceholders(step.text, replacements) : undefined,
        duration: step.duration,
        effect: step.effect,
        actor: actorSide,
      };
      await onEvent(payload);
    }
  };

  const transitionsFor = state => state?.transitions ?? {};

  const collectedVocabulary = (() => {
    if (Array.isArray(enemyVocabulary) && enemyVocabulary.length > 0) {
      return [...new Set(enemyVocabulary.filter(Boolean))];
    }
    const words = new Set();
    Object.values(machine).forEach(state => {
      const transitions = transitionsFor(state);
      Object.keys(transitions).forEach(key => {
        if (key) words.add(key);
      });
    });
    return [...words];
  })();

  let stateKey = initialState;
  let actor = initialActor === 'enemy' ? 'enemy' : 'player';
  let lastFailure = null;
  let recentEnemyWord = null;
  renderStatus();

  while (life.player.current > 0 && life.enemy.current > 0) {
    const state = states[stateKey];
    if (!state) {
      throw new Error(`Missing fight state definition for "${stateKey}"`);
    }

    const actorName = actor === 'player' ? playerName : enemyName;
    const opponent = actor === 'player' ? enemyName : playerName;
    const replacements = {
      actor: actorName,
      opponent,
      state: stateKey,
    };

    const sequenceConfig = actor === 'player'
      ? state.sequence_player ?? state.sequence
      : state.sequence_enemy ?? state.sequence;
    await emitSequence(sequenceConfig, actor, replacements);

    const introConfig = actor === 'player' ? state.intro_player : state.intro_enemy;
    await emitSpeech(resolveSpeech(introConfig, actor === 'player' ? 'ally' : 'enemy', replacements));

    const stateTransitions = transitionsFor(state);
    const transitionKeys = Object.keys(stateTransitions);

    const resolveFailure = async word => {
      const failedStateKey = stateKey;
      const damage = actor === 'player'
        ? state.damage_player ?? state.damage ?? 0
        : state.damage_enemy ?? state.damage ?? 0;
      const failureConfig = actor === 'player' ? state.failure_player : state.failure_computer;
      const failureSpeakerFallback = actor === 'player' ? 'ally' : 'enemy';
      const failureReplacements = {
        ...replacements,
        word: word ?? '',
      };
      let speech = resolveSpeech(failureConfig, failureSpeakerFallback, failureReplacements);
      if (!speech || !speech.text) {
        const defaultText = actor === 'player'
          ? `${playerName} findet keinen passenden Zauber.`
          : `${enemyName} findet keinen passenden Zauber.`;
        speech = { speaker: failureSpeakerFallback, text: defaultText };
      }
      speech.text = appendDamageMarker(speech.text, damage);
      await emitSpeech(speech);

      if (damage > 0) {
        const target = actor === 'player' ? 'player' : 'enemy';
        const targetName = target === 'player' ? playerName : enemyName;
        const template = (actor === 'player'
          ? state.failure_player_damageText
          : state.failure_computer_damageText)
          ?? state.failure_damageText;
        const damageText = template
          ? replacePlaceholders(template, failureReplacements)
          : `${targetName} erhält ${damage} Schaden.`;
        await applyDamage(target, damage, damageText);
      }

      if (life.player.current <= 0 || life.enemy.current <= 0) {
        const transitions = Object.keys(stateTransitions ?? {});
        lastFailure = {
          actor,
          state: failedStateKey,
          word: word ?? '',
          transitions,
          attackerWord: actor === 'player' ? recentEnemyWord : null,
          damage,
        };
        return;
      }

      const failureNextPreference = actor === 'player'
        ? state.failure_player_next
        : state.failure_computer_next;
      stateKey = failureNextPreference ?? state.failure_next ?? 'start';
      const transitions = Object.keys(stateTransitions ?? {});
      lastFailure = {
        actor,
        state: failedStateKey,
        word: word ?? '',
        transitions,
        attackerWord: actor === 'player' ? recentEnemyWord : null,
        damage,
      };
    };

    if (transitionKeys.length === 0) {
      await resolveFailure('');
      if (life.player.current <= 0 || life.enemy.current <= 0) break;
      continue;
    }

    let chosenWord;
    if (actor === 'player') {
      const promptText = state.prompt_player ?? state.prompt ?? 'Welches Wort sprichst du?';
      const input = await promptPlayerSpell?.({
        prompt: replacePlaceholders(promptText, replacements),
        allowSkip: false,
        state: stateKey,
        playerHP: life.player.current,
        enemyHP: life.enemy.current,
      });
      const normalized = normalizeInput(input);
      chosenWord = normalized ?? '';
    } else {
      const pickRandom = list => (list.length > 0 ? list[Math.floor(randomFn() * list.length)] : undefined);
      const shouldFreestyle = enemyMistakeChance > 0 && randomFn() < enemyMistakeChance;
      if (shouldFreestyle) {
        chosenWord = pickRandom(collectedVocabulary) ?? null;
      }
      if (!chosenWord) {
        const fallback = pickRandom(transitionKeys);
        chosenWord = fallback ?? '';
      }
      recentEnemyWord = chosenWord;
    }

    const transition = normalizeTransition(stateTransitions[chosenWord], actor);

    if (!transition) {
      await resolveFailure(chosenWord);
      if (life.player.current <= 0 || life.enemy.current <= 0) break;
      continue;
    }

    const speakReplacements = {
      ...replacements,
      word: chosenWord,
    };

    const explicitTarget = transition.damageTarget;
    const allowDamage = transition.damage && transition.damage > 0 && (
      explicitTarget === 'player'
      || explicitTarget === 'enemy'
      || actor === 'player'
    );
    const effectiveDamage = allowDamage ? transition.damage : 0;

    const speech = resolveSpeech(
      {
        speaker: transition.speaker,
        speaker2: transition.speaker2,
        text: transition.text,
        text2: transition.text2,
      },
      actor === 'player' ? 'player' : 'enemy',
      speakReplacements,
    );

    if (speech && effectiveDamage > 0) {
      speech.text = appendDamageMarker(speech.text, effectiveDamage);
    }

    if (!speech?.text) {
      const defaultSpeaker = actor === 'player' ? 'player' : 'enemy';
      let defaultText = `${actorName} spricht ${chosenWord}.`;
      defaultText = appendDamageMarker(defaultText, effectiveDamage);
      await emitSpeech({ speaker: defaultSpeaker, text: defaultText });
    } else {
      await emitSpeech(speech);
    }

    if (allowDamage) {
      const target = (() => {
        if (explicitTarget === 'player' || explicitTarget === 'enemy') {
          return explicitTarget;
        }
        return actor === 'player' ? 'enemy' : 'player';
      })();
      const targetName = target === 'player' ? playerName : enemyName;
      const damageText = transition.damageText
        ? replacePlaceholders(transition.damageText, speakReplacements)
        : `${targetName} erhält ${transition.damage} Schaden.`;
      await applyDamage(target, transition.damage, damageText);
      if (life.player.current <= 0 || life.enemy.current <= 0) {
        lastFailure = {
          actor,
          state: stateKey,
          word: chosenWord,
          transitions: transitionKeys,
          attackerWord: actor === 'enemy' ? chosenWord : recentEnemyWord,
          damage: transition.damage,
        };
        break;
      }
      if (life.player.current <= 0 || life.enemy.current <= 0) break;
    }

    stateKey = transition.next ?? 'start';
    if (!transition.keepActor) {
      actor = actor === 'player' ? 'enemy' : 'player';
      if (actor === 'enemy') {
        recentEnemyWord = null;
      }
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
