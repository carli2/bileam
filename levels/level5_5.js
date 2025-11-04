import {
  ensureAmbience,
  setSceneContext,
  levelAmbiencePlan,
  fadeToBlack,
  fadeToBase,
  showLevelTitle,
  promptBubble,
  setLifeBars,
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
} from './utils.js';
import { runFightLoop } from '../fight.js';

const RESPONSE_ALIASES = {
  ash: 'אש',
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
};

const GOLEM_MACHINE = {
  start: {
    speaker: 'narrator',
    text: 'Der Steinwächter stampft auf und sammelt Staub zu einer Faust.',
    text2: 'Spürst du es? Er wählt dein nächstes Prüfwort.',
    speaker2: 'ally',
    options: ['attack_fire', 'attack_echo', 'attack_stone'],
  },
  attack_fire: {
    speaker: 'enemy',
    text: 'Glühende Risse öffnen sich in der Brust des Wächters. Hitze peitscht dir entgegen.',
    text2: 'Nur Wasser zähmt Glut.',
    speaker2: 'ally',
    prompt: 'Mit welchem Wort besänftigst du die Flammen?',
    target: 'player',
    damage: 24,
    failText: 'Die Glut frisst sich in deine Haut!',
    failDamageText: 'Bileam verliert 24 Lebenspunkte.',
    failSpeaker: 'narrator',
    failNext: 'start',
    counterspells: {
      'מים': { speaker: 'player', text: 'Du sprichst מים. Wasser hüllt dich ein und erstickt das Feuer.', damage: 26, damageText: 'Der Wächter dampft und Steine platzen von seinem Körper.', target: 'enemy', next: 'start' },
    },
  },
  attack_echo: {
    speaker: 'enemy',
    text: 'Der Wächter stößt einen kehlig vibrierenden Ton aus. Der Fels unter dir beginnt zu schwingen.',
    text2: 'Antworte laut und klar mit Stimme.',
    speaker2: 'ally',
    prompt: 'Welches Wort lenkt das Echo?',
    target: 'player',
    damage: 18,
    failText: 'Der Klang schneidet durch deine Knochen.',
    failDamageText: 'Bileam verliert 18 Lebenspunkte.',
    failSpeaker: 'narrator',
    failNext: 'start',
    counterspells: {
      'קול': { speaker: 'player', text: 'Du antwortest mit קול. Deine Stimme fängt das Echo ein und wirft es zurück.', damage: 22, damageText: 'Der Wächter taumelt, Risse ziehen sich durch seine Brust.', target: 'enemy', next: 'start' },
    },
  },
  attack_stone: {
    speaker: 'enemy',
    text: 'Der Golem reißt einen Basaltbrocken aus dem Boden und schleudert ihn auf dich.',
    text2: 'Feuer bricht Stein – oder Blendlicht.',
    speaker2: 'ally',
    prompt: 'Wie brichst du den Ansturm?',
    target: 'player',
    damage: 20,
    failText: 'Der Brocken trifft dich und presst die Luft aus deiner Brust.',
    failDamageText: 'Bileam verliert 20 Lebenspunkte.',
    failSpeaker: 'narrator',
    failNext: 'start',
    counterspells: {
      'אש': { speaker: 'player', text: 'Du rufst אש. Glut zeichnet Linien in den Stein, der Brocken zerbirst.', damage: 24, damageText: 'Splitter reißen Stücke aus dem Wächter.', target: 'enemy', next: 'start' },
      'אור': { speaker: 'player', text: 'Du sprichst אור. Licht blendet den Wächter, der Fels zerfällt zu Staub.', damage: 18, damageText: 'Der Wächter schwankt und verliert Stücke aus seinem Torso.', target: 'enemy', next: 'start' },
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

  let fightResult;
  do {
    fightResult = await executeFight();
    if (fightResult === 'lose') {
      await narratorSay('Der Golem schüttelt das Licht ab. Du wirst zurück in die Schlucht gedrängt.');
      await fadeToBlack(420);
      ensureAmbience(plan?.review ?? 'echoChamber');
      await fadeToBase(420);
      await narratorSay('Staub formt den Wächter erneut. Versuche es noch einmal.');
      setLifeBars(null);
    }
  } while (fightResult === 'lose');

  await narratorSay('Der Golem erstarrt. Moos wächst über seinen Leib, und die Schlucht wird still.');
  await donkeySay('Du hast nicht zerstört – du hast verstanden. Weiter nach Moab, Meister.');
  await fadeToBlack(480);
  setLifeBars(null);
}

async function executeFight() {
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

const relayFightEvent = async (event, props) => {
  if (!event || !event.text) return;
  switch (event.speaker) {
    case 'player':
      await wizardSay(event.text);
      break;
    case 'enemy':
      await propSay(props, 'golemGuardian', event.text);
      break;
    case 'ally':
      await donkeySay(event.text);
      break;
    default:
        await narratorSay(event.text);
        break;
    }
  };

  const result = await runFightLoop({
    machine: GOLEM_MACHINE,
    initialState: 'start',
    playerName: 'Bileam',
    enemyName: 'Golem',
    promptPlayerSpell: options => promptSpellInput(options),
    onEvent: evt => relayFightEvent(evt, canyonProps),
    onUpdate: hudUpdate,
  });

  if (result.winner === 'player') {
    await donkeySay('Gut gemacht. Der Golem verneigt sich – Worte beruhigen Stein.');
    return 'win';
  }
  await donkeySay('Der Golem formt sich neu. Versuche es noch einmal!');
  return 'lose';
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
