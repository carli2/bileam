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
} from './utils.js';

export async function runLevelFour() {
  const plan = levelAmbiencePlan.level4;
  ensureAmbience(CANYON_SCENE.ambience ?? 'echoChamber');
  setSceneProps(cloneSceneProps(CANYON_SCENE.props));
  setSceneContext({ level: 'bridge', phase: 'between3and4' });
  await fadeToBase(800);
  await narratorSay('Der Klang der Schlucht hallt noch in dir nach, als der Pfad sich weitet.');
  await donkeySay('Hoer hin: Vor uns liegt Moab – Balaks Garten wartet.');
  await transitionAmbience(plan?.review ?? GARDEN_SCENE.ambience ?? 'gardenBloom', { fade: { toBlack: 220, toBase: 520 } });

  const gardenProps = cloneSceneProps(GARDEN_SCENE.props);
  setSceneProps([]);
  applySceneConfig({ ...GARDEN_SCENE, props: gardenProps });
  setSceneContext({ level: 'level4', phase: 'review' });

  await showLevelTitle('Level 4 -\nDer Garten der\nErneuerung');
  await fadeToBase(600);

  await phaseIntroduction();

  await phaseGardenFountain(plan, gardenProps);

  await phaseSunStone(plan, gardenProps);

  await phaseResonanceRock(plan, gardenProps);

  await phaseXayimReveal(gardenProps);

  await phaseBreadOfLife(plan, gardenProps);

  await fadeToBlack(720);
}

async function phaseIntroduction() {
  await narratorSay('Am Tor von Moab ruht Balaks Garten – einst voller Leben, nun nur Staub.');
  await wizardSay('Was soll ich hier tun?');
  await donkeySay('Balak verlangt, dass du diesen Garten neu erblühen laesst.');
  await wizardSay('Mit Worten allein?');
  await donkeySay('Mit den richtigen Worten. Du kennst sie – findest du noch, wo sie hingehören?');
}

async function phaseGardenFountain(plan, props) {
  const fountainProp = findProp(props, 'gardenDryBasin');
  const target = fountainProp ? fountainProp.x + 26 : wizard.x + 120;
  await donkeySay('Sieh dir den Brunnen an, Meister – er ist nur noch Staub.');
  await waitForWizardToReach(target, { tolerance: 40 });
  await narratorSay('Der Brunnen ist ausgetrocknet. Auf dem Rand steht: "Durst löscht, wer das Fließen ruft."');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -62),
      'Sprich מים (mayim)',
      anchorX(wizard, 0),
      anchorY(wizard, -36),
    );
    const answer = normalizeHebrewInput(answerInput);
    if (spellEquals(answer, 'mayim', 'majim', 'mjm', 'מים')) {
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
      ensureAmbience(plan?.review ?? GARDEN_SCENE.ambience ?? 'gardenBloom');
      await donkeySay('Erinner dich an den Fluss. Wie nanntest du das Wort, das ihn beruhigte?');
      await fadeToBase(320);
    }
  }
}

async function phaseSunStone(plan, props) {
  const sunProp = findProp(props, 'gardenSunStone');
  const target = sunProp ? sunProp.x + 30 : wizard.x + 160;
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
      await narratorSay('Die Metallblaetter oeffnen sich, Licht bricht aus der Steinbluete und tanzt auf dem Wasser.');
      return;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Zu dunkel gedacht. Vielleicht fehlt der Schein.');
    } else {
      attempts = 0;
      await fadeToBlack(160);
      ensureAmbience(plan?.learn ?? GARDEN_SCENE.ambience ?? 'gardenBloom');
      await narratorSay('Rueckblende: Die Huette, in der du erstmals אור gesprochen hast.');
      await fadeToBase(320);
    }
  }
}

async function phaseResonanceRock(plan, props) {
  const rockProp = findProp(props, 'gardenEchoRock');
  const target = rockProp ? rockProp.x + 24 : wizard.x + 180;
  await donkeySay('Hoer auf den Felsen am Rand – er atmet.');
  await waitForWizardToReach(target, { tolerance: 36 });
  await narratorSay('Der Stein brummt tief, als hielte er die Luft an.');
  await narratorSay('In den Rissen glimmt ein Wort: "Ich öffne mich nur, wenn man mich hört."');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -4),
      anchorY(wizard, -60),
      'Ich oeffne mich nur, wenn man mich hoert.',
      anchorX(wizard, 2),
      anchorY(wizard, -32),
    );
    const answer = normalizeHebrewInput(answerInput);
    if (spellEquals(answer, 'qol', 'קול')) {
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
      ensureAmbience(plan?.learn ?? GARDEN_SCENE.ambience ?? 'gardenBloom');
      await narratorSay('Rueckblende: Die Schlucht, in der du קול gelernt hast.');
      await fadeToBase(300);
    }
  }
}

async function phaseXayimReveal(props) {
  setSceneContext({ phase: 'revelation' });
  addProp(props, { id: 'gardenGlyph', type: 'waterGlyph', x: wizard.x + 60, y: wizard.y - 10, parallax: 0.8 });
  await narratorSay('Licht, Wasser und Klang verweben sich. Eine neue Glyphe entsteht im Boden.');
  await donkeySay('Das ist חַיִּים – xayim. Es bedeutet Leben... und Brot.');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -60),
      'Sprich חַיִּים (xayim)',
      anchorX(wizard, 0),
      anchorY(wizard, -34),
    );
    const answer = normalizeHebrewInput(answerInput);
    if (spellEquals(answer, 'xayim', 'חיים', 'חַיִּים')) {
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
  setSceneContext({ phase: 'apply' });
  const wheat = findProp(props, 'gardenWheatBundle');
  const altar = findProp(props, 'gardenAltar');

  if (wheat) {
    await donkeySay('Siehst du die goldenen Aehren dort? Sammle sie ein.');
    await waitForWizardToReach(wheat.x + 10, { tolerance: 12 });
    await narratorSay('Du sammelst die Aehren behutsam ein; sie fuehlen sich warm an.');
    updateProp(props, 'gardenWheatBundle', { type: 'gardenWheatHarvested' });
  }

  if (altar) {
    await donkeySay('Bring die Aehren zum Altar und lege sie dort ab.');
    await waitForWizardToReach(altar.x + 16, { tolerance: 12 });
    addProp(props, { id: 'gardenBreadLight', type: 'gardenBreadLight', x: altar.x + 8, y: altar.y - 18, parallax: 0.95 });
    await narratorSay('Die Aehren legen sich zu einem einfachen Brot. Licht und Erde backen es zusammen.');
  }

  await donkeySay('Wer Leben spricht, saet Brot. Und wer Brot teilt, spricht Leben.');
  await wizardSay('Ich habe mit Worten Brot gemacht.');
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
