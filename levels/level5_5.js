import {
  ensureAmbience,
  setSceneContext,
  levelAmbiencePlan,
  fadeToBlack,
  fadeToBase,
  showLevelTitle,
  promptBubble,
  setLifeBars,
  SkipSignal,
  getScenePropBounds,
  LevelRetrySignal,
} from '../scene.js';
import {
  narratorSay,
  wizardSay,
  donkeySay,
  divineSay,
  anchorX,
  anchorY,
  wizard,
  donkey,
  canonicalSpell,
  applySceneConfig,
  cloneSceneProps,
  CANYON_SCENE,
  propSay,
  addProp,
  findProp,
} from './utils.js';
import { runFightLoop, cropStateMachine } from '../fight.js';
import { SPELL_DUEL_MACHINE } from '../stateMachines/spellDuelMachine.js';

const GUARDIAN_KNOWN_WORDS = ['אור', 'מים', 'קול', 'חיים', 'אש']
  .map(canonicalSpell)
  .filter(Boolean);
const GOLEM_MACHINE = cropStateMachine(SPELL_DUEL_MACHINE, GUARDIAN_KNOWN_WORDS);
GOLEM_MACHINE.meta = {
  ...(SPELL_DUEL_MACHINE.meta ? { ...SPELL_DUEL_MACHINE.meta } : {}),
  enemyAccuracy: 0.45,
  enemyAccuracyStreakLimit: 1,
};

export async function runLevelFiveFive() {
  const plan = levelAmbiencePlan.level5_5;
  const canyonProps = cloneSceneProps(CANYON_SCENE.props);
  applySceneConfig({ ...CANYON_SCENE, props: canyonProps });
  ensureAmbience(plan?.review ?? 'echoChamber');
  setSceneContext({ level: 'level5_5', phase: 'arrival' });
  setLifeBars(null);
  await showLevelTitle('Zwischenboss -\nDer Steinwächter');
  await fadeToBase(600);

  addProp(canyonProps, { id: 'golemGuardian', type: 'golemGuardian', align: 'ground', x: wizard.x + 140 });

  await narratorSay('Aus dem Staub der Schlucht formt sich ein Leib aus Stein – schwer, uralt, stumm.');
  await donkeySay('Ein Wächter. Er prüft, ob du verstanden hast, was Worte bewirken können.');
  await wizardSay('Wie besiegt man einen Stein?');
  await donkeySay('Mit Worten, nicht mit Fäusten. Aber merke: Worte kämpfen nicht – sie wirken.');

  const fightOutcome = await executeFight(canyonProps);

  if (fightOutcome === 'win') {
    await narratorSay('Der Golem erstarrt. Die Schlucht wird still.');
    const golem = findProp(canyonProps, 'golemGuardian');
    const bounds = getScenePropBounds('golemGuardian');
    const baseX = bounds ? bounds.left + bounds.width / 2 : (golem?.x ?? wizard.x);
    const baseY = bounds ? bounds.top + bounds.height - 18 : (golem?.y ?? wizard.y);
    addProp(canyonProps, {
      id: 'golemMossLeft',
      type: 'gardenForegroundPlant',
      x: baseX - 26,
      y: baseY - 12,
      parallax: 1.02,
    });
    addProp(canyonProps, {
      id: 'golemMossRight',
      type: 'gardenForegroundPlant',
      x: baseX + 14,
      y: baseY - 6,
      parallax: 1.04,
    });
    await donkeySay('Du hast nicht zerstört – du hast verstanden. Weiter nach Moab, Meister.');
    await divineSay('עתה בלעם בן בעור, הנך מוכן למלאכה שאמסור לך.\nNun Bileam Sohn des Beor, bist du bereit für den Auftrag, den ich dir geben werde.');
    await fadeToBlack(480);
    setLifeBars(null);
    return;
  }
}

async function executeFight(canyonProps) {
  const hudUpdate = state => {
    if (!state) {
      setLifeBars(null);
      return;
    }
    const playerHP = Math.max(0, Math.round(state.playerHP ?? 0));
    const playerMax = Math.max(1, Math.round(state.playerMax ?? 100));
    const enemyHP = Math.max(0, Math.round(state.enemyHP ?? 0));
    const enemyMax = Math.max(1, Math.round(state.enemyMax ?? 100));
    const playerText = `Bileam ${state.barPlayer ?? ''} ${playerHP}/${playerMax}`.trim();
    const enemyText = `Golem ${state.barEnemy ?? ''} ${enemyHP}/${enemyMax}`.trim();
    setLifeBars({
      player: { text: playerText },
      enemy: { text: enemyText },
    });
  };


  const propsRef = { current: canyonProps };

  const relayFightEvent = async event => {
    if (!event) return;
    if (event.speaker === 'sequence') {
      await playCutsceneMoment(event);
      return;
    }
    if (!event.text) return;
    switch (event.speaker) {
      case 'player':
        await wizardSay(event.text);
        break;
      case 'enemy': {
        const golem = findProp(propsRef.current, 'golemGuardian');
        const bounds = getScenePropBounds('golemGuardian');
        const spriteHeight = bounds?.height ?? golem?.sprite?.height ?? 96;
        const estimatedWidth = bounds?.width ?? golem?.sprite?.width ?? 120;
        const offsetY = -Math.max(28, spriteHeight * 0.42);
        const anchorX = () => {
          const liveBounds = getScenePropBounds('golemGuardian');
          if (liveBounds) {
            return liveBounds.left + liveBounds.width / 2;
          }
          const baseLeft = golem?.x ?? wizard.x;
          return baseLeft + estimatedWidth / 2;
        };
        const anchorY = () => {
          const liveBounds = getScenePropBounds('golemGuardian');
          if (liveBounds) {
            return liveBounds.top + Math.max(8, liveBounds.height * 0.08);
          }
          const baseY = golem?.y ?? wizard.y;
          return baseY + Math.max(8, (golem?.sprite?.height ?? 0) * 0.08);
        };
        await propSay(propsRef.current, 'golemGuardian', event.text, {
          offsetY,
          anchor: 'center',
          anchorX,
          anchorY,
        });
        break;
      }
      case 'ally':
        await donkeySay(event.text);
        break;
      default:
        await narratorSay(event.text);
        break;
    }
  };

  let result;
  try {
    result = await runFightLoop({
      machine: GOLEM_MACHINE,
      initialState: 'start',
      playerName: 'Bileam',
      enemyName: 'Golem',
      promptPlayerSpell: options => promptSpellInput(options),
      onEvent: relayFightEvent,
      onUpdate: hudUpdate,
      enemyAccuracy: GOLEM_MACHINE.meta?.enemyAccuracy,
    });
  } catch (err) {
    if (err instanceof SkipSignal) {
      setLifeBars(null);
    }
    throw err;
  }

  if (result.winner === 'player') {
    await donkeySay('Gut gemacht. Der Golem verneigt sich – Worte beruhigen Stein.');
    return 'win';
  }
  const defeatAdvice = await handleFightDefeat(result.lastFailure);
  await playDefeatComfortSequence(canyonProps);
  throw new LevelRetrySignal('level5_5', {
    message: 'level5_5_guardian_defeat',
    hint: defeatAdvice?.suggestion ?? null,
    state: defeatAdvice?.stateKey ?? null,
  });
}

async function promptSpellInput({ prompt, allowSkip = false } = {}) {
  const input = await promptBubble(
    anchorX(wizard, -6),
    anchorY(wizard, -60),
    prompt ?? 'Sprich dein Wort',
    anchorX(wizard, 0),
    anchorY(wizard, -32),
  );
  const canonical = canonicalSpell(input);
  if (!canonical && allowSkip) {
    return null;
  }
  return canonical || input;
}

async function playCutsceneMoment({ text, duration = 1400 } = {}) {
  const caption = (text ?? '').trim();
  if (!caption) return;
  await showLevelTitle(caption, duration);
}

async function handleFightDefeat(lastFailure) {
  setLifeBars(null);
  const word = lastFailure?.attackerWord;
  if (word) {
    await narratorSay(`${word} zerreißt deine Verteidigung. Deine Knie geben nach.`);
  } else {
    await narratorSay('Der Wächter trifft dich. Deine Knie geben nach.');
  }

  const { stateKey, suggestion } = buildSuggestion(lastFailure);
  const stateLabel = stateKey ? describeState(stateKey) : null;

  if (stateLabel && suggestion) {
    await donkeySay(`Mut, Meister. Wenn der Wächter dich im Zustand ${stateLabel} hält, antworte mit ${suggestion}.`);
  } else if (suggestion) {
    await donkeySay(`Mut, Meister. Versuch es beim nächsten Mal mit ${suggestion}.`);
  } else {
    await donkeySay('Mut, Meister. Beobachte seine Worte und antworte präzise.');
  }

  return {
    suggestion: suggestion ?? null,
    stateKey: stateKey ?? null,
  };
}

function buildSuggestion(lastFailure) {
  if (!lastFailure?.state) {
    return { stateKey: null, suggestion: null };
  }
  const stateKey = lastFailure.state;
  const machineState = GOLEM_MACHINE[stateKey];
  if (!machineState) {
    return { stateKey, suggestion: null };
  }

  const transitions = machineState.transitions ?? {};
  const orderedKeys = (lastFailure.transitions && lastFailure.transitions.length > 0)
    ? lastFailure.transitions
    : Object.keys(transitions);

  for (const key of orderedKeys) {
    const entry = transitions[key];
    if (!entry) continue;
    if (typeof entry === 'object' && entry.only === 'enemy') continue;
    return { stateKey, suggestion: key };
  }

  return { stateKey, suggestion: null };
}

function describeState(stateKey) {
  switch (stateKey) {
    case 'burning':
      return 'אש';
    case 'flooded':
      return 'מים';
    case 'echoing':
      return 'קול';
    case 'resonantTrap':
      return 'קול';
    case 'radiant':
      return 'אור';
    case 'overgrown':
      return 'חיים';
    case 'start':
    default:
      return null;
  }
}

async function playDefeatComfortSequence(canyonProps) {
  await divineSay('דע, בלעם: לא הנצחון הוא התכלית, אלא הדרך לה.\nWisse, Bileam: Nicht der Sieg ist das Ziel, sondern der Weg dorthin.');
  await golemSpeak(canyonProps, 'Du wirst mich nicht besiegen können.');
  await donkeySay('Kopf hoch, Bileam – du kannst es noch einmal versuchen.');
}

async function golemSpeak(canyonProps, text) {
  if (!text) return;
  const golem = findProp(canyonProps, 'golemGuardian');
  const bounds = getScenePropBounds('golemGuardian');
  const spriteHeight = bounds?.height ?? golem?.sprite?.height ?? 96;
  const estimatedWidth = bounds?.width ?? golem?.sprite?.width ?? 120;
  const offsetY = -Math.max(28, spriteHeight * 0.42);
  const anchorX = () => {
    const liveBounds = getScenePropBounds('golemGuardian');
    if (liveBounds) {
      return liveBounds.left + liveBounds.width / 2;
    }
    const baseLeft = golem?.x ?? wizard.x;
    return baseLeft + estimatedWidth / 2;
  };
  const anchorY = () => {
    const liveBounds = getScenePropBounds('golemGuardian');
    if (liveBounds) {
      return liveBounds.top + Math.max(8, liveBounds.height * 0.08);
    }
    const baseY = golem?.y ?? wizard.y;
    return baseY + Math.max(8, (golem?.sprite?.height ?? 0) * 0.08);
  };
  await propSay(canyonProps, 'golemGuardian', text, {
    offsetY,
    anchor: 'center',
    anchorX,
    anchorY,
  });
}
