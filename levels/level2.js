import {
  promptBubble,
  ensureAmbience,
  transitionAmbience,
  setSceneContext,
  levelAmbiencePlan,
  fadeToBlack,
  fadeToBase,
  showLevelTitle,
  setSceneProps,
  getScenePropBounds,
  waitForWizardToReach,
} from '../scene.js';
import { transliterateToHebrew } from '../game.helpers.js';
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
  RIVER_SCENE,
  cloneSceneProps,
} from './utils.js';

const WORD_AOR = transliterateToHebrew('aor');
const WORD_MIM = transliterateToHebrew('mim');
const RIVER_PROP_ID = RIVER_SCENE.props?.[0]?.id ?? 'riverPool';
const RIVER_X = RIVER_SCENE.props?.[0]?.x ?? 620;

export async function runLevelTwo() {
  const plan = levelAmbiencePlan.level2;
  const riverProps = cloneSceneProps(RIVER_SCENE.props);
  applySceneConfig({ ...RIVER_SCENE, props: riverProps }, { setAmbience: false });
  ensureAmbience(plan?.review ?? RIVER_SCENE.ambience ?? 'riverDawn');
  setSceneContext({ level: 'level2', phase: 'review' });
  const titleResult = await showLevelTitle('Level 2 - Das Wasser\ndes Lebens');
  if (titleResult === 'skip' || isSkipRequested()) return 'skip';
  await fadeToBase(600);

  if (isSkipRequested()) return 'skip';
  const recall = await phaseOneRecall(plan);
  if (recall === 'skip' || isSkipRequested()) return 'skip';
  const travel = await phaseTravelToWater(plan, riverProps);
  if (travel === 'skip' || isSkipRequested()) return 'skip';
  const learn = await phaseTwoLearning(plan);
  if (learn === 'skip' || isSkipRequested()) return 'skip';
  const apply = await phaseThreeApplication(plan, riverProps);
  if (apply === 'skip' || isSkipRequested()) return 'skip';
  setSceneProps([]);
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
      await narratorSay('Das Licht legt eine Spur nach draussen.');
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

async function phaseTravelToWater(plan, riverProps) {
  if (isSkipRequested()) return 'skip';
  setSceneContext({ phase: 'travel' });
  await transitionAmbience(plan?.learn ?? 'riverDawn', { fade: { toBlack: 120, toBase: 420 } });
  if (isSkipRequested()) return 'skip';
  applySceneConfig({ ...RIVER_SCENE, props: riverProps }, { setAmbience: false, position: false });
  await donkeySay('Komm, Meister – geh weiter bis das Wasser direkt vor dir liegt.');
  if (isSkipRequested()) return 'skip';
  const bounds = getScenePropBounds(RIVER_PROP_ID);
  const target = bounds ? bounds.left + bounds.width * 0.3 : RIVER_X;
  const reached = await waitForWizardToReach(target, { tolerance: 14 });
  if (reached === 'skip' || isSkipRequested()) return 'skip';
  await narratorSay('Jetzt rauscht der Fluss zu deinen Fuessen.');
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

async function phaseThreeApplication(plan, riverProps) {
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
      const glyphId = 'riverGlyph';
      const glyphExists = riverProps?.some(prop => prop.id === glyphId);
      if (!glyphExists) {
        const wizardSprite = wizard.sprites?.right ?? wizard.sprites?.left;
        const glyphX = wizard.x + (wizardSprite?.width ?? 24) + 12;
        const glyphY = wizardSprite ? wizard.y + wizardSprite.height - 18 : wizard.y + 44;
        riverProps.push({ id: glyphId, type: 'waterGlyph', x: glyphX, y: glyphY, parallax: 1 });
        setSceneProps(riverProps);
      }
      await transitionAmbience(plan?.apply ?? plan?.learn ?? 'riverDawn', { fade: { toBlack: 140, toBase: 420 } });
      await fadeToBlack(800);
      if (isSkipRequested()) return 'skip';
    } else {
      await narratorSay('Das Wasser wartet noch. Hoere in den Fluss hinein und sprich es klar aus.');
    }
  }
}
