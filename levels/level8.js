import {
  promptBubble,
  ensureAmbience,
  setSceneContext,
  levelAmbiencePlan,
  fadeToBlack,
  fadeToBase,
  showLevelTitle,
  setSceneProps,
  waitForWizardToReach,
  flashLightning,
} from '../scene.js';
import {
  narratorSay,
  wizardSay,
  donkeySay,
  anchorX,
  anchorY,
  wizard,
  applySceneConfig,
  cloneSceneProps,
  spellEquals,
  updateProp,
  addProp,
  celebrateGlyph,
  propSay,
  canonicalizeSequence,
  consumeSequenceTokens,
  divineSay,
  showLocationSign,
  findProp,
  getPropCenterX,
  canonicalSpell,
} from './utils.js';
import { SPELL_DUEL_MACHINE } from '../stateMachines/spellDuelMachine.js';

const flameFlickers = new Map();

const BAMOT_TERRACE_SCENE = {
  ambience: 'desertTravel',
  wizardStartX: 78,
  donkeyOffset: -38,
  groundProfile: {
    height: 58,
    segments: [
      { end: 180, height: 54, type: 'sand' },
      { start: 180, end: 360, height: 70, type: 'stone' },
      { start: 360, end: 540, height: 56, type: 'sand' },
      { start: 540, end: 720, height: 72, type: 'stone' },
      { start: 720, end: 900, height: 58, type: 'sand' },
      { start: 900, end: 1080, height: 74, type: 'stone' },
      { start: 1080, height: 60, type: 'sand' },
    ],
  },
  props: [
    { id: 'bamotSkyVeil', type: 'canyonMist', x: -120, align: 'ground', offsetY: -38, parallax: 0.32, layer: -3 },
    { id: 'bamotProcessionPath', type: 'borderProcessionPath', x: -40, align: 'ground', parallax: 0.48, layer: -2 },
    { id: 'bamotBasaltNorth', type: 'basaltSpireTall', x: 92, align: 'ground', parallax: 0.78, layer: -1 },
    { id: 'bamotBasaltSouth', type: 'basaltSpireShort', x: 418, align: 'ground', parallax: 0.82, layer: -1 },
    { id: 'bamotSunStone', type: 'sunStoneDormant', x: 244, align: 'ground', parallax: 0.9, layer: 0 },
    { id: 'balakArrival', type: 'balakFigure', x: 1080, align: 'ground', parallax: 1.06 },
    { id: 'terraceBanner', type: 'princeProcessionBanner', x: 112, align: 'ground', parallax: 0.94 },
    { id: 'bamotTorchWest', type: 'watchFireDormant', x: 120, align: 'ground', parallax: 1.02 },
    { id: 'bamotTorchEast', type: 'watchFireDormant', x: 410, align: 'ground', parallax: 1.04 },
    { id: 'bamotForegroundHerb', type: 'gardenForegroundPlant', x: 52, align: 'ground', parallax: 1.12, layer: 2 },
    { id: 'bamotEdgeGlyphs', type: 'resonanceRingDormant', x: 520, align: 'ground', parallax: 1.14 },
  ],
};

const ALTAR_FIELD_SCENE = {
  ambience: 'desertTravel',
  wizardStartX: 88,
  donkeyOffset: -40,
  props: [
    { id: 'altarFieldMist', type: 'canyonMist', x: -96, align: 'ground', offsetY: -60, parallax: 0.36, layer: -3 },
    { id: 'altarNorth', type: 'gardenAltar', x: 120, align: 'ground', parallax: 1 },
    { id: 'altarNorthEast', type: 'gardenAltar', x: 260, align: 'ground', parallax: 1 },
    { id: 'altarEast', type: 'gardenAltar', x: 400, align: 'ground', parallax: 1 },
    { id: 'altarSouthEast', type: 'gardenAltar', x: 540, align: 'ground', parallax: 1 },
    { id: 'altarSouth', type: 'gardenAltar', x: 680, align: 'ground', parallax: 1 },
    { id: 'altarSouthWest', type: 'gardenAltar', x: 820, align: 'ground', parallax: 1 },
    { id: 'altarWest', type: 'gardenAltar', x: 960, align: 'ground', parallax: 1 },
    { id: 'altarAttendantOne', type: 'envoyShadow', x: 100, align: 'ground', parallax: 0.98 },
    { id: 'altarAttendantTwo', type: 'envoyShadow', x: 1000, align: 'ground', parallax: 1.02 },
    { id: 'altarWatchFire', type: 'watchFireDormant', x: 540, align: 'ground', parallax: 1 },
    { id: 'altarForegroundPlant', type: 'gardenForegroundPlant', x: 76, align: 'ground', parallax: 1.12, layer: 2 },
  ],
};

const RESONANCE_SCENE = {
  ambience: 'desertTravel',
  wizardStartX: 92,
  donkeyOffset: -40,
  props: [
    { id: 'resonanceMist', type: 'canyonMist', x: -64, align: 'ground', offsetY: -58, parallax: 0.38, layer: -2 },
    { id: 'resonanceOuter', type: 'resonanceRingDormant', x: 236, align: 'ground', parallax: 0.94 },
    { id: 'resonanceMiddle', type: 'resonanceRingDormant', x: 316, align: 'ground', parallax: 0.96 },
    { id: 'resonanceInner', type: 'resonanceRingDormant', x: 396, align: 'ground', parallax: 0.98 },
    { id: 'resonanceTorch', type: 'watchFireDormant', x: 460, align: 'ground', parallax: 1.02 },
  ],
};

const ORACLE_SCENE = {
  ambience: 'desertTravel',
  wizardStartX: 100,
  donkeyOffset: -38,
  props: [
    { id: 'balakWaiting', type: 'balakFigure', x: 268, align: 'ground', parallax: 0.94 },
    { id: 'oracleBanner', type: 'princeProcessionBanner', x: 404, align: 'ground', parallax: 0.98 },
    { id: 'oracleSpire', type: 'basaltSpireShort', x: 132, align: 'ground', parallax: 0.88 },
    { id: 'oracleSunStone', type: 'sunStoneDormant', x: 352, align: 'ground', parallax: 0.96 },
  ],
};

const ALTAR_POSITIONS = [120, 260, 400, 540, 680, 820, 960];

const ALTAR_SEQUENCE = [
  { id: 'altarNorth' },
  { id: 'altarNorthEast' },
  { id: 'altarEast' },
  { id: 'altarSouthEast' },
  { id: 'altarSouth' },
  { id: 'altarSouthWest' },
  { id: 'altarWest', fragment: 'ר' },
];

export async function runLevelEight() {
  const plan = levelAmbiencePlan.level8;

  const altarProps = cloneSceneProps([
    ...BAMOT_TERRACE_SCENE.props,
    ...ALTAR_FIELD_SCENE.props,
  ]);
  applySceneConfig({
    ...BAMOT_TERRACE_SCENE,
    props: altarProps,
  });
  ensureAltarLayout(altarProps);
  await showLevelTitle('Level 8 – Bamot-Baal');
  await showLocationSign(altarProps, { id: 'signBamot', x: 208, text: 'Bamot-Baal | במות בעל' });
  ensureAmbience(plan?.review ?? BAMOT_TERRACE_SCENE.ambience ?? 'desertTravel');
  setSceneContext({ level: 'level8', phase: 'altars' });
  await fadeToBase(600);

  await phaseArrivalSummary(altarProps);
  await phaseSevenAltars(altarProps);

  const oracleProps = cloneSceneProps(ORACLE_SCENE.props);
  await transitionToScene(plan?.learn, ORACLE_SCENE, oracleProps, 'oracle');
  await phaseFirstOracle(oracleProps);
  await phaseBlessingSequence();
  await phaseReflection();
  await phaseBalakUngeduld(oracleProps);
  await narratorSay('Balak führt dich weiter – zum Feld des Spähers. Noch mehr Altäre werden gefordert.');
  await donkeySay('Bewahre hören, Nein, Segen. Sie werden am nächsten Ort wieder geprüft.');
  await fadeToBlack(720);
}

async function phaseBalakGreeting(props) {
  await narratorSay('Staubiger Wind fegt über die terrassierten Hügel. Balak wartet auf einer Basaltplattform, Moabs Lager glimmt wie ein Raster aus goldenen Punkten.');
  await ensureWizardBesideBalak(props, 'balakArrival');
  await propSay(props, 'balakArrival', 'Hab ich nicht zu dir gesandt und dich rufen lassen? Meinst du, ich könnte dich nicht ehren?', { anchor: 'center', offsetY: -34 });
  await wizardSay('Siehe, ich bin zu dir gekommen. Aber wie kann ich etwas anderes reden als das, was mir אלוהים in den Mund gibt? Nur das kann ich reden.');
  await narratorSay('Balak tritt beiseite, und drei glühende Höhen werden sichtbar. Jede verlangt Hören, Nein und den Segen.');
  addProp(props, { id: 'bamotGuidingTrailWest', type: 'hoofSignTrail', x: wizard.x + 36, align: 'ground', parallax: 1.04 });
  addProp(props, { id: 'bamotGuidingTrailEast', type: 'hoofSignTrail', x: wizard.x + 88, align: 'ground', parallax: 1.06 });
}

async function phaseArrivalSummary(props) {
  await narratorSay('Balak zog dir entgegen nach Ar am Arnon, an der Grenze. Er fragte, warum du so lange zögern kannst.');
  await ensureWizardBesideBalak(props, 'balakArrival', { offset: -36, tolerance: 12 });
  await propSay(props, 'balakArrival', 'Hab ich nicht zu dir gesandt und dich rufen lassen? Meinst du, ich könnte dich nicht ehren?', { anchor: 'center', offsetY: -34 });
  await wizardSay('Siehe, ich bin gekommen. Aber wie könnte ich etwas anderes reden als das, was אלוהים in meinen Mund legt? Nur das kann ich reden.');
  await donkeySay('Halte dich an hören, Nein, Segen: zuerst שמע, dann לא, dann ברך, wenn der Altar ruft.');
  await narratorSay('In Kirjat-Huzot opferte Balak Rinder und Schafe, und ihr aßt in jener Nacht.');
  await narratorSay('Am Morgen führte Balak dich auf Bamot-Baal hinauf, damit du das Lager Israels siehst.');
  await narratorSay('Von den Höhen blickst du in die Steppe. Die Altäre warten auf dein Wort.');
}

async function phaseSevenAltars(props) {
  await wizardSay('Baue mir hier sieben Altare und schaffe mir her sieben junge Stiere und sieben Widder.');
  await propSay(props, 'altarAttendantOne', 'Ich tue, wie du sagst.', { anchor: 'center' });
  for (let index = 0; index < ALTAR_SEQUENCE.length; index += 1) {
    await runAltarRitual(props, ALTAR_SEQUENCE[index], index);
  }
  await narratorSay('Sieben Altare stehen im Licht. Balak wartet auf dein Orakel.');
  await narratorSay('Die Nacht senkt sich, und Balak steht schweigend – ein Schatten neben dem Altar.');
  await divineSay('בלילה הזה יפגשך אלוהי. לא תקלל את אשר ברך יהוה.\nDiese Nacht begegne ich dir: Du wirst nicht verfluchen, was יהוה gesegnet hat.');
  await narratorSay('Du schließt die Augen. Das Feuer glimmt auf, als ob jemand antwortete.');
}

async function runAltarRitual(props, altar, roundIndex = 0) {
  const target = props.find(entry => entry.id === altar.id)?.x ?? wizard.x + 160;
  await waitForWizardToReach(target, { tolerance: 18 });
  await requireAshIgnition(props, altar.id);
  const roundNumber = roundIndex + 1;
  await narratorSay(`Übung ${roundNumber}/${ALTAR_SEQUENCE.length} am Altar.`);
  const curseWord = await promptForCurseWord([], roundNumber);
  await runSpellDrill(curseWord, { roundNumber, totalRounds: ALTAR_SEQUENCE.length });
  updateProp(props, altar.id, { type: 'gardenAltar' });
  if (altar.fragment) {
    addProp(props, {
      id: `altarFragment${altar.fragment}`,
      type: 'blessingFragment',
      x: wizard.x + 16,
      y: wizard.y - 44,
      parallax: 0.9,
      letter: altar.fragment,
    });
    await flashLightning({ doubleFlash: true, durationIn: 70, durationOut: 150, intensity: 0.8 });
  }
}

async function phaseFirstOracle(props) {
  await narratorSay('Bileam hebt an mit seinem Spruch und spricht:');
  await wizardSay('Aus Aram hat mich Balak holen lassen, vom Gebirge des Ostens: Komm, verfluche mir Jakob, komm, verwünsche Israel!');
  await wizardSay('Wie soll ich fluchen, dem אלוהים nicht flucht? Wie soll ich verwünschen, den יהוה nicht verwünscht?');
  await wizardSay('Denn von der Höhe der Felsen sehe ich ihn, und von den Hügeln schaue ich ihn. Siehe, das Volk wohnt abgesondert und wird sich nicht zu den Völkern rechnen.');
  await wizardSay('Wer kann den Staub Jakobs zählen, die Zahl des vierten Teils Israels nennen? Meine Seele sterbe den Tod der Gerechten, und mein Ende sei wie ihres.');
  await propSay(props, 'balakWaiting', 'Was tust du mir an? Ich habe dich holen lassen, um meine Feinde zu verfluchen – und siehe, du segnest sie!', { anchor: 'center' });
  await wizardSay('Muss ich nicht reden, was יהוה in meinen Mund gibt?');
  await flashLightning({ doubleFlash: true, durationIn: 80, durationOut: 180, intensity: 0.9 });
}

async function phaseBlessingSequence(props) {
  igniteAltarFlame(props, 'altarWatchFire', { offsetY: -50 });
  addProp(props, { id: 'blessingRingBlue', type: 'resonanceRingActive', x: wizard.x - 20, align: 'ground', parallax: 0.94, layer: 1, offsetY: -10, tint: 'blue' });
  addProp(props, { id: 'blessingRingViolet', type: 'resonanceRingActive', x: wizard.x, align: 'ground', parallax: 0.96, layer: 1, offsetY: -12, tint: 'violet' });
  addProp(props, { id: 'blessingRingGold', type: 'resonanceRingActive', x: wizard.x + 20, align: 'ground', parallax: 0.98, layer: 1, offsetY: -14, tint: 'gold' });
  const order = ['shama', 'lo', 'baruch'];
  const canonicalOrder = canonicalizeSequence(order);
  let index = 0;
  let baruchFailures = 0;
  while (index < order.length) {
    const prompts = [
      'Höre zuerst: sprich שמע.',
      'Blockiere Balaks Wunsch mit לא.',
      'Vervollständige den Segen mit ברך.',
    ];
    const answer = await readWord(prompts[index]);
    const expected = order[index];
    const variant = expected === 'shama' ? 'שמע' : expected === 'lo' ? 'לא' : 'ברך';
    const multiAdvance = consumeSequenceTokens(answer, canonicalOrder, index);
    if (multiAdvance > 0) {
      for (let offset = 0; offset < multiAdvance; offset += 1) {
        await celebrateGlyph(order[index + offset]);
      }
      index += multiAdvance;
      continue;
    }
    if (spellEquals(answer, expected, variant)) {
      await celebrateGlyph(answer);
      index += 1;
    } else {
      if (expected === 'baruch') {
        baruchFailures += 1;
        if (baruchFailures % 3 === 0) {
        await donkeySay('Der letzte Schritt ist ברך – baruch. Sprich ihn – oder tippe die ganze Folge auf einmal: "shama lo baruch".');
        } else {
          await donkeySay('Reihenfolge: hören, verneinen, segnen. Du kannst sie auch gesammelt tippen, getrennt durch Leerzeichen.');
        }
      } else {
        await donkeySay('Reihenfolge: hören, verneinen, segnen. Du kannst sie auch gesammelt tippen, getrennt durch Leerzeichen.');
      }
      index = 0;
    }
  }
  await narratorSay('Eine Segenwelle rollt über das Lager. Balak beisst die Zähne zusammen.');
  await flashLightning({ doubleFlash: true, durationIn: 70, durationOut: 160, intensity: 0.85 });
}

async function phaseReflection() {
  await wizardSay('Ich sprach das Wort, und das Wort sprach zurück.');
  await donkeySay('Wer segnet, richtet den Faden neu aus.');
}

async function phaseBalakUngeduld(props) {
  const balak = findProp(props, 'balakWaiting');
  const centerX = getPropCenterX(props, 'balakWaiting') ?? wizard.x + 60;
  updateProp(props, 'oracleSunStone', { type: 'sunStoneAwakened' });
  addProp(props, {
    id: 'balakWrathAura',
    type: 'balakWrathEffect',
    x: Math.round(centerX - 18),
    align: 'ground',
    offsetY: -46,
    parallax: balak?.parallax ?? 0.96,
    layer: (balak?.layer ?? 0) + 1,
  });
  await flashLightning({ doubleFlash: false, durationIn: 80, durationOut: 230, intensity: 0.55 });
  await ensureWizardBesideBalak(props, 'balakWaiting', { offset: -30, tolerance: 16 });
  await propSay(props, 'balakWaiting', 'Komm mit mir an einen andern Ort. Von hier siehst du zu viel. Vielleicht kannst du mir dort das Ende verfluchen.', { anchor: 'center' });
}

const usedDrillWords = new Set();

async function promptForCurseWord(validSpells = [], roundNumber = null) {
  await donkeySay('Nenne mir ein Wort aus unserer Übung.');
  while (true) {
    const response = await readWord('Welches Wort sollen wir hier üben?');
    const canonical = canonicalSpell(response);
    if (!canonical) {
      await narratorSay('Leere Worte entzünden nichts. Versuche es erneut.');
      continue;
    }
    if (usedDrillWords.has(canonical)) {
      await donkeySay('Das ist ja langweilig, das kennst du doch schon. Welches Zauberwort kennst du noch?');
      continue;
    }
    const transition = resolveStartTransition(canonical);
    if (!transition) {
      const suggestion = pickRandomTransitionFromStateKey('start');
      const hint = suggestion?.word ? ` Versuche: ${suggestion.word}` : '';
      await donkeySay(`Das ist kein Zauber aus unserem Kreis.${hint}`);
      continue;
    }
    usedDrillWords.add(canonical);
    return canonical;
  }
}

async function runSpellDrill(curseWord, { roundNumber = null, totalRounds = null } = {}) {
  const match = resolveStartTransition(curseWord);
  if (!match) {
    const suggestion = pickRandomTransitionFromStateKey('start');
    if (suggestion?.word) {
      await donkeySay(`Das ist kein gültiger Zauberspruch. Probier mal ${suggestion.word}.`);
    } else {
      await donkeySay('Das ist kein gültiger Zauberspruch.');
    }
    return;
  }
  const [startWord, startConfig] = match;
  const startTransition = normalizeTransitionConfig(startConfig);
  const textPlayer = startTransition.text_player
    ?? startTransition.text
    ?? startTransition.text_enemy
    ?? '';
  if (textPlayer) {
    await wizardSay(textPlayer);
  }

  const nextStateKey = startTransition.next ?? 'start';
  const nextState = SPELL_DUEL_MACHINE[nextStateKey];
  if (!nextState) {
    await donkeySay('Diese Form wurde uns noch nicht gezeigt.');
    return;
  }

  if (Number.isFinite(roundNumber) && Number.isFinite(totalRounds)) {
    // Hinweis wurde vor der Eingabe angezeigt.
  }

  const enemyLines = collectSequenceLines(nextState);
  for (const line of enemyLines) {
    await narratorSay(line);
  }

  const follow = pickRandomTransitionFromStateKey(nextStateKey);
  if (follow && follow.transition) {
    const normalizedFollow = normalizeTransitionConfig(follow.transition);
    const line = normalizedFollow.text_enemy
      ?? normalizedFollow.text
      ?? normalizedFollow.text_player
      ?? '';
    const message = line ? ` ${line}` : '';
    await donkeySay(`${follow.word}!${message}`);
  } else {
    await donkeySay('Kein weiterer Schlag antwortet – halte den Kreis geschlossen.');
  }
  await donkeySay('Siehst du, so würde man den Zauber kontern.');
}

function normalizeTransitionConfig(config) {
  if (typeof config === 'string') {
    return { next: config };
  }
  return { ...config };
}

function resolveStartTransition(word) {
  const canonical = canonicalSpell(word);
  if (!canonical) return null;
  const transitions = SPELL_DUEL_MACHINE?.start?.transitions ?? {};
  return Object.entries(transitions).find(([key]) => canonical === canonicalSpell(key)) ?? null;
}

function collectSequenceLines(state) {
  const lines = [];
  appendSpeechSegment(state?.sequence_enemy, lines);
  if (lines.length === 0) {
    appendSpeechSegment(state?.sequence_player, lines);
  }
  if (lines.length === 0) {
    appendSpeechSegment(state?.intro_enemy, lines);
  }
  return lines
    .map(text => (typeof text === 'string' ? text.trim() : ''))
    .filter(text => text.length > 0);
}

function appendSpeechSegment(segment, bucket) {
  if (!segment) return;
  if (Array.isArray(segment)) {
    segment.forEach(entry => appendSpeechSegment(entry, bucket));
    return;
  }
  if (typeof segment === 'string') {
    bucket.push(segment);
    return;
  }
  if (typeof segment === 'object') {
    if (typeof segment.text === 'string') {
      bucket.push(segment.text);
    }
    if (typeof segment.text2 === 'string') {
      bucket.push(segment.text2);
    }
  }
}

function describeDrillState(stateKey) {
  switch (stateKey) {
    case 'obedienceEcho':
    case 'obedienceBind':
    case 'listening':
      return 'שמע';
    case 'negation':
      return 'לא';
    case 'burning':
      return 'אש';
    case 'radiant':
    case 'radiantPrism':
      return 'אור';
    case 'flooded':
    case 'steamChamber':
      return 'מים';
    case 'echoing':
    case 'resonantTrap':
      return 'קול';
    case 'spoken':
      return 'דבר';
    case 'truth':
    case 'truthPrism':
      return 'אמת';
    case 'angelic':
    case 'angelicChorus':
      return 'מלאך';
    case 'blessing':
    case 'blessingOrbit':
      return 'ברך';
    case 'overgrown':
      return 'חיים';
    default:
      return stateKey;
  }
}

function ensureAltarLayout(props) {
  if (!Array.isArray(props)) return;
  ALTAR_SEQUENCE.forEach((entry, index) => {
    const id = entry.id;
    const x = ALTAR_POSITIONS[index] ?? (120 + 140 * index);
    const existing = findProp(props, id);
    if (existing) {
      updateProp(props, id, { x, align: 'ground', parallax: existing.parallax ?? 1, type: existing.type ?? 'gardenAltar' });
    } else {
      addProp(props, { id, type: 'gardenAltar', x, align: 'ground', parallax: 1 });
    }
  });
}

function pickRandomTransitionFromStateKey(stateKey = 'start') {
  const state = SPELL_DUEL_MACHINE?.[stateKey];
  if (!state || !state.transitions) return null;
  const options = Object.entries(state.transitions)
    .map(([word, transition]) => ({ word, transition }))
    .filter(Boolean);
  if (options.length === 0) return null;
  const index = Math.floor(Math.random() * options.length);
  return options[index];
}

async function ensureWizardBesideBalak(props, id, { offset = -42, tolerance = 18 } = {}) {
  if (!Array.isArray(props)) return;
  const balak = props.find(entry => entry.id === id);
  if (!balak) return;
  const targetX = (balak.x ?? wizard.x) + offset;
  await waitForWizardToReach(targetX, { tolerance });
}

async function requireAshIgnition(props, altarId) {
  await donkeySay('Entzünde den Altar mit אש.');
  while (true) {
    const answer = await readWord('Sprich אש, um den Altar zu entzünden.');
    if (spellEquals(answer, 'ash', 'אש')) {
      await narratorSay('Feuer krönt den Altar, und die Opferglut wird ruhig.');
      igniteAltarFlame(props, altarId);
      return;
    }
    await narratorSay('Kein Funke rührt sich. Versuche es erneut.');
  }
}

async function transitionToScene(ambienceKey, sceneConfig, props, phase) {
  await fadeToBlack(360);
  ensureAmbience(ambienceKey ?? sceneConfig.ambience ?? 'desertTravel');
  stopAllFlameFlickers();
  setSceneProps([]);
  applySceneConfig({ ...sceneConfig, props }, { setAmbience: false });
  setSceneProps(props);
  setSceneContext({ level: 'level8', phase });
  await fadeToBase(420);
}

async function readWord(promptText) {
  const input = await promptBubble(
    anchorX(wizard, -6),
    anchorY(wizard, -60),
    promptText,
    anchorX(wizard, 0),
    anchorY(wizard, -34),
  );
  if (input == null) return '';
  return String(input).trim();
}

function igniteAltarFlame(props, baseId, { offsetY = -34 } = {}) {
  if (!Array.isArray(props) || !baseId) return;
  const base = findProp(props, baseId);
  if (!base) return;
  const flameId = `${baseId}Flame`;
  const centerX = getPropCenterX(props, baseId);
  if (!Number.isFinite(centerX)) return;
  const flameX = Math.round(centerX - 8);
  const flameProps = {
    id: flameId,
    type: 'anvilFlame',
    x: flameX,
    align: 'ground',
    offsetY,
    parallax: base.parallax ?? 1,
    layer: (base.layer ?? 0) + 1,
    visible: true,
  };
  if (findProp(props, flameId)) {
    updateProp(props, flameId, flameProps);
  } else {
    addProp(props, flameProps);
  }
  startFlameFlicker(props, flameId);
}

function startFlameFlicker(props, flameId) {
  if (!flameId || flameFlickers.has(flameId)) return;
  let visible = true;
  const interval = setInterval(() => {
    const flame = findProp(props, flameId);
    if (!flame) {
      clearInterval(interval);
      flameFlickers.delete(flameId);
      return;
    }
    visible = !visible;
    updateProp(props, flameId, { visible });
  }, 180 + Math.random() * 140);
  flameFlickers.set(flameId, () => clearInterval(interval));
}

function stopAllFlameFlickers() {
  flameFlickers.forEach(stop => {
    try {
      stop();
    } catch (error) {
      // ignore cleanup errors
    }
  });
  flameFlickers.clear();
}
