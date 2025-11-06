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
  spellEquals,
  addProp,
  updateProp,
  celebrateGlyph,
  propSay,
} from './utils.js';

const MOAB_APPROACH_SCENE = {
  ambience: 'marketBazaar',
  wizardStartX: 74,
  donkeyOffset: -38,
  props: [
    { id: 'moabWatcherNorth', type: 'moabWallWatcher', x: 156, align: 'ground', parallax: 0.88 },
    { id: 'moabWatcherSouth', type: 'moabWallWatcher', x: 492, align: 'ground', parallax: 1.06 },
    { id: 'balakWallFigure', type: 'balakFigure', x: 628, align: 'ground', parallax: 1.12 },
    { id: 'midianElder', type: 'envoyShadow', x: 586, align: 'ground', parallax: 1.08 },
    { id: 'israelCampGlow', type: 'hoofSignTrail', x: 708, align: 'ground', parallax: 1.18 },
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
    { id: 'petorFootprints', type: 'hoofSignTrail', x: 108, align: 'ground', parallax: 0.9 },
    { id: 'petorCampfire', type: 'nightCampfire', x: 236, align: 'ground', parallax: 0.92 },
    { id: 'petorEnvoyNorth', type: 'envoyShadow', x: 156, align: 'ground', parallax: 0.96 },
    { id: 'petorEnvoyEast', type: 'envoyShadow', x: 316, align: 'ground', parallax: 0.96 },
    { id: 'petorEnvoySouth', type: 'envoyShadow', x: 472, align: 'ground', parallax: 0.96 },
    { id: 'petorOffering', type: 'temptationVessel', x: 396, align: 'ground', parallax: 1.04 },
  ],
};

const BORDER_SCENE = {
  ambience: 'marketBazaar',
  wizardStartX: 72,
  donkeyOffset: -38,
  props: [
    { id: 'borderBackdrop', type: 'borderProcessionPath', x: -36, align: 'ground', parallax: 0.6 },
    { id: 'borderLetterDrift', type: 'resonanceRingDormant', x: 132, align: 'ground', parallax: 0.84 },
    { id: 'borderStone', type: 'borderMilestone', x: 212, align: 'ground', parallax: 0.95 },
    { id: 'borderBush', type: 'borderThorn', x: 332, align: 'ground', parallax: 0.98 },
    { id: 'borderWatchFire', type: 'watchFireDormant', x: 492, align: 'ground', parallax: 1.02 },
    { id: 'borderTrailGlow', type: 'hoofSignTrail', x: 552, align: 'ground', parallax: 1.1 },
  ],
};

const MOAB_RING_TASKS = [
  {
    id: 'moabVisionRingWest',
    prompt: 'Stell dich in den Ring und sprich אור.',
    spells: ['or', 'אור'],
  },
  {
    id: 'moabVisionRingCenter',
    prompt: 'Welche Erinnerung beruhigt die Szene?',
    spells: ['mayim', 'majim', 'mjm', 'מים'],
  },
  {
    id: 'moabVisionRingEast',
    prompt: 'Welches Wort offenbart Balaks Fluester-Befehl?',
    spells: ['qol', 'קול'],
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

  await phaseMoabPrelude(moabProps);
  await phaseMoabVisionRings(moabProps);

  const petorProps = cloneSceneProps(PETOR_SCENE.props);
  await transitionToScene(plan?.learn, PETOR_SCENE, petorProps, 'petor');
  await phaseEnvoyDialogue(petorProps);
  await phaseEnvoyResponses(petorProps);
  await phaseNightVision(petorProps);
  await phaseNightMeditation();
  await phaseMorningRefusal(petorProps);

  await phaseBalakEdict(petorProps);

  const borderProps = cloneSceneProps(BORDER_SCENE.props);
  await transitionToScene(plan?.apply, BORDER_SCENE, borderProps, 'border');
  await phaseBorderStations(borderProps);
  await phaseWatchFire(borderProps);

  await narratorSay('Die neuen Fuersten reiten voraus. Es geht nach Moab.');
  await donkeySay('Bewahre das Nein – Balak wird es pruefen.');
  await fadeToBlack(720);
}

async function phaseMoabPrelude(props) {
  const balak = props.find(entry => entry.id === 'balakWallFigure');
  const targetX = balak ? balak.x - 42 : wizard.x + 220;
  if (targetX > wizard.x + 16) {
    await waitForWizardToReach(targetX, { tolerance: 22 });
  }
  await narratorSay('Danach lagerten sich die Israeliten in den Steppen Moabs, gegenueber Jericho. Und Balak sah alles, was Israel den Amoritern angetan hatte.');
  await propSay(props, 'balakWallFigure', 'Sieh nur, sie bedecken das ganze Land... Wenn sie weitergehen, bleibt nur Staub.');
  await propSay(props, 'midianElder', 'Es gibt einen Seher jenseits des Flusses. Was er spricht, geschieht – als folge die Welt seiner Stimme.');
  await propSay(props, 'balakWallFigure', 'Dann ruft ihn. Vielleicht kann er das Muster wenden, bevor alles ausgelöscht ist.');
  await narratorSay('Unter den Mauern flimmert die Welt, als waere sie nur halb aus Klang gewebt.');
}

async function phaseMoabVisionRings(props) {
  await narratorSay('Die Waechter blicken nach Osten. Drei sandgluehende Aussichtsringe warten auf deine Worte.');
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
        applyMoabRingEffect(props, task.id);
        addProp(props, { id: `${task.id}Trail`, type: 'hoofSignTrail', x: wizard.x + 12, y: wizard.y - 16, parallax: 1.05 });
      } else {
        await donkeySay('Nutze, was du bereits gelernt hast.');
      }
    }
  }
  await narratorSay('Die Ringe glimmen weiter. Balaks Gesandte reiten nach Petor.');
}

async function phaseEnvoyDialogue(props) {
  await narratorSay('Petor, am Euphrat. Ein stilles Feuer lodert, Lichtlinien laufen unter dem Sand.');
  await propSay(props, 'petorEnvoyNorth', 'Siehe, ein Volk ist aus Aegypten gezogen, es bedeckt das ganze Land und lagert uns gegenueber.');
  await propSay(props, 'petorEnvoyEast', 'So komm nun und verfluche mir dieses Volk, denn es ist mir zu maechtig.');
  await propSay(props, 'petorEnvoySouth', 'Denn wir wissen: Wen du segnest, der ist gesegnet, und wen du verfluchst, der ist verflucht.');
  await wizardSay('Bleibt hier ueber Nacht. Ich will hoeren, was der HERR mir sagt.');
  await narratorSay('Ziel: Warte auf die Stimme in der Nacht. Neues Lernwort verfuegbar: lo (לא) – nicht, nein.');
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
  await narratorSay('Dunkelheit senkt sich. Nur das Flackern des Feuers und ein Rauschen, als atme die Welt selbst.');
  await narratorSay('Gottes Stimme: „Wer sind die Maenner, die bei dir sind?“');
  await wizardSay('Balak, Sohn Zippors, hat mich gerufen, zu verfluchen ein Volk, das das Land bedeckt.');
  await narratorSay('Gott: „Geh nicht mit ihnen. Verfluche das Volk nicht – denn es ist gesegnet.“');

  let attempts = 0;
  while (true) {
    const answer = await readWord('Das Wort formt sich: sprich לא (lo).');
    if (spellEquals(answer, 'lo', 'לא')) {
      await celebrateGlyph(answer);
      addProp(props, { id: 'petorGlyphComplete', type: 'noGlyphShard', x: wizard.x + 20, y: wizard.y - 48, parallax: 0.9, letter: 'לא' });
      await narratorSay('Systemmeldung: Neues Wort gelernt: lo – das Nein, das die Welt zusammenhaelt.');
      await narratorSay('Innere Stimme: Das Nein hallt nach. In seinem Echo hoere ich den Raum zwischen den Dingen – das Unsichtbare, das doch alles traegt.');
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
  await narratorSay('Der Morgen graut. Geschenke in Lichtgefaessen warten, waehrend Balaks Stimme Ehre und Gold verheisst.');
  await wizardSay('Geht hin in euer Land. Der HERR wills nicht gestatten, dass ich mit euch ziehe.');

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
  await narratorSay('Die Fuersten verbeugen sich, reiten ab. Ein mattes Flackern liegt ueber der Steppe.');
}

async function phaseBalakEdict(props) {
  await narratorSay('Balaks Palast. Goldene Linien fliessen ueber die Waende, doch sie flackern unruhig.');
  const balakId = 'palaceBalakEcho';
  addProp(props, { id: balakId, type: 'balakFigure', x: wizard.x + 160, align: 'ground', parallax: 0.96 });
  await propSay(props, balakId, 'Dann sendet mehr. Staerkere Maenner.');
  await propSay(props, balakId, 'Gebt ihm Gold, und sagt: Der Koenig wird ihn ehren.');
  await narratorSay('So sandte Balak noch maechtigere Fuersten, und mit ihnen begann der Weg, der zur Grenze fuehrt.');
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

function applyMoabRingEffect(props, taskId) {
  switch (taskId) {
    case 'moabVisionRingWest':
      ensurePropDefinition(props, {
        id: 'moabVistaLight',
        type: 'sunStoneAwakened',
        x: 684,
        align: 'ground',
        parallax: 1.14,
      });
      break;
    case 'moabVisionRingCenter':
      ensurePropDefinition(props, {
        id: 'moabVistaWater',
        type: 'waterGlyph',
        x: 640,
        align: 'ground',
        parallax: 1.1,
      });
      break;
    case 'moabVisionRingEast':
      ensurePropDefinition(props, {
        id: 'moabVistaSound',
        type: 'soundGlyph',
        x: 604,
        align: 'ground',
        parallax: 1.06,
      });
      break;
    default:
      break;
  }
}

function ensurePropDefinition(list, definition) {
  if (!definition?.id) return;
  const existing = list.find(entry => entry.id === definition.id);
  if (existing) {
    updateProp(list, definition.id, definition);
  } else {
    addProp(list, definition);
  }
}
