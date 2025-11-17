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
  divineSay,
  switchMusic,
} from './utils.js';
import { runFightLoop, cropStateMachine } from '../fight.js';
import { SPELL_DUEL_MACHINE } from '../stateMachines/spellDuelMachine.js';

const BALAK_WIZARD_START_X = 96;
const BALAK_BOSS_X = BALAK_WIZARD_START_X + 96;

const BALAK_SCENE = {
  ambience: 'sanctumFinale',
  wizardStartX: BALAK_WIZARD_START_X,
  donkeyOffset: -40,
  props: [],
};

const ALL_BOSS_WORDS = [
  'אור',
  'מים',
  'קול',
  'חיים',
  'אש',
  'לא',
  'שמע',
  'ברך',
  'דבר',
  'אמת',
  'מלאך',
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
  switchMusic('secher belam ben beor-full.mp3');

  await showLevelTitle('Finaler Kampf -\nBalak, Schatten des Wortes');
  await fadeToBase(600);

  addProp(throneProps, { id: 'balakBoss', type: 'balakBossFigure', align: 'ground', x: BALAK_BOSS_X, parallax: 0.98 });
  const balakSpeechIntro = buildBalakSpeechOptions(throneProps);

  await wizardSay('Balak, ich habe dich durchschaut. Dein Herz ist böse und mit Geld und Macht willst du mich auf deine Seite bringen.');
  await donkeySay('Endlich hat er es kapiert.');
  await wizardSay('Doch meine Kraft kommt von יהוה – ihm bin ich zur Treue verpflichtet.');
  await propSay(throneProps, 'balakBoss', 'Ich bin der König von Moab, was denkst du, wer du bist?', balakSpeechIntro);
  await donkeySay('Los sag es!');
  await wizardSay('Ich bin Bileam, Sohn des Beor. Mit Worten kann ich Dinge bewegen. Die Welt gehorcht mir, wenn ich mich an die richtigen Worte benutze und dem Code des Schöpfers folge.');
  await propSay(throneProps, 'balakBoss', 'Dann sind wir jetzt Feinde.', balakSpeechIntro);

  const outcome = await executeBalakFight(throneProps);
  if (outcome === 'win') {
    await narratorSay('Balaks Schatten zerbricht. Purpurne Funken taumeln in das Sternenlicht und verglühen.');
    await donkeySay('Siehst du, Meister? Sein Gold und seine Drohungen liegen wie Staub zu deinen Füßen.');
    await divineSay('שמעת בקולי, בן בעור.\nDu hast auf meine Stimme gehört, Sohn des Beor.');
    await fadeToBlack(640);
    setLifeBars(null);
    return 'win';
  }
  return 'restart';
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
        const balakSpeech = buildBalakSpeechOptions(propsRef.current);
        await propSay(propsRef.current, 'balakBoss', event.text, balakSpeech);
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
    await donkeySay('Balak fällt stumm. Deine Worte bleiben unter יהוה.');
    return 'win';
  }

  const defeatAdvice = await handleFightDefeat(result.lastFailure);
  await playBalakDefeatSequence(sceneProps);
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
    await narratorSay(`${word} spaltet deine Treue. Sternenlicht sickert als Purpur aus dem Boden.`);
  } else {
    await narratorSay('Balaks Schatten umschlingt dich. Sternlicht kippt in schwarzen Rauch.');
  }

  const { stateKey, suggestion } = buildSuggestion(lastFailure);
  const stateLabel = stateKey ? describeState(stateKey) : null;

  if (stateLabel && suggestion) {
    await donkeySay(`Merke dir das Muster, Meister: In ${stateLabel} antwortest du am besten mit ${suggestion}.`);
  } else if (suggestion) {
    await donkeySay(`Versuche es beim nächsten Mal mit ${suggestion}, Meister.`);
  } else {
    await donkeySay('Beobachte seine Worte, Meister. Jeder Schatten folgt einem Muster.');
  }

  return {
    suggestion: suggestion ?? null,
    stateKey: stateKey ?? null,
  };
}

async function playBalakDefeatSequence(sceneProps) {
  setSceneContext({ level: 'level10_5', phase: 'defeat' });
  const balakSpeech = buildBalakSpeechOptions(sceneProps);
  await propSay(sceneProps, 'balakBoss', 'Siehst du, Sohn des Beor? Meine Gier frisst deine Treue.', balakSpeech);
  await narratorSay('Purpurne Ketten umwinden den Altar. Sternenlicht sickert in schwarzes Glas.');
  await donkeySay('Wir kehren zum Anfang zurück. Atme, erinnere dich, forme die Worte neu.');
  await donkeySay('Nur wer hoert und wiederholt, zerreißt seinen Schatten. Wir beginnen von vorn.');
  await divineSay('חזור לדברי ואקים אותך.\nKehre zu meinem Wort zurück, und ich richte dich auf.');
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
      return 'ברך';
    case 'angelic':
      return 'מלאך';
    case 'truth':
      return 'אמת';
    case 'spoken':
      return 'דבר';
    case 'resonantTrap':
      return 'קול';
    case 'truthPrism':
      return 'אמת';
    case 'blessingOrbit':
      return 'ברך';
    case 'angelicChorus':
      return 'מלאך';
    case 'radiantPrism':
      return 'אור';
    case 'negation':
      return 'לא';
    case 'listening':
      return 'שמע';
    default:
      return null;
  }
}

function buildBalakSpeechOptions(sceneProps) {
  const balak = findProp(sceneProps ?? [], 'balakBoss');
  const bounds = getScenePropBounds('balakBoss');
  const spriteHeight = bounds?.height ?? balak?.sprite?.height ?? 110;
  const estimatedWidth = bounds?.width ?? balak?.sprite?.width ?? 138;
  const offsetY = -Math.max(36, spriteHeight * 0.32);
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
      return liveBounds.top + Math.max(18, liveBounds.height * 0.18);
    }
    const baseY = balak?.y ?? wizard.y;
    const height = balak?.sprite?.height ?? 0;
    return baseY + Math.max(18, height * 0.18);
  };
  return {
    offsetY,
    anchor: 'center',
    anchorX: anchorXBalak,
    anchorY: anchorYBalak,
  };
}
