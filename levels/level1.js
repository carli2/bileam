import {
  promptBubble,
  ensureAmbience,
  transitionAmbience,
  setSceneContext,
  levelAmbiencePlan,
  getCurrentAmbienceKey,
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
} from './utils.js';

const WORD_AOR = transliterateToHebrew('aor');
const HUT_DOOR_ID = 'hutDoor';
const HUT_DOOR_X = 252;

export async function runLevelOne() {
  const plan = levelAmbiencePlan.level1;

  while (true) {
    setSceneProps([
      { id: HUT_DOOR_ID, type: 'door', x: HUT_DOOR_X },
    ]);
    ensureAmbience(plan?.introduction ?? 'hutInteriorDark');
    setSceneContext({ level: 'level1', phase: 'introduction' });
    const titleResult = await showLevelTitle('Level 1 - Das Licht');
    if (titleResult === 'skip' || isSkipRequested()) return 'skip';

    if (isSkipRequested()) return 'skip';
    const intro = await levelOneIntroduction();
    if (intro === 'skip' || isSkipRequested()) return 'skip';

    const learnResult = await levelOneLearning(plan);
    if (learnResult === 'skip' || isSkipRequested()) return 'skip';
    if (learnResult === 'restart') {
      continue;
    }

    const door = await levelOneDoorSequence(plan);
    if (door === 'skip' || isSkipRequested()) return 'skip';
    return;
  }
}

async function levelOneIntroduction() {
  if (isSkipRequested()) return 'skip';
  await narratorSay('Es ist dunkel in dieser Huette.');
  if (isSkipRequested()) return 'skip';
  await donkeySay('Sprich אור – OR. Das Alef schweigt, das O ziehst du lang – so ruft man das Licht.');
  if (isSkipRequested()) return 'skip';
  await wizardSay('Gut, ich probiere es.');
  if (isSkipRequested()) return 'skip';
}

async function levelOneLearning(plan) {
  setSceneContext({ phase: 'learning' });

  let attemptsSinceRecap = 0;
  let illuminated = getCurrentAmbienceKey() === (plan?.illumination ?? 'hutInteriorLit');

  while (true) {
    if (isSkipRequested()) return 'skip';
    const input = await promptBubble(
      anchorX(wizard, -18),
      anchorY(wizard, -56),
      'Sprich das Wort אור (OR)',
      anchorX(wizard, -12),
      anchorY(wizard, -28)
    );

    if (input === 'skip') return 'skip';

    const answer = normalizeHebrewInput(input);
    if (answer === WORD_AOR) {
      if (!illuminated) {
        setSceneContext({ phase: 'illumination' });
        await transitionAmbience(plan?.illumination ?? 'hutInteriorLit', {
          fade: { toBlack: 180, toBase: 680 },
        });
        illuminated = true;
      }
      await narratorSay('Staub faengt an zu glimmen und die Oellampe flammt auf.');
      await donkeySay('Oho! Das war hell!');
      await wizardSay('Das Wort fuehlt sich warm an... wie eine Flamme in der Hand.');
      await wizardSay('אור (aor)');
      setSceneContext({ phase: 'exploration' });
      break;
    }

    attemptsSinceRecap++;
    if (attemptsSinceRecap === 1) {
      await donkeySay('Fast! Versuch, es laenger zu ziehen: A... O... R.');
    } else if (attemptsSinceRecap === 2) {
      await narratorSay('Das Wort verhallt, aber kein Licht kommt. Versuche, dich zu erinnern.');
      await narratorSay('A  O  R');
    } else {
      attemptsSinceRecap = 0;
      await narratorSay('Wir fangen noch einmal an. Atme tief durch.');
      await levelOneRecap();
      return 'restart';
    }
  }
}

async function levelOneRecap() {
  if (isSkipRequested()) return;
  setSceneContext({ phase: 'introduction' });
  await donkeySay('AO R bedeutet Licht. Stell es dir wie eine kleine Sonne in der Hand vor.');
  await wizardSay('Ich spreche es diesmal lauter.');
  setSceneContext({ phase: 'learning' });
}

async function levelOneDoorSequence(plan) {
  if (isSkipRequested()) return 'skip';
  setSceneContext({ phase: 'apply' });
  await donkeySay('Siehst du die Tuer? Sie leuchtet fuer dich – geh hin, Meister.');
  if (isSkipRequested()) return 'skip';
  const target = doorTargetX();
  const arrival = await waitForWizardToReach(target, { tolerance: 10 });
  if (arrival === 'skip' || isSkipRequested()) return 'skip';
  await narratorSay('Die Rune erwacht, sobald du das Holz beruehrst.');
  await fadeToBlack(320);
  if (isSkipRequested()) return 'skip';
  applySceneConfig(RIVER_SCENE, { setAmbience: false });
  ensureAmbience(plan?.door ?? RIVER_SCENE.ambience ?? 'riverDawn');
  setSceneContext({ phase: 'exit' });
  await fadeToBase(600);
  if (isSkipRequested()) return 'skip';
  const titleResult = await showLevelTitle('אור', 2600);
  if (titleResult === 'skip' || isSkipRequested()) return 'skip';
  await narratorSay('Das Wort אור steht wie ein Feuer ueber dem Eingang, ohne dass du es noch einmal sprichst.');
  if (isSkipRequested()) return 'skip';
  await narratorSay('Du spuerst, wie der Morgen hereinsickert.');
  await donkeySay('Da draussen wartet der Tag.');
  await narratorSay('Ein warmer Morgen wartet vor der Tuer.');
  await fadeToBlack(600);
  if (isSkipRequested()) return 'skip';
}

function doorTargetX() {
  const bounds = getScenePropBounds(HUT_DOOR_ID);
  if (!bounds) return HUT_DOOR_X + 12;
  return bounds.left + bounds.width * 0.65;
}
