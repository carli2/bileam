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
  MARKET_SCENE,
  spellEquals,
  addProp,
  updateProp,
  celebrateGlyph,
} from './utils.js';

const MOAB_APPROACH_SCENE = {
  ambience: 'marketBazaar',
  wizardStartX: 74,
  donkeyOffset: -38,
  props: [
    { id: 'moabWatcherNorth', type: 'moabWallWatcher', x: 156, align: 'ground', parallax: 0.88 },
    { id: 'moabWatcherSouth', type: 'moabWallWatcher', x: 492, align: 'ground', parallax: 1.06 },
    { id: 'moabVisionRingWest', type: 'sandVisionRingDormant', x: 182, align: 'ground', parallax: 1 },
    { id: 'moabVisionRingCenter', type: 'sandVisionRingDormant', x: 326, align: 'ground', parallax: 1 },
    { id: 'moabVisionRingEast', type: 'sandVisionRingDormant', x: 472, align: 'ground', parallax: 1 },
  ],
};

const PETOR_SCENE = {
  ambience: 'marketBazaar',
  wizardStartX: 68,
  donkeyOffset: -40,
  props: [
    { id: 'petorCampfire', type: 'nightCampfire', x: 236, align: 'ground', parallax: 0.92 },
    { id: 'petorEnvoyNorth', type: 'envoyShadow', x: 156, align: 'ground', parallax: 0.96 },
    { id: 'petorEnvoyEast', type: 'envoyShadow', x: 316, align: 'ground', parallax: 0.96 },
    { id: 'petorEnvoySouth', type: 'envoyShadow', x: 472, align: 'ground', parallax: 0.96 },
  ],
};

const BORDER_SCENE = {
  ambience: 'marketBazaar',
  wizardStartX: 72,
  donkeyOffset: -38,
  props: [
    { id: 'borderBackdrop', type: 'borderProcessionPath', x: -36, align: 'ground', parallax: 0.6 },
    { id: 'borderStone', type: 'borderMilestone', x: 212, align: 'ground', parallax: 0.95 },
    { id: 'borderBush', type: 'borderThorn', x: 332, align: 'ground', parallax: 0.98 },
    { id: 'borderWatchFire', type: 'watchFireDormant', x: 492, align: 'ground', parallax: 1.02 },
  ],
};

const MOAB_RING_TASKS = [
  {
    id: 'moabVisionRingWest',
    prompt: 'Stell dich in den Ring und sprich אור.',
    spells: ['or', 'אור'],
    response: 'Das Lager Israels leuchtet wie ein ruhendes Meer aus Waechtern.',
  },
  {
    id: 'moabVisionRingCenter',
    prompt: 'Welche Erinnerung beruhigt die Szene?',
    spells: ['mayim', 'majim', 'mjm', 'מים'],
    response: 'Der Sand bewegt sich wie Wasser; die Vision ordnet sich.',
  },
  {
    id: 'moabVisionRingEast',
    prompt: 'Welches Wort offenbart Balaks Fluester-Befehl?',
    spells: ['qol', 'קול'],
    response: 'Ein Echo laesst Balaks Angst als Klang erscheinen.',
  },
];

const ENVOY_TASKS = [
  {
    id: 'petorEnvoyNorth',
    prompt: 'Gib ihnen Licht als Antwort.',
    spells: ['or', 'אור'],
    response: 'Die Gesichter der Gesandten werden warm und ruhig.',
    fragment: 'ל',
  },
  {
    id: 'petorEnvoyEast',
    prompt: 'Beruhige Balaks Pferde.',
    spells: ['mayim', 'majim', 'mjm', 'מים'],
    response: 'Tau legt sich auf die Zaegel. Der Atem wird sanft.',
    fragment: 'א',
  },
  {
    id: 'petorEnvoySouth',
    prompt: 'Lausche und gib ihnen Klang.',
    spells: ['qol', 'קול'],
    response: 'Die Luft vibriert, ein fernes Echo bestaetigt deine Worte.',
  },
];

const BORDER_TASKS = [
  {
    id: 'borderStone',
    prompt: 'Der Schriftstein fordert ein Nein.',
    spells: ['lo', 'לא'],
    response: 'Der Befehl zerfaellt zu Staub.',
  },
  {
    id: 'borderBush',
    prompt: 'Leg Tau auf die Dornen.',
    spells: ['mayim', 'majim', 'mjm', 'מים'],
    response: 'Tau glaenzt auf den Zweigen, der Weg wird frei.',
  },
];

export async function runLevelSix() {
  const plan = levelAmbiencePlan.level6;

  const moabProps = cloneSceneProps(MOAB_APPROACH_SCENE.props);
  applySceneConfig({ ...MOAB_APPROACH_SCENE, props: moabProps });
  ensureAmbience(plan?.review ?? MOAB_APPROACH_SCENE.ambience ?? 'marketBazaar');
  setSceneContext({ level: 'level6', phase: 'approach' });
  await showLevelTitle('Level 6 - Der Ruf des Koenigs');
  await fadeToBase(600);

  await phaseMoabVisionRings(moabProps);

  const petorProps = cloneSceneProps(PETOR_SCENE.props);
  await transitionToScene(plan?.learn, PETOR_SCENE, petorProps, 'petor');
  await phaseEnvoyDialogue();
  await phaseEnvoyResponses(petorProps);
  await phaseNightVision(petorProps);
  await phaseNightMeditation();
  await phaseMorningRefusal(petorProps);

  await phaseBalakEdict();

  const borderProps = cloneSceneProps(BORDER_SCENE.props);
  await transitionToScene(plan?.apply, BORDER_SCENE, borderProps, 'border');
  await phaseBorderStations(borderProps);
  await phaseWatchFire(borderProps);

  await narratorSay('Die neuen Fuersten reiten voraus. Es geht nach Moab.');
  await donkeySay('Bewahre das Nein – Balak wird es pruefen.');
  await fadeToBlack(720);
}

async function phaseMoabVisionRings(props) {
  await narratorSay('Balaks Waechter blicken nach Osten. Drei Ringe aus Licht warten auf deine Worte.');
  for (const task of MOAB_RING_TASKS) {
    const target = props.find(entry => entry.id === task.id)?.x ?? wizard.x + 120;
    await waitForWizardToReach(target, { tolerance: 18 });

    let solved = false;
    while (!solved) {
      const answer = await readWord(task.prompt);
      if (task.spells.some(spell => spellEquals(answer, spell))) {
        solved = true;
        updateProp(props, task.id, { type: 'sandVisionRingActive' });
        await celebrateGlyph(answer);
        await narratorSay(task.response);
        addProp(props, { id: `${task.id}Trail`, type: 'hoofSignTrail', x: wizard.x + 12, y: wizard.y - 16, parallax: 1.05 });
      } else {
        await donkeySay('Nutze, was du bereits gelernt hast.');
      }
    }
  }
  await narratorSay('Die Ringe glimmen weiter. Balaks Gesandte reiten nach Petor.');
}

async function phaseEnvoyDialogue() {
  await narratorSay('In Petor lodert ein stilles Feuer. Die Gesandten Balaks treten vor Bileam.');
  await donkeySay('Höre ihnen zu, und antworte mit dem, was du weisst.');
}

async function phaseEnvoyResponses(props) {
  setSceneContext({ phase: 'envoys' });
  const collected = [];
  for (const task of ENVOY_TASKS) {
    const target = props.find(entry => entry.id === task.id)?.x ?? wizard.x + 160;
    await waitForWizardToReach(target, { tolerance: 18 });
    let done = false;
    while (!done) {
      const answer = await readWord(task.prompt);
      if (task.spells.some(spell => spellEquals(answer, spell))) {
        done = true;
        await celebrateGlyph(answer);
        await narratorSay(task.response);
        if (task.fragment) {
          collected.push(task.fragment);
          addProp(props, {
            id: `petorFragment${task.fragment}`,
            type: 'noGlyphShard',
            x: wizard.x + 16 + collected.length * 6,
            y: wizard.y - 42 - collected.length * 2,
            parallax: 0.92,
            letter: task.fragment,
          });
        }
      } else {
        await donkeySay('Sprich das Wort, das du gelernt hast.');
      }
    }
  }
  await narratorSay('Die Fragmente schimmern: ל und א. Ein neues Wort wartet.');
}

async function phaseNightVision(props) {
  setSceneContext({ phase: 'night' });
  await narratorSay('In der Nacht spricht Gott: Geh nicht mit ihnen. Verfluche das Volk nicht, denn es ist gesegnet.');

  let attempts = 0;
  while (true) {
    const answer = await readWord('Das Wort formt sich: sprich לא (lo).');
    if (spellEquals(answer, 'lo', 'לא')) {
      await celebrateGlyph(answer);
      addProp(props, { id: 'petorGlyphComplete', type: 'noGlyphShard', x: wizard.x + 20, y: wizard.y - 48, parallax: 0.9, letter: 'לא' });
      await narratorSay('Das Nein legt sich wie ein Schild um dich.');
      break;
    }
    attempts += 1;
    if (attempts === 1) {
      await donkeySay('Nur zwei Buchstaben. Sprich sie klar.');
    } else {
      attempts = 0;
      await wizardSay('L ... א ... ich spreche es erneut.');
    }
  }
}

async function phaseNightMeditation() {
  setSceneContext({ phase: 'meditation' });
  await narratorSay('Ein Hoerkreis erscheint. Halte ihn dreimal mit dem Nein, das du gelernt hast.');
  let successes = 0;
  while (successes < 3) {
    const answer = await readWord('Halte den Kreis. Sprich לא (lo).');
    if (spellEquals(answer, 'lo', 'לא')) {
      successes += 1;
      await narratorSay('Der Kreis leuchtet heller.');
    } else if (spellEquals(answer, 'qol', 'קול')) {
      await narratorSay('Ein Ton jagt die Schatten fort, doch der Kreis verlangt weiter nach לא.');
    } else {
      await donkeySay('Nur lo haelt den Kreis. Versuch es erneut.');
    }
  }
  await narratorSay('Der Kreis schliesst sich. Der Atem der Nacht wird ruhig.');
}

async function phaseMorningRefusal(props) {
  setSceneContext({ phase: 'morning' });
  addProp(props, { id: 'petorGift', type: 'temptationVessel', x: wizard.x + 42, align: 'ground', parallax: 1.02 });
  await narratorSay('Am Morgen liegen Geschenke bereit. Balak verspricht Ehre und Gold.');

  while (true) {
    const answer = await readWord('Welches Wort loescht Balaks Gabe?');
    if (spellEquals(answer, 'lo', 'לא')) {
      updateProp(props, 'petorGift', { type: 'temptationVesselAshes' });
      await celebrateGlyph(answer);
      await narratorSay('Die Gabe verglimmt zu Staub.');
      break;
    }
    await donkeySay('Bleib beim Wort der Nacht.');
  }
}

async function phaseBalakEdict() {
  await narratorSay('Die Fuersten berichten Balak: Bileam weigert sich, zu kommen.');
  await narratorSay('Balak sendet mächtigere Maenner und verspricht große Ehre.');
}

async function phaseBorderStations(props) {
  setSceneContext({ phase: 'border' });
  await narratorSay('Der Weg nach Moab fuehrt entlang einer Grenze voller Schrift.');

  for (const task of BORDER_TASKS) {
    const target = props.find(entry => entry.id === task.id)?.x ?? wizard.x + 160;
    await waitForWizardToReach(target, { tolerance: 18 });
    let complete = false;
    while (!complete) {
      const answer = await readWord(task.prompt);
      if (task.spells.some(spell => spellEquals(answer, spell))) {
        complete = true;
        await celebrateGlyph(answer);
        await narratorSay(task.response);
      } else {
        await donkeySay('Nutze das richtige Wort.');
      }
    }
  }
}

async function phaseWatchFire(props) {
  const fire = props.find(entry => entry.id === 'borderWatchFire');
  const target = fire ? fire.x + 18 : wizard.x + 260;
  await waitForWizardToReach(target, { tolerance: 18 });

  let stage = 0;
  while (stage < 2) {
    const prompt = stage === 0
      ? 'Das Wachfeuer verlangt nach אור.'
      : 'Verberge den Pfad. Sprich לא.';
    const answer = await readWord(prompt);
    if (stage === 0 && spellEquals(answer, 'or', 'אור')) {
      updateProp(props, 'borderWatchFire', { type: 'watchFireAwakened' });
      await celebrateGlyph(answer);
      await narratorSay('Ein heller Schein offenbart den Pfad.');
      stage = 1;
      continue;
    }
    if (stage === 1 && spellEquals(answer, 'lo', 'לא')) {
      updateProp(props, 'borderWatchFire', { type: 'watchFireVeiled' });
      await celebrateGlyph(answer);
      await narratorSay('Der Pfad verschwindet vor Balaks Augen.');
      stage = 2;
      break;
    }
    await donkeySay('Zuerst Licht, dann das Nein.');
  }
}

async function transitionToScene(ambienceKey, sceneConfig, props, phase) {
  await fadeToBlack(360);
  ensureAmbience(ambienceKey ?? sceneConfig.ambience ?? 'marketBazaar');
  setSceneProps([]);
  applySceneConfig({ ...sceneConfig, props }, { setAmbience: false });
  setSceneProps(props);
  setSceneContext({ level: 'level6', phase });
  await fadeToBase(480);
}

async function readWord(promptText) {
  const input = await promptBubble(
    anchorX(wizard, -6),
    anchorY(wizard, -60),
    promptText,
    anchorX(wizard, 0),
    anchorY(wizard, -34),
  );
  return normalizeHebrewInput(input);
}
