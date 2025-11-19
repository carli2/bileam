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
  switchMusic,
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
      { end: 140, height: 52, type: 'sand' },
      { start: 140, end: 240, height: 72, type: 'stone' },
      { start: 240, end: 320, height: 56, type: 'sand' },
      { start: 320, end: 420, height: 74, type: 'stone' },
      { start: 420, end: 500, height: 58, type: 'sand' },
      { start: 500, end: 620, height: 76, type: 'stone' },
      { start: 620, height: 52, type: 'sand' },
    ],
  },
  props: [
    { id: 'bamotSkyVeil', type: 'canyonMist', x: -120, align: 'ground', offsetY: -38, parallax: 0.32, layer: -3 },
    { id: 'bamotProcessionPath', type: 'borderProcessionPath', x: -40, align: 'ground', parallax: 0.48, layer: -2 },
    { id: 'bamotBasaltNorth', type: 'basaltSpireTall', x: 92, align: 'ground', parallax: 0.78, layer: -1 },
    { id: 'bamotBasaltSouth', type: 'basaltSpireShort', x: 418, align: 'ground', parallax: 0.82, layer: -1 },
    { id: 'bamotSunStone', type: 'sunStoneDormant', x: 244, align: 'ground', parallax: 0.9, layer: 0 },
    { id: 'terraceOne', type: 'altarGlyphPlateDormant', x: 168, align: 'ground', parallax: 0.96 },
    { id: 'terraceTwo', type: 'altarGlyphPlateDormant', x: 316, align: 'ground', parallax: 0.98 },
    { id: 'terraceThree', type: 'altarGlyphPlateDormant', x: 464, align: 'ground', parallax: 1.0 },
    { id: 'balakArrival', type: 'balakFigure', x: 552, align: 'ground', parallax: 1.06 },
    { id: 'terraceBanner', type: 'princeProcessionBanner', x: 112, align: 'ground', parallax: 0.94 },
    { id: 'bamotTorchWest', type: 'watchFireDormant', x: 128, align: 'ground', parallax: 1.02 },
    { id: 'bamotTorchEast', type: 'watchFireDormant', x: 392, align: 'ground', parallax: 1.04 },
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
    { id: 'altarFieldPath', type: 'borderProcessionPath', x: -24, align: 'ground', parallax: 0.52, layer: -2 },
    { id: 'altarNorth', type: 'altarGlyphPlateDormant', x: 140, align: 'ground', parallax: 0.94 },
    { id: 'altarNorthEast', type: 'altarGlyphPlateDormant', x: 212, align: 'ground', parallax: 0.95 },
    { id: 'altarEast', type: 'altarGlyphPlateDormant', x: 284, align: 'ground', parallax: 0.96 },
    { id: 'altarSouthEast', type: 'altarGlyphPlateDormant', x: 356, align: 'ground', parallax: 0.97 },
    { id: 'altarSouth', type: 'altarGlyphPlateDormant', x: 428, align: 'ground', parallax: 0.98 },
    { id: 'altarSouthWest', type: 'altarGlyphPlateDormant', x: 500, align: 'ground', parallax: 0.99 },
    { id: 'altarWest', type: 'altarGlyphPlateDormant', x: 572, align: 'ground', parallax: 1.0 },
    { id: 'altarAttendantOne', type: 'envoyShadow', x: 96, align: 'ground', parallax: 0.92 },
    { id: 'altarAttendantTwo', type: 'envoyShadow', x: 608, align: 'ground', parallax: 1.04 },
    { id: 'altarWatchFire', type: 'watchFireDormant', x: 312, align: 'ground', parallax: 0.96 },
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

const PISGA_SCENE = {
  ambience: 'desertTravel',
  wizardStartX: 86,
  donkeyOffset: -38,
  props: [
    { id: 'pisgaVeil', type: 'canyonMist', x: -88, align: 'ground', offsetY: -62, parallax: 0.34, layer: -3 },
    { id: 'pisgaStone', type: 'borderMilestone', x: 204, align: 'ground', parallax: 0.94 },
    { id: 'pisgaCleft', type: 'pisgaBridgeRunesDormant', x: 316, align: 'ground', parallax: 0.96 },
    { id: 'pisgaPortal', type: 'pisgaBridgeSegmentDormant', x: 432, align: 'ground', parallax: 0.98 },
    { id: 'pisgaWindVeil', type: 'resonanceRingDormant', x: 508, align: 'ground', parallax: 1.08 },
    { id: 'pisgaForeground', type: 'gardenForegroundPlant', x: 84, align: 'ground', parallax: 1.14, layer: 2 },
  ],
};

const HEIGHT_STEPS = [
  {
    id: 'terraceOne',
    actions: [
      { prompt: 'Blockiere Balaks Befehl mit לא.', spells: ['lo', 'לא'] },
      { prompt: 'Höre auf die Wächter: sprich שמע.', spells: ['shama', 'שמע'] },
    ],
    fragment: 'ב',
  },
  {
    id: 'terraceTwo',
    actions: [
      { prompt: 'Enthülle die Schrift mit אור.', spells: ['or', 'אור'] },
      { prompt: 'Setze erneut ein Nein.', spells: ['lo', 'לא'] },
    ],
  },
  {
    id: 'terraceThree',
    actions: [
      { prompt: 'Lausche: sprich שמע.', spells: ['shama', 'שמע'] },
      { prompt: 'Segne den Pfad mit ברך.', spells: ['baruch', 'ברך'] },
    ],
  },
];

const ALTAR_SEQUENCE = [
  { id: 'altarNorth', prompt: 'Höre am nördlichen Altar.', spells: ['shama', 'שמע'] },
  { id: 'altarNorthEast', prompt: 'Sichere den Altar mit lo.', spells: ['lo', 'לא'] },
  { id: 'altarEast', prompt: 'Lass Licht auf den Altar fallen.', spells: ['or', 'אור'] },
  { id: 'altarSouthEast', prompt: 'Höre erneut.', spells: ['shama', 'שמע'] },
  { id: 'altarSouth', prompt: 'Verneine Balaks Fluch.', spells: ['lo', 'לא'] },
  { id: 'altarSouthWest', prompt: 'Laß Wasser beruhigen.', spells: ['mayim', 'majim', 'mjm', 'מים'] },
  { id: 'altarWest', prompt: 'Segne, was du erweckt hast.', spells: ['baruch', 'ברך'], fragment: 'ר' },
];

const RESONANCE_STEPS = [
  { id: 'resonanceOuter', prompt: 'Höre den äußeren Ring: sprich שמע.', spells: ['shama', 'שמע'] },
  { id: 'resonanceMiddle', prompt: 'Banne den Fluch mit לא.', spells: ['lo', 'לא'] },
  { id: 'resonanceInner', prompt: 'Sprich ברך, um den Segen freizusetzen.', spells: ['baruch', 'ברך'] },
];

export async function runLevelEight() {
  const plan = levelAmbiencePlan.level8;

  const terraceProps = cloneSceneProps(BAMOT_TERRACE_SCENE.props);
  applySceneConfig({ ...BAMOT_TERRACE_SCENE, props: terraceProps });
  await showLocationSign(terraceProps, { id: 'signBamot', x: 208, text: 'Bamot-Baal | במות בעל' });
  ensureAmbience(plan?.review ?? BAMOT_TERRACE_SCENE.ambience ?? 'desertTravel');
  setSceneContext({ level: 'level8', phase: 'heights' });
  await fadeToBase(600);

  await phaseBalakGreeting(terraceProps);
  await phaseHeightTrials(terraceProps);

  const altarProps = cloneSceneProps(ALTAR_FIELD_SCENE.props);
  await transitionToScene(plan?.learn, ALTAR_FIELD_SCENE, altarProps, 'altars');
  await phaseSevenAltars(altarProps);

  const resonanceProps = cloneSceneProps(RESONANCE_SCENE.props);
  await transitionToScene(plan?.learn, RESONANCE_SCENE, resonanceProps, 'resonance');
  await phaseResonance(resonanceProps);

  const oracleProps = cloneSceneProps(ORACLE_SCENE.props);
  await transitionToScene(plan?.learn, ORACLE_SCENE, oracleProps, 'oracle');
  await phaseFirstOracle(oracleProps);
  await phaseBlessingSequence();
  await phaseReflection();
  await phaseBalakUngeduld(oracleProps);

  const pisgaProps = cloneSceneProps(PISGA_SCENE.props);
  await transitionToScene(plan?.apply, PISGA_SCENE, pisgaProps, 'pisga');
  await phasePisgaPath(pisgaProps);

  await narratorSay('So führte Balak Bileam zum Feld des Spähers. Neue Altare warten.');
  await donkeySay('Merke dir den Segen – er wird wieder verlangt.');
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

async function phaseHeightTrials(props) {
  await narratorSay('Drei Höhen prüfen deine Worte. Jede Kuppe verlangt Hören und Nein.');
  for (const step of HEIGHT_STEPS) {
    const target = props.find(entry => entry.id === step.id)?.x ?? wizard.x + 140;
    await waitForWizardToReach(target, { tolerance: 18 });
    for (const action of step.actions) {
      let done = false;
      while (!done) {
        const answer = await readWord(action.prompt);
        if (action.spells.some(spell => spellEquals(answer, spell))) {
          done = true;
          await celebrateGlyph(answer);
          await narratorSay('Die Stufe reagiert auf dein Wort.');
        } else {
          await donkeySay('Nutze das passende Wort für diese Stufe.');
        }
      }
    }
    updateProp(props, step.id, { type: 'altarGlyphPlateLit' });
    igniteAltarFlame(props, step.id);
    if (step.fragment) {
      addProp(props, { id: `terraceFragment${step.fragment}`, type: 'blessingFragment', x: wizard.x + 14, y: wizard.y - 44, parallax: 0.9, letter: step.fragment });
    }
  }
  await narratorSay('Die Stufen leuchten. Balak zeigt auf den Kamm, wo die Altare warten.');
  igniteAltarFlame(props, 'bamotTorchWest', { offsetY: -52 });
  igniteAltarFlame(props, 'bamotTorchEast', { offsetY: -52 });
}

async function phaseSevenAltars(props) {
  await wizardSay('Baue mir hier sieben Altare und schaffe mir her sieben junge Stiere und sieben Widder.');
  await propSay(props, 'altarAttendantOne', 'Ich tue, wie du sagst.', { anchor: 'center' });
  for (const altar of ALTAR_SEQUENCE) {
    await runAltarRitual(props, altar);
  }
  await narratorSay('Sieben Altare stehen im Licht. Balak wartet auf dein Orakel.');
  await narratorSay('Die Nacht senkt sich, und Balak steht schweigend – ein Schatten neben dem Altar.');
  await divineSay('בלילה הזה יפגשך אלוהי. לא תקלל את אשר ברך יהוה.\nDiese Nacht begegne ich dir: Du wirst nicht verfluchen, was יהוה gesegnet hat.');
  await narratorSay('Du schließt die Augen. Das Feuer glimmt auf, als ob jemand antwortete.');
  igniteAltarFlame(props, 'altarWatchFire', { offsetY: -50 });
}

async function runAltarRitual(props, altar) {
  const target = props.find(entry => entry.id === altar.id)?.x ?? wizard.x + 160;
  await waitForWizardToReach(target, { tolerance: 18 });
  await requireAshIgnition(props, altar.id);
  for (const action of altar.actions ?? []) {
    if (action.prompt) {
      await narratorSay(action.prompt);
    }
    const curseWord = await promptForCurseWord(action.spells);
    await runSpellDrill(curseWord);
  }
  updateProp(props, altar.id, { type: 'altarGlyphPlateLit' });
  if (altar.fragment) {
    addProp(props, {
      id: `altarFragment${altar.fragment}`,
      type: 'blessingFragment',
      x: wizard.x + 16,
      y: wizard.y - 44,
      parallax: 0.9,
      letter: altar.fragment,
    });
  }
}

async function phaseResonance(props) {
  await narratorSay('In der Nacht begegnet dir אלוהים: „Sieben Altare hast du errichtet. Du kannst nicht fluchen, was ich gesegnet habe.“');
  for (const ring of RESONANCE_STEPS) {
    const target = props.find(entry => entry.id === ring.id)?.x ?? wizard.x + 160;
    await waitForWizardToReach(target, { tolerance: 16 });
    const needsBaruchHint = containsBaruchSpell(ring.spells);
    let failures = 0;
    let done = false;
    while (!done) {
      const answer = await readWord(ring.prompt);
      if (ring.spells.some(spell => spellEquals(answer, spell))) {
        done = true;
        updateProp(props, ring.id, { type: 'resonanceRingActive' });
        await celebrateGlyph(answer);
        await narratorSay('Der Ring antwortet auf dein Wort.');
      } else {
        failures += 1;
        if (needsBaruchHint && failures % 3 === 0) {
          await donkeySay('ברך – baruch. Vergiss den Segen nicht.');
        } else {
          await donkeySay('Höre, verneine und segne – in dieser Reihenfolge.');
        }
      }
    }
  }
  await narratorSay('Das Wort ברך formt sich über deinen Händen.');
  let learned = false;
  while (!learned) {
    const answer = await readWord('Sprich ברך (baruch).');
    if (spellEquals(answer, 'baruch', 'ברך')) {
      learned = true;
      addProp(props, { id: 'baruchFragmentKaf', type: 'blessingFragment', x: wizard.x + 18, y: wizard.y - 46, parallax: 0.9, letter: 'ך' });
      await celebrateGlyph(answer);
      await narratorSay('Segen strahlt wie warme Glut.');
      addProp(props, { id: 'baruchGlyphOrbit', type: 'blessingFragmentOrbit', x: wizard.x + 30, y: wizard.y - 52, parallax: 0.92, letter: 'ברך' });
      await narratorSay('Fragmente ב, ר und ך kreisen nun als sichtbare Glyphen um dich.');
      igniteAltarFlame(props, 'resonanceTorch', { offsetY: -48 });
    } else {
      await donkeySay('Sprich es klar: ba-rak.');
    }
  }
}

async function phaseFirstOracle(props) {
  await narratorSay('Bileam hebt an mit seinem Spruch und spricht:');
  await wizardSay('Aus Aram hat mich Balak holen lassen, vom Gebirge des Ostens: Komm, verfluche mir Jakob, komm, verwünsche Israel!');
  await wizardSay('Wie soll ich fluchen, dem אלוהים nicht flucht? Wie soll ich verwünschen, den יהוה nicht verwünscht?');
  await wizardSay('Denn von der Höhe der Felsen sehe ich ihn, und von den Hügeln schaue ich ihn. Siehe, das Volk wohnt abgesondert und wird sich nicht zu den Völkern rechnen.');
  await propSay(props, 'balakWaiting', 'Was tust du mir an? Ich habe dich holen lassen, um meine Feinde zu verfluchen – und siehe, du segnest sie!', { anchor: 'center' });
  await wizardSay('Muss ich nicht reden, was יהוה in meinen Mund gibt?');
}

async function phaseBlessingSequence() {
  await narratorSay('Balak fordert den Fluch. Deine Worte werden Segen.');
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
}

async function phaseReflection() {
  await wizardSay('Ich sprach das Wort, und das Wort sprach zurück.');
  await donkeySay('Wer segnet, richtet den Faden neu aus.');
}

async function phaseBalakUngeduld(props) {
  addProp(props, { id: 'balakWrathAura', type: 'balakWrathEffect', x: wizard.x + 60, y: wizard.y - 32, parallax: 0.96 });
  await narratorSay('Balak versucht, den Segen zu zerreißen; über seinen Händen flackert eine rote Aura.');
  await ensureWizardBesideBalak(props, 'balakWaiting', { offset: -30, tolerance: 16 });
  await propSay(props, 'balakWaiting', 'Komm mit mir an einen andern Ort. Von hier siehst du zu viel. Vielleicht kannst du mir dort das Ende verfluchen.', { anchor: 'center' });
}

async function phasePisgaPath(props) {
  addProp(props, { id: 'pisgaScriptVeil', type: 'pisgaScriptPath', x: wizard.x - 40, y: wizard.y - 30, parallax: 0.8 });
  await narratorSay('Der Weg zum Pisga ist mit Schrift übersät.');
  const steps = [
    { id: 'pisgaStone', prompt: 'Der Späherstein verlangt einen Segen: sprich ברך.', spells: ['baruch', 'ברך'] },
    { id: 'pisgaCleft', prompt: 'Höre und verneine Balaks Linie (שמע, dann לא).', sequence: ['shama', 'lo'] },
    { id: 'pisgaPortal', prompt: 'Öffne das Portal mit לא und schliesse mit ברך.', sequence: ['lo', 'baruch'] },
  ];
  for (const step of steps) {
    const target = props.find(entry => entry.id === step.id)?.x ?? wizard.x + 200;
    await waitForWizardToReach(target, { tolerance: 18 });
    if (!step.sequence) {
      const needsBaruchHint = containsBaruchSpell(step.spells);
      let failures = 0;
      let ok = false;
      while (!ok) {
        const answer = await readWord(step.prompt);
        if (step.spells.some(spell => spellEquals(answer, spell))) {
          ok = true;
          updateProp(props, step.id, { type: 'pisgaBridgeSegmentLit' });
          await celebrateGlyph(answer);
        } else {
          failures += 1;
          if (needsBaruchHint && failures % 3 === 0) {
            await donkeySay('ברך – baruch. Der Stein nimmt nur den Segen an.');
          } else {
            await donkeySay('Der Stein wartet auf den passenden Segen.');
          }
        }
      }
    } else {
      let idx = 0;
      let baruchFailures = 0;
      const canonicalSeq = canonicalizeSequence(step.sequence);
      while (idx < step.sequence.length) {
        const expected = step.sequence[idx];
        const labels = expected === 'shama' ? 'שמע' : expected === 'lo' ? 'לא' : 'ברך';
        const answer = await readWord(step.prompt);
        const multiAdvance = consumeSequenceTokens(answer, canonicalSeq, idx);
        if (multiAdvance > 0) {
          for (let offset = 0; offset < multiAdvance; offset += 1) {
            await celebrateGlyph(step.sequence[idx + offset]);
          }
          idx += multiAdvance;
          if (idx === step.sequence.length) {
            updateProp(props, step.id, { type: 'pisgaBridgeSegmentLit' });
          }
          continue;
        }
        if (spellEquals(answer, expected, labels)) {
          idx += 1;
          if (idx === step.sequence.length) {
            updateProp(props, step.id, { type: 'pisgaBridgeSegmentLit' });
          }
        } else {
          if (expected === 'baruch') {
            baruchFailures += 1;
            if (baruchFailures % 3 === 0) {
              await donkeySay('Der Abschluss lautet ברך – sprich baruch, oder tippe alle Worte auf einmal (z. B. "lo baruch").');
            } else {
              await donkeySay('Halte die Reihenfolge ein.');
            }
          } else {
            await donkeySay('Halte die Reihenfolge ein – oder sprich sie am Stück, getrennt durch Leerzeichen.');
          }
          idx = 0;
        }
      }
    }
  }
}

async function promptForCurseWord(validSpells = []) {
  await donkeySay('Nenne mir ein Fluchwort und ich werde verteidigen.');
  while (true) {
    const response = await readWord('Welches Wort schleudert Balak?');
    const canonical = canonicalSpell(response);
    if (!canonical) {
      await narratorSay('Leere Worte entzünden nichts. Versuche es erneut.');
      continue;
    }
    if (Array.isArray(validSpells) && validSpells.length > 0) {
      const matches = validSpells.some(option => canonical === canonicalSpell(option));
      if (!matches) {
        await narratorSay('Dieses Wort gehört nicht zu diesem Altar.');
        continue;
      }
    }
    return canonical;
  }
}

async function runSpellDrill(curseWord) {
  const stateKey = resolveDrillState(curseWord);
  if (!stateKey) {
    await wizardSay('Dieses Wort erreicht keinen Widerhall in meinem Ritual.');
    return;
  }
  const state = SPELL_DUEL_MACHINE[stateKey];
  if (!state) {
    await wizardSay('Diese Form wurde uns noch nicht gezeigt.');
    return;
  }
  const lines = collectStateLines(state);
  if (lines.length > 0) {
    for (const line of lines) {
      await wizardSay(line);
    }
  } else {
    await wizardSay('Ich halte das Wort still und warte auf die Reaktion.');
  }
  const transition = pickRandomTransitionFromState(state);
  if (transition) {
    const line = transition.line ? ` ${transition.line}` : '';
    await donkeySay(`${transition.word}!${line}`);
  } else {
    await donkeySay('Kein weiterer Schlag antwortet – halte den Kreis geschlossen.');
  }
  await donkeySay('Gut gemacht. Dieser Altar kennt nun deine Verteidigung.');
}

function resolveDrillState(word) {
  const canonical = canonicalSpell(word);
  if (!canonical) return null;
  const baseState = SPELL_DUEL_MACHINE?.start;
  if (!baseState || !baseState.transitions) return null;
  const entry = baseState.transitions[canonical];
  if (!entry) return null;
  if (typeof entry === 'string') return entry;
  return entry.next ?? null;
}

function collectStateLines(state) {
  const lines = [];
  appendSpeechSegment(state?.intro_player, lines);
  appendSpeechSegment(state?.sequence_player, lines);
  if (lines.length === 0) {
    appendSpeechSegment(state?.intro_enemy, lines);
    appendSpeechSegment(state?.sequence_enemy, lines);
  }
  if (lines.length === 0 && typeof state?.prompt_player === 'string') {
    lines.push(state.prompt_player);
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

function pickRandomTransitionFromState(state) {
  if (!state || !state.transitions) return null;
  const options = Object.entries(state.transitions)
    .map(([word, descriptor]) => {
      if (!descriptor) return null;
      if (typeof descriptor === 'string') {
        return { word, line: '' };
      }
      const text = descriptor.text_enemy
        ?? descriptor.text
        ?? descriptor.text_player
        ?? '';
      return { word, line: text?.trim?.() ?? '' };
    })
    .filter(Boolean);
  if (options.length === 0) return null;
  const index = Math.floor(Math.random() * options.length);
  return options[index];
}

function containsBaruchSpell(spells) {
  if (!Array.isArray(spells)) return false;
  return spells.some(spell => {
    if (typeof spell !== 'string') return false;
    const trimmed = spell.trim();
    if (trimmed === 'ברך') return true;
    const base = typeof trimmed.normalize === 'function'
      ? trimmed.normalize('NFKD')
      : trimmed;
    const normalized = base
      .replace(/[^A-Za-z]/g, '')
      .toLowerCase();
    return normalized === 'baruch';
  });
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
