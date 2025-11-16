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
  divineSay,
  switchMusic,
  updateProp,
} from './utils.js';
const HUT_DOOR_ID = 'hutDoor';
const HUT_DOOR_X = 252;

export async function runLevelOne() {
  const plan = levelAmbiencePlan.level1;

  while (true) {
    const hutProps = [
      { id: HUT_DOOR_ID, type: 'door', x: HUT_DOOR_X },
      { id: 'hutBed', type: 'hutBed', x: 62, align: 'ground', parallax: 0.94 },
      { id: 'hutTable', type: 'hutTable', x: 142, align: 'ground', parallax: 0.98 },
      { id: 'hutShelf', type: 'hutShelf', x: 20, align: 'ground', parallax: 0.9 },
      { id: 'hutTorchDormant', type: 'hutTorchOff', x: 212, align: 'top', offsetY: 22, parallax: 0.92, visible: true },
      { id: 'hutTorchLit', type: 'hutTorchOn', x: 212, align: 'top', offsetY: 22, parallax: 0.92, visible: false },
      { id: 'hutFloorRug', type: 'hutRug', x: 112, align: 'ground', parallax: 1 },
    ];
    setSceneProps(hutProps);
    ensureAmbience(plan?.introduction ?? 'hutInteriorDark');
    setSceneContext({ level: 'level1', phase: 'introduction' });
    await showLevelTitle('Level 1 - Das Licht');

    await levelOneIntroduction();

    const learnResult = await levelOneLearning(plan, hutProps);
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

async function levelOneLearning(plan, hutProps = null) {
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
        switchMusic('secher belam ben beor.mp3');
        if (hutProps) {
          updateProp(hutProps, 'hutTorchDormant', { visible: false });
          updateProp(hutProps, 'hutTorchLit', { visible: true });
        }
      }
      await celebrateGlyph(answer);
      await narratorSay('Staub faengt an zu glimmen und die Öllampe flammt auf.');
      await donkeySay('Oho! Das war hell!');
      await wizardSay('Das Wort fühlt sich warm an... wie eine Flamme in der Hand.');
      await wizardSay('אור (aor)');
      await divineSay('זכר בלעם בן בעור אני נתתי לך הכח הזה השתמש בו טוב\nBedenke, Bileam, Sohn des Beor, ich habe dir diese Kraft gegeben. Benutze sie gut.');
      setSceneContext({ phase: 'exploration' });
      break;
    }

    attemptsSinceRecap++;
    if (attemptsSinceRecap === 1) {
      await donkeySay('Fast! Versuch, es länger zu ziehen: A... O... R.');
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
  await donkeySay('Siehst du die Tür? Sie leuchtet für dich – geh hin, Meister.');
  const target = doorTargetX();
  await waitForWizardToReach(target, { tolerance: 10 });
  await showLevelTitle('Das Tor wartet auf dein Licht.', 1800);
  await fadeToBlack(320);
  applySceneConfig(RIVER_SCENE, { setAmbience: false });
  ensureAmbience(plan?.door ?? RIVER_SCENE.ambience ?? 'riverDawn');
  setSceneContext({ phase: 'exit' });
  await fadeToBase(600);
  await showLevelTitle('אור', 2600);
  await narratorSay('Das Wort אור steht wie ein Feuer über dem Eingang, ohne dass du es noch einmal sprichst.');
  await narratorSay('Du spürst, wie der Morgen hereinsickert.');
  await donkeySay('Da draussen wartet der Tag.');
  await narratorSay('Ein warmer Morgen wartet vor der Tür.');
  await fadeToBlack(600);
}

function doorTargetX() {
  const bounds = getScenePropBounds(HUT_DOOR_ID);
  if (!bounds) return HUT_DOOR_X + 12;
  return bounds.left + bounds.width * 0.65;
}
