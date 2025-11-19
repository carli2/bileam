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
  normalizeHebrewInput,
  applySceneConfig,
  cloneSceneProps,
  spellEquals,
  updateProp,
  addProp,
  celebrateGlyph,
  propSay,
  showLocationSign,
} from './utils.js';

const STAR_TERRACE_SCENE = {
  ambience: 'sanctumFinale',
  wizardStartX: 80,
  donkeyOffset: -36,
  groundProfile: {
    height: 24,
    cutouts: [{ start: 540, end: 760 }],
  },
  props: [
    { id: 'starTerraceBackdrop', type: 'canyonMist', x: -120, align: 'ground', offsetY: -58, parallax: 0.42, layer: -3 },
    { id: 'starTerraceFloor', type: 'borderProcessionPath', x: -60, align: 'ground', parallax: 0.5, layer: -2 },
    { id: 'starTerraceGlyphRing', type: 'resonanceRingDormant', x: 40, align: 'ground', parallax: 0.7 },
    { id: 'starTerraceTorchWest', type: 'watchFireDormant', x: 118, align: 'ground', parallax: 0.88 },
    { id: 'starTerraceTorchEast', type: 'watchFireDormant', x: 548, align: 'ground', parallax: 1.12 },
    { id: 'starTerraceSpireWest', type: 'basaltSpireTall', x: -30, align: 'ground', parallax: 0.74 },
    { id: 'starTerraceSpireEast', type: 'basaltSpireShort', x: 70, align: 'ground', parallax: 0.78 },
    { id: 'starTerraceCliff', type: 'vineyardBoundary', x: 592, align: 'ground', parallax: 1.14 },
    { id: 'starTerraceChasm', type: 'canyonMist', x: 624, align: 'ground', offsetY: 16, parallax: 1.22, layer: 1 },
    { id: 'starTerraceOne', type: 'starShardDormant', x: 168, align: 'ground', parallax: 0.96 },
    { id: 'starTerraceTwo', type: 'starShardDormant', x: 316, align: 'ground', parallax: 0.98 },
    { id: 'starTerraceThree', type: 'starShardDormant', x: 464, align: 'ground', parallax: 1.0 },
    { id: 'starTerraceBanner', type: 'princeProcessionBanner', x: 112, align: 'ground', parallax: 0.9 },
    { id: 'balakStarFigure', type: 'balakFigure', x: 556, align: 'ground', parallax: 1.08 },
  ],
};

const CROWN_SCENE = {
  ambience: 'sanctumFinale',
  wizardStartX: 92,
  donkeyOffset: -38,
  groundProfile: {
    height: 24,
    cutouts: [{ start: 540, end: 760 }],
  },
  props: [
    { id: 'crownBackdrop', type: 'canyonMist', x: -80, align: 'ground', offsetY: -60, parallax: 0.38, layer: -3 },
    { id: 'crownFloor', type: 'borderProcessionPath', x: -12, align: 'ground', parallax: 0.54, layer: -2 },
    { id: 'crownAura', type: 'starShardDormant', x: 60, align: 'ground', parallax: 0.84 },
    { id: 'crownTorchNorth', type: 'watchFireDormant', x: 132, align: 'ground', parallax: 0.82 },
    { id: 'crownTorchSouth', type: 'watchFireDormant', x: 470, align: 'ground', parallax: 1.08 },
    { id: 'crownArcOne', type: 'lightCrownArcDormant', x: 216, align: 'ground', parallax: 0.94 },
    { id: 'crownArcTwo', type: 'lightCrownArcDormant', x: 272, align: 'ground', parallax: 0.95 },
    { id: 'crownArcThree', type: 'lightCrownArcDormant', x: 328, align: 'ground', parallax: 0.96 },
    { id: 'crownArcFour', type: 'lightCrownArcDormant', x: 384, align: 'ground', parallax: 0.97 },
    { id: 'crownArcFive', type: 'lightCrownArcDormant', x: 440, align: 'ground', parallax: 0.98 },
  ],
};

const VISION_SCENE = {
  ambience: 'sanctumFinale',
  wizardStartX: 90,
  donkeyOffset: -38,
  groundProfile: {
    height: 24,
    cutouts: [{ start: 540, end: 760 }],
  },
  props: [
    { id: 'visionBackdrop', type: 'canyonMist', x: -140, align: 'ground', offsetY: -60, parallax: 0.4, layer: -3 },
    { id: 'visionPath', type: 'borderProcessionPath', x: -20, align: 'ground', parallax: 0.58, layer: -2 },
    { id: 'visionGlyphNorth', type: 'resonanceRingDormant', x: 80, align: 'ground', parallax: 0.8 },
    { id: 'visionTorch', type: 'watchFireDormant', x: 518, align: 'ground', parallax: 1.1 },
    { id: 'visionAmalek', type: 'nationEchoDormant', x: 216, align: 'ground', parallax: 0.94 },
    { id: 'visionKenite', type: 'nationEchoDormant', x: 312, align: 'ground', parallax: 0.96 },
    { id: 'visionAsshur', type: 'nationEchoDormant', x: 408, align: 'ground', parallax: 0.98 },
    { id: 'visionWoe', type: 'nationEchoDormant', x: 504, align: 'ground', parallax: 1.0 },
    { id: 'visionKittim', type: 'nationEchoDormant', x: 592, align: 'ground', parallax: 1.04 },
  ],
};

const SHADOW_SCENE = {
  ambience: 'sanctumFinale',
  wizardStartX: 94,
  donkeyOffset: -36,
  groundProfile: {
    height: 24,
    cutouts: [{ start: 520, end: 740 }],
  },
  props: [
    { id: 'shadowBackdrop', type: 'canyonMist', x: -100, align: 'ground', offsetY: -64, parallax: 0.36, layer: -3 },
    { id: 'shadowFloor', type: 'borderProcessionPath', x: -32, align: 'ground', parallax: 0.48, layer: -2 },
    { id: 'shadowSpill', type: 'resonanceRingDormant', x: 60, align: 'ground', parallax: 0.76 },
    { id: 'shadowTorch', type: 'watchFireDormant', x: 520, align: 'ground', parallax: 1.1 },
    { id: 'shadowEchoNorth', type: 'shadowEchoDormant', x: 232, align: 'ground', parallax: 0.94 },
    { id: 'shadowEchoEast', type: 'shadowEchoDormant', x: 332, align: 'ground', parallax: 0.96 },
    { id: 'shadowEchoSouth', type: 'shadowEchoDormant', x: 432, align: 'ground', parallax: 0.98 },
    { id: 'balakShadowCore', type: 'balakFigure', x: 296, align: 'ground', parallax: 0.96 },
  ],
};

const BRIDGE_SCENE = {
  ambience: 'sanctumFinale',
  wizardStartX: 92,
  donkeyOffset: -36,
  groundProfile: {
    height: 24,
    cutouts: [{ start: 480, end: 760 }],
  },
  props: [
    { id: 'bridgeBackdrop', type: 'canyonMist', x: -120, align: 'ground', offsetY: -66, parallax: 0.34, layer: -3 },
    { id: 'bridgeFloor', type: 'borderProcessionPath', x: -28, align: 'ground', parallax: 0.46, layer: -2 },
    { id: 'bridgeStarTrail', type: 'resonanceRingDormant', x: 80, align: 'ground', parallax: 0.74 },
    { id: 'bridgeTorchEast', type: 'watchFireDormant', x: 536, align: 'ground', parallax: 1.08 },
    { id: 'bridgeSegOne', type: 'starBridgeSegmentDormant', x: 148, align: 'ground', parallax: 0.92 },
    { id: 'bridgeSegTwo', type: 'starBridgeSegmentDormant', x: 214, align: 'ground', parallax: 0.94 },
    { id: 'bridgeSegThree', type: 'starBridgeSegmentDormant', x: 280, align: 'ground', parallax: 0.96 },
    { id: 'bridgeSegFour', type: 'starBridgeSegmentDormant', x: 346, align: 'ground', parallax: 0.98 },
    { id: 'bridgeSegFive', type: 'starBridgeSegmentDormant', x: 412, align: 'ground', parallax: 1.0 },
    { id: 'bridgeSegSix', type: 'starBridgeSegmentDormant', x: 478, align: 'ground', parallax: 1.02 },
    { id: 'bridgeSegSeven', type: 'starBridgeSegmentDormant', x: 544, align: 'ground', parallax: 1.04 },
  ],
};

const TERRACE_ACTIONS = [
  {
    id: 'starTerraceOne',
    steps: [
      { prompt: 'Höre den ersten Stern: sprich שמע.', spells: ['shama', 'שמע'] },
      { prompt: 'Blockiere Balaks Gegenspruch mit לא.', spells: ['lo', 'לא'] },
      { prompt: 'Segne den Pfad mit ברך.', spells: ['baruch', 'ברך'] },
    ],
    fragment: 'א',
  },
  {
    id: 'starTerraceTwo',
    steps: [
      { prompt: 'Höre erneut.', spells: ['shama', 'שמע'] },
      { prompt: 'Sag Nein.', spells: ['lo', 'לא'] },
      { prompt: 'Segne erneut.', spells: ['baruch', 'ברך'] },
    ],
  },
  {
    id: 'starTerraceThree',
    steps: [
      { prompt: 'Höre ein drittes Mal.', spells: ['shama', 'שמע'] },
      { prompt: 'Segne Balaks Furcht.', spells: ['baruch', 'ברך'] },
      { prompt: 'Sag Nein zum Schatten.', spells: ['lo', 'לא'] },
    ],
  },
];

const CROWN_SEQUENCE = [
  ['shama', 'dabar'],
  ['dabar', 'emet'],
  ['baruch', 'emet', 'or'],
  ['shama', 'lo', 'or'],
  ['or'],
];

const NATION_SEQUENCE = [
  {
    id: 'visionAmalek',
    combo: ['dabar', 'or'],
    quote: '„Amalek war das erste unter den Völkern, doch zuletzt wird es vergehen.“',
  },
  {
    id: 'visionKenite',
    combo: ['shama', 'lo'],
    quote: '„Fest ist deine Wohnung, Keniter, und du hast dein Nest im Felsen gebaut.“',
  },
  {
    id: 'visionAsshur',
    combo: ['dabar', 'or'],
    quote: '„Dennoch wird dich Assur gefangen führen.“',
  },
  {
    id: 'visionWoe',
    combo: ['shama', 'lo', 'baruch'],
    quote: '„Wehe, wer wird leben, wenn אלוהים dies tut?“',
  },
  {
    id: 'visionKittim',
    combo: ['dabar', 'emet', 'or'],
    quote: '„Schiffe aus כתים kommen; sie demütigen אשור und עבר – doch auch sie vergehen.“',
  },
];

const SHADOW_SEQUENCE = [
  { id: 'shadowEchoNorth', combo: ['shama', 'lo', 'baruch', 'or'] },
  { id: 'shadowEchoEast', combo: ['shama', 'lo', 'baruch', 'or'] },
  { id: 'shadowEchoSouth', combo: ['shama', 'lo', 'baruch', 'or'] },
];

const BRIDGE_SEQUENCE = [
  { id: 'bridgeSegOne', combo: ['or'] },
  { id: 'bridgeSegTwo', combo: ['or', 'emet'] },
  { id: 'bridgeSegThree', combo: ['or', 'emet', 'baruch'] },
  { id: 'bridgeSegFour', combo: ['shama', 'or'] },
  { id: 'bridgeSegFive', combo: ['dabar', 'or'] },
  { id: 'bridgeSegSix', combo: ['baruch', 'or'] },
  { id: 'bridgeSegSeven', combo: ['or'] },
];

export async function runLevelTen() {
  const plan = levelAmbiencePlan.level10;

  const terraceProps = cloneSceneProps(STAR_TERRACE_SCENE.props);
  applySceneConfig({ ...STAR_TERRACE_SCENE, props: terraceProps });
  ensureAmbience(plan?.review ?? STAR_TERRACE_SCENE.ambience ?? 'sanctumFinale');
  setSceneContext({ level: 'level10', phase: 'terraces' });
  await showLevelTitle('Level 10 - Der Stern aus Jakob');
  await fadeToBase(600);
  await showLocationSign(terraceProps, { id: 'signStarTerraces', x: 172, text: 'Bamot-Peor – Sternterrassen | במות פעור' });

  await phaseBalakAccusation(terraceProps);
  await phaseStarTerraces(terraceProps);

  const crownProps = cloneSceneProps(CROWN_SCENE.props);
  await transitionToScene(plan?.learn, CROWN_SCENE, crownProps, 'crown');
  await showLocationSign(crownProps, { id: 'signStarCrown', x: 236, text: 'Krone des Sterns | כתר הכוכב' });
  await phaseStarCrown(crownProps);

  const visionProps = cloneSceneProps(VISION_SCENE.props);
  await transitionToScene(plan?.learn, VISION_SCENE, visionProps, 'visions');
  await showLocationSign(visionProps, { id: 'signVisionField', x: 228, text: 'Visionen der Nationen | חזון הגויים' });
  await phaseNationVisions(visionProps);

  const shadowProps = cloneSceneProps(SHADOW_SCENE.props);
  await transitionToScene(plan?.learn, SHADOW_SCENE, shadowProps, 'shadows');
  await showLocationSign(shadowProps, { id: 'signShadowRift', x: 240, text: 'Balaks Schattenriss | סדק הצל של בלק' });
  await phaseShadowRift(shadowProps);

  await phaseFirmamentWarning();

  const bridgeProps = cloneSceneProps(BRIDGE_SCENE.props);
  await transitionToScene(plan?.apply, BRIDGE_SCENE, bridgeProps, 'bridge');
  await showLocationSign(bridgeProps, { id: 'signStarBridge', x: 220, text: 'Sternenbrücke | גשר הכוכבים' });
  await phaseStarBridge(bridgeProps);

  await narratorSay('Balaks Schatten flieht in den Palast der Worte. Der Stern bleibt als Schild hinter dir.');
  await fadeToBlack(720);
}

async function phaseBalakAccusation(props) {
  await narratorSay('Bileam steht auf dem Felsen von Bamot-Peor; unter ihm glimmt das Lager Israels wie ein Meer aus geordneten Sternen.');
  await ensureWizardBesideBalak(props, 'balakStarFigure', { offset: -36, tolerance: 18 });
  await propSay(props, 'balakStarFigure', 'Ich habe dich gerufen, dass du meine Feinde verfluchst – und siehe, du hast sie dreimal gesegnet! Geh fort; ich wollte dich ehren, aber dein אלוהים verweigert es dir.', { anchor: 'center', offsetY: -30 });
  await wizardSay('Hab ich dir nicht gesagt? Gäbe mir Balak sein Haus voll Silber und Gold, ich könnte das Wort יהוה nicht übertreten, weder im Kleinen noch im Großen.');

  addProp(props, { id: 'starTrailWestA', type: 'hoofSignTrail', x: wizard.x - 24, align: 'ground', parallax: 0.96 });
  addProp(props, { id: 'starTrailWestB', type: 'hoofSignTrail', x: wizard.x - 56, align: 'ground', parallax: 0.94 });
  addProp(props, { id: 'starTrailWestC', type: 'starShardDormant', x: wizard.x - 92, align: 'ground', parallax: 0.92 });
  await donkeySay('Schau nach Westen. Die Sternsplitter warten dort auf dich – folge den Spuren zurück über den Pfad.');
}

async function phaseStarTerraces(props) {
  await narratorSay('Der Sternpfad ist zerrissen. Stabilisiere jede Terrasse mit Hören, Nein und Segen.');
  for (const terrace of TERRACE_ACTIONS) {
    const target = props.find(entry => entry.id === terrace.id)?.x ?? wizard.x + 160;
    await waitForWizardToReach(target, { tolerance: 18 });
    for (const step of terrace.steps) {
      let ok = false;
      while (!ok) {
        const answer = await readWord(step.prompt);
        const variant = step.spells[0] === 'שמע' ? 'שמע' : step.spells[0] === 'לא' ? 'לא' : 'ברך';
        if (step.spells.some(spell => spellEquals(answer, spell))) {
          ok = true;
          await celebrateGlyph(answer);
        } else {
          await donkeySay('Halte dich an Hören, Nein und Segen.');
        }
      }
    }
    updateProp(props, terrace.id, { type: 'starShardAwakened' });
    if (terrace.fragment) {
      addProp(props, { id: `starFragment${terrace.fragment}`, type: 'crownFragment', x: wizard.x + 16, y: wizard.y - 44, parallax: 0.9, letter: terrace.fragment });
    }
  }
  await narratorSay('Fragmente des Sterns sammeln sich in deiner Hand.');
}

async function phaseStarCrown(props) {
  await narratorSay('Eine Krone aus Licht senkt sich. Hänge jede Bahn mit den richtigen Worten.');
  await wizardSay('Es sagt Bileam, der Sohn בעור, der Mann, dem die Augen geöffnet sind.');
  await wizardSay('Es sagt der Hörer göttlicher Rede, der Offenbarung des Mächtigen sieht, dem die Augen geöffnet wird, wenn er niederkniet.');
  await wizardSay('Wie fein sind deine Zelte, Jakob, deine Wohnungen, Israel.');
  await wizardSay('Wie Täler, die sich ausbreiten, wie Gärten an Wassern, wie Aloebäume, die יהוה pflanzt, wie Zedern an Bächen.');
  await wizardSay('Sein Eimer strömt über, seine Saat trinkt aus Fülle; sein König wird höher als Agag und sein Reich erhebt sich.');
  await wizardSay('אלוהים führte sie aus מצרים; er ist ihnen wie das Horn des Wildstiers.');
  await wizardSay('Er frisst die Nationen, ihre Gegner, zermalmt ihre Knochen und zerbricht sie mit Pfeilen.');
  await wizardSay('Er liegt wie ein Löwe und wie ein Junglöwe – wer will ihn aufwecken? Gesegnet ist, wer dich segnet; verflucht, wer dich verflucht.');
  for (let index = 0; index < CROWN_SEQUENCE.length; index++) {
    const arcId = ['crownArcOne', 'crownArcTwo', 'crownArcThree', 'crownArcFour', 'crownArcFive'][index];
    const combo = CROWN_SEQUENCE[index];
    let stepIndex = 0;
    while (stepIndex < combo.length) {
      const expected = combo[stepIndex];
      const prompt = makePromptForCrown(index, stepIndex);
      const answer = await readWord(prompt);
      const variant = expected === 'shama' ? 'שמע' : expected === 'lo' ? 'לא' : expected === 'baruch' ? 'ברך' : expected === 'dabar' ? 'דבר' : expected === 'emet' ? 'אמת' : 'אור';
      if (spellEquals(answer, expected, variant)) {
        stepIndex += 1;
        await celebrateGlyph(answer);
      } else {
        await donkeySay('Behalte die Reihenfolge der Krone.');
        stepIndex = 0;
      }
    }
    updateProp(props, arcId, { type: 'lightCrownArcLit' });
  }
  await narratorSay('Die Krone erglueht und antwortet auf deine Worte.');
  await wizardSay('Ich sehe ihn, aber nicht jetzt; ich schaue ihn, aber nicht von Nahem.');
  await wizardSay('Ein Stern geht auf aus Jakob, ein Zepter erhebt sich aus ישראל.');
  await wizardSay('Er zerbricht die Schläfen מואב und die Häupter aller Söhne שת.');
  await wizardSay('Edom fällt, Seir wird Besitz; ישראל handelt mächtig.');
  await wizardSay('Aus Jakob kommt der Herrscher hervor und tilgt, was von den Städten bleibt.');
}

async function phaseNationVisions(props) {
  await narratorSay('Fünf Visionen erscheinen: Amalek, der Keniter, Assur, das Wehe und כתים.');
  for (const vision of NATION_SEQUENCE) {
    const target = props.find(entry => entry.id === vision.id)?.x ?? wizard.x + 200;
    await waitForWizardToReach(target, { tolerance: 18 });
    if (vision.quote) {
      await narratorSay(vision.quote);
    }
    let idx = 0;
    while (idx < vision.combo.length) {
      const expected = vision.combo[idx];
      const prompt = makePromptForVision(expected);
      const answer = await readWord(prompt);
      const variant = expected === 'shama' ? 'שמע' : expected === 'lo' ? 'לא' : expected === 'baruch' ? 'ברך' : expected === 'dabar' ? 'דבר' : 'אור';
      if (spellEquals(answer, expected, variant)) {
        idx += 1;
        await celebrateGlyph(answer);
      } else {
        await donkeySay('Folge der vorgegebenen Formel für diese Vision.');
        idx = 0;
      }
    }
    updateProp(props, vision.id, { type: 'nationEchoActive' });
  }
  addProp(props, { id: 'starFragmentVav', type: 'crownFragment', x: wizard.x + 18, y: wizard.y - 46, parallax: 0.9, letter: 'ו' });
}

async function phaseShadowRift(props) {
  await narratorSay('Balak tritt in den Sternkreis. Sein Schatten löst sich und greift dich an.');
  await propSay(props, 'balakShadowCore', 'Dein Licht blendet, aber es wärmt nicht. Wer ist dieser Stern? Ein אלוהים? Ein Spiegel?', { anchor: 'center', offsetY: -34 });
  await wizardSay('Ich sehe ihn nur. Und wer ihn sieht, weiss, dass nichts anderes ist.');
  await donkeySay('Hüte dich, Meister. Licht kann auch verletzen.');
  for (const shadow of SHADOW_SEQUENCE) {
    const target = props.find(entry => entry.id === shadow.id)?.x ?? wizard.x + 220;
    await waitForWizardToReach(target, { tolerance: 18 });
    let idx = 0;
    while (idx < shadow.combo.length) {
      const expected = shadow.combo[idx];
      const prompt = 'Bann den Schatten mit שמע → לא → ברך → אור.';
      const answer = await readWord(prompt);
      const variant = expected === 'shama' ? 'שמע' : expected === 'lo' ? 'לא' : expected === 'baruch' ? 'ברך' : 'אור';
      if (spellEquals(answer, expected, variant)) {
        idx += 1;
        await celebrateGlyph(answer);
      } else {
        await donkeySay('Reihenfolge einhalten: hören, verneinen, segnen, leuchten.');
        idx = 0;
      }
    }
    updateProp(props, shadow.id, { type: 'shadowEchoBanished' });
  }
  addProp(props, { id: 'starFragmentKaf', type: 'crownFragment', x: wizard.x + 22, y: wizard.y - 48, parallax: 0.9, letter: 'ך' });
}

async function phaseFirmamentWarning() {
  await narratorSay('Der Himmel reisst auf. Ein Riss zeigt den Schattenpalast.');
  await narratorSay('Systemwarnung: Weltstabilität kritisch. Neuer Prozess entdeckt: SHADOW_BALAK.exe.');
  await narratorSay('Eine Stimme warnt: „Verwende אור → אמת → ברך, um den Riss zu schliessen.“');
  let idx = 0;
  const combo = ['or', 'emet', 'baruch'];
  while (idx < combo.length) {
    const expected = combo[idx];
    const prompt = 'Sprich אור → אמת → ברך, um den Riss zu zügeln.';
    const variant = expected === 'or' ? 'אור' : expected === 'emet' ? 'אמת' : 'ברך';
    const answer = await readWord(prompt);
    if (spellEquals(answer, expected, variant)) {
      idx += 1;
      await celebrateGlyph(answer);
    } else {
      await donkeySay('Halte die Reihenfolge: Licht, Wahrheit, Segen.');
      idx = 0;
    }
  }
  await narratorSay('Der Riss schliesst sich kurz – doch Balaks Schatten entkommt in eine tiefe Senke.');
}

async function phaseStarBridge(props) {
  await narratorSay('Ein Sternensteg führt in den Schattenpalast. Jeder Schritt verlangt ein Lichtwort.');
  for (const seg of BRIDGE_SEQUENCE) {
    const target = props.find(entry => entry.id === seg.id)?.x ?? wizard.x + 160;
    await waitForWizardToReach(target, { tolerance: 16 });
    let idx = 0;
    while (idx < seg.combo.length) {
      const expected = seg.combo[idx];
      const prompt = makePromptForBridge(expected, idx, seg.combo.length);
      const variant = expected === 'shama' ? 'שמע' : expected === 'lo' ? 'לא' : expected === 'baruch' ? 'ברך' : expected === 'dabar' ? 'דבר' : expected === 'emet' ? 'אמת' : 'אור';
      const answer = await readWord(prompt);
      if (spellEquals(answer, expected, variant)) {
        idx += 1;
        await celebrateGlyph(answer);
      } else {
        await donkeySay('Der Steg reagiert nur auf die richtige Formel. Beginn erneut.');
        idx = 0;
      }
    }
    updateProp(props, seg.id, { type: 'starBridgeSegmentLit' });
  }
  await narratorSay('Der Sternensteg leuchtet und zieht dich in den Schattenpalast. Du trägst den Stern als Schild.');
}

function makePromptForCrown(arcIndex, stepIndex) {
  const prompts = [
    ['Höre zuerst: sprich שמע.', 'Forme das Gehörte mit דבר.'],
    ['Sprich דבר, dann אמת.', 'Besiegle den Klang mit אמת.'],
    ['Segne und bestaetige: ברך, dann אמת.', 'Lass אור als drittes folgen.'],
    ['Höre den Befehl: שמע.', 'Verneine ihn mit לא.', 'Schliesse mit אור.'],
    ['Halte das Licht: sprich אור.'],
  ];
  return prompts[arcIndex][stepIndex] ?? 'Sprich das passende Wort.';
}

function makePromptForVision(expected) {
  switch (expected) {
    case 'dabar':
      return 'Sprich דבר, um die Vision zu binden.';
    case 'or':
      return 'Lass אור den Schatten brechen.';
    case 'shama':
      return 'Höre zuerst: שמע.';
    case 'lo':
      return 'Verneine den Fluch mit לא.';
    case 'baruch':
      return 'Beende mit ברך.';
    default:
      return 'Sprich das geforderte Wort.';
  }
}

function makePromptForBridge(expected, index, total) {
  if (total === 1 && expected === 'or') return 'Folge dem Stern: sprich אור.';
  if (expected === 'or') return 'Schliesse den Schritt mit אור.';
  if (expected === 'emet') return 'Fülle den Schritt mit אמת.';
  if (expected === 'baruch') return 'Segne diesen Abschnitt mit ברך.';
  if (expected === 'shama') return 'Höre vor jedem Schritt: שמע.';
  if (expected === 'dabar') return 'Setze das Wort als Träger: דבר.';
  return 'Sprich das geforderte Wort.';
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

async function transitionToScene(ambienceKey, sceneConfig, props, phase) {
  await fadeToBlack(360);
  ensureAmbience(ambienceKey ?? sceneConfig.ambience ?? 'sanctumFinale');
  setSceneProps([]);
  applySceneConfig({ ...sceneConfig, props }, { setAmbience: false });
  setSceneProps(props);
  setSceneContext({ level: 'level10', phase });
  await fadeToBase(420);
}

async function ensureWizardBesideBalak(props, id, { offset = -42, tolerance = 18 } = {}) {
  if (!Array.isArray(props)) return;
  const balak = props.find(entry => entry.id === id);
  if (!balak) return;
  const targetX = (balak.x ?? wizard.x) + offset;
  await waitForWizardToReach(targetX, { tolerance });
}
