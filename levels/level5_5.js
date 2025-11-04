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
  addProp,
} from './utils.js';
import { runFightLoop } from '../fight.js';

const SPELL_TREE = {
  'אור': {
    hebrew: 'אור',
    text: 'אור – das Licht blendet deinen Gegner!',
    text2: 'Der Golem blinzelt, doch er stemmt sich gegen das Strahlen.',
    success: 'Der Golem ist geblendet und taumelt zurück.',
    damage: 10,
    counters: {
      'מים': {
        text: 'מים – Wasser löscht das Licht!',
        text2: 'Der Nebel verschlingt dein Strahlen.',
        success: 'Das Licht erlischt – du verlierst an Kraft.',
        damage: 6,
        counters: {
          'אש': {
            text: 'אש – Feuer verdampft das Wasser!',
            text2: 'Zischend hebt sich der Dampf – der Golem schreit!',
            success: 'Das Wasser löst sich in Rauch auf, der Gegner nimmt Schaden.',
            damage: 8,
          },
        },
      },
      'אש': {
        text: 'אש – das Licht entfacht die Flamme!',
        text2: 'Hitze breitet sich aus, der Golem schützt sein Gesicht.',
        success: 'Eine Explosion trifft beide Seiten.',
        damage: 12,
        counters: {
          'מים': {
            text: 'מים – ein Strom löscht das Feuer!',
            text2: 'Zischend weichen die Flammen.',
            success: 'Das Feuer erlischt; du erleidest nur geringen Schaden.',
            damage: 4,
          },
        },
      },
    },
  },
  'מים': {
    text: 'מים – Wogen umfließen den Gegner.',
    text2: 'Der Golem wird schwer und versucht standzuhalten.',
    success: 'Die Fluten drücken auf den Stein.',
    damage: 9,
    counters: {
      'אש': {
        text: 'אש – Feuer verdampft das Wasser!',
        text2: 'Dampf erfüllt die Luft.',
        success: 'Das Wasser verliert Kraft – du nimmst Schaden.',
        damage: 6,
        counters: {
          'קול': {
            text: 'קול – deine Stimme durchbricht den Dampf!',
            text2: 'Das Echo reißt die Nebel auseinander.',
            success: 'Der Golem ist benommen.',
            damage: 7,
          },
        },
      },
      'חיים': {
        text: 'חיים – Leben erwächst aus dem Wasser!',
        text2: 'Wurzeln und Blätter umringen den Golem.',
        success: 'Der Garten erstarkt, der Golem wird langsamer.',
        damage: -8,
      },
    },
  },
  'אש': {
    text: 'אש – Hitze flammt auf!',
    text2: 'Die Luft flimmert, der Stein brennt.',
    success: 'Der Gegner brennt und verliert Kraft.',
    damage: 14,
    counters: {
      'מים': {
        text: 'מים – Wasser löscht das Feuer!',
        text2: 'Ein Strom ergießt sich, Dampf steigt auf.',
        success: 'Das Feuer wird gezähmt, der Schaden bleibt gering.',
        damage: 5,
      },
      'אור': {
        text: 'אור – Licht spaltet den Rauch!',
        text2: 'Der Nebel zerreißt, Funken tanzen.',
        success: 'Der Golem wird geblendet.',
        damage: 4,
      },
    },
  },
  'קול': {
    text: 'קול – deine Stimme hallt durch den Stein!',
    text2: 'Der Golem hält sich die Ohren zu.',
    success: 'Das Echo erschüttert die Felsen.',
    damage: 7,
    counters: {
      'אור': {
        text: 'אור – das Licht übertönt die Stimme!',
        text2: 'Ein Strahl durchschneidet den Klang.',
        success: 'Der Ton zerfällt, nur Licht bleibt.',
        damage: 5,
      },
    },
  },
  'חיים': {
    text: 'חיים – Leben erneuert dich!',
    text2: 'Wurzeln wachsen um deine Füße.',
    success: 'Du heilst dich um 12 Punkte.',
    damage: -12,
    counters: {
      'אש': {
        text: 'אש – Feuer verbrennt das Leben!',
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
  const normalized = normalizeHebrewInput(input);
  if (!normalized && allowSkip) {
    return null;
  }
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
