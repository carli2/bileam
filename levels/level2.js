import {
  promptBubble,
  ensureAmbience,
  transitionAmbience,
  setSceneContext,
  levelAmbiencePlan,
  fadeToBlack,
  fadeToBase,
  showLevelTitle,
} from '../scene.js';
import { transliterateToHebrew } from '../game.helpers.js';
import { narratorSay, wizardSay, donkeySay, anchorX, anchorY, wizard, donkey, isSkipRequested } from './utils.js';

const WORD_AOR = transliterateToHebrew('aor');
const WORD_MIM = transliterateToHebrew('mim');

export async function runLevelTwo() {
  const plan = levelAmbiencePlan.level2;
  ensureAmbience(plan?.review ?? 'riverDawn');
  setSceneContext({ level: 'level2', phase: 'review' });
  showLevelTitle('Level 2 - Das Wasser\ndes Lebens');
  if (isSkipRequested()) return 'skip';
  await fadeToBase(600);

  if (isSkipRequested()) return 'skip';
  const recall = await phaseOneRecall(plan);
  if (recall === 'skip' || isSkipRequested()) return 'skip';
  const learn = await phaseTwoLearning(plan);
  if (learn === 'skip' || isSkipRequested()) return 'skip';
  const apply = await phaseThreeApplication(plan);
  if (apply === 'skip' || isSkipRequested()) return 'skip';
}


async function phaseOneRecall(plan) {
  if (isSkipRequested()) return 'skip';
  await narratorSay('Das Licht aus der Huette folgt dir – doch vor dir liegt Dunkel im Nebel.');
  await donkeySay('Der Nebel verschluckt das Licht. Ruf es noch einmal, so wie vorhin.');
  await wizardSay('Ich erinnere mich ... das Wort AO R.');

  let attempts = 0;
  while (true) {
    if (isSkipRequested()) return 'skip';
    const answerInput = await promptBubble(
      anchorX(wizard, -12),
      anchorY(wizard, -58),
      'Sprich אור (aor), um den Nebel zu teilen',
      anchorX(wizard, -8),
      anchorY(wizard, -32)
    );
    if (answerInput === 'skip') return 'skip';
    const answer = normalizeHebrewInput(answerInput);

    if (answer === WORD_AOR) {
      await narratorSay('Das Licht faechert sich ueber das Wasser. Eine erste Planke erscheint.');
      await transitionAmbience(plan?.learn ?? 'riverDawn', { fade: { toBlack: 120, toBase: 420 } });
      if (isSkipRequested()) return 'skip';
      break;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Fast – denk daran, das O laenger zu ziehen. Aaaor.');
    } else {
      await narratorSay('Der Nebel bleibt dicht. Stell dir die Huette vor und das Licht darin.');
      await wizardSay('A... O... R.');
    }
  }
}

async function phaseTwoLearning(plan) {
  if (isSkipRequested()) return 'skip';
  setSceneContext({ phase: 'learning' });
  await wizardSay('Das Licht reicht nicht weit genug. Der Fluss bleibt wild.');
  await donkeySay('Dann brauchst du ein neues Wort, Meister. Geschrieben mim – gesprochen ma-im. Es bedeutet Wasser.');
  await wizardSay('Ma... im... Wasser.');
  await donkeySay('Sprich es, und der Fluss hoert auf dich.');

  let attempts = 0;
  while (true) {
    if (isSkipRequested()) return 'skip';
    const answerInput = await promptBubble(
      anchorX(wizard, -10),
      anchorY(wizard, -58),
      'Schreibe mim (מים) und sprich ma-im',
      anchorX(wizard, -6),
      anchorY(wizard, -30),
    );
    if (answerInput === 'skip') return 'skip';
    const answer = normalizeHebrewInput(answerInput);

    if (answer === WORD_MIM) {
      await narratorSay('Das Wasser beruhigt sich, Nebel hebt sich. Planken steigen aus der Tiefe.');
      break;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Das i sitzt in der Mitte – m-i-m, lass es fliessen!');
    } else if (attempts === 2) {
      await narratorSay('Der Fluss bleibt taub. Lass die Buchstaben ueber dem Wasser schweben: M I M.');
    } else {
      attempts = 0;
      await wizardSay('Vielleicht sollte ich zum Ufer zurueck.');
      await donkeySay('Atme wie der Fluss: maaaa-im. Lass es fliessen.');
    }
  }
}

async function phaseThreeApplication(plan) {
  if (isSkipRequested()) return 'skip';
  setSceneContext({ phase: 'apply' });
  await narratorSay('Die Bruecke traegt dich. Doch mitten auf dem Fluss klafft eine Luecke.');
  await narratorSay('Der Fluss wartet auf dein Wort, bevor er dich weiter traegt.');

  let filled = false;
  while (!filled) {
    if (isSkipRequested()) return 'skip';
    const answerInput = await promptBubble(
      anchorX(wizard, 24),
      anchorY(wizard, -52),
      'Die Planke sinkt. Tipp mim (מים), bitte den Fluss erneut.',
      anchorX(wizard, 18),
      anchorY(wizard, -24),
    );
    if (answerInput === 'skip') return 'skip';
    const answer = normalizeHebrewInput(answerInput);

    if (answer === WORD_MIM) {
      filled = true;
      await narratorSay('Eine transparente Welle hebt dich sanft an und traegt dich ans andere Ufer.');
      await donkeySay('Gut gemacht, Meister. Worte fliessen – und wer sie kennt, kann Stroeme lenken.');
      await wizardSay('Dann ist Sprache wirklich Kraft?');
      await donkeySay('Vielleicht. Aber vergiss nicht: Zu viel Fluss – und du wirst davongetragen.');
      await transitionAmbience(plan?.apply ?? plan?.learn ?? 'riverDawn', { fade: { toBlack: 140, toBase: 420 } });
      await narratorSay('Ein leuchtendes Wellenzeichen glimmt im Boden und weist auf den naechsten Pfad.');
      await fadeToBlack(800);
      if (isSkipRequested()) return 'skip';
    } else {
      await narratorSay('Das Wasser wartet noch. Hoere in den Fluss hinein und sprich es klar aus.');
    }
  }
}

function normalizeHebrewInput(value) {
  if (!value) return '';
  return value.replace(/\s+/g, '');
}
