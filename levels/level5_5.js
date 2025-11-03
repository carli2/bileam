import {
  ensureAmbience,
  transitionAmbience,
  setSceneContext,
  levelAmbiencePlan,
  fadeToBlack,
  fadeToBase,
  showLevelTitle,
  setSceneProps,
  promptBubble,
} from '../scene.js';
import {
  narratorSay,
  wizardSay,
  donkeySay,
  anchorX,
  anchorY,
  wizard,
  donkey,
  isSkipRequested,
  normalizeHebrewInput,
  applySceneConfig,
  cloneSceneProps,
  CANYON_SCENE,
} from './utils.js';
import { runFightLoop, buildLifeBarString } from '../fight.js';

const SPELL_TREE = {
  'אור': {
    hebrew: 'אוֹר',
    text: 'אוֹר – das Licht blendet deinen Gegner!',
    text2: 'Der Golem blinzelt, doch er stemmt sich gegen das Strahlen.',
    success: 'Der Golem ist geblendet und taumelt zurück.',
    damage: 10,
    counters: {
      'מים': {
        text: 'מַיִם – Wasser löscht das Licht!',
        text2: 'Der Nebel verschlingt dein Strahlen.',
        success: 'Das Licht erlischt – du verlierst an Kraft.',
        damage: 6,
        counters: {
          'אש': {
            text: 'אֵשׁ – Feuer verdampft das Wasser!',
            text2: 'Zischend hebt sich der Dampf – der Golem schreit!',
            success: 'Das Wasser löst sich in Rauch auf, der Gegner nimmt Schaden.',
            damage: 8,
          },
        },
      },
      'אש': {
        text: 'אֵשׁ – das Licht entfacht die Flamme!',
        text2: 'Hitze breitet sich aus, der Golem schützt sein Gesicht.',
        success: 'Eine Explosion trifft beide Seiten.',
        damage: 12,
        counters: {
          'מים': {
            text: 'מַיִם – ein Strom löscht das Feuer!',
            text2: 'Zischend weichen die Flammen.',
            success: 'Das Feuer erlischt; du erleidest nur geringen Schaden.',
            damage: 4,
          },
        },
      },
    },
  },
  'מים': {
    text: 'מַיִם – Wogen umfließen den Gegner.',
    text2: 'Der Golem wird schwer und versucht standzuhalten.',
    success: 'Die Fluten drücken auf den Stein.',
    damage: 9,
    counters: {
      'אש': {
        text: 'אֵשׁ – Feuer verdampft das Wasser!',
        text2: 'Dampf erfüllt die Luft.',
        success: 'Das Wasser verliert Kraft – du nimmst Schaden.',
        damage: 6,
        counters: {
          'קול': {
            text: 'קוֹל – deine Stimme durchbricht den Dampf!',
            text2: 'Das Echo reißt die Nebel auseinander.',
            success: 'Der Golem ist benommen.',
            damage: 7,
          },
        },
      },
      'חיים': {
        text: 'חַיִּים – Leben erwächst aus dem Wasser!',
        text2: 'Wurzeln und Blätter umringen den Golem.',
        success: 'Der Garten erstarkt, der Golem wird langsamer.',
        damage: -8,
      },
    },
  },
  'אש': {
    text: 'אֵשׁ – Hitze flammt auf!',
    text2: 'Die Luft flimmert, der Stein brennt.',
    success: 'Der Gegner brennt und verliert Kraft.',
    damage: 14,
    counters: {
      'מים': {
        text: 'מַיִם – Wasser löscht das Feuer!',
        text2: 'Ein Strom ergießt sich, Dampf steigt auf.',
        success: 'Das Feuer wird gezähmt, der Schaden bleibt gering.',
        damage: 5,
      },
      'אור': {
        text: 'אוֹר – Licht spaltet den Rauch!',
        text2: 'Der Nebel zerreißt, Funken tanzen.',
        success: 'Der Golem wird geblendet.',
        damage: 4,
      },
    },
  },
  'קול': {
    text: 'קוֹל – deine Stimme hallt durch den Stein!',
    text2: 'Der Golem hält sich die Ohren zu.',
    success: 'Das Echo erschüttert die Felsen.',
    damage: 7,
    counters: {
      'אור': {
        text: 'אוֹר – das Licht übertönt die Stimme!',
        text2: 'Ein Strahl durchschneidet den Klang.',
        success: 'Der Ton zerfällt, nur Licht bleibt.',
        damage: 5,
      },
    },
  },
  'חיים': {
    text: 'חַיִּים – Leben erneuert dich!',
    text2: 'Wurzeln wachsen um deine Füße.',
    success: 'Du heilst dich um 12 Punkte.',
    damage: -12,
    counters: {
      'אש': {
        text: 'אֵשׁ – Feuer verbrennt das Leben!',
        text2: 'Der Rauch riecht nach Asche.',
        success: 'Leben wird zu Staub; du verlierst Energie.',
        damage: 10,
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
  await fadeToBase(600);
  if (isSkipRequested()) return 'skip';

  await narratorSay('Aus dem Staub der Schlucht formt sich ein Leib aus Stein – schwer, uralt, stumm.');
  if (isSkipRequested()) return 'skip';
  await donkeySay('Ein Wächter. Er prüft, ob du verstanden hast, was Worte bewirken können.');
  if (isSkipRequested()) return 'skip';
  await wizardSay('Wie besiegt man einen Stein?');
  if (isSkipRequested()) return 'skip';
  await donkeySay('Mit Worten, nicht mit Fäusten. Aber merke: Worte kämpfen nicht – sie wirken.');
  if (isSkipRequested()) return 'skip';

  let fightResult;
  do {
    fightResult = await executeFight();
    if (fightResult === 'skip') return 'skip';
    if (fightResult === 'lose') {
      if (isSkipRequested()) return 'skip';
      await narratorSay('Der Golem schüttelt das Licht ab. Du wirst zurück in die Schlucht gedrängt.');
      if (isSkipRequested()) return 'skip';
      await fadeToBlack(420);
      if (isSkipRequested()) return 'skip';
      ensureAmbience(plan?.review ?? 'echoChamber');
      await fadeToBase(420);
      if (isSkipRequested()) return 'skip';
      await narratorSay('Staub formt den Wächter erneut. Versuche es noch einmal.');
      if (isSkipRequested()) return 'skip';
    }
  } while (fightResult === 'lose');

  await narratorSay('Der Golem erstarrt. Moos wächst über seinen Leib, und die Schlucht wird still.');
  if (isSkipRequested()) return 'skip';
  await donkeySay('Du hast nicht zerstört – du hast verstanden. Weiter nach Moab, Meister.');
  if (isSkipRequested()) return 'skip';
  await fadeToBlack(480);
}

async function executeFight() {
  const hudUpdate = state => {
    if (!state) return;
    const barLines = buildLifeBarString(state.playerHP, state.playerMax, state.enemyHP, state.enemyMax).split('\n');
    const lifeText = `Bileam ${barLines[0] ?? ''}\nGolem ${barLines[1] ?? ''}`;
    showLevelTitle(lifeText, 600);
  };

  const result = await runFightLoop({
    spellTree: SPELL_TREE,
    playerName: 'Bileam',
    enemyName: 'Golem',
    promptPlayerSpell: () => promptSpellInput('Sprich dein Wort'),
    promptPlayerCounter: ({ enemySpell }) => promptSpellInput(`Golem spricht ${renderSpellName(enemySpell)} – womit antwortest du? (Enter für kein Gegenwort)`, true),
    enemyAttackStrategy: () => pickEnemySpell(),
    enemyCounterStrategy: (playerSpell) => pickEnemyCounter(playerSpell),
    onEvent: event => relayFightEvent(event),
    onUpdate: hudState => hudUpdate({
      playerHP: hudState.playerHP,
      playerMax: hudState.playerMax,
      enemyHP: hudState.enemyHP,
      enemyMax: hudState.enemyMax,
    }),
  });

  if (result.winner === 'player') {
    await donkeySay('Gut gemacht. Der Golem verneigt sich – Worte beruhigen Stein.');
    return 'win';
  }
  await donkeySay('Der Golem formt sich neu. Versuche es noch einmal!');
  return 'lose';
}

async function promptSpellInput(promptText, allowSkip = false) {
  const input = await promptBubble(
    anchorX(wizard, -6),
    anchorY(wizard, -60),
    promptText,
    anchorX(wizard, 0),
    anchorY(wizard, -32),
  );
  if (input === 'skip' || input === null) return allowSkip ? 'skip' : null;
  const normalized = normalizeHebrewInput(input);
  return normalized || input;
}

function renderSpellName(key) {
  return key ?? '?';
}

function pickEnemySpell() {
  const keys = Object.keys(SPELL_TREE);
  if (keys.length === 0) return null;
  return keys[Math.floor(Math.random() * keys.length)];
}

function pickEnemyCounter(playerSpell) {
  const node = SPELL_TREE[playerSpell];
  if (!node?.counters) return null;
  const keys = Object.keys(node.counters);
  if (keys.length === 0) return null;
  return keys[Math.floor(Math.random() * keys.length)];
}

async function relayFightEvent(event) {
  if (!event) return;
  const speaker = event.speaker;
  switch (speaker) {
    case 'player':
      await wizardSay(event.text);
      break;
    case 'enemy':
      await narratorSay(`Golem: ${event.text}`);
      break;
    case 'narrator':
      await narratorSay(event.text);
      break;
    default:
      await narratorSay(event.text ?? '');
      break;
  }
}

function findProp(list, id) {
  return Array.isArray(list) ? list.find(prop => prop.id === id) ?? null : null;
}
