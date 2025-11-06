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
  divineSay,
  withCameraFocusOnProp,
  sleep,
} from './utils.js';

const MOAB_APPROACH_SCENE = {
  ambience: 'marketBazaar',
  wizardStartX: 74,
  donkeyOffset: -38,
  props: [
    { id: 'moabStallWest', type: 'marketStall', x: 214, align: 'ground', parallax: 0.9, layer: 0 },
    { id: 'moabStallEast', type: 'marketStall', x: 388, align: 'ground', parallax: 0.96, layer: 0 },
    { id: 'moabScribeBooth', type: 'scribeBooth', x: 536, align: 'ground', parallax: 1.04, layer: 1 },
    { id: 'moabGrainBundle', type: 'gardenWheatBundle', x: 268, align: 'ground', parallax: 1.06, layer: 2 },
    { id: 'moabWatcherNorth', type: 'moabWallWatcher', x: 156, align: 'ground', parallax: 0.88 },
    { id: 'moabWatcherSouth', type: 'moabWallWatcher', x: 492, align: 'ground', parallax: 1.06 },
    { id: 'balakWallFigure', type: 'balakFigure', x: 628, align: 'ground', parallax: 1.12 },
    { id: 'balakAdvisor', type: 'balakAdvisor', x: 586, align: 'ground', parallax: 1.08 },
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
    { id: 'petorBackdrop', type: 'marketBackdrop', x: -140, align: 'ground', parallax: 0.26, layer: -4 },
    { id: 'petorMist', type: 'canyonMist', x: -16, align: 'ground', offsetY: -52, parallax: 0.5, layer: -2 },
    { id: 'petorSunStone', type: 'sunStoneDormant', x: 284, align: 'ground', parallax: 0.9, layer: 0 },
    { id: 'petorResonanceRock', type: 'resonanceRockDormant', x: 436, align: 'ground', parallax: 0.94, layer: 0 },
    { id: 'petorForegroundHerb', type: 'gardenForegroundPlant', x: 92, align: 'ground', parallax: 1.08, layer: 2 },
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
    { id: 'borderBackdropHaze', type: 'marketBackdrop', x: -168, align: 'ground', parallax: 0.24, layer: -4 },
    { id: 'borderMist', type: 'canyonMist', x: 12, align: 'ground', offsetY: -48, parallax: 0.52, layer: -3 },
    { id: 'borderSpireTall', type: 'basaltSpireTall', x: 126, align: 'ground', parallax: 0.68, layer: -1 },
    { id: 'borderSpireShort', type: 'basaltSpireShort', x: 388, align: 'ground', parallax: 0.82, layer: -1 },
    { id: 'borderSunStone', type: 'sunStoneDormant', x: 356, align: 'ground', parallax: 0.96, layer: 0 },
    { id: 'borderForegroundVine', type: 'gardenForegroundPlant', x: 548, align: 'ground', parallax: 1.12, layer: 2 },
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
    description: 'Der Schriftstein fordert ein Nein; dein Wort zerfällt Balaks Befehl zu Staub.',
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
    description: 'Tau glänzt auf den Dornen, die Eselin kann passieren.',
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

  await narratorSay('Die neuen Fürsten reiten voraus. Es geht nach Moab.');
  await donkeySay('Er lernt, zu hören, was man nicht sagen darf.');
  await donkeySay('Wer das Nein versteht, hält den ersten Faden des Himmels in der Hand.');
  await fadeToBlack(720);
}

async function phaseMoabPrelude(props) {
  await withCameraFocusOnProp(props, 'balakWallFigure', async () => {
    await narratorSay('Danach lagerten sich die Israeliten in den Steppen Moabs, gegenüber Jericho.');
    await narratorSay('Und Balak, der Sohn Zippors, sah alles, was Israel den Amoritern angetan hatte.');
    await narratorSay('Und die Moabiter fürchteten sich sehr, denn das Volk war groß, und ihnen graute vor den Israeliten.');
    await propSay(props, 'balakWallFigure', 'Sieh nur, sie bedecken das ganze Land...', { anchor: 'center', offsetX: -12 });
    await propSay(props, 'balakWallFigure', 'Wenn sie weitergehen, bleibt nur Staub.', { anchor: 'center', offsetX: -12 });
    await propSay(props, 'balakWallFigure', 'Wie ein Tier, das das Gras des Feldes frisst, so werden sie uns verzehren.', { anchor: 'center', offsetX: -12 });
    await propSay(props, 'balakAdvisor', 'Es gibt einen Seher jenseits des Flusses. Was er spricht, geschieht – als folge die Welt seiner Stimme.', { anchor: 'center', offsetY: -34 });
    await propSay(props, 'balakWallFigure', 'Dann ruft ihn. Vielleicht kann er das Muster wenden, bevor alles ausgelöscht ist.', { anchor: 'center', offsetX: -12 });
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
  await narratorSay('Balaks Wächter blicken nach Osten. Drei sandglühende Aussichtsringe warten auf deine Worte.');
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

  await narratorSay('Die glimmenden Ringe behalten dein Licht im Sand. Balaks Gesandte reiten nach Petor.');
}

async function phaseEnvoyDialogue(props) {
  await narratorSay('Petor, am Euphrat. Ein stilles Feuer lodert, Lichtlinien laufen unter dem Sand.');
  const envoy = props.find(entry => entry.id === 'petorEnvoyNorth');
  if (envoy) {
    const meetingX = envoy.x - 36;
    if (meetingX > wizard.x + 12) {
      await waitForWizardToReach(meetingX, { tolerance: 18 });
    }
  }
  await propSay(props, 'petorEnvoyNorth', 'Siehe, ein Volk ist aus Ägypten gezogen, es bedeckt das ganze Land und lagert uns gegenüber.', { anchor: 'center' });
  await propSay(props, 'petorEnvoyEast', 'So komm nun und verfluche mir dieses Volk, denn es ist mir zu mächtig.', { anchor: 'center' });
  await propSay(props, 'petorEnvoySouth', 'Denn wir wissen: Wen du segnest, der ist gesegnet, und wen du verfluchst, der ist verflucht.', { anchor: 'center' });
  await wizardSay('Bleibt hier über Nacht. Ich will hören, was der HERR mir sagt.');
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
  await narratorSay('Die Fragmente ל und א schweben über deiner Hand. Ein neues Wort wartet.');
}

async function phaseNightVision(props) {
  setSceneContext({ phase: 'night' });
  await narratorSay('Dunkelheit senkt sich. Nur das Flackern des Feuers und ein Rauschen, als atme die Welt selbst.');
  await divineSay('מי האנשים האלה עמך\nWer sind die Männer, die bei dir sind?');
  await wizardSay('Balak, Sohn Zippors, hat mich gerufen, zu verfluchen ein Volk, das das Land bedeckt.');
  await divineSay('לא תלך עמהם לא תאר את העם כי ברוך הוא\nGeh nicht mit ihnen. Verfluche das Volk nicht – denn es ist gesegnet.');

  await celebrateGlyph('לא');
  addProp(props, { id: 'petorGlyphComplete', type: 'noGlyphShard', x: wizard.x + 20, y: wizard.y - 48, parallax: 0.9, letter: 'לא' });
  await showLevelTitle('Neues Wort gelernt: לא (lo) – das Nein, das die Welt zusammenhält.', 3600);
  await narratorSay('Innere Stimme: Das Nein hallt nach. In seinem Echo höre ich den Raum zwischen den Dingen – das Unsichtbare, das doch alles trägt.');
}

async function phaseNightMeditation() {
  setSceneContext({ phase: 'meditation' });
  await showLevelTitle('Spielphase II – Nacht der Stille', 3600);
  await showLevelTitle('Ein Hörkreis aus Licht erscheint um dich.', 3200);
  await narratorSay('Schatten aus Balaks Palast greifen nach dir, doch das Nein, das du gelernt hast, hält den Kreis dreimal lang.');
  await narratorSay('Der Kreis schliesst sich. Der Atem der Nacht wird ruhig.');
}

async function phaseMorningRefusal(props) {
  setSceneContext({ phase: 'morning' });
  addProp(props, { id: 'petorGift', type: 'temptationVessel', x: wizard.x + 42, align: 'ground', parallax: 1.02 });
  await narratorSay('Der Morgen graut. Geschenke in Lichtgefäßen warten, während Balaks Stimme Ehre und Gold verheisst.');
  await wizardSay('Geht hin in euer Land. Der HERR wills nicht gestatten, dass ich mit euch ziehe.');
  await celebrateGlyph('לא');
  updateProp(props, 'petorGift', { type: 'temptationVesselAshes' });
  await narratorSay('Die Gabe verglimmt zu Staub.');
  await narratorSay('Die Fürsten verbeugen sich, reiten ab. Über der Steppe liegt wieder jenes matte Flackern, als sei der Himmel nur ein duennes Tuch.');
  await narratorSay('So kehrten die Fürsten zu Balak zurück und sprachen: „Bileam weigert sich, mit uns zu ziehen.“');
}

async function phaseBalakEdict(props) {
  await withCameraFocusOnProp(props, 'palaceBalakEcho', async () => {
    await showLevelTitle('Balaks Palast. Goldene Linien fließen über die Wände, doch sie flackern unruhig.', 3600);
    const balakId = 'palaceBalakEcho';
    addProp(props, { id: balakId, type: 'balakFigure', x: wizard.x + 160, align: 'ground', parallax: 0.96 });
    await propSay(props, balakId, 'Dann sendet mehr. Stärkere Männer.', { anchor: 'center', offsetY: -32 });
    await propSay(props, balakId, 'Vielleicht lässt er sich doch bewegen.', { anchor: 'center', offsetY: -32 });
    await propSay(props, balakId, 'Gebt ihm Gold, und sagt: Der König wird ihn ehren.', { anchor: 'center', offsetY: -32 });
  });
  await narratorSay('So sandte Balak noch mächtigere Fürsten, und mit ihnen begann der Weg, der zur Grenze führt.');
}

async function phaseBorderStations(props) {
  setSceneContext({ phase: 'border' });
  await narratorSay('Der Weg nach Moab führt entlang einer Grenze voller Schrift.');
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
