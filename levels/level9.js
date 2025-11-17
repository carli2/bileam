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
  divineSay,
  canonicalizeSequence,
  consumeSequenceTokens,
} from './utils.js';

const PISGA_LINE_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 84,
  donkeyOffset: -40,
  props: [
    { id: 'truthPlateOne', type: 'pisgaAltarPlate', x: 152, align: 'ground', parallax: 0.92 },
    { id: 'truthPlateTwo', type: 'pisgaAltarPlate', x: 216, align: 'ground', parallax: 0.94 },
    { id: 'truthPlateThree', type: 'pisgaAltarPlate', x: 280, align: 'ground', parallax: 0.96 },
    { id: 'truthPlateFour', type: 'pisgaAltarPlate', x: 344, align: 'ground', parallax: 0.98 },
    { id: 'truthPlateFive', type: 'pisgaAltarPlate', x: 408, align: 'ground', parallax: 1.0 },
    { id: 'truthPlateSix', type: 'pisgaAltarPlate', x: 472, align: 'ground', parallax: 1.02 },
    { id: 'truthPlateSeven', type: 'pisgaAltarPlate', x: 536, align: 'ground', parallax: 1.04 },
    { id: 'pisgaBanner', type: 'princeProcessionBanner', x: 112, align: 'ground', parallax: 0.9 },
    { id: 'pisgaBalak', type: 'balakFigure', x: 612, align: 'ground', parallax: 1.08 },
  ],
};

const DABAR_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 96,
  donkeyOffset: -40,
  props: [
    { id: 'dabarPillarOne', type: 'resonancePillarDormant', x: 216, align: 'ground', parallax: 0.94 },
    { id: 'dabarPillarTwo', type: 'resonancePillarDormant', x: 320, align: 'ground', parallax: 0.96 },
    { id: 'dabarPillarThree', type: 'resonancePillarDormant', x: 424, align: 'ground', parallax: 0.98 },
  ],
};

const DABAR_PILLAR_SENTENCES = [
  {
    id: 'dabarPillarOne',
    prompt: 'Säule 1 – Höre das wirksame Wort: tippe שמע דבר (shama dabar).',
    sequence: ['shama', 'dabar'],
    fragment: 'ב',
    hint: 'שמע דבר – hören und handeln – gehört zusammen.',
  },
  {
    id: 'dabarPillarTwo',
    prompt: 'Säule 2 – Sag Nein zum falschen Wort: tippe לא דבר (lo dabar).',
    sequence: ['lo', 'dabar'],
    hint: 'Schreib לא דבר, um leere Rede zu brechen.',
  },
  {
    id: 'dabarPillarThree',
    prompt: 'Säule 3 – Hör, verneine, sprich: tippe שמע לא דבר.',
    sequence: ['shama', 'lo', 'dabar'],
    fragment: 'ר',
    hint: 'Der ganze Satz lautet שמע לא דבר.',
  },
];

const MIRROR_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 90,
  donkeyOffset: -40,
  props: [
    { id: 'mirrorDabar', type: 'truthMirrorSymbolDormant', x: 268, align: 'ground', parallax: 0.94 },
    { id: 'mirrorEmet', type: 'truthMirrorSymbolDormant', x: 360, align: 'ground', parallax: 0.96 },
  ],
};

const GARDEN_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 92,
  donkeyOffset: -40,
  props: [
    { id: 'gardenNet', type: 'truthWeaveNetDormant', x: 140, align: 'ground', parallax: 0.9 },
    { id: 'symbolTent', type: 'truthMirrorSymbolDormant', x: 220, align: 'ground', parallax: 0.94 },
    { id: 'symbolGarden', type: 'truthMirrorSymbolDormant', x: 300, align: 'ground', parallax: 0.96 },
    { id: 'symbolTree', type: 'truthMirrorSymbolDormant', x: 380, align: 'ground', parallax: 0.98 },
    { id: 'symbolLion', type: 'truthMirrorSymbolDormant', x: 460, align: 'ground', parallax: 1.0 },
    { id: 'gardenBalakShadow', type: 'balakFigure', x: 520, align: 'ground', parallax: 1.02 },
  ],
};

const OATH_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 96,
  donkeyOffset: -38,
  props: [
    { id: 'truthCircle', type: 'truthCircleSealDormant', x: 332, align: 'ground', parallax: 0.96 },
  ],
};

const PISGA_SENTENCES = [
  {
    id: 'truthPlateOne',
    description: 'Vision 1 – Zelte Jakobs: Stoffbahnen rauschen, als wollten sie gehört werden.',
    prompt: 'Schreib שמע דבר (shama dabar) – „Höre das Wort“.',
    sequence: ['shama', 'dabar'],
    fragment: 'ד',
    hint: 'Sprich שמע דבר – gerne mit Leerzeichen in einem Zug.',
  },
  {
    id: 'truthPlateTwo',
    description: 'Vision 2 – Staubflüstern: Balaks Befehl kriecht wie Sand über den Grat.',
    prompt: 'Schreib לא ברך (lo baruch) – „Sag Nein und segne“. ',
    sequence: ['lo', 'baruch'],
    hint: 'Tippe לא ברך, um seinen Auftrag zu brechen.',
  },
  {
    id: 'truthPlateThree',
    description: 'Vision 3 – Gärten an Wassern: Bäche glänzen wie Spiegel.',
    prompt: 'Schreib מים ברך (mayim baruch).',
    sequence: ['mayim', 'baruch'],
    hint: 'Der Garten reagiert nur auf מים ברך.',
  },
  {
    id: 'truthPlateFour',
    description: 'Vision 4 – Löwe: sein Atem rollt wie Donner.',
    prompt: 'Schreib שמע אמת (shama emet) – „Höre die Wahrheit“. ',
    sequence: ['shama', 'emet'],
    hint: 'שמע אמת hält den Löwen wahr.',
  },
  {
    id: 'truthPlateFive',
    description: 'Vision 5 – Horn des Wildstiers: Klang, Nein und Wort gehören zusammen.',
    prompt: 'Schreib קול לא דבר (qol lo dabar).',
    sequence: ['qol', 'lo', 'dabar'],
    hint: 'Der Satz lautet genau קול לא דבר.',
  },
  {
    id: 'truthPlateSix',
    description: 'Vision 6 – Stern über Jakob: Licht verlangt nach Segen.',
    prompt: 'Schreib אור ברך (or baruch).',
    sequence: ['or', 'baruch'],
    hint: 'Der Stern wartet auf אור ברך.',
  },
  {
    id: 'truthPlateSeven',
    description: 'Vision 7 – Schlusswort: Segen für die Segnenden.',
    prompt: 'Schreib אמת ברך (emet baruch).',
    sequence: ['emet', 'baruch'],
    hint: 'Der Abschluss lautet אמת ברך.',
  },
];

export async function runLevelNine() {
  const plan = levelAmbiencePlan.level9;

  const pisgaProps = cloneSceneProps(PISGA_LINE_SCENE.props);
  applySceneConfig({ ...PISGA_LINE_SCENE, props: pisgaProps });
  ensureAmbience(plan?.review ?? PISGA_LINE_SCENE.ambience ?? 'courtAudience');
  setSceneContext({ level: 'level9', phase: 'pisga-lines' });
  await showLevelTitle('Level 9 - Die Stimme des Wahren');
  await fadeToBase(600);
  await narratorSay('lo hält die Grenze, shama offenbart den Klang, baruch lenkt den Segen.');
  await narratorSay('Nun erwarten dich zwei neue Worte: דבר (dabar) – das Wort, das geschieht; אמת (emet) – das Licht, das wahr bleibt.');

  await phasePisgaLines(pisgaProps);

  const dabarProps = cloneSceneProps(DABAR_SCENE.props);
  await transitionToScene(plan?.learn, DABAR_SCENE, dabarProps, 'dabar');
  await phaseDabarPillars(dabarProps);

  const mirrorProps = cloneSceneProps(MIRROR_SCENE.props);
  await transitionToScene(plan?.learn, MIRROR_SCENE, mirrorProps, 'mirror');
  await phaseTruthMirror(mirrorProps);

  const gardenProps = cloneSceneProps(GARDEN_SCENE.props);
  await transitionToScene(plan?.learn, GARDEN_SCENE, gardenProps, 'garden');
  await phaseGardenEmet(gardenProps);

  await phaseSecondOracle(gardenProps);

  const oathProps = cloneSceneProps(OATH_SCENE.props);
  await transitionToScene(plan?.apply, OATH_SCENE, oathProps, 'oath');
  await phaseOathCircle(oathProps);

  await narratorSay('Balak stampft. Seine Schatten lösen sich vom Boden.');
  await donkeySay('Du hast das wahre Wort gesprochen. Bereite dich auf seine letzte Forderung vor.');
  await fadeToBlack(720);
}

async function phasePisgaLines(props) {
  await narratorSay('Balak und Bileam erreichen den zerklüfteten Grat des Pisga. Unter ihnen liegen die Lager vergangener Versuche, über ihnen kreisen Glyphen aus Klang.');
  await propSay(props, 'pisgaBalak', 'Komm an einen andern Ort. Von hier wirst du nur das äußerste Ende sehen – vielleicht kannst du mir dort das Volk verfluchen.', { anchor: 'center' });
  await wizardSay('Baue mir hier sieben Altäre und opfere sieben junge Stiere und sieben Widder.');
  await showLevelTitle('לא, שמע, ברך stehen dir bereits. דבר und אמת warten darauf, das Gewebe zu halten.', 5200);
  for (const vision of PISGA_SENTENCES) {
    const target = props.find(entry => entry.id === vision.id)?.x ?? wizard.x + 160;
    await waitForWizardToReach(target, { tolerance: 18 });
    if (vision.description) {
      await narratorSay(vision.description);
    }
    await requireSequenceInput({
      promptText: vision.prompt,
      sequence: vision.sequence,
      hint: vision.hint,
    });
    updateProp(props, vision.id, { type: 'pisgaAltarPlateLit' });
    if (vision.fragment) {
      addProp(props, { id: `truthFragment${vision.fragment}`, type: 'truthFragment', x: wizard.x + 14, y: wizard.y - 44, parallax: 0.9, letter: vision.fragment });
    }
  }
  await narratorSay('Der Wahrheitskreis schliesst sich. Balaks Schleier flackert.');
}

async function phaseDabarPillars(props) {
  await divineSay('לא איש אל ויכזב ובן אדם ויתנחם ההוא אמר ולא יעשה ודבר ולא יקימנה\nIch bin nicht ein Mensch, dass ich Lüge, noch ein Menschenkind, dass ich bereue. Sollte ich reden und es nicht tun? Sollte ich sprechen und es nicht halten?');
  await narratorSay('Dabar – das Wort, das geschieht. Wenn אלוהים spricht, handelt er. Nun prüft er, ob du dasselbe tust.');
  for (const pillar of DABAR_PILLAR_SENTENCES) {
    const target = props.find(entry => entry.id === pillar.id)?.x ?? wizard.x + 180;
    await waitForWizardToReach(target, { tolerance: 16 });
    await requireSequenceInput({
      promptText: pillar.prompt,
      sequence: pillar.sequence,
      hint: pillar.hint,
    });
    updateProp(props, pillar.id, { type: 'resonancePillarLit' });
    if (pillar.fragment) {
      addProp(props, { id: `dabarFragment${pillar.fragment}`, type: 'truthFragment', x: wizard.x + 18, y: wizard.y - 44, parallax: 0.9, letter: pillar.fragment });
    }
  }
  await narratorSay('Dabar lebt in deinem Mund.');
  await Promise.all([
    showLevelTitle('דבר (dabar)', 2800),
    donkeySay('Dabar – das Wort, das geschieht.'),
  ]);
}

async function phaseTruthMirror(props) {
  await narratorSay('Zwei Spiegel warten: einer für das Wort, einer für die Wahrheit.');
  await narratorSay('Wenn du דבר sprichst, muss es geschehen. Wenn du אמת sprichst, bleibt es bestehen.');
  let stage = 0;
  while (stage < 2) {
    if (stage === 0) {
      const answer = await readWord('Sprich דבר (dabar) in den Spiegel.');
      if (spellEquals(answer, 'dabar', 'דבר')) {
        updateProp(props, 'mirrorDabar', { type: 'truthMirrorSymbolLit' });
        await celebrateGlyph(answer);
        stage = 1;
      } else {
        await donkeySay('Zuerst das Wort.');
      }
    } else {
      const answer = await readWord('Sprich אמת (emet), damit der Spiegel die Wahrheit zeigt.');
      if (spellEquals(answer, 'emet', 'אמת')) {
        updateProp(props, 'mirrorEmet', { type: 'truthMirrorSymbolLit' });
        addProp(props, { id: 'emetFragmentAleph', type: 'truthFragment', x: wizard.x + 16, y: wizard.y - 44, parallax: 0.9, letter: 'א' });
        await celebrateGlyph(answer);
        stage = 2;
      } else {
        await donkeySay('Erst das wahre Wort, dann die Wahrheit selbst.');
      }
    }
  }
}

async function phaseGardenEmet(props) {
  await narratorSay('Ein Garten aus Licht breitet sich aus: Zelte, Gärten, Bäume, Löwen warten auf Wahrheit.');
  await narratorSay('Emet – אמת – ist ehernes Gewicht: Alef (א) für אלוהים, Mem (מ) für die Mitte, Taw (ת) für das Ende. Bleibt ein Buchstabe aus, zerfällt das Wort zu Lüge.');
  const symbols = ['symbolTent', 'symbolGarden', 'symbolTree', 'symbolLion'];
  for (const id of symbols) {
    const target = props.find(entry => entry.id === id)?.x ?? wizard.x + 180;
    await waitForWizardToReach(target, { tolerance: 18 });
    let ok = false;
    while (!ok) {
      const answer = await readWord('Sprich אמת (emet), damit das Bild wahr bleibt.');
      if (spellEquals(answer, 'emet', 'אמת')) {
        ok = true;
        updateProp(props, id, { type: 'truthMirrorSymbolLit' });
        await celebrateGlyph(answer);
      } else {
        await donkeySay('Nur die Wahrheit hält das Bild.');
      }
    }
  }
  addProp(props, { id: 'emetFragmentMem', type: 'truthFragment', x: wizard.x + 18, y: wizard.y - 46, parallax: 0.9, letter: 'מ' });
  addProp(props, { id: 'emetFragmentTaw', type: 'truthFragment', x: wizard.x + 24, y: wizard.y - 48, parallax: 0.9, letter: 'ת' });
  await celebrateGlyph('אמת');
  await narratorSay('Emet vollendet sich. Das Netz aus Licht wird stabil.');
}

async function phaseSecondOracle(props) {
  await narratorSay('Bileam spricht:');
  await wizardSay('Man sieht kein Unheil in Jakob, keine Mühsal in Israel. יהוה, sein אלוהים, ist bei ihm, und es jauchzt dem König zu.');
  await wizardSay('Daher hilft kein Zaubern gegen Jakob und kein Wahrsagen gegen Israel. Zu rechter Zeit wird gesagt, was אלוהים gewirkt hat.');
  await wizardSay('אלוהים hat sie aus Ägypten geführt; er ist für sie wie das Horn des Wildstiers.');
  await wizardSay('Wie Täler, die sich ausbreiten, wie Gärten an Wassern, wie Aloebäume, die יהוה pflanzt, wie Zedern an den Wassern.');
  await wizardSay('Er hat sich hingestreckt wie ein Löwe – wer will ihn aufstören?');
  await wizardSay('ברוך מברכיך וארור ארריך\nGesegnet sei, wer dich segnet, und verflucht, wer dich verflucht!');
  await propSay(props, 'gardenBalakShadow', 'Wenn du schon nicht fluchst, so segne sie wenigstens nicht!', { anchor: 'center' });
  await wizardSay('Hab ich dir nicht gesagt: Alles, was יהוה redet, das werde ich tun?');
  await wizardSay('Vielleicht ist jedes wahre Wort ein Tor.');
  await wizardSay('Wenn es gesprochen wird, öffnet sich für einen Augenblick der Plan des Lichts, der uns alle trägt.');
  await donkeySay('Worte sind Tore. Du hast sie geöffnet.');
}

async function phaseOathCircle(props) {
  await narratorSay('Ein Wahrheitskreis verlangt deine Treue. Sprich shama → dabar → emet → baruch.');
  await narratorSay('Höre (שמע), sprich das wirksame Wort (דבר), halte es wahr (אמת) und lasse den Segen fließen (ברך).');
  const order = [
    { word: 'shama', prompt: 'Sprich שמע.' },
    { word: 'dabar', prompt: 'Sprich דבר.' },
    { word: 'emet', prompt: 'Sprich אמת.' },
    { word: 'baruch', prompt: 'Sprich ברך.' },
  ];
  const canonicalOrder = canonicalizeSequence(order.map(entry => entry.word));
  let index = 0;
  while (index < order.length) {
    const { word, prompt } = order[index];
    const variant = word === 'shama' ? 'שמע' : word === 'dabar' ? 'דבר' : word === 'emet' ? 'אמת' : 'ברך';
    const answer = await readWord(prompt);
    const multiAdvance = consumeSequenceTokens(answer, canonicalOrder, index);
    if (multiAdvance > 0) {
      for (let offset = 0; offset < multiAdvance; offset += 1) {
        await celebrateGlyph(order[index + offset].word);
      }
      index += multiAdvance;
      continue;
    }
    if (spellEquals(answer, word, variant)) {
      index += 1;
      await celebrateGlyph(answer);
    } else {
      await donkeySay('Reihenfolge: shama, dabar, emet, baruch. Du kannst sie auch gesammelt eingeben, getrennt durch Leerzeichen.');
      index = 0;
    }
  }
  updateProp(props, 'truthCircle', { type: 'truthCircleSealLit' });
  await narratorSay('Der Kreis schliesst sich. Du bist Wahrheitsbote.');
}

async function transitionToScene(ambienceKey, sceneConfig, props, phase) {
  await fadeToBlack(320);
  ensureAmbience(ambienceKey ?? sceneConfig.ambience ?? 'courtAudience');
  setSceneProps([]);
  applySceneConfig({ ...sceneConfig, props }, { setAmbience: false });
  setSceneProps(props);
  setSceneContext({ level: 'level9', phase });
  await fadeToBase(360);
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

function hebrewVariant(word) {
  switch (word) {
    case 'shama':
      return 'שמע';
    case 'lo':
      return 'לא';
    case 'baruch':
      return 'ברך';
    case 'dabar':
      return 'דבר';
    case 'emet':
      return 'אמת';
    case 'mayim':
      return 'מים';
    case 'or':
      return 'אור';
    case 'qol':
      return 'קול';
    default:
      return word;
  }
}

async function requireSequenceInput({ promptText, sequence, hint }) {
  const canonicalSeq = canonicalizeSequence(sequence);
  let idx = 0;
  while (idx < sequence.length) {
    const answer = await readWord(promptText);
    const multiAdvance = consumeSequenceTokens(answer, canonicalSeq, idx);
    if (multiAdvance > 0) {
      for (let offset = 0; offset < multiAdvance; offset += 1) {
        await celebrateGlyph(sequence[idx + offset]);
      }
      idx += multiAdvance;
      continue;
    }
    const expected = sequence[idx];
    const variant = hebrewVariant(expected);
    if (spellEquals(answer, expected, variant)) {
      await celebrateGlyph(expected);
      idx += 1;
    } else {
      if (hint) {
        await donkeySay(hint);
      } else {
        await donkeySay('Sprich den ganzen Satz – du kannst alle Worte hintereinander mit Leerzeichen tippen.');
      }
      idx = 0;
    }
  }
}
