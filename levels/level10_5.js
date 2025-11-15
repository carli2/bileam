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
  anchorX,
  anchorY,
  wizard,
  donkey,
  canonicalSpell,
  applySceneConfig,
  cloneSceneProps,
  propSay,
  addProp,
  findProp,
} from './utils.js';
import { runFightLoop, cropStateMachine } from '../fight.js';
import { SPELL_DUEL_MACHINE } from '../stateMachines/spellDuelMachine.js';

const BALAK_SCENE = {
  ambience: 'sanctumFinale',
  wizardStartX: 96,
  donkeyOffset: -40,
  props: [
    { id: 'balakFractureWest', type: 'shadowFracture', x: 168, align: 'ground', parallax: 0.92 },
    { id: 'balakProcessCore', type: 'balakProcessCore', x: 332, align: 'ground', parallax: 0.98 },
    { id: 'balakFractureEast', type: 'shadowFracture', x: 484, align: 'ground', parallax: 1.02 },
  ],
};

const ALL_BOSS_WORDS = [
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

const BALAK_KNOWN_WORDS = ALL_BOSS_WORDS
  .map(canonicalSpell)
  .filter(Boolean);

const BALAK_MACHINE = cropStateMachine(SPELL_DUEL_MACHINE, BALAK_KNOWN_WORDS);
BALAK_MACHINE.meta = {
  ...(BALAK_MACHINE.meta ? { ...BALAK_MACHINE.meta } : {}),
  enemyAccuracy: 0.88,
  enemyAccuracyStreakLimit: 3,
};

export async function runLevelTenFive() {
  const plan = levelAmbiencePlan.level10;
  const throneProps = cloneSceneProps(BALAK_SCENE.props);
  applySceneConfig({ ...BALAK_SCENE, props: throneProps });
  ensureAmbience(plan?.apply ?? BALAK_SCENE.ambience ?? 'sanctumFinale');
  setSceneContext({ level: 'level10_5', phase: 'arrival' });
  setLifeBars(null);

  await showLevelTitle('Finaler Kampf -\nBalak, Schatten des Wortes');
  await fadeToBase(600);

  addProp(throneProps, { id: 'balakBoss', type: 'balakProcessCoreActive', align: 'ground', x: 332 });

  await narratorSay('Balaks Schatten löst sich von seinem Leib. Schriftbahnen wüten wie Sturm.');
  await donkeySay('Alle Worte stehen dir zu Diensten. Erwarte keine Gnade.');
  await wizardSay('Ich spreche nur, was ich gelernt habe – und nichts anderes.');
  await donkeySay('Dann sprich – und halte stand.');

  const outcome = await executeBalakFight(throneProps);
  if (outcome === 'win') {
    await narratorSay('Balaks Schatten reisst. Sein Körper sinkt in den Riss aus Licht.');
    await donkeySay('Der Stern bleibt – aber sein Griff ist gebrochen.');
    await fadeToBlack(640);
    setLifeBars(null);
  }
}

async function executeBalakFight(sceneProps) {
  const hudUpdate = state => {
    if (!state) {
      setLifeBars(null);
      return;
    }
    const playerHP = Math.max(0, Math.round(state.playerHP ?? 0));
    const playerMax = Math.max(1, Math.round(state.playerMax ?? 100));
    const enemyHP = Math.max(0, Math.round(state.enemyHP ?? 0));
    const enemyMax = Math.max(1, Math.round(state.enemyMax ?? 140));
    const playerText = `Bileam ${state.barPlayer ?? ''} ${playerHP}/${playerMax}`.trim();
    const enemyText = `Balak ${state.barEnemy ?? ''} ${enemyHP}/${enemyMax}`.trim();
    setLifeBars({
      player: { text: playerText },
      enemy: { text: enemyText },
    });
  };

  const propsRef = { current: sceneProps };

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
        const balak = findProp(propsRef.current, 'balakBoss');
        const bounds = getScenePropBounds('balakBoss');
        const spriteHeight = bounds?.height ?? balak?.sprite?.height ?? 110;
        const estimatedWidth = bounds?.width ?? balak?.sprite?.width ?? 138;
        const offsetY = -Math.max(32, spriteHeight * 0.46);
        const anchorXBalak = () => {
          const liveBounds = getScenePropBounds('balakBoss');
          if (liveBounds) {
            return liveBounds.left + liveBounds.width / 2;
          }
          const baseLeft = balak?.x ?? wizard.x + 160;
          return baseLeft + estimatedWidth / 2;
        };
        const anchorYBalak = () => {
          const liveBounds = getScenePropBounds('balakBoss');
          if (liveBounds) {
            return liveBounds.top + Math.max(12, liveBounds.height * 0.12);
          }
          const baseY = balak?.y ?? wizard.y;
          return baseY + Math.max(12, (balak?.sprite?.height ?? 0) * 0.12);
        };
        await propSay(propsRef.current, 'balakBoss', event.text, {
          offsetY,
          anchor: 'center',
          anchorX: anchorXBalak,
          anchorY: anchorYBalak,
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
      machine: BALAK_MACHINE,
      initialState: 'start',
      playerName: 'Bileam',
      enemyName: 'Balak',
      playerHP: 110,
      enemyHP: 160,
      promptPlayerSpell: options => promptSpellInput(options),
      onEvent: relayFightEvent,
      onUpdate: hudUpdate,
      enemyAccuracy: BALAK_MACHINE.meta?.enemyAccuracy ?? 0.88,
      enemyMistakeChance: 0.08,
    });
  } catch (error) {
    if (error instanceof SkipSignal) {
      setLifeBars(null);
    }
    throw error;
  }

  if (result.winner === 'player') {
    await donkeySay('Balak verstummt. Dein Wort bleibt, seiner vergeht.');
    return 'win';
  }

  const defeatAdvice = await handleFightDefeat(result.lastFailure);
  throw new LevelRetrySignal('level10_5', {
    message: 'level10_5_balak_defeat',
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

async function playCutsceneMoment({ text, duration = 1600 } = {}) {
  const caption = (text ?? '').trim();
  if (!caption) return;
  await showLevelTitle(caption, duration);
}

async function handleFightDefeat(lastFailure) {
  setLifeBars(null);
  const word = lastFailure?.attackerWord;
  if (word) {
    await narratorSay(`${word} zerreisst deine Verteidigung. Der Stern verfinstert sich.`);
  } else {
    await narratorSay('Balaks Schatten trifft dich. Die Sterne erloeschen.');
  }

  const { stateKey, suggestion } = buildSuggestion(lastFailure);
  const stateLabel = stateKey ? describeState(stateKey) : null;

  if (stateLabel && suggestion) {
    await donkeySay(`Merke dir das Muster: In ${stateLabel} antwortest du am besten mit ${suggestion}.`);
  } else if (suggestion) {
    await donkeySay(`Versuche es beim nächsten Mal mit ${suggestion}.`);
  } else {
    await donkeySay('Beobachte seine Worte. Jeder Schatten folgt einem Muster.');
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
  const machineState = BALAK_MACHINE[stateKey];
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
    case 'radiant':
      return 'אור';
    case 'overgrown':
      return 'חיים';
    case 'blessing':
      return 'ברכה';
    case 'curse':
      return 'ארור';
    case 'angelic':
      return 'מלאך';
    case 'truth':
      return 'אמת';
    case 'spoken':
      return 'דבר';
    case 'battle':
      return 'המלחמה';
    case 'negation':
      return 'לא';
    case 'listening':
      return 'שמע';
    default:
      return null;
  }
}
