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
  wizard,
  applySceneConfig,
  cloneSceneProps,
  addProp,
  updateProp,
  celebrateGlyph,
  propSay,
  withCameraFocusOnProp,
  sleep,
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

const ENVOY_SEQUENCE = [
  {
    id: 'petorEnvoyNorth',
    word: 'aor',
    glyph: 'אור',
    fragment: 'ל',
    description: 'Das Licht der Erinnerung erhellt die Gesichter der Gesandten und legt ihre Angst offen.',
    effect: props => ensurePropDefinition(props, {
      id: 'petorEnvoyNorthLight',
      type: 'sunStoneAwakened',
      x: 156,
      align: 'ground',
      parallax: 0.96,
    }),
  },
  {
    id: 'petorEnvoyEast',
    word: 'mayim',
    glyph: 'מים',
    fragment: 'א',
    description: 'Tau legt sich auf die Zaumzeuge, die Pferde atmen ruhig.',
    effect: props => ensurePropDefinition(props, {
      id: 'petorEnvoyEastWater',
      type: 'waterGlyph',
      x: 316,
      align: 'ground',
      parallax: 0.96,
    }),
  },
  {
    id: 'petorEnvoySouth',
    word: 'qol',
    glyph: 'קול',
    description: 'Die Luft vibriert; Balaks Versprechen hallt als fernes Echo.',
    effect: props => ensurePropDefinition(props, {
      id: 'petorEnvoySouthSound',
      type: 'soundGlyph',
      x: 472,
      align: 'ground',
      parallax: 0.96,
    }),
  },
];

const BORDER_SEQUENCE = [
  {
    id: 'borderStone',
    word: 'lo',
    glyph: 'לא',
    description: 'Der Schriftstein fordert ein Nein; dein Wort zerfaellt Balaks Befehl zu Staub.',
    effect: props => ensurePropDefinition(props, {
      id: 'borderStoneGlyph',
      type: 'soundGlyph',
      x: 212,
      align: 'ground',
      parallax: 0.95,
    }),
  },
  {
    id: 'borderBush',
    word: 'mayim',
    glyph: 'מים',
    description: 'Tau glaenzt auf den Dornen, die Eselin kann passieren.',
    effect: props => ensurePropDefinition(props, {
      id: 'borderBushDew',
      type: 'waterGlyph',
      x: 332,
      align: 'ground',
      parallax: 0.98,
    }),
  },
];

export async function runLevelSix() {
  const plan = levelAmbiencePlan.level6;

  const moabProps = cloneSceneProps(MOAB_APPROACH_SCENE.props);
  applySceneConfig({ ...MOAB_APPROACH_SCENE, props: moabProps });
  ensureAmbience(plan?.review ?? MOAB_APPROACH_SCENE.ambience ?? 'marketBazaar');
  setSceneContext({ level: 'level6', phase: 'approach' });
  await showLevelTitle('Level 6 - Der Ruf des Königs');
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
  await donkeySay('Er lernt, zu hoeren, was man nicht sagen darf.');
  await donkeySay('Wer das Nein versteht, haelt den ersten Faden des Himmels in der Hand.');
  await fadeToBlack(720);
}

async function phaseMoabPrelude(props) {
  await withCameraFocusOnProp(props, 'balakWallFigure', async () => {
    await narratorSay('Danach lagerten sich die Israeliten in den Steppen Moabs, gegenueber Jericho.');
    await narratorSay('Und Balak, der Sohn Zippors, sah alles, was Israel den Amoritern angetan hatte.');
    await narratorSay('Und die Moabiter fuerchteten sich sehr, denn das Volk war gross, und ihnen graute vor den Israeliten.');
    await propSay(props, 'balakWallFigure', 'Sieh nur, sie bedecken das ganze Land...');
    await propSay(props, 'balakWallFigure', 'Wenn sie weitergehen, bleibt nur Staub.');
    await propSay(props, 'balakWallFigure', 'Wie ein Tier, das das Gras des Feldes frisst, so werden sie uns verzehren.');
    await propSay(props, 'midianElder', 'Es gibt einen Seher jenseits des Flusses. Was er spricht, geschieht – als folge die Welt seiner Stimme.');
    await propSay(props, 'balakWallFigure', 'Dann ruft ihn. Vielleicht kann er das Muster wenden, bevor alles ausgelöscht ist.');
    await narratorSay('Unter den Mauern flimmert die Welt, als waere sie nur halb aus Klang gewebt.');

    const balakProp = props.find(entry => entry.id === 'balakWallFigure');
    const startX = balakProp?.x ?? wizard.x + 220;
    const meetingX = startX - 120;
    await movePropHorizontally(props, 'balakWallFigure', meetingX, { duration: 1200, steps: 6 });
    await narratorSay('Balak steigt von der Mauer herab und kommt dir entgegen.');
  });

  const balakAfter = props.find(entry => entry.id === 'balakWallFigure');
  const targetX = balakAfter ? (balakAfter.x ?? wizard.x + 220) - 42 : wizard.x + 220;
  if (targetX > wizard.x + 16) {
    await waitForWizardToReach(targetX, { tolerance: 22 });
  }
}

async function phaseMoabVisionRings(props) {
  await narratorSay('Balaks Waechter blicken nach Osten. Drei sandgluehende Aussichtsringe warten auf deine Worte.');
  await showLevelTitle('Spielhinweis: Besuche die drei Ringe (links, Mitte, rechts).', 3800);
  const ringOrder = [
    { id: 'moabVisionRingWest', word: 'aor', glyph: 'אור' },
    { id: 'moabVisionRingCenter', word: 'mayim', glyph: 'מים' },
    { id: 'moabVisionRingEast', word: 'qol', glyph: 'קול' },
  ];

  for (const ring of ringOrder) {
    const target = props.find(entry => entry.id === ring.id)?.x ?? wizard.x + 120;
    await waitForWizardToReach(target, { tolerance: 18 });
    updateProp(props, ring.id, { type: 'sandVisionRingActive' });
    await celebrateGlyph(ring.glyph);
    applyMoabRingEffect(props, ring.id);
    addProp(props, {
      id: `${ring.id}Trail`,
      type: 'hoofSignTrail',
      x: wizard.x + 12,
      y: wizard.y - 16,
      parallax: 1.05,
    });
  }

  await narratorSay('Die glimmenden Ringe halten dein Nein im Sand. Balaks Gesandte reiten nach Petor.');
}

async function phaseEnvoyDialogue(props) {
  await narratorSay('Petor, am Euphrat. Ein stilles Feuer lodert, Lichtlinien laufen unter dem Sand.');
  await propSay(props, 'petorEnvoyNorth', 'Siehe, ein Volk ist aus Aegypten gezogen, es bedeckt das ganze Land und lagert uns gegenueber.');
  await propSay(props, 'petorEnvoyEast', 'So komm nun und verfluche mir dieses Volk, denn es ist mir zu maechtig.');
  await propSay(props, 'petorEnvoySouth', 'Denn wir wissen: Wen du segnest, der ist gesegnet, und wen du verfluchst, der ist verflucht.');
  await wizardSay('Bleibt hier ueber Nacht. Ich will hoeren, was der HERR mir sagt.');
  ensurePropDefinition(props, {
    id: 'petorNightSignal',
    type: 'resonanceRingDormant',
    x: 236,
    align: 'ground',
    parallax: 0.9,
  });
  await showLevelTitle('Ziel: Warte auf die Stimme in der Nacht.', 4200);
}

async function phaseEnvoyResponses(props) {
  setSceneContext({ phase: 'envoys' });
  const collected = [];
  await showLevelTitle('Spielphase I – Spur der Gesandten', 3600);
  for (const step of ENVOY_SEQUENCE) {
    const target = props.find(entry => entry.id === step.id)?.x ?? wizard.x + 160;
    await waitForWizardToReach(target, { tolerance: 18 });
    await celebrateGlyph(step.glyph);
    if (typeof step.effect === 'function') {
      step.effect(props);
    }
    if (step.fragment) {
      collected.push(step.fragment);
      addProp(props, {
        id: `petorFragment${step.fragment}`,
        type: 'noGlyphShard',
        x: wizard.x + 16 + collected.length * 6,
        y: wizard.y - 42 - collected.length * 2,
        parallax: 0.92,
        letter: step.fragment,
      });
    }
    await narratorSay(step.description);
  }
  await narratorSay('Die Fragmente ל und א schweben ueber deiner Hand. Ein neues Wort wartet.');
}

async function phaseNightVision(props) {
  setSceneContext({ phase: 'night' });
  await narratorSay('Dunkelheit senkt sich. Nur das Flackern des Feuers und ein Rauschen, als atme die Welt selbst.');
  await narratorSay('Gottes Stimme: „Wer sind die Maenner, die bei dir sind?“');
  await wizardSay('Balak, Sohn Zippors, hat mich gerufen, zu verfluchen ein Volk, das das Land bedeckt.');
  await narratorSay('Gott: „Geh nicht mit ihnen. Verfluche das Volk nicht – denn es ist gesegnet.“');

  await celebrateGlyph('לא');
  addProp(props, { id: 'petorGlyphComplete', type: 'noGlyphShard', x: wizard.x + 20, y: wizard.y - 48, parallax: 0.9, letter: 'לא' });
  await showLevelTitle('Neues Wort gelernt: לא (lo) – das Nein, das die Welt zusammenhaelt.', 3600);
  await narratorSay('Innere Stimme: Das Nein hallt nach. In seinem Echo hoere ich den Raum zwischen den Dingen – das Unsichtbare, das doch alles traegt.');
}

async function phaseNightMeditation() {
  setSceneContext({ phase: 'meditation' });
  await showLevelTitle('Spielphase II – Nacht der Stille', 3600);
  await narratorSay('Ein Hoerkreis aus Licht erscheint um dich.');
  await narratorSay('Schatten aus Balaks Palast greifen nach dir, doch das Nein, das du gelernt hast, haelt den Kreis dreimal lang.');
  await narratorSay('Der Kreis schliesst sich. Der Atem der Nacht wird ruhig.');
}

async function phaseMorningRefusal(props) {
  setSceneContext({ phase: 'morning' });
  addProp(props, { id: 'petorGift', type: 'temptationVessel', x: wizard.x + 42, align: 'ground', parallax: 1.02 });
  await narratorSay('Der Morgen graut. Geschenke in Lichtgefaessen warten, waehrend Balaks Stimme Ehre und Gold verheisst.');
  await wizardSay('Geht hin in euer Land. Der HERR wills nicht gestatten, dass ich mit euch ziehe.');
  await celebrateGlyph('לא');
  updateProp(props, 'petorGift', { type: 'temptationVesselAshes' });
  await narratorSay('Die Gabe verglimmt zu Staub.');
  await narratorSay('Die Fuersten verbeugen sich, reiten ab. Ueber der Steppe liegt wieder jenes matte Flackern, als sei der Himmel nur ein duennes Tuch.');
  await narratorSay('So kehrten die Fuersten zu Balak zurueck und sprachen: „Bileam weigert sich, mit uns zu ziehen.“');
}

async function phaseBalakEdict(props) {
  await narratorSay('Balaks Palast. Goldene Linien fliessen ueber die Waende, doch sie flackern unruhig.');
  const balakId = 'palaceBalakEcho';
  addProp(props, { id: balakId, type: 'balakFigure', x: wizard.x + 160, align: 'ground', parallax: 0.96 });
  await propSay(props, balakId, 'Dann sendet mehr. Staerkere Maenner.');
  await propSay(props, balakId, 'Vielleicht laesst er sich doch bewegen.');
  await propSay(props, balakId, 'Gebt ihm Gold, und sagt: Der König wird ihn ehren.');
  await narratorSay('So sandte Balak noch maechtigere Fuersten, und mit ihnen begann der Weg, der zur Grenze fuehrt.');
}

async function phaseBorderStations(props) {
  setSceneContext({ phase: 'border' });
  await narratorSay('Der Weg nach Moab fuehrt entlang einer Grenze voller Schrift.');
  await showLevelTitle('Spielphase IV – Aufbruch entlang der Grenze', 3600);

  for (const step of BORDER_SEQUENCE) {
    const target = props.find(entry => entry.id === step.id)?.x ?? wizard.x + 160;
    await waitForWizardToReach(target, { tolerance: 18 });
    await celebrateGlyph(step.glyph);
    if (typeof step.effect === 'function') {
      step.effect(props);
    }
    await narratorSay(step.description);
  }
}

async function phaseWatchFire(props) {
  const fire = props.find(entry => entry.id === 'borderWatchFire');
  const target = fire ? fire.x + 18 : wizard.x + 260;
  await waitForWizardToReach(target, { tolerance: 18 });

  updateProp(props, 'borderWatchFire', { type: 'watchFireAwakened' });
  await celebrateGlyph('אור');
  await narratorSay('Ein heller Schein offenbart den Pfad.');
  ensurePropDefinition(props, {
    id: 'borderWatchFireAura',
    type: 'sunStoneAwakened',
    x: fire?.x ?? wizard.x + 12,
    align: 'ground',
    parallax: 1.02,
  });

  updateProp(props, 'borderWatchFire', { type: 'watchFireVeiled' });
  await celebrateGlyph('לא');
  await narratorSay('Du sprichst das Nein: der Pfad verschwindet vor Balaks Augen.');
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

async function movePropHorizontally(props, id, targetX, { duration = 900, steps = 6 } = {}) {
  if (!Array.isArray(props)) return;
  const prop = props.find(entry => entry.id === id);
  if (!prop) return;
  const startX = prop.x ?? 0;
  const distance = targetX - startX;
  if (Math.abs(distance) < 1) {
    updateProp(props, id, { x: targetX });
    return;
  }
  const clampedSteps = Math.max(1, steps);
  const stepDuration = duration > 0 ? duration / clampedSteps : 0;
  for (let index = 1; index <= clampedSteps; index += 1) {
    const progress = index / clampedSteps;
    const nextX = startX + distance * progress;
    updateProp(props, id, { x: nextX });
    if (index < clampedSteps) {
      await sleep(stepDuration);
    }
  }
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
