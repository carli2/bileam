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
  divineSay,
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

const PISGA_TASKS = [
  {
    id: 'truthPlateOne',
    words: ['shama', 'lo', 'barak'],
    descriptions: [
      'Höre den ersten Kreis.',
      'Versiegle ihn mit לא.',
      'Segne, was du gesehen hast.',
    ],
    fragment: 'ד',
  },
  {
    id: 'truthPlateTwo',
    words: ['shama', 'lo', 'barak'],
    descriptions: [
      'Höre erneut.',
      'Sag erneut Nein.',
      'Segne Balaks Furcht.',
    ],
  },
  {
    id: 'truthPlateThree',
    words: ['shama', 'lo', 'barak'],
    descriptions: [
      'Lausche auf das Echo.',
      'Verneine den Fluch.',
      'Segne den Kreis.',
    ],
  },
  {
    id: 'truthPlateFour',
    words: ['shama', 'lo', 'barak'],
    descriptions: [
      'Höre den Herzschlag des Berges.',
      'Sag Nein zum Zorn.',
      'Schenke Segen.',
    ],
  },
  {
    id: 'truthPlateFive',
    words: ['shama', 'lo', 'barak'],
    descriptions: [
      'Höre auf Israel.',
      'Sag Nein zum Fluch.',
      'Segne das Volk.',
    ],
  },
  {
    id: 'truthPlateSix',
    words: ['shama', 'lo', 'barak'],
    descriptions: [
      'Höre auf den Engel hinter dir.',
      'Verneine Balaks Stimme.',
      'Segne Balaks Angst.',
    ],
  },
  {
    id: 'truthPlateSeven',
    words: ['shama', 'lo', 'barak'],
    descriptions: [
      'Höre ein letztes Mal.',
      'Sag Nein zu dir selbst.',
      'Segne den Stern, der kommt.',
    ],
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
  await narratorSay('Aktive Worte: lo, shama, barak. Neue Worte zum Ergründen: dabar (דבר) – Wort, das geschieht; emet (אמת) – Wahrheit, die trägt. Ziel: Errichte den Wahrheitskreis, bevor Balaks Druck das Gewebe reisst.');
  for (const plate of PISGA_TASKS) {
    const target = props.find(entry => entry.id === plate.id)?.x ?? wizard.x + 160;
    await waitForWizardToReach(target, { tolerance: 18 });
    for (let i = 0; i < plate.words.length; i += 1) {
      const expected = plate.words[i];
      const prompt = plate.descriptions[i];
      let done = false;
      while (!done) {
        const answer = await readWord(prompt);
        const variant = expected === 'shama' ? 'שמע' : expected === 'lo' ? 'לא' : 'ברך';
        if (spellEquals(answer, expected, variant)) {
          done = true;
          await celebrateGlyph(answer);
        } else {
          await donkeySay('Erinnere dich: höre, verneine, segne.');
        }
      }
    }
    updateProp(props, plate.id, { type: 'pisgaAltarPlateLit' });
    if (plate.fragment) {
      addProp(props, { id: `truthFragment${plate.fragment}`, type: 'truthFragment', x: wizard.x + 14, y: wizard.y - 44, parallax: 0.9, letter: plate.fragment });
    }
  }
  await narratorSay('Der Wahrheitskreis schliesst sich. Balaks Schleier flackert.');
}

async function phaseDabarPillars(props) {
  await divineSay('לא איש אל ויכזב ובן אדם ויתנחם ההוא אמר ולא יעשה ודבר ולא יקימנה\nIch bin nicht ein Mensch, dass ich Lüge, noch ein Menschenkind, dass ich bereue. Sollte ich reden und es nicht tun? Sollte ich sprechen und es nicht halten?');
  const sequence = ['shama', 'lo', 'dabar'];
  const pillarFragments = ['ב', 'ר'];
  for (let i = 0; i < props.length; i += 1) {
    const id = i === 0 ? 'dabarPillarOne' : i === 1 ? 'dabarPillarTwo' : 'dabarPillarThree';
    const target = props.find(entry => entry.id === id)?.x ?? wizard.x + 180;
    await waitForWizardToReach(target, { tolerance: 16 });
    for (const expected of sequence) {
      let ok = false;
      while (!ok) {
        const answer = await readWord(expected === 'shama' ? 'Höre zuerst.' : expected === 'lo' ? 'Sprich לא.' : 'Sprich דבר (dabar).');
        const variant = expected === 'shama' ? 'שמע' : expected === 'lo' ? 'לא' : 'דבר';
        if (spellEquals(answer, expected, variant)) {
          ok = true;
          await celebrateGlyph(answer);
        } else {
          await donkeySay('Reihenfolge: shama, lo, dabar.');
        }
      }
    }
    updateProp(props, id, { type: 'resonancePillarLit' });
    const fragment = pillarFragments[i];
    if (fragment) {
      addProp(props, { id: `dabarFragment${fragment}`, type: 'truthFragment', x: wizard.x + 18 + i * 4, y: wizard.y - 44 - i * 3, parallax: 0.9, letter: fragment });
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
  await wizardSay('Man sieht kein Unheil in Jakob, keine Mühsal in Israel. Der HERR, sein Gott, ist bei ihm, und es jauchzt dem König zu.');
  await wizardSay('Daher hilft kein Zaubern gegen Jakob und kein Wahrsagen gegen Israel. Zu rechter Zeit wird gesagt, was Gott gewirkt hat.');
  await wizardSay('Gott hat sie aus Ägypten geführt; er ist für sie wie das Horn des Wildstiers.');
  await wizardSay('Wie Täler, die sich ausbreiten, wie Gärten an Wassern, wie Aloebäume, die der HERR pflanzt, wie Zedern an den Wassern.');
  await wizardSay('Er hat sich hingestreckt wie ein Löwe – wer will ihn aufstören?');
  await wizardSay('Gesegnet sei, wer dich segnet, und verflucht, wer dich verflucht!');
  await propSay(props, 'gardenBalakShadow', 'Wenn du schon nicht fluchst, so segne sie wenigstens nicht!', { anchor: 'center' });
  await wizardSay('Hab ich dir nicht gesagt: Alles, was der HERR redet, das werde ich tun?');
  await wizardSay('Vielleicht ist jedes wahre Wort ein Tor.');
  await wizardSay('Wenn es gesprochen wird, öffnet sich für einen Augenblick der Plan des Lichts, der uns alle trägt.');
  await donkeySay('Worte sind Tore. Du hast sie geöffnet.');
}

async function phaseOathCircle(props) {
  await narratorSay('Ein Wahrheitskreis verlangt deine Treue. Sprich shama → dabar → emet → barak.');
  const order = [
    { word: 'shama', prompt: 'Sprich שמע.' },
    { word: 'dabar', prompt: 'Sprich דבר.' },
    { word: 'emet', prompt: 'Sprich אמת.' },
    { word: 'barak', prompt: 'Sprich ברך.' },
  ];
  let index = 0;
  while (index < order.length) {
    const { word, prompt } = order[index];
    const variant = word === 'shama' ? 'שמע' : word === 'dabar' ? 'דבר' : word === 'emet' ? 'אמת' : 'ברך';
    const answer = await readWord(prompt);
    if (spellEquals(answer, word, variant)) {
      index += 1;
      await celebrateGlyph(answer);
    } else {
      await donkeySay('Reihenfolge: shama, dabar, emet, barak.');
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
  return normalizeHebrewInput(input);
}
