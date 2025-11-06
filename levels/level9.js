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
} from './utils.js';

const PISGA_LINE_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 84,
  donkeyOffset: -40,
  props: [
    { id: 'truthPlateOne', type: 'pisgaAltarPlate', x: 148, align: 'ground', parallax: 0.92 },
    { id: 'truthPlateTwo', type: 'pisgaAltarPlate', x: 212, align: 'ground', parallax: 0.94 },
    { id: 'truthPlateThree', type: 'pisgaAltarPlate', x: 276, align: 'ground', parallax: 0.96 },
    { id: 'truthPlateFour', type: 'pisgaAltarPlate', x: 340, align: 'ground', parallax: 0.98 },
    { id: 'truthPlateFive', type: 'pisgaAltarPlate', x: 404, align: 'ground', parallax: 1.0 },
    { id: 'truthPlateSix', type: 'pisgaAltarPlate', x: 468, align: 'ground', parallax: 1.02 },
    { id: 'truthPlateSeven', type: 'pisgaAltarPlate', x: 532, align: 'ground', parallax: 1.04 },
    { id: 'truthBalakVeil', type: 'balakAngerVeilDormant', x: 596, align: 'ground', parallax: 1.06 },
  ],
};

const DABAR_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 96,
  donkeyOffset: -42,
  props: [
    { id: 'dabarPillarOne', type: 'resonancePillarDormant', x: 216, align: 'ground', parallax: 0.94 },
    { id: 'dabarPillarTwo', type: 'resonancePillarDormant', x: 318, align: 'ground', parallax: 0.96 },
    { id: 'dabarPillarThree', type: 'resonancePillarDormant', x: 420, align: 'ground', parallax: 0.98 },
  ],
};

const MIRROR_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 90,
  donkeyOffset: -42,
  props: [
    { id: 'mirrorSymbolDabar', type: 'truthMirrorSymbolDormant', x: 262, align: 'ground', parallax: 0.94 },
    { id: 'mirrorSymbolEmet', type: 'truthMirrorSymbolDormant', x: 360, align: 'ground', parallax: 0.96 },
  ],
};

const GARDEN_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 92,
  donkeyOffset: -42,
  props: [
    { id: 'gardenNet', type: 'truthWeaveNetDormant', x: 140, align: 'ground', parallax: 0.9 },
    { id: 'gardenSymbolTent', type: 'truthMirrorSymbolDormant', x: 220, align: 'ground', parallax: 0.94 },
    { id: 'gardenSymbolGarden', type: 'truthMirrorSymbolDormant', x: 300, align: 'ground', parallax: 0.96 },
    { id: 'gardenSymbolTree', type: 'truthMirrorSymbolDormant', x: 380, align: 'ground', parallax: 0.98 },
    { id: 'gardenSymbolLion', type: 'truthMirrorSymbolDormant', x: 460, align: 'ground', parallax: 1.0 },
  ],
};

const OATH_SCENE = {
  ambience: 'courtAudience',
  wizardStartX: 94,
  donkeyOffset: -40,
  props: [
    { id: 'truthCircle', type: 'truthCircleSealDormant', x: 304, align: 'ground', parallax: 0.94 },
  ],
};

const PISGA_TASKS = [
  {
    id: 'truthPlateOne',
    x: 148,
    steps: [
      {
        prompt: 'Hoere, bevor du gehst.',
        spells: ['shama', 'שמע'],
        effect: props => updateProp(props, 'truthPlateOne', { type: 'pisgaAltarPlateLit' }),
        success: 'Die Linien offenbaren den Weg vor dir.',
      },
      {
        prompt: 'Blockiere Balaks Befehl.',
        spells: ['lo', 'לא'],
        effect: null,
        success: 'Eine Purpurkette reisst.',
      },
      {
        prompt: 'Segne, was du siehst.',
        spells: ['barak', 'ברכה'],
        effect: props => addProp(props, { id: 'truthFragmentDalet', type: 'truthFragment', x: wizard.x + 10, y: wizard.y - 44, parallax: 0.92, letter: 'ד' }),
        success: 'Fragment ד ruht ueber deinem Grimoire.',
      },
    ],
  },
  {
    id: 'truthPlateTwo',
    x: 212,
    steps: [
      {
        prompt: 'Hoere erneut.',
        spells: ['shama', 'שמע'],
        success: 'Der zweite Pfad wird sichtbar.',
      },
      {
        prompt: 'Sag Nein zu Balaks Wunsch.',
        spells: ['lo', 'לא'],
        success: 'Ein Schatten sinkt nieder.',
      },
      {
        prompt: 'Segne den Pfad.',
        spells: ['barak', 'ברכה'],
        success: 'Der Sand legt sich zu Linien.',
      },
    ],
  },
  {
    id: 'truthPlateThree',
    x: 276,
    steps: [
      { prompt: 'Hoere auf die ferne Stimme.', spells: ['shama', 'שמע'], success: 'Der Wind bringt Fluestern.' },
      { prompt: 'Errichte ein Nein gegen den Fluch.', spells: ['lo', 'לא'], success: 'Fluchschrift zerfaellt.' },
      { prompt: 'Segne den Kreis.', spells: ['barak', 'ברכה'], success: 'Ein goldener Kreis schliesst sich.' },
    ],
  },
  {
    id: 'truthPlateFour',
    x: 340,
    steps: [
      { prompt: 'Hoere den Herzschlag des Berges.', spells: ['shama', 'שמע'], success: 'Der Berg antwortet mit einem Ton.' },
      { prompt: 'Sprich Nein zum Zorn.', spells: ['lo', 'לא'], success: 'Balaks Echo verstummt kurz.' },
      { prompt: 'Schenke Segen.', spells: ['barak', 'ברכה'], success: 'Ein warmer Hauch gleitet ueber den Pfad.' },
    ],
  },
  {
    id: 'truthPlateFive',
    x: 404,
    steps: [
      { prompt: 'Hoere auf Israel.', spells: ['shama', 'שמע'], success: 'Du hoerst Jubel wie fernes Rauschen.' },
      { prompt: 'Sag Nein zu der Forderung.', spells: ['lo', 'לא'], success: 'Der Boden wird fest.' },
      { prompt: 'Segne das Volk.', spells: ['barak', 'ברכה'], success: 'Ein Lichtstrahl zieht ueber das Lager.' },
    ],
  },
  {
    id: 'truthPlateSix',
    x: 468,
    steps: [
      { prompt: 'Hoere den Engel hinter dir.', spells: ['shama', 'שמע'], success: 'Die Luft klingt wie Metall.' },
      { prompt: 'Verneine den Fluch.', spells: ['lo', 'לא'], success: 'Ein Fluchzeichen zerreisst.' },
      { prompt: 'Segne Balaks Angst.', spells: ['barak', 'ברכה'], success: 'Ein sanfter Ton legt sich auf den Pfad.' },
    ],
  },
  {
    id: 'truthPlateSeven',
    x: 532,
    steps: [
      { prompt: 'Hoere noch einmal.', spells: ['shama', 'שמע'], success: 'Die Linien brummen im Takt.' },
      { prompt: 'Sage Nein zu dir selbst.', spells: ['lo', 'לא'], success: 'Stolz verfluessigt sich.' },
      { prompt: 'Segne den kommenden Stern.', spells: ['barak', 'ברכה'], success: 'Ein Sternfunke haelt ueber dem Pfad.' },
    ],
  },
];

export async function runLevelNine() {
  const plan = levelAmbiencePlan.level9;
  const lineProps = cloneSceneProps(PISGA_LINE_SCENE.props);

  applySceneConfig({ ...PISGA_LINE_SCENE, props: lineProps });
  ensureAmbience(plan?.review ?? PISGA_LINE_SCENE.ambience ?? 'courtAudience');
  setSceneContext({ level: 'level9', phase: 'pisga-lines' });
  await showLevelTitle('Level 9 - Die Stimme des Wahren');
  await fadeToBase(600);

  await phasePisgaLines(lineProps);

  const dabarProps = cloneSceneProps(DABAR_SCENE.props);
  await transitionToScene(DABAR_SCENE, plan?.learn, dabarProps, 'dabar-pillar');
  await phaseDabarPillars(dabarProps);

  const mirrorProps = cloneSceneProps(MIRROR_SCENE.props);
  await transitionToScene(MIRROR_SCENE, plan?.learn, mirrorProps, 'mirror');
  await phaseTruthMirror(mirrorProps);

  const gardenProps = cloneSceneProps(GARDEN_SCENE.props);
  await transitionToScene(GARDEN_SCENE, plan?.learn, gardenProps, 'truth-garden');
  await phaseGardenEmet(gardenProps);

  await phaseSecondOracle();

  const oathProps = cloneSceneProps(OATH_SCENE.props);
  await transitionToScene(OATH_SCENE, plan?.apply, oathProps, 'oath');
  await phaseOathCircle(oathProps);

  await narratorSay('Balak stampft mit den Fuessen. Seine Schatten loesen sich vom Boden.');
  await donkeySay('Die Wahrheit steht. Doch Balak wird sie noch pruefen.');
  await fadeToBlack(720);
}

function getPropX(props, id, fallback = wizard.x) {
  const prop = props.find(entry => entry.id === id);
  return prop ? prop.x : fallback;
}

async function phasePisgaLines(props) {
  await narratorSay('Der Gipfel von Pisga zeichnet Kreise aus Licht. Jeder Kreis wartet auf dein Wort.');
  await donkeySay('Halte den Wahrheitskreis, bevor Balaks Zorn ihn zerreisst.');

  for (const plate of PISGA_TASKS) {
    const target = getPropX(props, plate.id, plate.x);
    await waitForWizardToReach(target, { tolerance: 18 });

    for (const step of plate.steps) {
      let solved = false;
      let attempts = 0;
      while (!solved) {
        const answerInput = await promptBubble(
          anchorX(wizard, -6),
          anchorY(wizard, -60),
          step.prompt,
          anchorX(wizard, 0),
          anchorY(wizard, -34),
        );
        const answer = normalizeHebrewInput(answerInput);

        if (step.spells.some(spell => spellEquals(answer, spell))) {
          solved = true;
          if (step.effect) step.effect(props);
          await celebrateGlyph(answer);
          await narratorSay(step.success);
          continue;
        }

        attempts++;
        if (attempts === 1) {
          await donkeySay('Erinnere dich: Hoeren, Nein, Segen.');
        } else {
          attempts = 0;
          await narratorSay('Der Kreis bleibt offen. Versuche es erneut mit Klarheit.');
        }
      }
    }
  }

  await narratorSay('Der Wahrheitskreis schliesst sich. Balaks Schleier flackert.');
}

async function phaseDabarPillars(props) {
  await narratorSay('Drei Saeulen steigen aus Licht. Jede verlangt Hoeren, Nein und das neue Wort.');

  const sequence = ['shama', 'lo', 'dabar'];
  for (let cycle = 0; cycle < 3; cycle++) {
    for (let index = 0; index < sequence.length; index++) {
      const expected = sequence[index];
      const pillarId = cycle === 0 ? 'dabarPillarOne'
        : cycle === 1 ? 'dabarPillarTwo'
        : 'dabarPillarThree';
      const target = getPropX(props, pillarId);
      await waitForWizardToReach(target, { tolerance: 16 });

      let satisfied = false;
      while (!satisfied) {
        const answerInput = await promptBubble(
          anchorX(wizard, -4),
          anchorY(wizard, -58),
          index === 0 ? 'Hoere zuerst.' : index === 1 ? 'Sprich das Nein.' : 'Sprich dabar.',
          anchorX(wizard, 2),
          anchorY(wizard, -32),
        );
        const answer = normalizeHebrewInput(answerInput);

        if (spellEquals(answer, expected, expected === 'shama' ? 'שמע' : expected === 'lo' ? 'לא' : 'דבר')) {
          satisfied = true;
          if (index === 2) {
            updateProp(props, pillarId, { type: 'resonancePillarLit' });
            const letter = cycle === 0 ? 'ב' : cycle === 1 ? 'ב' : 'ר';
            addProp(props, { id: `dabarFragment${cycle}`, type: 'truthFragment', x: wizard.x + 12, y: wizard.y - 44, parallax: 0.92, letter });
          }
          await celebrateGlyph(answer);
          await narratorSay(index === 2 ? 'Die Saeule resonniniert. Ein Fragment loest sich.' : 'Der Klang bewegt sich weiter.');
          continue;
        }

        if (spellEquals(answer, 'barak', 'ברכה')) {
          await narratorSay('Segen wartet noch. Erst das Wort, das geschieht.');
          continue;
        }

        await donkeySay('Lausche, verneine, dann sprich dabar.');
      }
    }
  }

  await narratorSay('Dabar lebt in deinem Mund. Balak spuellt seine Haende im Sand.');
  await Promise.all([
    showLevelTitle('דבר (dabar)', 3000),
    donkeySay('Dabar – das Wort, das geschieht.'),
  ]);
}

async function phaseTruthMirror(props) {
  await narratorSay('Zwei Spiegel warten: einer fuer das Wort, einer fuer die Wahrheit.');

  let stage = 0;
  while (stage < 2) {
    const prompt = stage === 0
      ? 'Sprich dabar in den Spiegel.'
      : 'Nun bestaetige die Wahrheit: emet.';
    const answerInput = await promptBubble(
      anchorX(wizard, -4),
      anchorY(wizard, -60),
      prompt,
      anchorX(wizard, 2),
      anchorY(wizard, -34),
    );
    const answer = normalizeHebrewInput(answerInput);

    if (stage === 0 && spellEquals(answer, 'dabar', 'דבר')) {
      updateProp(props, 'mirrorSymbolDabar', { type: 'truthMirrorSymbolLit' });
      await celebrateGlyph(answer);
      await narratorSay('Der Spiegel zeigt das Wort, wie es geschieht.');
      stage = 1;
      continue;
    }

    if (stage === 1 && spellEquals(answer, 'emet', 'אמת')) {
      updateProp(props, 'mirrorSymbolEmet', { type: 'truthMirrorSymbolLit' });
      addProp(props, { id: 'emetFragmentAleph', type: 'truthFragment', x: wizard.x + 12, y: wizard.y - 44, parallax: 0.92, letter: 'א' });
      await celebrateGlyph(answer);
      await narratorSay('Wahrheit spiegelt die Welt. Fragment א verbindet sich mit deinem Grimoire.');
      stage = 2;
      break;
    }

    await donkeySay('Erst das Wort, dann die Wahrheit.');
    stage = 0;
  }
}

async function phaseGardenEmet(props) {
  await narratorSay('Ein Garten aus Licht wartet. Jedes Zeichen verlangt Wahrheit.');

  const symbols = ['gardenSymbolTent', 'gardenSymbolGarden', 'gardenSymbolTree', 'gardenSymbolLion'];
  for (const id of symbols) {
    const target = getPropX(props, id);
    await waitForWizardToReach(target, { tolerance: 18 });

    let resolved = false;
    while (!resolved) {
      const answerInput = await promptBubble(
        anchorX(wizard, -6),
        anchorY(wizard, -60),
        'Sprich אמת (emet), um das Zeichen zu erfuellen.',
        anchorX(wizard, 0),
        anchorY(wizard, -34),
      );
      const answer = normalizeHebrewInput(answerInput);
      if (spellEquals(answer, 'emet', 'אמת')) {
        resolved = true;
        updateProp(props, id, { type: 'truthMirrorSymbolLit' });
        await celebrateGlyph(answer);
        await narratorSay('Die Wahrheit legt das Zeichen frei.');
        continue;
      }

      if (spellEquals(answer, 'barak', 'ברכה')) {
        await narratorSay('Der Garten dankt fuer den Segen, doch wartet noch auf Wahrheit.');
        continue;
      }

      await donkeySay('Nenne das Wort der Wahrheit.');
    }
  }

  addProp(props, { id: 'emetFragmentMem', type: 'truthFragment', x: wizard.x + 14, y: wizard.y - 42, parallax: 0.92, letter: 'מ' });
  addProp(props, { id: 'emetFragmentTaw', type: 'truthFragment', x: wizard.x + 18, y: wizard.y - 46, parallax: 0.92, letter: 'ת' });
  await celebrateGlyph('emet');
  await narratorSay('Emet vollendet sich. Das Netz aus Licht wird stabil.');
}

async function phaseSecondOracle() {
  await narratorSay('Du sprichst das zweite und dritte Orakel. Balak schlaegt die Haende verzweifelt zusammen.');
  await wizardSay('Gesegnet sei, wer dich segnet, und verflucht, wer dich verflucht.');
  await donkeySay('Worte sind Tore. Du hast sie geoeffnet.');
}

async function phaseOathCircle(props) {
  await narratorSay('Ein Wahrheitskreis erscheint. Er verlangt deine Treue.');

  const sequence = ['shama', 'dabar', 'emet', 'barak'];
  let index = 0;
  while (index < sequence.length) {
    const answerInput = await promptBubble(
      anchorX(wizard, -4),
      anchorY(wizard, -60),
      'Sprich die Wahrheitsformel.',
      anchorX(wizard, 2),
      anchorY(wizard, -34),
    );
    const answer = normalizeHebrewInput(answerInput);
    const expected = sequence[index];
    const variant = expected === 'shama' ? 'שמע'
      : expected === 'dabar' ? 'דבר'
      : expected === 'emet' ? 'אמת'
      : 'ברכה';

    if (spellEquals(answer, expected, variant)) {
      index++;
      if (index === sequence.length) {
        updateProp(props, 'truthCircle', { type: 'truthCircleSealLit' });
      }
      await celebrateGlyph(answer);
      await narratorSay('Der Kreis nimmt das Wort an.');
      continue;
    }

    if (spellEquals(answer, 'lo', 'לא')) {
      await narratorSay('Das Nein schuetzt, aber der Kreis verlangt mehr.');
      continue;
    }

    await donkeySay('Reihenfolge: shama, dabar, emet, barak.');
    index = 0;
  }
}

async function transitionToScene(scene, ambienceKey, props, phase) {
  await fadeToBlack(320);
  ensureAmbience(ambienceKey ?? scene.ambience ?? 'courtAudience');
  setSceneProps([]);
  applySceneConfig({ ...scene, props }, { setAmbience: false });
  setSceneProps(props);
  setSceneContext({ level: 'level9', phase });
  await fadeToBase(360);
}
