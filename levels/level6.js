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
  getCurrentAmbienceKey,
  promptBubble,
} from '../scene.js';
import {
  narratorSay,
  wizardSay,
  donkeySay,
  anchorX,
  anchorY,
  wizard,
  donkey,
  applySceneConfig,
  cloneSceneProps,
  addProp,
  updateProp,
  celebrateGlyph,
  propSay,
  divineSay,
  withCameraFocus,
  withCameraFocusOnProp,
  sleep,
  switchMusic,
  spellEquals,
  showLocationSign,
  findProp,
} from './utils.js';

const BALAK_WALK_SPEED = 26;

const MOAB_APPROACH_SCENE = {
  ambience: 'marketBazaar',
  wizardStartX: 74,
  donkeyOffset: -38,
  groundProfile: {
    height: 32,
    segments: [
      { end: 340, height: 32, type: 'sand' },
      { start: 340, end: 420, height: 28, type: 'sand' },
      { start: 420, end: 520, height: 20, type: 'sand' },
      { start: 520, height: 14, type: 'sand' },
    ],
  },
  props: [
    { id: 'moabStallWest', type: 'marketStall', x: 214, align: 'ground', parallax: 0.9, layer: 0 },
    { id: 'moabStallEast', type: 'marketStall', x: 388, align: 'ground', parallax: 0.96, layer: 0 },
    { id: 'moabScribeBooth', type: 'scribeBooth', x: 536, align: 'ground', parallax: 1.04, layer: 1 },
    { id: 'moabGrainBundle', type: 'gardenWheatBundle', x: 268, align: 'ground', parallax: 1.06, layer: 2 },
    { id: 'moabWatcherNorth', type: 'moabWallWatcher', x: 146, align: 'ground', parallax: 0.88 },
    { id: 'moabWatcherSouth', type: 'moabWallWatcher', x: 362, align: 'ground', parallax: 1.02 },
    { id: 'balakWallFigure', type: 'balakFigure', x: 184, align: 'ground', parallax: 1.06 },
    { id: 'balakAdvisor', type: 'balakAdvisor', x: 142, align: 'ground', parallax: 1.02 },
    { id: 'israelCampGlow', type: 'hoofSignTrail', x: 708, align: 'ground', offsetY: 36, parallax: 1.18, layer: -1 },
    { id: 'israelCentralCanopy', type: 'campTentCanopy', x: 648, align: 'ground', offsetY: 28, parallax: 1, layer: -1 },
    { id: 'israelCentralCluster', type: 'campTentCluster', x: 708, align: 'ground', offsetY: 32, parallax: 1.04, layer: -1 },
    { id: 'israelTentOne', type: 'campTent', x: 600, align: 'ground', offsetY: 34, parallax: 1.08, layer: -1 },
    { id: 'israelTentThree', type: 'campTent', x: 760, align: 'ground', offsetY: 40, parallax: 1.16, layer: -1 },
    { id: 'israelTentOuterWest', type: 'campTent', x: 640, align: 'ground', offsetY: 40, parallax: 1.14, layer: -2 },
    { id: 'israelTentOuterEast', type: 'campTent', x: 700, align: 'ground', offsetY: 42, parallax: 1.18, layer: -2 },
    { id: 'israelTentFarWest', type: 'campTent', x: 760, align: 'ground', offsetY: 44, parallax: 1.22, layer: -2 },
    { id: 'israelTentFarEast', type: 'campTent', x: 820, align: 'ground', offsetY: 46, parallax: 1.24, layer: -2 },
    { id: 'moabVisionRingWest', type: 'sandVisionRingDormant', x: 182, align: 'ground', parallax: 1 },
    { id: 'moabVisionRingCenter', type: 'sandVisionRingDormant', x: 326, align: 'ground', parallax: 1 },
    { id: 'moabVisionRingEast', type: 'sandVisionRingDormant', x: 472, align: 'ground', parallax: 1 },
  ],
};

const PETOR_SCENE = {
  ambience: 'marketBazaar',
  wizardStartX: 68,
  donkeyOffset: -40,
  groundProfile: {
    height: 22,
    segments: [
      { end: 260, height: 22, type: 'sand' },
      { start: 260, end: 480, height: 18, type: 'sand' },
      { start: 480, height: 20, type: 'stone' },
    ],
  },
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
  groundProfile: {
    height: 24,
    segments: [
      { end: 300, height: 24, type: 'sand' },
      { start: 300, end: 520, height: 20, type: 'stone' },
      { start: 520, height: 22, type: 'sand' },
    ],
  },
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

const PALACE_SCENE = {
  ambience: 'courtAudience',
  props: [
    { id: 'palaceGlow', type: 'canyonMist', x: -96, align: 'ground', offsetY: -60, parallax: 0.3, layer: -3 },
    { id: 'palaceFloor', type: 'borderProcessionPath', x: -80, align: 'ground', parallax: 0.5, layer: -2 },
    { id: 'palaceBannerWest', type: 'marketBanner', x: -12, align: 'ground', offsetY: -36, parallax: 0.76, layer: -1 },
    { id: 'palaceBannerEast', type: 'marketBanner', x: 188, align: 'ground', offsetY: -36, parallax: 0.78, layer: -1 },
    { id: 'palaceBalakEcho', type: 'balakFigure', x: 112, align: 'ground', parallax: 1, layer: 1 },
    { id: 'palaceAdvisorWest', type: 'balakAdvisor', x: 36, align: 'ground', parallax: 1, layer: 1 },
    { id: 'palaceAdvisorEast', type: 'balakAdvisor', x: 220, align: 'ground', parallax: 1, layer: 1 },
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
  await showLocationSign(moabProps, { id: 'signMoabRampart', x: 148, text: 'Steppen von Moab | ערבות מואב' });
  await showLocationSign(moabProps, { id: 'signIsraelCamp', x: 704, text: 'Lager Israel | מחנה ישראל', offsetY: 36, parallax: 1.16 });
  ensureAmbience(plan?.review ?? MOAB_APPROACH_SCENE.ambience ?? 'marketBazaar');
  setSceneContext({ level: 'level6', phase: 'approach' });
  await showLevelTitle('Level 6 - Der Ruf des Königs');
  await fadeToBase(600);

  await phaseMoabPrelude(moabProps);
  await phaseMoabVisionRings(moabProps);

  const petorProps = cloneSceneProps(PETOR_SCENE.props);
  await transitionToScene(plan?.learn, PETOR_SCENE, petorProps, 'petor');
  await showLocationSign(petorProps, { id: 'signPetor', x: 198, text: 'Petor am Euphrat | פתור' });
  await phaseEnvoyDialogue(petorProps);
  await phaseEnvoyResponses(petorProps);
  await phaseNightVision(petorProps);
  await phaseNightMeditation(petorProps);
  await phaseMorningRefusal(petorProps);

  await phaseBalakEdict(petorProps);

  const borderProps = cloneSceneProps(BORDER_SCENE.props);
  await transitionToScene(plan?.apply, BORDER_SCENE, borderProps, 'border');
  await showLocationSign(borderProps, { id: 'signBorder', x: 208, text: 'Grenze von Moab | גבול מואב' });
  await phaseBorderStations(borderProps);
  await phaseWatchFire(borderProps);

  await donkeySay('Er lernt, zu hören, was man nicht sagen darf.');
  await donkeySay('Wer das Nein versteht, hält den ersten Faden des Himmels in der Hand.');
  await fadeToBlack(720);
}

async function phaseMoabPrelude(props) {
  const savedWizard = { x: wizard.x, y: wizard.y, facing: wizard.facing };
  const savedDonkey = { x: donkey.x, y: donkey.y, facing: donkey.facing };
  wizard.x = -320;
  donkey.x = wizard.x - 40;
  await withCameraFocus(640, async () => {
    await narratorSay('Danach lagerten sich die Israeliten in den Steppen Moabs, gegenüber Jericho.');
  });

  await withCameraFocusOnProp(props, 'israelCentralCanopy', async () => {});

  await withCameraFocusOnProp(props, 'israelCampGlow', async () => {});

  await withCameraFocusOnProp(props, 'moabVisionRingEast', async () => {});

  await withCameraFocusOnProp(props, 'balakWallFigure', async () => {
    await narratorSay('Und Balak, der Sohn Zippors, sah alles, was Israel den Amoritern angetan hatte.');
    await narratorSay('Und die Moabiter fürchteten sich sehr, denn das Volk war groß, und ihnen graute vor den Israeliten.');
    await propSay(props, 'balakWallFigure', 'Sieh nur, sie bedecken das ganze Land...', { anchor: 'center', offsetX: -12 });
    await propSay(props, 'balakWallFigure', 'Wenn sie weitergehen, bleibt nur Staub.', { anchor: 'center', offsetX: -12 });
    await propSay(props, 'balakWallFigure', 'Wie ein Tier, das das Gras des Feldes frisst, so werden sie uns verzehren.', { anchor: 'center', offsetX: -12 });
    await propSay(props, 'balakAdvisor', 'Es gibt einen Seher jenseits des Flusses. Was er spricht, geschieht – als folge die Welt seiner Stimme.', { anchor: 'center', offsetY: -34 });
    await propSay(props, 'balakWallFigure', 'Dann ruft ihn. Vielleicht kann er das Muster wenden, bevor alles ausgelöscht ist.', { anchor: 'center', offsetX: -12 });

    const balakProp = props.find(entry => entry.id === 'balakWallFigure');
    const startX = balakProp?.x ?? wizard.x + 220;
    const meetingX = startX - 120;
    await walkBalakProcession(props, meetingX);
  });

  wizard.x = savedWizard.x;
  wizard.y = savedWizard.y;
  wizard.facing = savedWizard.facing;
  donkey.x = savedDonkey.x;
  donkey.y = savedDonkey.y;
  donkey.facing = savedDonkey.facing;

  const balakAfter = props.find(entry => entry.id === 'balakWallFigure');
  const targetX = balakAfter ? (balakAfter.x ?? wizard.x + 220) - 42 : wizard.x + 220;
  if (targetX > wizard.x + 16) {
    await waitForWizardToReach(targetX, { tolerance: 22 });
  }
}

async function phaseMoabVisionRings() {
  await narratorSay('Balak ruft die Ältesten von Moab und Midian. Er legt ihnen die Worte auf die Lippen: „Siehe, ein Volk ist aus Ägypten gezogen; komm und verfluche es.“');
}

async function phaseEnvoyDialogue(props) {
  await ensureWizardBesideProp(props, 'petorEnvoyNorth');
  await propSay(props, 'balakAdvisorNorth', 'Siehe, ein Volk ist aus Ägypten gezogen, es bedeckt das ganze Land und lagert uns gegenüber.', { anchor: 'center' });
  await ensureWizardBesideProp(props, 'petorEnvoyEast');
  await propSay(props, 'balakAdvisorEast', 'So komm nun und verfluche mir dieses Volk, denn es ist mir zu mächtig.', { anchor: 'center' });
  await ensureWizardBesideProp(props, 'petorEnvoySouth');
  await propSay(props, 'balakAdvisorSouth', 'Denn wir wissen: Wen du segnest, der ist gesegnet, und wen du verfluchst, der ist verflucht.', { anchor: 'center' });
  await propSay(props, 'balakAdvisorNorth', 'Balak sendet Silber, Gold und Ehrengewänder. Alles soll dir gehören, wenn du sprichst, wie er es verlangt.', { anchor: 'center' });
  await wizardSay('Bleibt hier über Nacht. Ich will hören, was יהוה (JHWH – Gott) mir sagt.');
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
  await showLevelTitle('Der Pfad der Gesandten', 3600);
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
  switchMusic('מי האנשים האלה עמך.mp3');
  await fadeToBlack(200);
  await narratorSay('Dunkelheit senkt sich. Nur das Flackern des Feuers und ein Rauschen, als atme die Welt selbst.');
  await fadeToBase(420);
  await divineSay('מי האנשים האלה עמך\nWer sind die Männer, die bei dir sind?');
  await wizardSay('Balak, Sohn Zippors, hat mich gerufen, zu verfluchen ein Volk, das das Land bedeckt.');
  await divineSay('לא תלך עמהם לא תאר את העם כי ברוך הוא\nGeh nicht mit ihnen. Verfluche das Volk nicht – denn es ist gesegnet.');

  await celebrateGlyph('לא', { forceLetter: 'א' });
  addProp(props, { id: 'petorGlyphComplete', type: 'noGlyphShard', x: wizard.x + 20, y: wizard.y - 48, parallax: 0.9, letter: 'לא' });
  await showLevelTitle('Neues Wort gelernt: לא (lo) – das Nein, das die Welt zusammenhält.', 3600);
  await wizardSay('Das Nein hallt nach. In seinem Echo höre ich den Raum zwischen den Dingen – das Unsichtbare, das doch alles trägt.');
  await narratorSay('לא (lo) heißt Nein. אל (el) heißt Gott. Wenn du אל rückwärts liest, kommt לא heraus – ist das nicht lustig?');
}

async function phaseNightMeditation(props) {
  setSceneContext({ phase: 'meditation' });
  await showLevelTitle('Die Nacht der Stille', 3600);
  let ringId = null;
  if (Array.isArray(props)) {
    ringId = 'petorHearingRing';
    addProp(props, { id: ringId, type: 'resonanceRingActive', x: wizard.x - 10, align: 'ground', parallax: 1.04 });
  }
  if (ringId) {
    updateProp(props, ringId, null);
  }
}

async function phaseMorningRefusal(props) {
  setSceneContext({ phase: 'morning' });
  addProp(props, { id: 'petorGift', type: 'temptationVessel', x: wizard.x + 42, align: 'ground', parallax: 1.02 });
  await propSay(props, 'petorEnvoyEast', 'Bileam, der König schwört bei seinem Thron: Er macht dich reich, wenn du nur kommst.', { anchor: 'center' });
  await propSay(props, 'petorEnvoySouth', 'Goldene Schalen, Purpur und Silber – alles liegt bereit. Verweigere uns nicht länger.', { anchor: 'center' });
  await wizardSay('לא. Geht hin in euer Land. יהוה (JHWH – Gott) wills nicht gestatten, dass ich mit euch ziehe.');
  await wizardSay('Selbst wenn Balak mir sein Haus voll Silber und Gold gäbe, würde ich kein Wort יהוהs brechen.');
  await celebrateGlyph('לא');
  updateProp(props, 'petorGift', { type: 'temptationVesselAshes' });
  await narratorSay('Die Gabe verglimmt zu Staub.');
  await narratorSay('Sprich selbst לא, damit sie dein Nein nicht vergessen.');
  const input = await promptBubble(
    anchorX(wizard, -12),
    anchorY(wizard, -64),
    'Sprich לא (lo)',
    anchorX(wizard, -8),
    anchorY(wizard, -36),
  );
  if (!spellEquals(input, 'lo', 'לא')) {
    await donkeySay('Sie gehen nur, wenn du das Nein aussprichst. Versuch es erneut.');
    return phaseMorningRefusal(props);
  }
  await celebrateGlyph('לא');
  await narratorSay('So kehrten die Fürsten zu Balak zurück und sprachen: „Bileam weigert sich, mit uns zu ziehen.“');
}

async function phaseBalakEdict(props) {
  const previousAmbience = getCurrentAmbienceKey();
  const palaceProps = createPalaceSceneProps();
  const savedWizard = { x: wizard.x, y: wizard.y, facing: wizard.facing };
  const savedDonkey = { x: donkey.x, y: donkey.y, facing: donkey.facing };
  wizard.x = -1200;
  donkey.x = wizard.x - 48;

  await fadeToBlack(280);
  setSceneProps(palaceProps);
  ensureAmbience(PALACE_SCENE.ambience);
  setSceneContext({ phase: 'palace' });
  await fadeToBase(420);
  await showLevelTitle('Balaks Palast. Goldene Linien fließen über die Wände, doch sie flackern unruhig.', 3600);

  await withCameraFocusOnProp(palaceProps, 'palaceBalakEcho', async () => {
    await propSay(palaceProps, 'palaceAdvisorWest', 'Er weigert sich, mein Herr. Sein Nein liegt schwer auf unseren Fürsten.', { anchor: 'center', offsetY: -28 });
    await propSay(palaceProps, 'palaceBalakEcho', 'Dann sendet mehr. Stärkere Männer.', { anchor: 'center', offsetY: -34 });
    await propSay(palaceProps, 'palaceAdvisorEast', 'Wir bringen Truhen voller Gold und Purpur, doch seine Rede bleibt wie Stein.', { anchor: 'center', offsetY: -28 });
    await propSay(palaceProps, 'palaceBalakEcho', 'Füllt mehr Truhen. Gebt ihm Gold, und sagt: Der König wird ihn ehren.', { anchor: 'center', offsetY: -34 });
  });

  await fadeToBlack(260);
  setSceneProps(props);
  ensureAmbience(previousAmbience ?? MOAB_APPROACH_SCENE.ambience ?? 'marketBazaar');
  setSceneContext({ phase: 'morning' });
  wizard.x = savedWizard.x;
  wizard.y = savedWizard.y;
  wizard.facing = savedWizard.facing;
  donkey.x = savedDonkey.x;
  donkey.y = savedDonkey.y;
  donkey.facing = savedDonkey.facing;
  await fadeToBase(360);

  await narratorSay('So sandte Balak noch mächtigere Fürsten, und mit ihnen begann der Weg, der zur Grenze führt.');
}

async function phaseBorderStations(props) {
  setSceneContext({ phase: 'border' });
  await showLevelTitle('Grenzweg der Schrift', 3600);

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

function walkBalakProcession(props, targetX, options = {}) {
  if (!Array.isArray(props)) return Promise.resolve();
  const balak = findProp(props, 'balakWallFigure');
  if (!balak) return Promise.resolve();
  const { minSpacing = 0, speed = BALAK_WALK_SPEED, duration } = options;
  let finalX = Number.isFinite(targetX) ? targetX : balak.x ?? 0;
  if (Number.isFinite(minSpacing)) {
    finalX = Math.max(finalX, wizard.x + minSpacing);
  }
  finalX = Math.round(finalX);
  const startX = balak.x ?? 0;
  if (!Number.isFinite(finalX)) {
    return Promise.resolve();
  }
  if (Math.abs(finalX - startX) < 2) {
    updateProp(props, 'balakWallFigure', { x: finalX });
    return Promise.resolve();
  }
  const distance = finalX - startX;
  let travelDuration = duration;
  if (!Number.isFinite(travelDuration) || travelDuration <= 0) {
    const computed = Math.abs(distance) / Math.max(1, speed) * 1000;
    travelDuration = Math.max(420, Math.round(computed));
  }
  return new Promise(resolve => {
    const begin = performance.now();
    const step = now => {
      const t = Math.min(1, (now - begin) / Math.max(1, travelDuration));
      const current = Math.round(startX + distance * t);
      updateProp(props, 'balakWallFigure', { x: current });
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
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

async function ensureWizardBesideProp(props, id, options = {}) {
  const prop = Array.isArray(props) ? props.find(entry => entry.id === id) : null;
  if (!prop) return;
  const tolerance = Math.max(6, options.tolerance ?? 16);
  const offset = options.offset ?? -24;
  const meetingX = (prop.x ?? wizard.x) + offset;
  await waitForWizardToReach(meetingX, { tolerance });
}

function createPalaceSceneProps() {
  return cloneSceneProps(PALACE_SCENE.props);
}
