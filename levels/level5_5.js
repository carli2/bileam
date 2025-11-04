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
} from '../scene.js';
import {
  narratorSay,
  wizardSay,
  donkeySay,
  anchorX,
  anchorY,
  wizard,
  donkey,
  normalizeHebrewInput,
  applySceneConfig,
  cloneSceneProps,
  CANYON_SCENE,
  propSay,
  addProp,
  findProp,
} from './utils.js';
import { runFightLoop } from '../fight.js';

const RESPONSE_ALIASES = {
  ash: 'אש',
  esh: 'אש',
  אש: 'אש',
  or: 'אור',
  אור: 'אור',
  mayim: 'מים',
  majim: 'מים',
  mjm: 'מים',
  מים: 'מים',
  qol: 'קול',
  kol: 'קול',
  קול: 'קול',
  chayim: 'חיים',
  chaim: 'חיים',
  xayim: 'חיים',
  chajim: 'חיים',
  חיים: 'חיים',
};

const GOLEM_MACHINE = {
  start: {
    intro_player: {
      speaker: 'narrator',
      text: 'Staub pulst um dich. Worte hungern nach Form.',
    },
    intro_enemy: null,
    sequence_enemy: {
      text: 'Der Wächter ballt die Fäuste.\nStaub knotet sich, Glyphen glühen.',
      duration: 1500,
    },
    prompt_player: 'Welches Wort entfesselst du?',
    damage: 10,
    failure_player: '%s - dein Atem verfliegt, der Wächter rührt sich nicht.',
    failure_computer: '%s - der Wächter presst das Wort, doch nichts gehorcht ihm.',
    failure_player_damageText: 'Bileam erhält 10 Schaden im Rückstoß.',
    failure_computer_damageText: 'Der Wächter erhält 10 Schaden, Splitter seiner Kraft brechen.',
    transitions: {
      'אש': {
        next: 'burning',
        text_player: 'אש! Funken fräsen sich in deinen Stein.',
        text_enemy: 'אש! Brenne, Lehrling.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Ströme, haltet diesen Wächter.',
        text_enemy: 'מים! Stürze ihn, Wortbändiger.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Stimme, zerreiß den Canyon.',
        text_enemy: 'קול! Lausche meinem Kern, Mensch.',
      },
      'אור': {
        next: 'radiant',
        text_player: 'אור! Licht, schneide durch Stein.',
        text_enemy: 'אור! Strahlen, bindet ihn.',
      },
      'חיים': {
        next: 'overgrown',
        text_player: 'חיים! Wurzeln, umschlingt den Wächter.',
        text_enemy: 'חיים! Wucher, halte den Lehrling fest.',
      },
    },
  },
  burning: {
    intro_player: {
      speaker: 'narrator',
      text: 'אש kriecht über deine Ärmel. Hitze summt in der Luft.',
    },
    intro_enemy: {
      speaker: 'narrator',
      text: 'אש frisst durch den Wächter. Seine Runen flackern unruhig.',
    },
    prompt_player: 'Wie löschst du die Flammen?',
    damage: 24,
    failure_player: '%s - die Glut frisst tiefer in dein Fleisch.',
    failure_computer: '%s - der Wächter knirscht, sein Leib splittert in der Glut.',
    failure_player_damageText: 'Bileam erhält 24 Schaden im Feuer.',
    failure_computer_damageText: 'Der Wächter erhält 24 Schaden in der Glut.',
    transitions: {
      'מים': {
        next: 'start',
        text_player: 'מים! Nebel, nimm die Glut.',
        text_enemy: 'מים! Ersticke die Flamme in mir.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Donner, zerreiß die Flammen.',
        text_enemy: 'קול! Klang, stoß ihn zurück.',
        damage: 8,
        damageText: '%opponent% erhält 8 Klangschläge Schaden.',
      },
    },
  },
  flooded: {
    intro_player: {
      speaker: 'narrator',
      text: 'מים umspült deine Beine. Die Schlucht rauscht mit dir.',
    },
    intro_enemy: {
      speaker: 'narrator',
      text: 'מים presst den Wächter nieder. Er sucht Hitze oder Stimme.',
    },
    prompt_player: 'Wie formst du die Strömung?',
    damage: 18,
    failure_player: '%s - Dampf schlägt zurück, die Flut reißt dich zu Boden.',
    failure_computer: '%s - das Wasser spült dem Wächter Runen aus dem Leib.',
    failure_player_damageText: 'Bileam erhält 18 Schaden in der Strömung.',
    failure_computer_damageText: 'Der Wächter erhält 18 Schaden, Runen werden ausgespült.',
    transitions: {
      'אש': {
        only: 'enemy',
        next: 'burning',
        text_enemy: 'אש! Verdampfe seinen Schutz.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Wasser, sing nach meinem Willen.',
        text_enemy: 'קול! Strömung, schlag ihn mit deinem Echo.',
      },
      'חיים': {
        next: 'overgrown',
        text_player: 'חיים! Ranken, haltet ihn.',
        text_enemy: 'חיים! Moos, kriecht an ihm hoch.',
        damage: 6,
        damageText: '%opponent% erhält 6 Schaden durch wuchernde Ranken.',
      },
    },
  },
  echoing: {
    intro_player: {
      speaker: 'narrator',
      text: 'קול drückt in deine Schläfen. Fels vibriert im Takt.',
    },
    intro_enemy: {
      speaker: 'narrator',
      text: 'קול schwingt durch den Wächter. Er jagt dem hallenden Wort hinterher.',
    },
    prompt_player: 'Mit welchem Wort stellst du die Resonanz?',
    damage: 18,
    failure_player: '%s - dein Klang reißt zurück und zerschneidet dich.',
    failure_computer: '%s - der Wächter verstummt, Risse laufen wie Notenlinien.',
    failure_player_damageText: 'Bileam erhält 18 Schaden in der Resonanz.',
    failure_computer_damageText: 'Der Wächter erhält 18 Schaden, Risse singen im Stein.',
    transitions: {
      'קול': {
        next: 'start',
        text_player: 'קול! Gehorche mir und werde still.',
        text_enemy: 'קול! Schweig und gehorsam mir.',
      },
      'אור': {
        next: 'radiant',
        text_player: 'אור! Blitz, brich das Echo.',
        text_enemy: 'אור! Licht, jag ihn mit Klang.',
        damage: 10,
        damageText: '%opponent% erhält 10 Schaden aus grellem Klang.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Fließ mit dem Klang.',
        text_enemy: 'מים! Echo, werde Strömung.',
      },
    },
  },
  radiant: {
    intro_player: {
      speaker: 'narrator',
      text: 'אור blendet dich. Linien schneiden durch den Nebel.',
    },
    intro_enemy: {
      speaker: 'narrator',
      text: 'אור schneidet den Wächter. Er sucht Schatten im Klang.',
    },
    prompt_player: 'Wie formst du das Licht?',
    damage: 20,
    failure_player: '%s - das Licht durchdringt dich, Metall liegt auf deiner Zunge.',
    failure_computer: '%s - der Wächter zerfällt zu Glas, doch das Leuchten bleibt.',
    failure_player_damageText: 'Bileam erhält 20 Schaden im Licht.',
    failure_computer_damageText: 'Der Wächter erhält 20 Schaden, Licht zerfrisst den Stein.',
    transitions: {
      'קול': {
        next: 'echoing',
        text_player: 'קול! Sing das Licht in Schatten.',
        text_enemy: 'קול! Licht, dröhn gegen ihn.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Brech dieses Licht zu Regen.',
        text_enemy: 'מים! Regen, zerstreu sein Licht.',
      },
      'אש': {
        next: 'burning',
        text_player: 'אש! Verbrenne das Licht zu Funken.',
        text_enemy: 'אש! Licht, werde Glut gegen ihn.',
        damage: 12,
        damageText: '%opponent% erhält 12 Schaden aus blendender Glut.',
      },
    },
  },
  overgrown: {
    intro_player: {
      speaker: 'narrator',
      text: 'חיים greifen nach dir. Sporen glimmen über dem Boden.',
    },
    intro_enemy: {
      speaker: 'narrator',
      text: 'חיים sprießen durch den Wächter. Er knirscht unter Ranken.',
    },
    prompt_player: 'Wie beantwortest du das Wachsen?',
    damage: 16,
    failure_player: '%s - die Ranken ziehen dich zu Boden.',
    failure_computer: '%s - das Leben im Wächter wird wild, er zerreißt sich selbst.',
    failure_player_damageText: 'Bileam erhält 16 Schaden zwischen Ranken.',
    failure_computer_damageText: 'Der Wächter erhält 16 Schaden, Holzplatten splittern.',
    transitions: {
      'אש': {
        next: 'burning',
        text_player: 'אש! Brenne diese Ranken fort.',
        text_enemy: 'אש! Wucher, werde Asche um ihn.',
      },
      'מים': {
        next: 'flooded',
        text_player: 'מים! Führ das Leben zum Fluss.',
        text_enemy: 'מים! Leben, fließ auf ihn zu.',
      },
      'קול': {
        next: 'echoing',
        text_player: 'קול! Ruhe, Leben.',
        text_enemy: 'קול! Wucher, hör mir zu und schlag zu.',
        damage: 6,
        damageText: '%opponent% erhält 6 Schaden durch peitschende Triebe.',
      },
    },
  },
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
    await narratorSay('Der Golem erstarrt. Moos wächst über seinen Leib, und die Schlucht wird still.');
    await donkeySay('Du hast nicht zerstört – du hast verstanden. Weiter nach Moab, Meister.');
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
        const spriteHeight = golem?.sprite?.height ?? 96;
        const offsetY = -(spriteHeight + 24);
        await propSay(propsRef.current, 'golemGuardian', event.text, { offsetY });
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
      initialActor: 'enemy',
      playerName: 'Bileam',
      enemyName: 'Golem',
      promptPlayerSpell: options => promptSpellInput(options),
      onEvent: relayFightEvent,
      onUpdate: hudUpdate,
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
  const error = new Error('level5_5_guardian_defeat');
  error.code = 'LEVEL_RETRY';
  error.level = 'level5_5';
  error.hint = defeatAdvice?.suggestion ?? null;
  error.state = defeatAdvice?.stateKey ?? null;
  throw error;
}

async function promptSpellInput({ prompt, allowSkip = false } = {}) {
  const input = await promptBubble(
    anchorX(wizard, -6),
    anchorY(wizard, -60),
    prompt ?? 'Sprich dein Wort',
    anchorX(wizard, 0),
    anchorY(wizard, -32),
  );
  const normalized = normalizeHebrewInput(input);
  const canonical = RESPONSE_ALIASES[normalized] ?? normalized;
  if (!normalized && allowSkip) {
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
    case 'radiant':
      return 'אור';
    case 'overgrown':
      return 'חיים';
    case 'start':
    default:
      return null;
  }
}
