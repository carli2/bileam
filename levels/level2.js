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
  waitForWizardToReach,
  getScenePropBounds,
  setWalkBounds,
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
  cloneSceneProps,
  spellEquals,
  celebrateGlyph,
  divineSay,
  addProp,
  updateProp,
  sleep,
} from './utils.js';
const RIVER_EDGE_X = Number.isFinite(RIVER_SCENE.walkBounds?.max)
  ? RIVER_SCENE.walkBounds.max
  : 520;
const RIVER_WALK_MIN = Number.isFinite(RIVER_SCENE.walkBounds?.min)
  ? RIVER_SCENE.walkBounds.min
  : -Infinity;
const RIVER_WATER_SEGMENT = Array.isArray(RIVER_SCENE.groundProfile?.segments)
  ? RIVER_SCENE.groundProfile.segments.find(segment => segment?.type === 'water')
  : null;
const RIVER_SHORELINE_X = typeof RIVER_WATER_SEGMENT?.start === 'number'
  ? Math.max(0, Math.min(RIVER_WATER_SEGMENT.start - 12, RIVER_EDGE_X))
  : RIVER_EDGE_X;
const RIVER_FAR_BANK_X = typeof RIVER_WATER_SEGMENT?.end === 'number'
  ? RIVER_WATER_SEGMENT.end + 22
  : RIVER_EDGE_X + 48;

export async function runLevelTwo() {
  const plan = levelAmbiencePlan.level2;
  const riverProps = cloneSceneProps(RIVER_SCENE.props);
  applySceneConfig({ ...RIVER_SCENE, props: riverProps }, { setAmbience: false });
  ensureAmbience(plan?.review ?? RIVER_SCENE.ambience ?? 'riverDawn');
  setSceneContext({ level: 'level2', phase: 'review' });
  await showLevelTitle('Level 2 - Das Wasser\ndes Lebens');
  await fadeToBase(600);

  await phaseOneRecall(plan);
  await phaseTravelToWater(plan, riverProps);
  await phaseTwoLearning(plan);
  await phaseThreeApplication(plan, riverProps);
  setSceneProps([]);
}


async function phaseOneRecall(plan) {
  await narratorSay('Das Licht aus der Hütte folgt dir – doch vor dir liegt Dunkel im Nebel.');
  await donkeySay('Der Nebel verschluckt das Licht. Ruf es noch einmal, so wie vorhin.');
  await wizardSay('Ich erinnere mich ... das Wort AO R.');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -12),
      anchorY(wizard, -58),
      'Sprich אור (OR), um den Nebel zu teilen',
      anchorX(wizard, -8),
      anchorY(wizard, -32)
    );
    const answer = normalizeHebrewInput(answerInput);

    if (spellEquals(answer, 'or', 'אור')) {
      await celebrateGlyph(answer);
      await narratorSay('Das Licht legt eine Spur nach draußen.');
      break;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Fast – denk daran, das O länger zu ziehen. Aaaor.');
    } else {
      await narratorSay('Der Nebel bleibt dicht. Stell dir die Hütte vor und das Licht darin.');
      await wizardSay('A... O... R.');
    }
  }
}

async function phaseTravelToWater(plan, riverProps) {
  setSceneContext({ phase: 'travel' });
  await transitionAmbience(plan?.learn ?? 'riverDawn', { fade: { toBlack: 120, toBase: 420 } });
  applySceneConfig({ ...RIVER_SCENE, props: riverProps }, { setAmbience: false, position: false });
  await donkeySay('Komm, Meister – geh weiter bis das Wasser direkt vor dir liegt.');
  await waitForWizardToReach(RIVER_SHORELINE_X, { tolerance: 6 });
  await narratorSay('Jetzt rauscht der Fluss zu deinen Füßen.');
}

async function phaseTwoLearning(plan) {
  setSceneContext({ phase: 'learning' });
  await wizardSay('Das Licht reicht nicht weit genug. Der Fluss bleibt wild.');
  await donkeySay('Dann brauchst du ein neues Wort, Meister. Geschrieben mim – gesprochen ma-im. Es bedeutet Wasser.');
  await wizardSay('Ma... im... Wasser.');
  await donkeySay('Sprich es, und der Fluss hört auf dich.');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -10),
      anchorY(wizard, -58),
      'Schreibe mim (מים) und sprich ma-im',
      anchorX(wizard, -6),
      anchorY(wizard, -30),
    );
    const answer = normalizeHebrewInput(answerInput);

    if (spellEquals(answer, 'mayim', 'majim', 'mjm', 'מים')) {
      await celebrateGlyph(answer);
      await narratorSay('Das Wasser beruhigt sich, Nebel hebt sich. Planken steigen aus der Tiefe.');
      await divineSay('אני מי החיים\nIch bin das Wasser des Lebens.');
      break;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Das i sitzt in der Mitte – m-i-m, lass es fließen!');
    } else if (attempts === 2) {
      await narratorSay('Der Fluss bleibt taub. Lass die Buchstaben über dem Wasser schweben: M I M.');
    } else {
      attempts = 0;
      await wizardSay('Vielleicht sollte ich zum Ufer zurück.');
      await donkeySay('Atme wie der Fluss: maaaa-im. Lass es fließen.');
    }
  }
}

async function phaseThreeApplication(plan, riverProps) {
  setSceneContext({ phase: 'apply' });
  await narratorSay('Die Brücke trägt dich. Doch mitten auf dem Fluss klafft eine Lücke.');
  await narratorSay('Der Fluss wartet auf dein Wort, bevor er dich weiter trägt.');

  let filled = false;
  while (!filled) {
    const answerInput = await promptBubble(
      anchorX(wizard, 24),
      anchorY(wizard, -52),
      'Die Planke sinkt. Tipp mim (מים), bitte den Fluss erneut.',
      anchorX(wizard, 18),
      anchorY(wizard, -24),
    );
    const answer = normalizeHebrewInput(answerInput);

    if (spellEquals(answer, 'mayim', 'majim', 'mjm', 'מים')) {
      filled = true;
      await celebrateGlyph(answer);
      await playRiverWaveRide(riverProps);
      await donkeySay('Gut gemacht, Meister. Worte fließen – und wer sie kennt, kann Ströme lenken.');
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
    } else {
      await narratorSay('Das Wasser wartet noch. Höre in den Fluss hinein und sprich es klar aus.');
    }
  }
}

async function playRiverWaveRide(riverProps) {
  if (!Array.isArray(riverProps)) return;
  const waveId = 'riverWaveRide';
  const baseWizardY = wizard.y;
  const baseDonkeyY = donkey.y;
  const waveStartX = (RIVER_WATER_SEGMENT?.end ?? RIVER_EDGE_X) + 96;
  const approachTarget = Math.max((RIVER_WATER_SEGMENT?.start ?? wizard.x) - 24, wizard.x - 12);
  const previousLock = wizard.locked;
  wizard.locked = true;

  try {
    addProp(riverProps, {
      id: waveId,
      type: 'riverWave',
      x: waveStartX,
      align: 'ground',
      offsetY: 6,
      parallax: 1.05,
      layer: -1,
    });

    await movePropHorizontally(riverProps, waveId, approachTarget, { duration: 840, steps: 12 });

    const bounds = getScenePropBounds(waveId);
    const waveLeft = bounds?.left ?? approachTarget;
    const waveRight = bounds?.right ?? (waveLeft + 96);
    const waveBottom = bounds?.bottom ?? (baseWizardY + (wizard.sprites?.right?.height ?? 48));
    const wizardSprite = wizard.sprites?.right ?? wizard.sprites?.left;
    const wizardWidth = wizardSprite?.width ?? 32;
    const wizardHeight = wizardSprite?.height ?? 48;
    const rideOffsetX = Math.round((waveRight - waveLeft - wizardWidth) / 2);
    const rideY = Math.round(Math.max(0, waveBottom - wizardHeight - 6));

    wizard.x = Math.round(waveLeft + rideOffsetX);
    wizard.y = rideY;
    wizard.vx = 0;
    wizard.vy = 0;
    wizard.onGround = true;

    const rideTarget = (RIVER_WATER_SEGMENT?.end ?? waveRight);
    await movePropHorizontally(riverProps, waveId, rideTarget, {
      duration: 1300,
      steps: 18,
      carryWizard: true,
      wizardOffsetX: rideOffsetX,
      wizardY: rideY,
    });

    await sleep(220);
    updateProp(riverProps, waveId, null);
    wizard.x = Math.max(RIVER_FAR_BANK_X, rideTarget + 12);
    wizard.y = baseWizardY;
    wizard.onGround = true;
    setWalkBounds({ min: RIVER_WALK_MIN, max: RIVER_FAR_BANK_X + 180 });
    donkey.x = wizard.x - 36;
    donkey.y = baseDonkeyY;
    donkey.facing = 'right';
  } finally {
    wizard.locked = previousLock;
  }
}

async function movePropHorizontally(props, id, targetX, { duration = 900, steps = 8, carryWizard = false, wizardOffsetX = 0, wizardY = wizard.y } = {}) {
  if (!Array.isArray(props)) return;
  const prop = props.find(entry => entry.id === id);
  if (!prop) return;
  const startX = prop.x ?? 0;
  const distance = targetX - startX;
  if (Math.abs(distance) < 1) {
    updateProp(props, id, { x: targetX });
    if (carryWizard) {
      wizard.x = Math.round(targetX + wizardOffsetX);
      wizard.y = Math.round(wizardY);
      wizard.vx = 0;
      wizard.vy = 0;
      wizard.onGround = true;
    }
    return;
  }
  const clampedSteps = Math.max(1, steps);
  const stepDuration = duration > 0 ? duration / clampedSteps : 0;
  for (let index = 1; index <= clampedSteps; index += 1) {
    const progress = index / clampedSteps;
    const nextX = startX + distance * progress;
    updateProp(props, id, { x: nextX });
    if (carryWizard) {
      wizard.x = Math.round(nextX + wizardOffsetX);
      wizard.y = Math.round(wizardY);
      wizard.vx = 0;
      wizard.vy = 0;
      wizard.onGround = true;
    }
    if (index < clampedSteps && stepDuration > 0) {
      await sleep(stepDuration);
    }
  }
}
