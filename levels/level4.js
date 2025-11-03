import {
  ensureAmbience,
  transitionAmbience,
  setSceneContext,
  levelAmbiencePlan,
  fadeToBlack,
  fadeToBase,
  showLevelTitle,
  setSceneProps,
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
  cloneSceneProps,
  GARDEN_SCENE,
  CANYON_SCENE,
} from './utils.js';

const WORD_AOR = transliterateToHebrew('aor');
const WORD_MAYIM = transliterateToHebrew('mim');
const WORD_QOL = transliterateToHebrew('qol');
const WORD_XAYIM = transliterateToHebrew('xayim');

export async function runLevelFour() {
  const plan = levelAmbiencePlan.level4;
  ensureAmbience(CANYON_SCENE.ambience ?? 'echoChamber');
  setSceneProps(cloneSceneProps(CANYON_SCENE.props));
  setSceneContext({ level: 'bridge', phase: 'between3and4' });
  await fadeToBase(800);
  if (isSkipRequested()) return 'skip';
  await narratorSay('Der Klang der Schlucht hallt noch in dir nach, als der Pfad sich weitet.');
  if (isSkipRequested()) return 'skip';
  await donkeySay('Hoer hin: Vor uns liegt Moab – Balaks Garten wartet.');
  if (isSkipRequested()) return 'skip';
  await transitionAmbience(plan?.review ?? GARDEN_SCENE.ambience ?? 'gardenBloom', { fade: { toBlack: 220, toBase: 520 } });

  const gardenProps = cloneSceneProps(GARDEN_SCENE.props);
  setSceneProps([]);
  applySceneConfig({ ...GARDEN_SCENE, props: gardenProps });
  setSceneContext({ level: 'level4', phase: 'review' });

  const titleResult = await showLevelTitle('Level 4 -\nDer Garten der Erneuerung');
  if (titleResult === 'skip' || isSkipRequested()) return 'skip';
  await fadeToBase(600);

  const intro = await phaseIntroduction();
  if (intro === 'skip' || isSkipRequested()) return 'skip';

  const fountain = await phaseGardenFountain(plan, gardenProps);
  if (fountain === 'skip' || isSkipRequested()) return 'skip';

  const sunStone = await phaseSunStone(plan, gardenProps);
  if (sunStone === 'skip' || isSkipRequested()) return 'skip';

  const resonance = await phaseResonanceRock(plan, gardenProps);
  if (resonance === 'skip' || isSkipRequested()) return 'skip';

  const revelation = await phaseXayimReveal(gardenProps);
  if (revelation === 'skip' || isSkipRequested()) return 'skip';

  const application = await phaseBreadOfLife(plan, gardenProps);
  if (application === 'skip' || isSkipRequested()) return 'skip';

  await fadeToBlack(720);
}

async function phaseIntroduction() {
  if (isSkipRequested()) return 'skip';
  await narratorSay('Am Tor von Moab ruht Balaks Garten – einst voller Leben, nun nur Staub.');
  if (isSkipRequested()) return 'skip';
  await wizardSay('Was soll ich hier tun?');
  if (isSkipRequested()) return 'skip';
  await donkeySay('Balak verlangt, dass du diesen Garten neu erblühen laesst.');
  if (isSkipRequested()) return 'skip';
  await wizardSay('Mit Worten allein?');
  if (isSkipRequested()) return 'skip';
  await donkeySay('Mit den richtigen Worten. Du kennst sie – findest du noch, wo sie hingehören?');
}

async function phaseGardenFountain(plan, props) {
  if (isSkipRequested()) return 'skip';
  const fountainProp = findProp(props, 'gardenDryBasin');
  const target = fountainProp ? fountainProp.x + 20 : wizard.x + 120;
  await donkeySay('Sieh dir den Brunnen an, Meister – er ist nur noch Staub.');
  if (isSkipRequested()) return 'skip';
  const reach = await waitForWizardToReach(target, { tolerance: 14 });
  if (reach === 'skip' || isSkipRequested()) return 'skip';

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -62),
      'Durst loescht, wer das Fliessen ruft.',
      anchorX(wizard, 0),
      anchorY(wizard, -36),
    );
    if (answerInput === 'skip' || isSkipRequested()) return 'skip';
    const answer = normalizeHebrewInput(answerInput);
    if (answer === WORD_MAYIM) {
      updateProp(props, 'gardenDryBasin', { type: 'fountainFilled' });
      await narratorSay('Wasser steigt aus der Tiefe, fuellt den Brunnen und laesst ein zartes Gurgeln erklingen.');
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
      if (isSkipRequested()) return 'skip';
      ensureAmbience(plan?.review ?? GARDEN_SCENE.ambience ?? 'gardenBloom');
      await donkeySay('Erinner dich an den Fluss. Wie nanntest du das Wort, das ihn beruhigte?');
      await fadeToBase(320);
      if (isSkipRequested()) return 'skip';
    }
  }
}

async function phaseSunStone(plan, props) {
  if (isSkipRequested()) return 'skip';
  const sunProp = findProp(props, 'gardenSunStone');
  const target = sunProp ? sunProp.x + 24 : wizard.x + 160;
  await donkeySay('Dort steht der Sonnenstein. Ohne Morgenlicht bleibt er kalt.');
  if (isSkipRequested()) return 'skip';
  const reach = await waitForWizardToReach(target, { tolerance: 14 });
  if (reach === 'skip' || isSkipRequested()) return 'skip';

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -60),
      'Was kalt ist, wird warm durch den Hauch des Morgens. (OR)',
      anchorX(wizard, 2),
      anchorY(wizard, -34),
    );
    if (answerInput === 'skip' || isSkipRequested()) return 'skip';
    const answer = normalizeHebrewInput(answerInput);
    if (answer === WORD_AOR) {
      updateProp(props, 'gardenSunStone', { type: 'sunStoneAwakened' });
      await narratorSay('Die Metallblaetter oeffnen sich, Licht bricht aus der Steinbluete und tanzt auf dem Wasser.');
      return;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Zu dunkel gedacht. Vielleicht fehlt der Schein.');
    } else {
      attempts = 0;
      await fadeToBlack(160);
      if (isSkipRequested()) return 'skip';
      ensureAmbience(plan?.learn ?? GARDEN_SCENE.ambience ?? 'gardenBloom');
      await narratorSay('Rueckblende: Die Huette, in der du erstmals אור gesprochen hast.');
      await fadeToBase(320);
      if (isSkipRequested()) return 'skip';
    }
  }
}

async function phaseResonanceRock(plan, props) {
  if (isSkipRequested()) return 'skip';
  const rockProp = findProp(props, 'gardenEchoRock');
  const target = rockProp ? rockProp.x + 18 : wizard.x + 180;
  await donkeySay('Hoer auf den Felsen am Rand – er atmet.');
  if (isSkipRequested()) return 'skip';
  const reach = await waitForWizardToReach(target, { tolerance: 14 });
  if (reach === 'skip' || isSkipRequested()) return 'skip';
  await narratorSay('Der Stein brummt tief, als hielte er die Luft an.');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -4),
      anchorY(wizard, -60),
      'Ich oeffne mich nur, wenn man mich hoert.',
      anchorX(wizard, 2),
      anchorY(wizard, -32),
    );
    if (answerInput === 'skip' || isSkipRequested()) return 'skip';
    const answer = normalizeHebrewInput(answerInput);
    if (answer === WORD_QOL) {
      updateProp(props, 'gardenEchoRock', { type: 'resonanceRockAwakened' });
      await narratorSay('Der Fels bebt, Risse leuchten, ein klarer Ton mischt sich in das Wasser. Voegel regen sich in den Zweigen.');
      return;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Steine verstehen keine Stille, Meister.');
    } else {
      attempts = 0;
      await fadeToBlack(160);
      if (isSkipRequested()) return 'skip';
      ensureAmbience(plan?.learn ?? GARDEN_SCENE.ambience ?? 'gardenBloom');
      await narratorSay('Rueckblende: Die Schlucht, in der du קול gelernt hast.');
      await fadeToBase(300);
      if (isSkipRequested()) return 'skip';
    }
  }
}

async function phaseXayimReveal(props) {
  if (isSkipRequested()) return 'skip';
  setSceneContext({ phase: 'revelation' });
  addProp(props, { id: 'gardenGlyph', type: 'waterGlyph', x: wizard.x + 60, y: wizard.y - 10, parallax: 0.8 });
  await narratorSay('Licht, Wasser und Klang verweben sich. Eine neue Glyphe entsteht im Boden.');
  if (isSkipRequested()) return 'skip';
  await donkeySay('Das ist חַיִּים – xayim. Es bedeutet Leben... und Brot.');
  if (isSkipRequested()) return 'skip';

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -60),
      'Sprich חַיִּים (xayim)',
      anchorX(wizard, 0),
      anchorY(wizard, -34),
    );
    if (answerInput === 'skip' || isSkipRequested()) return 'skip';
    const answer = normalizeHebrewInput(answerInput);
    if (answer === WORD_XAYIM) {
      updateProp(props, 'gardenGlyph', { type: 'soundGlyph' });
      updateProp(props, 'gardenBalakStatue', { type: 'balakStatueOvergrown' });
      updateProp(props, 'gardenSunStone', { type: 'sunStoneAwakened' });
      updateProp(props, 'gardenEchoRock', { type: 'resonanceRockAwakened' });
      addProp(props, { id: 'gardenGrowth', type: 'gardenForegroundPlant', x: wizard.x + 70, y: wizard.y - 18, parallax: 1.02 });
      addProp(props, { id: 'gardenWheatBundle', type: 'gardenWheatBundle', x: wizard.x + 110, y: wizard.y - 12, parallax: 0.95 });
      await narratorSay('Pflanzen spriessen, Baeume treiben Blueten, Wasser rinnt durch die Kanaele. Ueber der Statue Balaks waechst Moos.');
      return;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Atme tiefer. Das Wort ist Leben – nicht bloss Laut.');
    } else {
      attempts = 0;
      await narratorSay('Stell dir die Buchstaben ח – י – י – ם vor. Lass sie leuchten und versuche es erneut.');
    }
  }
}

async function phaseBreadOfLife(plan, props) {
  if (isSkipRequested()) return 'skip';
  setSceneContext({ phase: 'apply' });
  const wheat = findProp(props, 'gardenWheatBundle');
  const altar = findProp(props, 'gardenAltar');

  if (wheat) {
    await donkeySay('Siehst du die goldenen Aehren dort? Sammle sie ein.');
    if (isSkipRequested()) return 'skip';
    const reachWheat = await waitForWizardToReach(wheat.x + 10, { tolerance: 12 });
    if (reachWheat === 'skip' || isSkipRequested()) return 'skip';
    await narratorSay('Du sammelst die Aehren behutsam ein; sie fuehlen sich warm an.');
    updateProp(props, 'gardenWheatBundle', { type: 'gardenWheatHarvested' });
  }

  if (altar) {
    await donkeySay('Bring die Aehren zum Altar und lege sie dort ab.');
    if (isSkipRequested()) return 'skip';
    const reachAltar = await waitForWizardToReach(altar.x + 16, { tolerance: 12 });
    if (reachAltar === 'skip' || isSkipRequested()) return 'skip';
    addProp(props, { id: 'gardenBreadLight', type: 'gardenBreadLight', x: altar.x + 8, y: altar.y - 18, parallax: 0.95 });
    await narratorSay('Die Aehren legen sich zu einem einfachen Brot. Licht und Erde backen es zusammen.');
  }

  await donkeySay('Wer Leben spricht, saet Brot. Und wer Brot teilt, spricht Leben.');
  if (isSkipRequested()) return 'skip';
  await wizardSay('Ich habe mit Worten Brot gemacht.');
  if (isSkipRequested()) return 'skip';
  await donkeySay('Oder Brot hat dich gemacht. Wer weiss das schon?');
  await transitionAmbience(plan?.apply ?? plan?.learn ?? GARDEN_SCENE.ambience ?? 'gardenBloom', { fade: { toBlack: 180, toBase: 420 } });
}

function updateProp(list, id, changes) {
  const index = list.findIndex(entry => entry.id === id);
  if (index === -1) return;
  if (changes == null) {
    list.splice(index, 1);
  } else {
    list[index] = { ...list[index], ...changes };
  }
  setSceneProps(list);
}

function addProp(list, definition) {
  const existingIndex = definition?.id ? list.findIndex(entry => entry.id === definition.id) : -1;
  if (existingIndex >= 0) {
    list[existingIndex] = { ...list[existingIndex], ...definition };
  } else {
    list.push({ ...definition });
  }
  setSceneProps(list);
}

function findProp(list, id) {
  if (!Array.isArray(list)) return null;
  return list.find(entry => entry.id === id) ?? null;
}
