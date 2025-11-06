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

const BAMOT_APPROACH_SCENE = {
  ambience: 'desertTravel',
  wizardStartX: 76,
  donkeyOffset: -40,
  props: [
    { id: 'bamotBackdrop', type: 'moabWindRaster', x: -48, align: 'ground', parallax: 0.62 },
    { id: 'bamotGuardWest', type: 'moabWatcherGuard', x: 132, align: 'ground', parallax: 0.88 },
    { id: 'bamotGuardEast', type: 'moabWatcherGuard', x: 532, align: 'ground', parallax: 1.06 },
    { id: 'bamotTerraceOne', type: 'altarGlyphPlateDormant', x: 176, align: 'ground', parallax: 0.98 },
    { id: 'bamotTerraceTwo', type: 'altarGlyphPlateDormant', x: 328, align: 'ground', parallax: 1.0 },
    { id: 'bamotTerraceThree', type: 'altarGlyphPlateDormant', x: 480, align: 'ground', parallax: 1.02 },
  ],
};

const ALTAR_FIELD_SCENE = {
  ambience: 'desertTravel',
  wizardStartX: 88,
  donkeyOffset: -42,
  props: [
    { id: 'altarFieldBackdrop', type: 'altarPlateField', x: -36, align: 'ground', parallax: 0.64 },
    { id: 'altarNorth', type: 'altarGlyphPlateDormant', x: 132, align: 'ground', parallax: 0.96 },
    { id: 'altarNorthEast', type: 'altarGlyphPlateDormant', x: 212, align: 'ground', parallax: 0.97 },
    { id: 'altarEast', type: 'altarGlyphPlateDormant', x: 288, align: 'ground', parallax: 0.98 },
    { id: 'altarSouthEast', type: 'altarGlyphPlateDormant', x: 360, align: 'ground', parallax: 0.99 },
    { id: 'altarSouth', type: 'altarGlyphPlateDormant', x: 430, align: 'ground', parallax: 1.0 },
    { id: 'altarSouthWest', type: 'altarGlyphPlateDormant', x: 498, align: 'ground', parallax: 1.0 },
    { id: 'altarWest', type: 'altarGlyphPlateDormant', x: 564, align: 'ground', parallax: 1.02 },
  ],
};

const RESONANCE_SCENE = {
  ambience: 'desertTravel',
  wizardStartX: 96,
  donkeyOffset: -44,
  props: [
    { id: 'resonanceOuterRing', type: 'resonanceRingDormant', x: 236, align: 'ground', parallax: 0.92 },
    { id: 'resonanceMidRing', type: 'resonanceRingDormant', x: 316, align: 'ground', parallax: 0.95 },
    { id: 'resonanceInnerRing', type: 'resonanceRingDormant', x: 396, align: 'ground', parallax: 0.98 },
  ],
};

const ORACLE_SCENE = {
  ambience: 'desertTravel',
  wizardStartX: 102,
  donkeyOffset: -40,
  props: [
    { id: 'oracleBackdrop', type: 'balakThronePresence', x: 124, align: 'ground', parallax: 0.9 },
    { id: 'oracleBalak', type: 'balakAngerVeilDormant', x: 488, align: 'ground', parallax: 1.04 },
  ],
};

const PISGA_PATH_SCENE = {
  ambience: 'desertTravel',
  wizardStartX: 86,
  donkeyOffset: -38,
  props: [
    { id: 'pisgaBackdrop', type: 'pisgaBridgeRunesDormant', x: -40, align: 'ground', parallax: 0.68 },
    { id: 'pisgaStone', type: 'borderMilestone', x: 210, align: 'ground', parallax: 0.94 },
    { id: 'pisgaBush', type: 'borderThorn', x: 324, align: 'ground', parallax: 0.96 },
    { id: 'pisgaWatch', type: 'watchFireDormant', x: 462, align: 'ground', parallax: 1.02 },
  ],
};

const STAR_BRIDGE_SCENE = {
  ambience: 'desertTravel',
  wizardStartX: 80,
  donkeyOffset: -38,
  props: [
    { id: 'starBridgeSegmentOne', type: 'pisgaBridgeSegmentDormant', x: 146, align: 'ground', parallax: 0.94 },
    { id: 'starBridgeSegmentTwo', type: 'pisgaBridgeSegmentDormant', x: 226, align: 'ground', parallax: 0.96 },
    { id: 'starBridgeSegmentThree', type: 'pisgaBridgeSegmentDormant', x: 306, align: 'ground', parallax: 0.98 },
    { id: 'starBridgeSegmentFour', type: 'pisgaBridgeSegmentDormant', x: 386, align: 'ground', parallax: 1.0 },
    { id: 'starBridgeSegmentFive', type: 'pisgaBridgeSegmentDormant', x: 466, align: 'ground', parallax: 1.02 },
    { id: 'starBridgeSegmentSix', type: 'pisgaBridgeSegmentDormant', x: 546, align: 'ground', parallax: 1.04 },
  ],
};

const TERRACE_TASKS = [
  {
    id: 'bamotTerraceOne',
    x: 176,
    prompts: [
      {
        line: 'Blockiere Balaks Befehl mit dem Wort, das den Strom stoppt.',
        spells: ['lo', 'לא'],
        effect: props => {
          updateProp(props, 'bamotTerraceOne', { type: 'altarGlyphPlateLit' });
          addProp(props, { id: 'terraceOneFragment', type: 'blessingFragment', x: wizard.x + 10, y: wizard.y - 40, parallax: 0.92, letter: 'ב' });
        },
        success: 'Die Kette um den Banner aus Purpur bricht. Fragment ב schwebt herab.',
      },
      {
        line: 'Hoere, was unter dem Sand klingt.',
        spells: ['shama', 'שמע'],
        effect: props => addProp(props, { id: 'terraceOneTrail', type: 'hoofSignTrail', x: wizard.x + 12, y: wizard.y - 16, parallax: 1.05 }),
        success: 'Ein Hoerton steigt auf, der Sand ordnet sich zu Linien.',
      },
    ],
  },
  {
    id: 'bamotTerraceTwo',
    x: 328,
    prompts: [
      {
        line: 'Lass Licht die Schatten zeigen.',
        spells: ['or', 'אור'],
        effect: props => updateProp(props, 'bamotTerraceTwo', { type: 'altarGlyphPlateLit' }),
        success: 'Der zweite Ring glaenzt. Auf dem Boden erscheint eine Sternspur.',
      },
      {
        line: 'Sichere den Ring mit einem Nein gegen Balaks Blick.',
        spells: ['lo', 'לא'],
        effect: props => addProp(props, { id: 'terraceTwoFragment', type: 'blessingFragment', x: wizard.x + 10, y: wizard.y - 42, parallax: 0.92, letter: 'ר' }),
        success: 'Fragment ר ruht ueber deinem Grimoire.',
      },
    ],
  },
  {
    id: 'bamotTerraceThree',
    x: 480,
    prompts: [
      {
        line: 'Hoere erneut – die Fuersten fluestern hinter den Bannern.',
        spells: ['shama', 'שמע'],
        effect: props => updateProp(props, 'bamotTerraceThree', { type: 'altarGlyphPlateLit' }),
        success: 'Die Fuersten erstarren. Ihre Worte werden als Ziehen in der Luft spuerbar.',
      },
      {
        line: 'Segne den Pfad mit dem Wort, das du bald vollstaendig lernen wirst.',
        spells: ['barak', 'ברכה'],
        effect: props => addProp(props, { id: 'terraceThreeTrail', type: 'hoofSignTrail', x: wizard.x + 14, y: wizard.y - 18, parallax: 1.05 }),
        success: 'Ein warmer Wind legt sich auf den Weg. Balak runzelt die Stirn in der Ferne.',
      },
    ],
  },
];

const ALTAR_SEQUENCE = [
  { id: 'altarNorth', prompt: 'Der Norden ruft nach Hoeren.', spells: ['shama', 'שמע'] },
  { id: 'altarNorthEast', prompt: 'Der Nordosten verlangt ein Nein gegen Fluch.', spells: ['lo', 'לא'] },
  { id: 'altarEast', prompt: 'Osten: Bring Licht in die Linien.', spells: ['or', 'אור'] },
  { id: 'altarSouthEast', prompt: 'Suedeast: Halte die Linien mit Hoeren.', spells: ['shama', 'שמע'] },
  { id: 'altarSouth', prompt: 'Sueden: Verbiete Balaks Schatten.', spells: ['lo', 'לא'] },
  { id: 'altarSouthWest', prompt: 'Suede Westen: Lass Wasser den Staub beruhigen.', spells: ['mayim', 'majim', 'mjm', 'מים'] },
  { id: 'altarWest', prompt: 'Westen: Segne, was du erweckt hast.', spells: ['barak', 'ברכה'] },
];

const RESONANCE_SEQUENCE = [
  { id: 'resonanceOuterRing', prompt: 'Der aeussere Ring fordert Hoeren.', spells: ['shama', 'שמע'], success: 'Der Ring leuchtet und laesst Klangfaden fallen.' },
  { id: 'resonanceMidRing', prompt: 'Der mittlere Ring verlangt ein Nein.', spells: ['lo', 'לא'], success: 'Der zweite Ring schliesst sich. Schatten weichen zurueck.' },
  { id: 'resonanceInnerRing', prompt: 'Der innere Ring sucht den Segen.', spells: ['barak', 'ברכה'], success: 'Alle drei Ringe resonnieren. Ein neues Wort formt sich ueber deiner Hand.' },
];

const PISGA_STATIONS = [
  {
    id: 'pisgaStone',
    prompt: 'Der Schriftstein lockt Balaks Fluch. Welche Formel stoppt ihn?',
    spells: ['lo', 'לא'],
    success: 'Der Stein zerbricht zu Staub, Balaks Worte verklingen.',
  },
  {
    id: 'pisgaBush',
    prompt: 'Die Dornen verlangen Wasser, damit die Eselin passieren kann.',
    spells: ['mayim', 'majim', 'mjm', 'מים'],
    success: 'Tau legt sich auf die Dornen. Ein schmaler Pfad oeffnet sich.',
  },
  {
    id: 'pisgaWatch',
    prompt: 'Das Wachfeuer darf Balaks Blick nicht fuehren. Welche Kombination nutzt du?',
    spells: ['or', 'אור', 'lo', 'לא'],
  },
];

const STAR_BRIDGE_SEQUENCE = [
  { id: 'starBridgeSegmentOne', prompt: 'Der erste Sternschritt verlangt Licht.', spells: ['or', 'אור'] },
  { id: 'starBridgeSegmentTwo', prompt: 'Der zweite Sternschritt verlangt Wahrheit.', spells: ['emet', 'אמת'] },
  { id: 'starBridgeSegmentThree', prompt: 'Der dritte Sternschritt verlangt Segen im Licht.', spells: ['barak', 'ברכה'] },
  { id: 'starBridgeSegmentFour', prompt: 'Der vierte Sternschritt hoert erst zu.', spells: ['shama', 'שמע'] },
  { id: 'starBridgeSegmentFive', prompt: 'Der fuenfte Sternschritt braucht das Wort, das geschieht.', spells: ['dabar', 'דבר'] },
  { id: 'starBridgeSegmentSix', prompt: 'Der letzte Schritt verlangt das Licht erneut.', spells: ['or', 'אור'] },
];

export async function runLevelEight() {
  const plan = levelAmbiencePlan.level8;
  const approachProps = cloneSceneProps(BAMOT_APPROACH_SCENE.props);

  applySceneConfig({ ...BAMOT_APPROACH_SCENE, props: approachProps });
  ensureAmbience(plan?.review ?? BAMOT_APPROACH_SCENE.ambience ?? 'desertTravel');
  setSceneContext({ level: 'level8', phase: 'approach' });
  await showLevelTitle('Level 8 - Der erste Blick vom Bamot-Baal');
  await fadeToBase(600);

  await phaseApproachTerraces(approachProps);

  const altarProps = cloneSceneProps(ALTAR_FIELD_SCENE.props);
  await transitionToScene(ALTAR_FIELD_SCENE, plan?.learn, altarProps, 'altars');
  await phaseSevenAltars(altarProps);

  const resonanceProps = cloneSceneProps(RESONANCE_SCENE.props);
  await transitionToScene(RESONANCE_SCENE, plan?.learn, resonanceProps, 'resonance');
  await phaseResonanceRevelation(resonanceProps);

  const oracleProps = cloneSceneProps(ORACLE_SCENE.props);
  await transitionToScene(ORACLE_SCENE, plan?.learn, oracleProps, 'oracle');
  await phaseFirstOracle();
  await phaseOracleSequence();
  await phaseReflection();
  await phaseBalakDemand();

  const pisgaProps = cloneSceneProps(PISGA_PATH_SCENE.props);
  await transitionToScene(PISGA_PATH_SCENE, plan?.apply, pisgaProps, 'pisga');
  await phasePisgaStations(pisgaProps);

  const bridgeProps = cloneSceneProps(STAR_BRIDGE_SCENE.props);
  await transitionToScene(STAR_BRIDGE_SCENE, plan?.apply, bridgeProps, 'bridge');
  await phaseStarBridge(bridgeProps);

  await narratorSay('Balak fuehrt dich zum Feld des Spaeher. Neue Altare warten in der Ferne.');
  await donkeySay('Der Stern ist erwacht – doch Balaks Zweifel ist nicht gestillt.');
  await fadeToBlack(720);
}

function getPropX(props, id, fallback = wizard.x) {
  const prop = props.find(entry => entry.id === id);
  return prop ? prop.x : fallback;
}

async function phaseApproachTerraces(props) {
  await narratorSay('Balak wartet, doch zuerst prueft er, ob du seine Stufen reinigst.');
  await donkeySay('Jede Terrasse verlangt nach einem Wort. Lass die Banner sprechen.');

  for (const terrace of TERRACE_TASKS) {
    await waitForWizardToReach(terrace.x, { tolerance: 18 });
    for (const task of terrace.prompts) {
      let resolved = false;
      let attempts = 0;
      while (!resolved) {
        const answerInput = await promptBubble(
          anchorX(wizard, -6),
          anchorY(wizard, -60),
          task.line,
          anchorX(wizard, 0),
          anchorY(wizard, -34),
        );
        const answer = normalizeHebrewInput(answerInput);

        if (task.spells.some(spell => spellEquals(answer, spell))) {
          task.effect(props);
          await celebrateGlyph(answer);
          await narratorSay(task.success);
          resolved = true;
          continue;
        }

        attempts++;
        if (attempts === 1) {
          await donkeySay('Erinnere dich – du kennst das Wort bereits.');
        } else if (attempts === 2) {
          await narratorSay('Die Terrasse flackert. Ohne das richtige Wort bleibt sie leer.');
        } else {
          attempts = 0;
          await donkeySay('Atme. Denk an Licht, Hoeren, Segen.');
        }
      }
    }
  }

  await narratorSay('Die Stufen leuchten. Fragmente ב und ר schweben ueber deinem Grimoire.');
  await donkeySay('Nur noch ein Zeichen fehlt, um das neue Wort zu vollenden.');
}

async function phaseSevenAltars(props) {
  await narratorSay('Sieben Altare warten auf das Wort, das du sprichst.');
  for (const altar of ALTAR_SEQUENCE) {
    const target = getPropX(props, altar.id);
    await waitForWizardToReach(target, { tolerance: 24 });

    let solved = false;
    let attempts = 0;
    while (!solved) {
      const answerInput = await promptBubble(
        anchorX(wizard, -4),
        anchorY(wizard, -60),
        altar.prompt,
        anchorX(wizard, 2),
        anchorY(wizard, -34),
      );
      const answer = normalizeHebrewInput(answerInput);

      if (altar.spells.some(spell => spellEquals(answer, spell))) {
        solved = true;
        updateProp(props, altar.id, { type: 'altarGlyphPlateLit' });
        await celebrateGlyph(answer);
        await narratorSay('Der Altar reagiert und schickt Funken in den Himmel.');
        continue;
      }

      attempts++;
      if (attempts === 1) {
        await donkeySay('Hoere noch einmal. Jedes Altar hat ein eigenes Wort.');
      } else {
        attempts = 0;
        await wizardSay('Ich fasse mich und versuche es erneut.');
      }
    }
  }
  await narratorSay('Alle Altare glimmen. Balak betrachtet dich mit wachsender Unruhe.');
}

async function phaseResonanceRevelation(props) {
  await narratorSay('In der Nacht begegnet dir eine Stimme. "Sieben Altare hast du errichtet..."');

  for (const ring of RESONANCE_SEQUENCE) {
    const target = getPropX(props, ring.id);
    await waitForWizardToReach(target, { tolerance: 16 });
    let complete = false;
    let attempts = 0;
    while (!complete) {
      const answerInput = await promptBubble(
        anchorX(wizard, -4),
        anchorY(wizard, -58),
        ring.prompt,
        anchorX(wizard, 2),
        anchorY(wizard, -32),
      );
      const answer = normalizeHebrewInput(answerInput);

      if (ring.spells.some(spell => spellEquals(answer, spell))) {
        complete = true;
        updateProp(props, ring.id, { type: 'resonanceRingActive' });
        await celebrateGlyph(answer);
        await narratorSay(ring.success);
        continue;
      }

      attempts++;
      if (attempts === 1) {
        await donkeySay('Hoere, bevor du sprichst.');
      } else {
        attempts = 0;
        await wizardSay('Ich lausche tiefer und versuche es erneut.');
      }
    }
  }

  await narratorSay('Das Wort ברך bildet sich ueber deinen Haenden.');
  await Promise.all([
    showLevelTitle('ברך (barak)', 3200),
    donkeySay('Barak – segnen. Wo andere verfluchen, sprichst du Segen.'),
  ]);

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -62),
      'Sprich ברך (barak)',
      anchorX(wizard, -2),
      anchorY(wizard, -36),
    );
    const answer = normalizeHebrewInput(answerInput);

    if (spellEquals(answer, 'barak', 'ברכה')) {
      addProp(props, { id: 'barakGlyph', type: 'blessingFragment', x: wizard.x + 18, y: wizard.y - 46, parallax: 0.9, letter: 'ך' });
      await celebrateGlyph(answer);
      await narratorSay('Das Segenwort gleitet wie Licht ueber das Lager. Balaks Bann wird kurz still.');
      break;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Lass die drei Silben fliessen: ba-rak.');
    } else {
      attempts = 0;
      await wizardSay('Barak. Ich spreche es erneut.');
    }
  }
}

async function phaseFirstOracle() {
  await narratorSay('Du sprichst das erste Orakel. Worte vom Stern und vom Zepter fliessen ueber die Ebene.');
  await wizardSay('Man sieht kein Unheil in Jakob; wie soll ich fluchen, wen Gott nicht flucht?');
}

async function phaseOracleSequence() {
  await narratorSay('Balak fordert den Fluch, doch deine Worte werden Segen.');

  const requiredOrder = ['shama', 'lo', 'barak'];
  let index = 0;
  while (index < requiredOrder.length) {
    const promptText = index === 0
      ? 'Hoere zuerst – welches Wort sprichst du?'
      : index === 1
        ? 'Nun blockiere Balaks Wunsch.'
        : 'Vervollstaendige den Segen.';
    const answerInput = await promptBubble(
      anchorX(wizard, -4),
      anchorY(wizard, -58),
      promptText,
      anchorX(wizard, 2),
      anchorY(wizard, -32),
    );
    const answer = normalizeHebrewInput(answerInput);
    if (spellEquals(answer, requiredOrder[index], requiredOrder[index] === 'lo' ? 'לא' : requiredOrder[index] === 'barak' ? 'ברכה' : 'שמע')) {
      await celebrateGlyph(answer);
      index++;
      continue;
    }

    if (spellEquals(answer, 'ash', 'אש')) {
      await narratorSay('Feuer loderte auf, doch der Engel haelt deine Worte an.');
      continue;
    }

    await donkeySay('Reihenfolge, Meister: erst hoeren, dann verneinen, dann segnen.');
    index = 0;
  }

  await narratorSay('Die Segenwelle rollt ueber Israel. Balak beisst die Zaehne zusammen.');
}

async function phaseReflection() {
  await narratorSay('Innere Stimme: "Vielleicht ist kein Laut je verloren."');
  await donkeySay('Wer segnet, richtet den Faden neu aus.');
}

async function phaseBalakDemand() {
  await narratorSay('Balak fuehrt dich zu einem neuen Feld. "Vielleicht kannst du mir dort das Ende verfluchen."');
  await donkeySay('Er gibt nicht auf. Doch dein Wort ist staerker.');
}

async function phasePisgaStations(props) {
  for (const station of PISGA_STATIONS) {
    await waitForWizardToReach(station.x, { tolerance: 18 });

    if (station.id !== 'pisgaWatch') {
      let solved = false;
      while (!solved) {
        const answerInput = await promptBubble(
          anchorX(wizard, -6),
          anchorY(wizard, -58),
          station.prompt,
          anchorX(wizard, 0),
          anchorY(wizard, -34),
        );
        const answer = normalizeHebrewInput(answerInput);
        if (station.spells.some(spell => spellEquals(answer, spell))) {
          await celebrateGlyph(answer);
          await narratorSay(station.success);
          solved = true;
          continue;
        }
        await donkeySay('Das war nicht das richtige Wort. Versuch es erneut.');
      }
    } else {
      let stage = 0;
      while (stage < 2) {
        const prompt = stage === 0
          ? 'Das Feuer verlangt Sicht. Zeige ihm kurz Licht.'
          : 'Verberge den Pfad mit einem Nein.';
        const answerInput = await promptBubble(
          anchorX(wizard, -4),
          anchorY(wizard, -60),
          prompt,
          anchorX(wizard, 2),
          anchorY(wizard, -32),
        );
        const answer = normalizeHebrewInput(answerInput);
        if (stage === 0 && spellEquals(answer, 'or', 'אור')) {
          await celebrateGlyph(answer);
          updateProp(props, 'pisgaWatch', { type: 'watchFireAwakened' });
          await narratorSay('Der Pfad glimmt kurz auf.');
          stage = 1;
          continue;
        }
        if (stage === 1 && spellEquals(answer, 'lo', 'לא')) {
          await celebrateGlyph(answer);
          updateProp(props, 'pisgaWatch', { type: 'watchFireVeiled' });
          await narratorSay('Das Licht schwindet fuer Balaks Spione.');
          stage = 2;
          continue;
        }
        await donkeySay('Zuerst Licht, dann das Nein. In dieser Reihenfolge.');
        stage = 0;
      }
    }
  }
}

async function phaseStarBridge(props) {
  await narratorSay('Ein Sternensteg fuehrt tiefer in Balaks Reich. Jeder Schritt verlangt ein Wort.');

  for (const step of STAR_BRIDGE_SEQUENCE) {
    const target = getPropX(props, step.id);
    await waitForWizardToReach(target, { tolerance: 18 });
    let solved = false;
    let attempts = 0;
    while (!solved) {
      const answerInput = await promptBubble(
        anchorX(wizard, -4),
        anchorY(wizard, -58),
        step.prompt,
        anchorX(wizard, 2),
        anchorY(wizard, -32),
      );
      const answer = normalizeHebrewInput(answerInput);

      if (step.spells.some(spell => spellEquals(answer, spell))) {
        solved = true;
        updateProp(props, step.id, { type: 'pisgaBridgeSegmentLit' });
        await celebrateGlyph(answer);
        await narratorSay('Der Sternensteg wird fester unter deinen Fuessen.');
        continue;
      }

      attempts++;
      if (attempts === 1) {
        await donkeySay('Der Steg reagiert nur auf das exakte Wort.');
      } else {
        attempts = 0;
        await narratorSay('Der Stern flackert. Versuche es erneut.');
      }
    }
  }

  await narratorSay('Der letzte Sternengang verweist zum Gipfel von Pisga. Balak wartet bereits.');
}

async function transitionToScene(sceneConfig, ambienceKey, props, phase) {
  await fadeToBlack(320);
  ensureAmbience(ambienceKey ?? sceneConfig.ambience ?? 'desertTravel');
  setSceneProps([]);
  applySceneConfig({ ...sceneConfig, props }, { setAmbience: false });
  setSceneProps(props);
  setSceneContext({ level: 'level8', phase });
  await fadeToBase(360);
}
