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
} from './utils.js';

const BAMOT_TERRACE_SCENE = {
  ambience: 'desertTravel',
  wizardStartX: 78,
  donkeyOffset: -38,
  props: [
    { id: 'bamotSkyVeil', type: 'canyonMist', x: -120, align: 'ground', offsetY: -68, parallax: 0.32, layer: -3 },
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

const TERRACE_STEPS = [
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
      { prompt: 'Segne den Pfad mit ברך.', spells: ['barak', 'ברך'] },
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
  { id: 'altarWest', prompt: 'Segne, was du erweckt hast.', spells: ['barak', 'ברך'], fragment: 'ר' },
];

const RESONANCE_STEPS = [
  { id: 'resonanceOuter', prompt: 'Höre den äußeren Ring: sprich שמע.', spells: ['shama', 'שמע'] },
  { id: 'resonanceMiddle', prompt: 'Banne den Fluch mit לא.', spells: ['lo', 'לא'] },
  { id: 'resonanceInner', prompt: 'Sprich ברך, um den Segen freizusetzen.', spells: ['barak', 'ברך'] },
];

export async function runLevelEight() {
  const plan = levelAmbiencePlan.level8;

  const terraceProps = cloneSceneProps(BAMOT_TERRACE_SCENE.props);
  applySceneConfig({ ...BAMOT_TERRACE_SCENE, props: terraceProps });
  ensureAmbience(plan?.review ?? BAMOT_TERRACE_SCENE.ambience ?? 'desertTravel');
  setSceneContext({ level: 'level8', phase: 'terraces' });
  await showLevelTitle('Level 8 - Der erste Blick vom Bamot-Baal');
  await fadeToBase(600);

  await phaseBalakGreeting(terraceProps);
  await phaseTerraceTrials(terraceProps);

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
  await narratorSay('Balak tritt beiseite, und drei glühende Terrassen werden sichtbar. Jede verlangt Hören, Nein und den Segen.');
  addProp(props, { id: 'bamotGuidingTrailWest', type: 'hoofSignTrail', x: wizard.x + 36, align: 'ground', parallax: 1.04 });
  addProp(props, { id: 'bamotGuidingTrailEast', type: 'hoofSignTrail', x: wizard.x + 88, align: 'ground', parallax: 1.06 });
  await showLevelTitle('Ziel: Folge den Hufspuren und erhelle alle drei Terrassen mit לא, שמע und ברך.', 5200);
}

async function phaseTerraceTrials(props) {
  await narratorSay('Drei Terrassen prüfen deine Worte. Jede Stufe verlangt Hören und Nein.');
  for (const step of TERRACE_STEPS) {
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
    if (step.fragment) {
      addProp(props, { id: `terraceFragment${step.fragment}`, type: 'blessingFragment', x: wizard.x + 14, y: wizard.y - 44, parallax: 0.9, letter: step.fragment });
    }
  }
  await narratorSay('Die Stufen leuchten. Balak zeigt auf den Kamm, wo die Altare warten.');
}

async function phaseSevenAltars(props) {
  await wizardSay('Baue mir hier sieben Altare und schaffe mir her sieben junge Stiere und sieben Widder.');
  await propSay(props, 'altarAttendantOne', 'Ich tue, wie du sagst.', { anchor: 'center' });
  for (const altar of ALTAR_SEQUENCE) {
    const target = props.find(entry => entry.id === altar.id)?.x ?? wizard.x + 160;
    await waitForWizardToReach(target, { tolerance: 18 });
    const needsBarakHint = containsBarakSpell(altar.spells);
    let failures = 0;
    let cleared = false;
    while (!cleared) {
      const answer = await readWord(altar.prompt);
      if (altar.spells.some(spell => spellEquals(answer, spell))) {
        cleared = true;
        updateProp(props, altar.id, { type: 'altarGlyphPlateLit' });
        await celebrateGlyph(answer);
        await requireAshIgnition();
        await narratorSay('Der Altar nimmt das Wort an. Rauch steigt ruhig empor.');
        if (altar.fragment) {
          addProp(props, { id: `altarFragment${altar.fragment}`, type: 'blessingFragment', x: wizard.x + 16, y: wizard.y - 44, parallax: 0.9, letter: altar.fragment });
        }
      } else {
        failures += 1;
        if (needsBarakHint && failures % 3 === 0) {
      await donkeySay('Erinnere dich: ברך wird baruch gesprochen – sprich den Segen, dann antwortet der Altar.');
        } else {
          await donkeySay('Der Altar reagiert nur auf das rechte Wort.');
        }
      }
    }
  }
  await narratorSay('Sieben Altare stehen im Licht. Balak wartet auf dein Orakel.');
  await narratorSay('Die Nacht senkt sich, und Balak steht schweigend – ein Schatten neben dem Altar.');
  await divineSay('בלילה הזה יפגשך אלוהי. לא תקלל את אשר ברך יהוה.\nDiese Nacht begegne ich dir: Du wirst nicht verfluchen, was יהוה gesegnet hat.');
  await narratorSay('Du schließt die Augen. Das Feuer glimmt auf, als ob jemand antwortete.');
}

async function phaseResonance(props) {
  await narratorSay('In der Nacht begegnet dir אלוהים: „Sieben Altare hast du errichtet. Du kannst nicht fluchen, was ich gesegnet habe.“');
  for (const ring of RESONANCE_STEPS) {
    const target = props.find(entry => entry.id === ring.id)?.x ?? wizard.x + 160;
    await waitForWizardToReach(target, { tolerance: 16 });
    const needsBarakHint = containsBarakSpell(ring.spells);
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
        if (needsBarakHint && failures % 3 === 0) {
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
    if (spellEquals(answer, 'barak', 'ברך')) {
      learned = true;
      addProp(props, { id: 'barakFragmentKaf', type: 'blessingFragment', x: wizard.x + 18, y: wizard.y - 46, parallax: 0.9, letter: 'ך' });
      await celebrateGlyph(answer);
      await narratorSay('Segen strahlt wie warme Glut.');
      addProp(props, { id: 'barakGlyphOrbit', type: 'blessingFragmentOrbit', x: wizard.x + 30, y: wizard.y - 52, parallax: 0.92, letter: 'ברך' });
      await narratorSay('Fragmente ב, ר und ך kreisen nun als sichtbare Glyphen um dich.');
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
  const order = ['shama', 'lo', 'barak'];
  const canonicalOrder = canonicalizeSequence(order);
  let index = 0;
  let barakFailures = 0;
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
      if (expected === 'barak') {
        barakFailures += 1;
        if (barakFailures % 3 === 0) {
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
    { id: 'pisgaStone', prompt: 'Der Späherstein verlangt einen Segen: sprich ברך.', spells: ['barak', 'ברך'] },
    { id: 'pisgaCleft', prompt: 'Höre und verneine Balaks Linie (שמע, dann לא).', sequence: ['shama', 'lo'] },
    { id: 'pisgaPortal', prompt: 'Öffne das Portal mit לא und schliesse mit ברך.', sequence: ['lo', 'barak'] },
  ];
  for (const step of steps) {
    const target = props.find(entry => entry.id === step.id)?.x ?? wizard.x + 200;
    await waitForWizardToReach(target, { tolerance: 18 });
    if (!step.sequence) {
      const needsBarakHint = containsBarakSpell(step.spells);
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
          if (needsBarakHint && failures % 3 === 0) {
            await donkeySay('ברך – baruch. Der Stein nimmt nur den Segen an.');
          } else {
            await donkeySay('Der Stein wartet auf den passenden Segen.');
          }
        }
      }
    } else {
      let idx = 0;
      let barakFailures = 0;
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
          if (expected === 'barak') {
            barakFailures += 1;
            if (barakFailures % 3 === 0) {
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

function containsBarakSpell(spells) {
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
  return normalized === 'barak';
  });
}

async function ensureWizardBesideBalak(props, id, { offset = -42, tolerance = 18 } = {}) {
  if (!Array.isArray(props)) return;
  const balak = props.find(entry => entry.id === id);
  if (!balak) return;
  const targetX = (balak.x ?? wizard.x) + offset;
  await waitForWizardToReach(targetX, { tolerance });
}

async function requireAshIgnition() {
  let attempts = 0;
  while (true) {
    const answer = await readWord('Entzünde den Altar mit אש (ash).');
    if (spellEquals(answer, 'ash', 'אש')) {
      await narratorSay('Feuer krönt den Altar, und die Opferglut wird ruhig.');
      return;
    }
    attempts += 1;
    if (attempts % 3 === 0) {
      await donkeySay('Erinner dich an אש – sprich ash, dann flammt das Feuer.');
    } else {
      await donkeySay('Der Altar wartet auf Feuer. Sprich אש.');
    }
  }
}

async function transitionToScene(ambienceKey, sceneConfig, props, phase) {
  await fadeToBlack(360);
  ensureAmbience(ambienceKey ?? sceneConfig.ambience ?? 'desertTravel');
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
