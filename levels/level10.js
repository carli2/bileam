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
} from './utils.js';

const STAR_TERRACE_SCENE = {
  ambience: 'sanctumFinale',
  wizardStartX: 80,
  donkeyOffset: -36,
  props: [
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
  props: [
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
  props: [
    { id: 'visionAmalek', type: 'nationEchoDormant', x: 216, align: 'ground', parallax: 0.94 },
    { id: 'visionKenite', type: 'nationEchoDormant', x: 312, align: 'ground', parallax: 0.96 },
    { id: 'visionAsshur', type: 'nationEchoDormant', x: 408, align: 'ground', parallax: 0.98 },
    { id: 'visionWoe', type: 'nationEchoDormant', x: 504, align: 'ground', parallax: 1.0 },
  ],
};

const SHADOW_SCENE = {
  ambience: 'sanctumFinale',
  wizardStartX: 94,
  donkeyOffset: -36,
  props: [
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
  props: [
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
      { prompt: 'Hoere den ersten Stern: sprich שמע.', spells: ['shama', 'שמע'] },
      { prompt: 'Blockiere Balaks Gegenspruch mit לא.', spells: ['lo', 'לא'] },
      { prompt: 'Segne den Pfad mit ברך.', spells: ['barak', 'ברך'] },
    ],
    fragment: 'א',
  },
  {
    id: 'starTerraceTwo',
    steps: [
      { prompt: 'Hoere erneut.', spells: ['shama', 'שמע'] },
      { prompt: 'Sag Nein.', spells: ['lo', 'לא'] },
      { prompt: 'Segne erneut.', spells: ['barak', 'ברך'] },
    ],
  },
  {
    id: 'starTerraceThree',
    steps: [
      { prompt: 'Hoere ein drittes Mal.', spells: ['shama', 'שמע'] },
      { prompt: 'Segne Balaks Furcht.', spells: ['barak', 'ברך'] },
      { prompt: 'Sag Nein zum Schatten.', spells: ['lo', 'לא'] },
    ],
  },
];

const CROWN_SEQUENCE = [
  ['shama', 'dabar'],
  ['dabar', 'emet'],
  ['barak', 'emet', 'or'],
  ['shama', 'lo', 'or'],
  ['or'],
];

const NATION_SEQUENCE = [
  {
    id: 'visionAmalek',
    combo: ['dabar', 'or'],
    quote: '„Amalek war das erste unter den Voelkern, doch zuletzt wird es vergehen.“',
  },
  {
    id: 'visionKenite',
    combo: ['shama', 'lo'],
    quote: '„Fest ist deine Wohnung, Keniter, und du hast dein Nest im Felsen gebaut.“',
  },
  {
    id: 'visionAsshur',
    combo: ['dabar', 'or'],
    quote: '„Dennoch wird dich Assur gefangen fuehren.“',
  },
  {
    id: 'visionWoe',
    combo: ['shama', 'lo', 'barak'],
    quote: '„Wehe, wer wird leben, wenn Gott dies tut?“',
  },
];

const SHADOW_SEQUENCE = [
  { id: 'shadowEchoNorth', combo: ['shama', 'lo', 'barak', 'or'] },
  { id: 'shadowEchoEast', combo: ['shama', 'lo', 'barak', 'or'] },
  { id: 'shadowEchoSouth', combo: ['shama', 'lo', 'barak', 'or'] },
];

const BRIDGE_SEQUENCE = [
  { id: 'bridgeSegOne', combo: ['or'] },
  { id: 'bridgeSegTwo', combo: ['or', 'emet'] },
  { id: 'bridgeSegThree', combo: ['or', 'emet', 'barak'] },
  { id: 'bridgeSegFour', combo: ['shama', 'or'] },
  { id: 'bridgeSegFive', combo: ['dabar', 'or'] },
  { id: 'bridgeSegSix', combo: ['barak', 'or'] },
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

  await phaseBalakAccusation(terraceProps);
  await phaseStarTerraces(terraceProps);

  const crownProps = cloneSceneProps(CROWN_SCENE.props);
  await transitionToScene(plan?.learn, CROWN_SCENE, crownProps, 'crown');
  await phaseStarCrown(crownProps);

  const visionProps = cloneSceneProps(VISION_SCENE.props);
  await transitionToScene(plan?.learn, VISION_SCENE, visionProps, 'visions');
  await phaseNationVisions(visionProps);

  const shadowProps = cloneSceneProps(SHADOW_SCENE.props);
  await transitionToScene(plan?.learn, SHADOW_SCENE, shadowProps, 'shadows');
  await phaseShadowRift(shadowProps);

  await phaseFirmamentWarning();

  const bridgeProps = cloneSceneProps(BRIDGE_SCENE.props);
  await transitionToScene(plan?.apply, BRIDGE_SCENE, bridgeProps, 'bridge');
  await phaseStarBridge(bridgeProps);

  await narratorSay('Balaks Schatten flieht in den Palast der Worte. Der Stern bleibt als Schild hinter dir.');
  await fadeToBlack(720);
}

async function phaseBalakAccusation(props) {
  await narratorSay('Bileam steht auf dem Felsen von Bamot-Peor; unter ihm glimmt das Lager Israels wie ein Meer aus geordneten Sternen.');
  await propSay(props, 'balakStarFigure', 'Ich habe dich gerufen, dass du meine Feinde verfluchst – und siehe, du hast sie dreimal gesegnet! Geh fort; ich wollte dich ehren, aber dein Gott verweigert es dir.', { anchor: 'center', offsetY: -30 });
  await wizardSay('Hab ich dir nicht gesagt? Gäbe mir Balak sein Haus voll Silber und Gold, ich könnte das Wort des HERRN nicht uebertreten, weder im Kleinen noch im Grossen.');
}

async function phaseStarTerraces(props) {
  await narratorSay('Der Sternpfad ist zerrissen. Stabilisiere jede Terrasse mit Hoeren, Nein und Segen.');
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
          await donkeySay('Halte dich an Hoeren, Nein und Segen.');
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
  await narratorSay('Eine Krone aus Licht senkt sich. Haenge jede Bahn mit den richtigen Worten.');
  await wizardSay('Es sagt Bileam, der Sohn Beors, der Mann, dem die Augen geoeffnet sind.');
  await wizardSay('Ich sehe ihn, aber nicht jetzt; ich schaue ihn, aber nicht von Nahem.');
  await wizardSay('Ein Stern geht auf aus Jakob, ein Zepter erhebt sich aus Israel.');
  for (let index = 0; index < CROWN_SEQUENCE.length; index++) {
    const arcId = ['crownArcOne', 'crownArcTwo', 'crownArcThree', 'crownArcFour', 'crownArcFive'][index];
    const combo = CROWN_SEQUENCE[index];
    let stepIndex = 0;
    while (stepIndex < combo.length) {
      const expected = combo[stepIndex];
      const prompt = makePromptForCrown(index, stepIndex);
      const answer = await readWord(prompt);
      const variant = expected === 'shama' ? 'שמע' : expected === 'lo' ? 'לא' : expected === 'barak' ? 'ברך' : expected === 'dabar' ? 'דבר' : expected === 'emet' ? 'אמת' : 'אור';
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
  await narratorSay('Die Krone erglueht. Ein Stern geht auf aus Jakob, ein Zepter erhebt sich aus Israel.');
}

async function phaseNationVisions(props) {
  await narratorSay('Vier Visionen erscheinen: Amalek, der Keniter, Assur und das Wehe.');
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
      const variant = expected === 'shama' ? 'שמע' : expected === 'lo' ? 'לא' : expected === 'barak' ? 'ברך' : expected === 'dabar' ? 'דבר' : 'אור';
      if (spellEquals(answer, expected, variant)) {
        idx += 1;
        await celebrateGlyph(answer);
      } else {
        await donkeySay('Folge der vorgegebenen Formel fuer diese Vision.');
        idx = 0;
      }
    }
    updateProp(props, vision.id, { type: 'nationEchoActive' });
  }
  addProp(props, { id: 'starFragmentVav', type: 'crownFragment', x: wizard.x + 18, y: wizard.y - 46, parallax: 0.9, letter: 'ו' });
}

async function phaseShadowRift(props) {
  await narratorSay('Balak tritt in den Sternkreis. Sein Schatten loest sich und greift dich an.');
  await propSay(props, 'balakShadowCore', 'Dein Licht blendet, aber es waermt nicht. Wer ist dieser Stern? Ein Gott? Ein Spiegel?', { anchor: 'center', offsetY: -34 });
  await wizardSay('Ich sehe ihn nur. Und wer ihn sieht, weiss, dass nichts anderes ist.');
  await donkeySay('Huete dich, Meister. Licht kann auch verletzen.');
  for (const shadow of SHADOW_SEQUENCE) {
    const target = props.find(entry => entry.id === shadow.id)?.x ?? wizard.x + 220;
    await waitForWizardToReach(target, { tolerance: 18 });
    let idx = 0;
    while (idx < shadow.combo.length) {
      const expected = shadow.combo[idx];
      const prompt = 'Bann den Schatten mit שמע → לא → ברך → אור.';
      const answer = await readWord(prompt);
      const variant = expected === 'shama' ? 'שמע' : expected === 'lo' ? 'לא' : expected === 'barak' ? 'ברך' : 'אור';
      if (spellEquals(answer, expected, variant)) {
        idx += 1;
        await celebrateGlyph(answer);
      } else {
        await donkeySay('Reihenfolge einhalten: hoeren, verneinen, segnen, leuchten.');
        idx = 0;
      }
    }
    updateProp(props, shadow.id, { type: 'shadowEchoBanished' });
  }
  addProp(props, { id: 'starFragmentKaf', type: 'crownFragment', x: wizard.x + 22, y: wizard.y - 48, parallax: 0.9, letter: 'ך' });
}

async function phaseFirmamentWarning() {
  await narratorSay('Der Himmel reisst auf. Ein Riss zeigt den Schattenpalast.');
  await narratorSay('Systemwarnung: Weltstabilitaet kritisch. Neuer Prozess entdeckt: SHADOW_BALAK.exe.');
  await narratorSay('Eine Stimme warnt: „Verwende אור → אמת → ברך, um den Riss zu schliessen.“');
  let idx = 0;
  const combo = ['or', 'emet', 'barak'];
  while (idx < combo.length) {
    const expected = combo[idx];
    const prompt = 'Sprich אור → אמת → ברך, um den Riss zu zuegeln.';
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
  await narratorSay('Ein Sternensteg fuehrt in den Schattenpalast. Jeder Schritt verlangt ein Lichtwort.');
  for (const seg of BRIDGE_SEQUENCE) {
    const target = props.find(entry => entry.id === seg.id)?.x ?? wizard.x + 160;
    await waitForWizardToReach(target, { tolerance: 16 });
    let idx = 0;
    while (idx < seg.combo.length) {
      const expected = seg.combo[idx];
      const prompt = makePromptForBridge(expected, idx, seg.combo.length);
      const variant = expected === 'shama' ? 'שמע' : expected === 'lo' ? 'לא' : expected === 'barak' ? 'ברך' : expected === 'dabar' ? 'דבר' : expected === 'emet' ? 'אמת' : 'אור';
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
  await narratorSay('Der Sternensteg leuchtet und zieht dich in den Schattenpalast. Du traegst den Stern als Schild.');
}

function makePromptForCrown(arcIndex, stepIndex) {
  const prompts = [
    ['Hoere zuerst: sprich שמע.', 'Forme das Gehoerte mit דבר.'],
    ['Sprich דבר, dann אמת.', 'Besiegle den Klang mit אמת.'],
    ['Segne und bestaetige: ברך, dann אמת.', 'Lass אור als drittes folgen.'],
    ['Hoere den Befehl: שמע.', 'Verneine ihn mit לא.', 'Schliesse mit אור.'],
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
      return 'Hoere zuerst: שמע.';
    case 'lo':
      return 'Verneine den Fluch mit לא.';
    case 'barak':
      return 'Beende mit ברך.';
    default:
      return 'Sprich das geforderte Wort.';
  }
}

function makePromptForBridge(expected, index, total) {
  if (total === 1 && expected === 'or') return 'Folge dem Stern: sprich אור.';
  if (expected === 'or') return 'Schliesse den Schritt mit אור.';
  if (expected === 'emet') return 'Fuelle den Schritt mit אמת.';
  if (expected === 'barak') return 'Segne diesen Abschnitt mit ברך.';
  if (expected === 'shama') return 'Hoere vor jedem Schritt: שמע.';
  if (expected === 'dabar') return 'Setze das Wort als Traeger: דבר.';
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
