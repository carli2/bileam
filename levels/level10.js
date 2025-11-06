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

const STAR_PATH_SCENE = {
  ambience: 'sanctumFinale',
  wizardStartX: 80,
  donkeyOffset: -38,
  props: [
    { id: 'starWatcherWest', type: 'starTerraceGuard', x: 122, align: 'ground', parallax: 0.88 },
    { id: 'starWatcherEast', type: 'starTerraceGuard', x: 538, align: 'ground', parallax: 1.06 },
    { id: 'starTerraceOne', type: 'starShardDormant', x: 168, align: 'ground', parallax: 0.98 },
    { id: 'starTerraceTwo', type: 'starShardDormant', x: 320, align: 'ground', parallax: 1.0 },
    { id: 'starTerraceThree', type: 'starShardDormant', x: 472, align: 'ground', parallax: 1.02 },
  ],
};

const CROWN_SCENE = {
  ambience: 'sanctumFinale',
  wizardStartX: 96,
  donkeyOffset: -40,
  props: [
    { id: 'crownArcOne', type: 'lightCrownArcDormant', x: 208, align: 'ground', parallax: 0.94 },
    { id: 'crownArcTwo', type: 'lightCrownArcDormant', x: 268, align: 'ground', parallax: 0.95 },
    { id: 'crownArcThree', type: 'lightCrownArcDormant', x: 328, align: 'ground', parallax: 0.96 },
    { id: 'crownArcFour', type: 'lightCrownArcDormant', x: 388, align: 'ground', parallax: 0.97 },
    { id: 'crownArcFive', type: 'lightCrownArcDormant', x: 448, align: 'ground', parallax: 0.98 },
  ],
};

const VISION_SCENE = {
  ambience: 'sanctumFinale',
  wizardStartX: 88,
  donkeyOffset: -40,
  props: [
    { id: 'visionAmalek', type: 'nationEchoDormant', x: 196, align: 'ground', parallax: 0.94 },
    { id: 'visionKenite', type: 'nationEchoDormant', x: 296, align: 'ground', parallax: 0.96 },
    { id: 'visionAsshur', type: 'nationEchoDormant', x: 396, align: 'ground', parallax: 0.98 },
    { id: 'visionWoe', type: 'nationEchoDormant', x: 496, align: 'ground', parallax: 1.0 },
  ],
};

const SHADOW_SCENE = {
  ambience: 'sanctumFinale',
  wizardStartX: 94,
  donkeyOffset: -38,
  props: [
    { id: 'shadowEchoNorth', type: 'shadowEchoDormant', x: 218, align: 'ground', parallax: 0.94 },
    { id: 'shadowEchoEast', type: 'shadowEchoDormant', x: 328, align: 'ground', parallax: 0.96 },
    { id: 'shadowEchoSouth', type: 'shadowEchoDormant', x: 438, align: 'ground', parallax: 0.98 },
  ],
};

const BRIDGE_SCENE = {
  ambience: 'sanctumFinale',
  wizardStartX: 92,
  donkeyOffset: -38,
  props: [
    { id: 'starBridgeOne', type: 'starBridgeSegmentDormant', x: 162, align: 'ground', parallax: 0.94 },
    { id: 'starBridgeTwo', type: 'starBridgeSegmentDormant', x: 234, align: 'ground', parallax: 0.96 },
    { id: 'starBridgeThree', type: 'starBridgeSegmentDormant', x: 306, align: 'ground', parallax: 0.98 },
    { id: 'starBridgeFour', type: 'starBridgeSegmentDormant', x: 378, align: 'ground', parallax: 1.0 },
    { id: 'starBridgeFive', type: 'starBridgeSegmentDormant', x: 450, align: 'ground', parallax: 1.02 },
    { id: 'starBridgeSix', type: 'starBridgeSegmentDormant', x: 522, align: 'ground', parallax: 1.04 },
    { id: 'starBridgeSeven', type: 'starBridgeSegmentDormant', x: 594, align: 'ground', parallax: 1.06 },
  ],
};

const TERRACE_TASKS = [
  {
    id: 'starTerraceOne',
    steps: [
      { prompt: 'Hoere, was die Banner tragen.', spells: ['shama', 'שמע'], success: 'Die Luft wird klar. Der Engel blinzelt in der Ferne.' },
      { prompt: 'Blockiere Balaks Forderung.', spells: ['lo', 'לא'], success: 'Ein Schattenzug wird gestoppt.' },
      { prompt: 'Segne den Pfad fuer den Stern.', spells: ['barak', 'ברכה'], success: 'Fragment א glimmt ueber deiner Hand.', fragment: { id: 'starFragmentAleph', letter: 'א' } },
    ],
  },
  {
    id: 'starTerraceTwo',
    steps: [
      { prompt: 'Lausche erneut.', spells: ['shama', 'שמע'], success: 'Linien erbeben wie Saite.' },
      { prompt: 'Sprich das Nein.', spells: ['lo', 'לא'], success: 'Balaks Befehl zerfasert.' },
      { prompt: 'Rufe Licht, das den Stern zeigt.', spells: ['or', 'אור'], success: 'Der Himmel oeffnet sich kurz.' },
    ],
  },
  {
    id: 'starTerraceThree',
    steps: [
      { prompt: 'Sammle das Echo der Fuersten.', spells: ['shama', 'שמע'], success: 'Der Klang wird zu Linien.' },
      { prompt: 'Segne, was vor dir liegt.', spells: ['barak', 'ברכה'], success: 'Fragment ר legt sich in dein Grimoire.', fragment: { id: 'starFragmentResh', letter: 'ר' } },
      { prompt: 'Sag ein letztes Nein fuer Balaks Schatten.', spells: ['lo', 'לא'], success: 'Der Pfad erglimmt.' },
    ],
  },
];

const CROWN_SEQUENCE = [
  { prompt: 'Ein Lichtbogen senkt sich. Hoere zuerst.', spells: ['shama', 'שמע'], prop: 'crownArcOne' },
  { prompt: 'Der zweite Bogen verlangt Nein.', spells: ['lo', 'לא'], prop: 'crownArcTwo' },
  { prompt: 'Der dritte Bogen fordert Segen.', spells: ['barak', 'ברכה'], prop: 'crownArcThree' },
  { prompt: 'Der vierte Bogen verlangt Licht im Nein.', spells: ['or', 'אור', 'lo', 'לא'], combination: ['or', 'lo'], prop: 'crownArcFour' },
  { prompt: 'Der letzte Bogen will das Wort hoeren.', spells: ['or', 'אור'], prop: 'crownArcFive', hold: true },
];

const NATION_SEQUENCE = [
  { id: 'visionAmalek', prompt: 'Amalek erscheint. Sprich dabar, dann or.', sequence: ['dabar', 'or'], success: 'Amalek zerfaellt zu Staublinien.' },
  { id: 'visionKenite', prompt: 'Der Keniter steht fest. Sprich shama, dann barak.', sequence: ['shama', 'barak'], success: 'Der Keniter senkt den Blick, der Pfad bleibt bestehen.' },
  { id: 'visionAsshur', prompt: 'Assur ruft nach Gefangenschaft. Sprich lo, dann dabar.', sequence: ['lo', 'dabar'], success: 'Assur wird zum Schatten, der Wind traegt ihn fort.' },
  { id: 'visionWoe', prompt: 'Wehe erklingt. Sprich shama, lo, barak.', sequence: ['shama', 'lo', 'barak'], success: 'Die Vision legt sich zur Ruhe.' },
];

const SHADOW_TARGETS = [
  { id: 'shadowEchoNorth', prompt: 'Der nördliche Schatten greift. Bann ihn.', sequence: ['shama', 'lo', 'barak', 'or'] },
  { id: 'shadowEchoEast', prompt: 'Der östliche Schatten will dich spiegeln. Bann ihn.', sequence: ['shama', 'lo', 'barak', 'or'] },
  { id: 'shadowEchoSouth', prompt: 'Der südliche Schatten zerreißt den Pfad. Bann ihn.', sequence: ['shama', 'lo', 'barak', 'or'] },
];

const BRIDGE_SEQUENCE = [
  { id: 'starBridgeOne', prompt: 'Der erste Sternschritt verlangt Licht.', spells: ['or', 'אור'] },
  { id: 'starBridgeTwo', prompt: 'Der zweite Sternschritt verlangt Wahrheit.', spells: ['emet', 'אמת'] },
  { id: 'starBridgeThree', prompt: 'Der dritte Sternschritt verlangt Segen.', spells: ['barak', 'ברכה'] },
  { id: 'starBridgeFour', prompt: 'Der vierte Sternschritt fordert Hoeren.', spells: ['shama', 'שמע'] },
  { id: 'starBridgeFive', prompt: 'Der fünfte Sternschritt sucht das Wort, das geschieht.', spells: ['dabar', 'דבר'] },
  { id: 'starBridgeSix', prompt: 'Der sechste Sternschritt verlangt ein Nein.', spells: ['lo', 'לא'] },
  { id: 'starBridgeSeven', prompt: 'Der letzte Sternschritt beendet im Licht.', spells: ['or', 'אור'] },
];

export async function runLevelTen() {
  const plan = levelAmbiencePlan.level10;
  const pathProps = cloneSceneProps(STAR_PATH_SCENE.props);

  applySceneConfig({ ...STAR_PATH_SCENE, props: pathProps });
  ensureAmbience(plan?.review ?? STAR_PATH_SCENE.ambience ?? 'sanctumFinale');
  setSceneContext({ level: 'level10', phase: 'star-path' });
  await showLevelTitle('Level 10 - Der Stern aus Jakob');
  await fadeToBase(600);

  await phaseStarTerraces(pathProps);

  const crownProps = cloneSceneProps(CROWN_SCENE.props);
  await transitionToScene(CROWN_SCENE, plan?.learn, crownProps, 'light-crown');
  await phaseLightCrown(crownProps);

  const visionProps = cloneSceneProps(VISION_SCENE.props);
  await transitionToScene(VISION_SCENE, plan?.learn, visionProps, 'visions');
  await phaseNationVisions(visionProps);

  const shadowProps = cloneSceneProps(SHADOW_SCENE.props);
  await transitionToScene(SHADOW_SCENE, plan?.learn, shadowProps, 'shadow-rift');
  await phaseShadowRift(shadowProps);

  const bridgeProps = cloneSceneProps(BRIDGE_SCENE.props);
  await transitionToScene(BRIDGE_SCENE, plan?.apply, bridgeProps, 'star-bridge');
  await phaseStarBridge(bridgeProps);

  await narratorSay('Der Stern haengt still ueber dir. Balak zieht sich in den Schattenpalast zurueck.');
  await donkeySay('Der Pfad fuehrt weiter – tiefer in Balaks Schatten.');
  await fadeToBlack(720);
}

function getPropX(props, id, fallback = wizard.x) {
  const prop = props.find(entry => entry.id === id);
  return prop ? prop.x : fallback;
}

async function phaseStarTerraces(props) {
  await narratorSay('Balak steht auf dem Gipfel. Drei Terrassen pruefen dein Wort.');
  await donkeySay('Jede Stufe will Hoeren, Nein, Segen – und das neue Licht.');

  for (const terrace of TERRACE_TASKS) {
    const target = getPropX(props, terrace.id);
    await waitForWizardToReach(target, { tolerance: 18 });

    for (const step of terrace.steps) {
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
          updateProp(props, terrace.id, { type: 'starShardAwakened' });
          if (step.fragment) {
            addProp(props, {
              id: step.fragment.id,
              type: 'crownFragment',
              x: wizard.x + 10,
              y: wizard.y - 44,
              parallax: 0.92,
              letter: step.fragment.letter,
            });
          }
          await celebrateGlyph(answer);
          await narratorSay(step.success);
          continue;
        }

        attempts++;
        if (attempts === 1) {
          await donkeySay('Erinner dich an deine Reise – hoere, sag Nein, segne.');
        } else {
          attempts = 0;
          await narratorSay('Der Sternschritt bleibt dunkel. Versuche es erneut.');
        }
      }
    }
  }

  await narratorSay('Fragmente א und ר schweben ueber dir. Der Stern beginnt zu kreisen.');
}

async function phaseLightCrown(props) {
  await narratorSay('Die Sternkrone senkt sich. Jede Kante verlangt ein Wort.');
  let stage = 0;
  let holdCount = 0;

  while (stage < CROWN_SEQUENCE.length) {
    const item = CROWN_SEQUENCE[stage];
    const prompt = item.hold && holdCount === 0
      ? `${item.prompt} Halte das Licht fuer drei Atemzuege.`
      : item.prompt;
    const answerInput = await promptBubble(
      anchorX(wizard, -4),
      anchorY(wizard, -60),
      prompt,
      anchorX(wizard, 2),
      anchorY(wizard, -34),
    );
    const answer = normalizeHebrewInput(answerInput);

    if (item.combination) {
      const [first, second] = item.combination;
      if (holdCount === 0 && spellEquals(answer, first, first === 'or' ? 'אור' : 'לא')) {
        holdCount = 1;
        await narratorSay('Das Licht oeffnet den Pfad. Jetzt verberge es.');
        continue;
      }
      if (holdCount === 1 && spellEquals(answer, second, second === 'lo' ? 'לא' : 'אור')) {
        holdCount = 0;
        updateProp(props, item.prop, { type: 'lightCrownArcLit' });
        await celebrateGlyph(answer);
        await narratorSay('Der Bogen schliesst sich.');
        stage++;
        continue;
      }
      await donkeySay('Zuerst Licht, dann das Nein.');
      holdCount = 0;
      continue;
    }

    if (item.hold) {
      if (spellEquals(answer, ...item.spells)) {
        holdCount++;
        if (holdCount >= 3) {
          updateProp(props, item.prop, { type: 'lightCrownArcLit' });
          await celebrateGlyph(answer);
          await narratorSay('Der letzte Bogen erklaert seine Gefolgschaft. Die Krone leuchtet.');
          stage++;
          holdCount = 0;
        } else {
          await narratorSay('Halte das Licht weiter.');
        }
        continue;
      }
      await donkeySay('Halte das Licht fest.');
      holdCount = 0;
      continue;
    }

    if (spellEquals(answer, ...item.spells)) {
      updateProp(props, item.prop, { type: 'lightCrownArcLit' });
      await celebrateGlyph(answer);
      await narratorSay('Der Bogen nimmt das Wort an.');
      stage++;
      continue;
    }

    await donkeySay('Die Krone reagiert nur auf das genaue Wort.');
    holdCount = 0;
  }

  await narratorSay('Die Sternkrone erglueht. Ein Lichtstrahl weist auf das Lager Israels.');
  await narratorSay('Ein Stern geht auf aus Jakob, ein Zepter erhebt sich aus Israel.');
  await wizardSay('Ich sehe ihn, aber nicht jetzt; ich schaue ihn, aber nicht von Nahem.');
}

async function phaseNationVisions(props) {
  await narratorSay('Vier Visionen erscheinen in Licht und Schatten.');

  for (const vision of NATION_SEQUENCE) {
    const target = getPropX(props, vision.id);
    await waitForWizardToReach(target, { tolerance: 18 });
    let stepIndex = 0;

    while (stepIndex < vision.sequence.length) {
      const currentPrompt = stepIndex === 0 ? vision.prompt : 'Setze die Formel fort.';
      const answerInput = await promptBubble(
        anchorX(wizard, -4),
        anchorY(wizard, -60),
        currentPrompt,
        anchorX(wizard, 2),
        anchorY(wizard, -34),
      );
      const answer = normalizeHebrewInput(answerInput);
      const expected = vision.sequence[stepIndex];
      const variant = expected === 'shama'
        ? 'שמע'
        : expected === 'lo'
          ? 'לא'
          : expected === 'barak'
            ? 'ברכה'
            : expected === 'dabar'
              ? 'דבר'
              : expected === 'or'
                ? 'אור'
                : 'דבר';

      if (spellEquals(answer, expected, variant)) {
        await celebrateGlyph(answer);
        stepIndex++;
        continue;
      }

      if (spellEquals(answer, 'emet', 'אמת')) {
        await narratorSay('Wahrheit laesst die Vision ruhen, aber die Formel wartet auf ihre Reihenfolge.');
        continue;
      }

      await donkeySay('Folge der Reihenfolge. Beginne erneut.');
      stepIndex = 0;
    }

    await narratorSay(vision.success);
  }
}

async function phaseShadowRift(props) {
  await narratorSay('Balaks Schatten loest sich vom Koerper. Drei Echos kreisen dich ein.');

  for (const shadow of SHADOW_TARGETS) {
    const target = getPropX(props, shadow.id);
    await waitForWizardToReach(target, { tolerance: 18 });
    let index = 0;

    while (index < shadow.sequence.length) {
      const prompt = index === 0
        ? shadow.prompt
        : 'Vervollstaendige den Bann.';
      const answerInput = await promptBubble(
        anchorX(wizard, -4),
        anchorY(wizard, -60),
        prompt,
        anchorX(wizard, 2),
        anchorY(wizard, -34),
      );
      const answer = normalizeHebrewInput(answerInput);
      const expected = shadow.sequence[index];
      const variant = expected === 'shama'
        ? 'שמע'
        : expected === 'lo'
          ? 'לא'
          : expected === 'barak'
            ? 'ברכה'
            : 'אור';

      if (spellEquals(answer, expected, variant)) {
        index++;
        if (index === shadow.sequence.length) {
          updateProp(props, shadow.id, { type: 'shadowEchoBanished' });
        }
        await celebrateGlyph(answer);
        await narratorSay('Der Schatten zieht sich zurueck.');
        continue;
      }

      if (spellEquals(answer, 'dabar', 'דבר')) {
        await narratorSay('Das Wort alleine reicht nicht. Du brauchst Hoeren, Nein, Segen, Licht.');
        continue;
      }

      await donkeySay('Bannformel: hoere, verneine, segne, leuchte.');
      index = 0;
    }
  }

  await narratorSay('Balaks Schatten zerfaellt, doch der Riss im Himmel bleibt.');
}

async function phaseStarBridge(props) {
  await narratorSay('Ein Sternensteg spannt sich zum Schattenpalast. Jeder Schritt verlangt ein Wort.');

  for (const step of BRIDGE_SEQUENCE) {
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
        updateProp(props, step.id, { type: 'starBridgeSegmentLit' });
        await celebrateGlyph(answer);
        await narratorSay('Der Steg wird fest unter deinen Fuessen.');
        continue;
      }

      attempts++;
      if (attempts === 1) {
        await donkeySay('Der Steg reagiert nur auf das genaue Wort.');
      } else {
        attempts = 0;
        await narratorSay('Der Himmel flackert. Versuch es erneut.');
      }
    }
  }

  await narratorSay('Der Sternensteg fuehrt zum Schattenpalast. Die Fortsetzung wartet.');
}

async function transitionToScene(sceneConfig, ambienceKey, props, phase) {
  await fadeToBlack(320);
  ensureAmbience(ambienceKey ?? sceneConfig.ambience ?? 'sanctumFinale');
  setSceneProps([]);
  applySceneConfig({ ...sceneConfig, props }, { setAmbience: false });
  setSceneProps(props);
  setSceneContext({ level: 'level10', phase });
  await fadeToBase(360);
}
