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
  RIVER_SCENE,
  spellEquals,
  celebrateGlyph,
} from './utils.js';
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
    await showLevelTitle('Level 1 - Das Licht');

    await levelOneIntroduction();

    const learnResult = await levelOneLearning(plan);
    if (learnResult === 'restart') {
      continue;
    }

    await levelOneDoorSequence(plan);
    return;
  }
}

async function levelOneIntroduction() {
  await narratorSay('Es ist dunkel in dieser Hütte.');
  await donkeySay('Sprich אור – OR. Das Alef schweigt, das O ziehst du lang – so ruft man das Licht.');
  await wizardSay('Gut, ich probiere es.');
}

async function levelOneLearning(plan) {
  setSceneContext({ phase: 'learning' });

  let attemptsSinceRecap = 0;
  let illuminated = getCurrentAmbienceKey() === (plan?.illumination ?? 'hutInteriorLit');

  while (true) {
    const input = await promptBubble(
      anchorX(wizard, -18),
      anchorY(wizard, -56),
      'Sprich das Wort אור (OR)',
      anchorX(wizard, -12),
      anchorY(wizard, -28)
    );

    const answer = normalizeHebrewInput(input);
    if (spellEquals(answer, 'or', 'אור')) {
      if (!illuminated) {
        setSceneContext({ phase: 'illumination' });
        await transitionAmbience(plan?.illumination ?? 'hutInteriorLit', {
          fade: { toBlack: 180, toBase: 680 },
        });
        illuminated = true;
      }
      await celebrateGlyph(answer);
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
  setSceneContext({ phase: 'introduction' });
  await donkeySay('OR bedeutet Licht. Stell es dir wie eine kleine Sonne in der Hand vor.');
  await wizardSay('Ich spreche es diesmal lauter.');
  setSceneContext({ phase: 'learning' });
}

async function levelOneDoorSequence(plan) {
  setSceneContext({ phase: 'apply' });
  await donkeySay('Siehst du die Tuer? Sie leuchtet fuer dich – geh hin, Meister.');
  const target = doorTargetX();
  await waitForWizardToReach(target, { tolerance: 10 });
  await showLevelTitle('Das Tor wartet auf dein Licht.', 1800);
  await fadeToBlack(320);
  applySceneConfig(RIVER_SCENE, { setAmbience: false });
  ensureAmbience(plan?.door ?? RIVER_SCENE.ambience ?? 'riverDawn');
  setSceneContext({ phase: 'exit' });
  await fadeToBase(600);
  await showLevelTitle('אור', 2600);
  await narratorSay('Das Wort אור steht wie ein Feuer ueber dem Eingang, ohne dass du es noch einmal sprichst.');
  await narratorSay('Du spuerst, wie der Morgen hereinsickert.');
  await donkeySay('Da draussen wartet der Tag.');
  await narratorSay('Ein warmer Morgen wartet vor der Tuer.');
  await fadeToBlack(600);
}

function doorTargetX() {
  const bounds = getScenePropBounds(HUT_DOOR_ID);
  if (!bounds) return HUT_DOOR_X + 12;
  return bounds.left + bounds.width * 0.65;
}
