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
  GARDEN_SCENE,
  CANYON_SCENE,
  spellEquals,
  propSay,
  findProp,
  updateProp,
  addProp,
  celebrateGlyph,
  divineSay,
} from './utils.js';

const BALAK_WALK_SPEED = 26;

function balakSay(props, text, options = {}) {
  return propSay(props, 'gardenBalakFigure', text, {
    anchor: 'center',
    offsetY: -36,
    ...options,
  });
}

export async function runLevelFour() {
  const plan = levelAmbiencePlan.level4;
  ensureAmbience(CANYON_SCENE.ambience ?? 'echoChamber');
  setSceneProps(cloneSceneProps(CANYON_SCENE.props));
  setSceneContext({ level: 'bridge', phase: 'between3and4' });
  await showLevelTitle('Level 4 -\nDer Garten der\nErneuerung');
  await fadeToBase(600);
  await narratorSay('Der Klang der Schlucht hallt noch in dir nach, als der Pfad sich weitet.');
  await donkeySay('Hör hin: Vor uns liegt Moab – Balaks Garten wartet.');
  await transitionAmbience(plan?.review ?? GARDEN_SCENE.ambience ?? 'gardenBloom', { fade: { toBlack: 220, toBase: 520 } });

  const gardenProps = cloneSceneProps(GARDEN_SCENE.props);
  setSceneProps([]);
  applySceneConfig({ ...GARDEN_SCENE, props: gardenProps });
  setSceneContext({ level: 'level4', phase: 'review' });

  await phaseIntroduction(gardenProps);

  await phaseGardenFountain(plan, gardenProps);

  await phaseSunStone(plan, gardenProps);

  await phaseResonanceRock(plan, gardenProps);

  await phaseXayimReveal(gardenProps);

  await phaseBreadOfLife(plan, gardenProps);

  await fadeToBlack(720);
}

async function phaseIntroduction(props) {
  await narratorSay('Am Tor von Moab liegt Balaks Garten – einst voller Leben, nun nur Staub.');
  await walkBalak(props, wizard.x + 24);
  await balakSay(props, 'Lehrling, mein Garten verdorrt. Erwecke ihn – sonst ist unser Bund dahin.');
  await wizardSay('Majestät Balak – erwartet Ihr, dass Worte den Staub zu Blüte wandeln?');
  await balakSay(props, 'Man pries deine Zunge in meinem Hof. Zeige mir, dass sie Licht und Wasser gebietet.');
  await donkeySay('Du hast ihn gehört. Balak verlangt, dass du diesen Garten neu erblühen lässt.');
  await wizardSay('Mit Worten allein?');
  await donkeySay('Mit den richtigen Worten. Du kennst sie – findest du noch, wo sie hingehören?');
}

async function phaseGardenFountain(plan, props) {
  const fountainProp = findProp(props, 'gardenDryBasin');
  const target = fountainProp ? fountainProp.x + 26 : wizard.x + 120;
  await walkBalak(props, Math.max(target - 32, wizard.x + 48));
  await balakSay(props, 'Sieh zuerst nach dem Brunnen, Lehrling. Wo kein Wasser ist, gibt es kein Leben.');
  await donkeySay('Sieh dir den Brunnen an, Meister – er ist nur noch Staub.');
  await waitForWizardToReach(target, { tolerance: 40 });
  await narratorSay('Der Brunnen ist ausgetrocknet. Auf dem Rand steht: "Durst löscht, wer das Fließen ruft."');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -62),
      'Ruf das alte Wasserwort in Erinnerung.',
      anchorX(wizard, 0),
      anchorY(wizard, -36),
    );
    const answer = normalizeHebrewInput(answerInput);
    if (spellEquals(answer, 'mayim', 'majim', 'mjm', 'מים')) {
      updateProp(props, 'gardenDryBasin', { type: 'fountainFilled' });
      await celebrateGlyph(answer);
      await narratorSay('Wasser steigt aus der Tiefe, füllt den Brunnen und lässt ein zartes Gurgeln erklingen.');
      return;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Nicht alles, was fest ist, braucht Licht. Manches wartet auf Fluss.');
    } else if (attempts === 2) {
      await narratorSay('Ein paar Tropfen glitzern, versiegen aber sofort.');
    } else {
      attempts = 0;
      await fadeToBlack(160);
      ensureAmbience(plan?.review ?? GARDEN_SCENE.ambience ?? 'gardenBloom');
      await fadeToBase(320);
      await donkeySay('Erinner dich an den Fluss. Wie nanntest du das Wort, das ihn beruhigte?');
    }
  }
}

async function phaseSunStone(plan, props) {
  const sunProp = findProp(props, 'gardenSunStone');
  const target = sunProp ? sunProp.x + 30 : wizard.x + 160;
  await walkBalak(props, Math.max(target - 36, wizard.x + 60));
  await balakSay(props, 'Die Blüte dort war einst mein Stolz. Vielleicht braucht sie mehr als nur Worte.');
  await donkeySay('Dort steht der Sonnenstein. Ohne Morgenlicht bleibt er kalt.');
  await waitForWizardToReach(target, { tolerance: 40 });
  await narratorSay('Die Metallblüte ist geschlossen und kalt. Eine Inschrift flüstert: "Was kalt ist, wird warm durch den Hauch des Morgens."');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -60),
      'Was kalt ist, wird warm durch den Hauch des Morgens. (OR)',
      anchorX(wizard, 2),
      anchorY(wizard, -34),
    );
    const answer = normalizeHebrewInput(answerInput);
    if (spellEquals(answer, 'or', 'אור')) {
      updateProp(props, 'gardenSunStone', { type: 'sunStoneAwakened' });
      await celebrateGlyph(answer);
      await narratorSay('Die Metallblätter öffnen sich, Licht bricht aus der Steinblüte und tanzt auf dem Wasser.');
      return;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Zu dunkel gedacht. Vielleicht fehlt der Schein.');
    } else {
      attempts = 0;
      await fadeToBlack(160);
      ensureAmbience(plan?.learn ?? GARDEN_SCENE.ambience ?? 'gardenBloom');
      await fadeToBase(320);
      await narratorSay('Rückblende: Die Hütte, in der du erstmals אור gesprochen hast.');
    }
  }
}

async function phaseResonanceRock(plan, props) {
  const rockProp = findProp(props, 'gardenEchoRock');
  const target = rockProp ? rockProp.x + 24 : wizard.x + 180;
  await walkBalak(props, Math.max(target - 28, wizard.x + 72));
  await balakSay(props, 'Der Fels antwortete mir nie. Vielleicht hört er eher auf dich.');
  await donkeySay('Hör auf den Felsen am Rand – er atmet.');
  await waitForWizardToReach(target, { tolerance: 36 });
  await narratorSay('Der Stein brummt tief, als hielte er die Luft an.');
  await narratorSay('In den Rissen glimmt ein Wort: "Ich oeffne mich nur, wenn man mich hört."');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -4),
      anchorY(wizard, -60),
      'Ich oeffne mich nur, wenn man mich hört.',
      anchorX(wizard, 2),
      anchorY(wizard, -32),
    );
    const answer = normalizeHebrewInput(answerInput);
    if (spellEquals(answer, 'qol', 'קול')) {
      updateProp(props, 'gardenEchoRock', { type: 'resonanceRockAwakened' });
      await celebrateGlyph(answer);
      await narratorSay('Der Fels bebt, Risse leuchten, ein klarer Ton mischt sich in das Wasser. Vögel regen sich in den Zweigen.');
      return;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Steine verstehen keine Stille, Meister.');
    } else {
      attempts = 0;
      await fadeToBlack(160);
      ensureAmbience(plan?.learn ?? GARDEN_SCENE.ambience ?? 'gardenBloom');
      await narratorSay('Rückblende: Die Schlucht, in der du קול gelernt hast.');
      await fadeToBase(300);
    }
  }
}

async function phaseXayimReveal(props) {
  await walkBalak(props, wizard.x + 92);
  setSceneContext({ phase: 'revelation' });
  addProp(props, {
    id: 'gardenGlyph',
    type: 'waterGlyph',
    x: wizard.x + 60,
    y: wizard.y - 10,
    parallax: 0.8,
    layer: 3,
  });
  await narratorSay('Licht, Wasser und Klang verweben sich und erfüllen den Garten.');
  await balakSay(props, 'Höre zu: Das ist חיים – Leben. Es ernährt mein Reich... oder lässt es verhungern.');
  await donkeySay('Das ist חיים – xayim. Es bedeutet Leben... und Brot.');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -60),
      'Sprich חיים (xayim)',
      anchorX(wizard, 0),
      anchorY(wizard, -34),
    );
    const answer = normalizeHebrewInput(answerInput);
    if (spellEquals(answer, 'xayim', 'חיים')) {
      updateProp(props, 'gardenGlyph', { type: 'soundGlyph' });
      updateProp(props, 'gardenBalakStatue', { type: 'balakStatueOvergrown' });
      updateProp(props, 'gardenSunStone', { type: 'sunStoneAwakened' });
      updateProp(props, 'gardenEchoRock', { type: 'resonanceRockAwakened' });
      addProp(props, {
        id: 'gardenGrowth',
        type: 'gardenForegroundPlant',
        x: wizard.x + 70,
        y: wizard.y - 18,
        parallax: 1.02,
        layer: 2,
      });
      addProp(props, {
        id: 'gardenWheatBundle',
        type: 'gardenWheatBundle',
        x: wizard.x + 110,
        y: wizard.y - 12,
        parallax: 0.95,
        layer: 2,
      });
      await celebrateGlyph(answer);
      await narratorSay('Pflanzen sprießen, Bäume treiben Blüten, Wasser rinnt durch die Kanäle. Über der Statue Balaks wächst Moos.');
      await divineSay('אני בראתי את החיים\nIch habe das Leben erschaffen.');
      await balakSay(props, 'So sei es – dein Wort weckt den Staub. Vergiss nicht, wessen Auftrag du trägst.');
      return;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Atme tiefer. Das Wort ist Leben – nicht bloß Laut.');
    } else {
      attempts = 0;
      await narratorSay('Stell dir die Buchstaben ח – י – י – ם vor. Lass sie leuchten und versuche es erneut.');
    }
  }
}

async function phaseBreadOfLife(plan, props) {
  await walkBalak(props, wizard.x + 128);
  await balakSay(props, 'Bring das Brot zum Altar. Zeig mir, dass Worte wirklich nähren.');
  setSceneContext({ phase: 'apply' });
  const wheat = findProp(props, 'gardenWheatBundle');
  const altar = findProp(props, 'gardenAltar');

  if (wheat) {
    await donkeySay('Siehst du die goldenen Ähren dort? Sammle sie ein.');
    await waitForWizardToReach(wheat.x + 10, { tolerance: 12 });
    await narratorSay('Du sammelst die Ähren behutsam ein; sie fühlen sich warm an.');
    updateProp(props, 'gardenWheatBundle', { type: 'gardenWheatHarvested' });
  }

  if (altar) {
    await donkeySay('Bring die Ähren zum Altar und lege sie dort ab.');
    await waitForWizardToReach(altar.x + 16, { tolerance: 12 });
    addProp(props, {
      id: 'gardenBreadLight',
      type: 'gardenBreadLight',
      x: altar.x + 8,
      y: altar.y - 18,
      parallax: 0.95,
      layer: 3,
    });
    await narratorSay('Die Ähren legen sich zu einem einfachen Brot. Licht und Erde backen es zusammen.');
  }

  await donkeySay('Wer Leben spricht, sät Brot. Und wer Brot teilt, spricht Leben.');
  await wizardSay('Ich habe mit Worten Brot gemacht.');
  await donkeySay('Oder Brot hat dich gemacht. Wer weiss das schon?');
  await transitionAmbience(plan?.apply ?? plan?.learn ?? GARDEN_SCENE.ambience ?? 'gardenBloom', { fade: { toBlack: 180, toBase: 420 } });
}

function walkBalak(props, targetX, options = {}) {
  if (!Array.isArray(props)) return Promise.resolve();

  const balak = findProp(props, 'gardenBalakFigure');
  if (!balak) return Promise.resolve();

  const { duration, minSpacing = 48, speed } = options;
  const bounds = getScenePropBounds('gardenBalakFigure');
  const startX = bounds ? bounds.left : balak.x ?? 0;
  const rawTarget = typeof targetX === 'number' ? targetX : startX;
  const finalX = Math.round(Math.max(rawTarget, wizard.x + minSpacing));

  if (!Number.isFinite(finalX)) {
    return Promise.resolve();
  }

  if (Math.abs(finalX - startX) < 2) {
    updateProp(props, 'gardenBalakFigure', { x: finalX, visible: true });
    return Promise.resolve();
  }

  return new Promise(resolve => {
    const startTime = performance.now();
    const distance = finalX - startX;
    const baseSpeed = Math.max(6, speed ?? BALAK_WALK_SPEED);
    let travelDuration = duration;
    if (!Number.isFinite(travelDuration) || travelDuration <= 0) {
      const computed = Math.abs(distance) / Math.max(1e-3, baseSpeed) * 1000;
      travelDuration = Math.max(420, Math.round(computed));
    }

    const step = now => {
      const t = Math.min(1, (now - startTime) / Math.max(1, travelDuration));
      const current = Math.round(startX + distance * t);
      updateProp(props, 'gardenBalakFigure', { x: current, visible: true });
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(step);
  });
}
