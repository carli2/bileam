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
  donkey,
  normalizeHebrewInput,
  applySceneConfig,
  cloneSceneProps,
  MARKET_SCENE,
  spellEquals,
  updateProp,
  addProp,
  celebrateGlyph,
} from './utils.js';

const MOAB_RING_DEFS = [
  {
    id: 'moabRingWest',
    label: 'westlichen',
    x: 172,
    success: 'Der Ring zeigt das Lager Israels wie ein ruhendes Meer aus Waechtern.',
  },
  {
    id: 'moabRingCenter',
    label: 'mittleren',
    x: 316,
    success: 'Die Mitte des Rings glaenzt, als wuerde der Sand selbst Schrift bilden.',
  },
  {
    id: 'moabRingEast',
    label: 'oestlichen',
    x: 472,
    success: 'Der oestliche Ring laesst Balaks Stadt wie ein flackerndes Gitter erscheinen.',
  },
];

const PETOR_RING_DEFS = [
  {
    id: 'petorRingNorth',
    label: 'noerdlichen',
    x: 164,
    prompt: 'Welche deiner Erinnerungen bringt Licht in ihre Gesichter?',
    spells: ['or', 'אור'],
    fragmentId: 'petorFragmentLamed',
    fragmentLetter: 'ל',
    success: 'Licht legt sich auf die Gesichter der Gesandten. Angst bricht wie Frost.',
  },
  {
    id: 'petorRingEast',
    label: 'oestlichen',
    x: 316,
    prompt: 'Welches Wort beruhigt die Pferde und laesst den Sand fliessen?',
    spells: ['mayim', 'majim', 'mjm', 'מים'],
    fragmentId: 'petorFragmentAleph',
    fragmentLetter: 'א',
    success: 'Wasserlaute gleiten durch die Luft. Sand wird zu Wellenlinien.',
  },
  {
    id: 'petorRingSouth',
    label: 'suedlichen',
    x: 468,
    prompt: 'Welches Wort laesst verborgene Stimmen hoerbar werden?',
    spells: ['qol', 'קול'],
    fragmentId: null,
    fragmentLetter: null,
    success: 'Der Klang legt sich wie Resonanz auf das Lager. Die Gesandten blicken auf.',
  },
];

const BORDER_STATIONS = [
  {
    id: 'borderStone',
    x: 208,
    prompt: 'Der Schriftstein verlangt nach einem Nein, das Flueche bricht.',
    spells: ['lo', 'לא'],
    success: 'Die Glyphen blinken auf und zerfallen zu Staub. Balaks Worte loesen sich.',
  },
  {
    id: 'borderBush',
    x: 332,
    prompt: 'Tau aus der Wuste rettet den Weg der Eselin.',
    spells: ['mayim', 'majim', 'mjm', 'מים'],
    success: 'Feiner Tau legt sich auf die Dornen. Ein Pfad oeffnet sich fuer die Eselin.',
  },
];

const PETOR_SCENE = {
  ambience: 'marketBazaar',
  wizardStartX: 68,
  donkeyOffset: -40,
  props: [
    { id: 'petorCampfire', type: 'nightCampfire', x: 236, align: 'ground', parallax: 0.92 },
    { id: 'petorEnvoyNorth', type: 'envoyShadow', x: 156, align: 'ground', parallax: 0.96 },
    { id: 'petorEnvoyEast', type: 'envoyShadow', x: 316, align: 'ground', parallax: 0.96 },
    { id: 'petorEnvoySouth', type: 'envoyShadow', x: 468, align: 'ground', parallax: 0.96 },
  ],
};

const BORDER_SCENE = {
  ambience: 'marketBazaar',
  wizardStartX: 70,
  donkeyOffset: -38,
  props: [
    { id: 'borderBackdrop', type: 'borderProcessionPath', x: -42, align: 'ground', parallax: 0.6 },
    { id: 'borderStone', type: 'borderMilestone', x: 212, align: 'ground', parallax: 0.95 },
    { id: 'borderBush', type: 'borderThorn', x: 332, align: 'ground', parallax: 0.98 },
    { id: 'borderWatchFire', type: 'watchFireDormant', x: 492, align: 'ground', parallax: 1.02 },
  ],
};

export async function runLevelSix() {
  const plan = levelAmbiencePlan.level6;
  const approachProps = createMoabProps();

  applySceneConfig({ ...MARKET_SCENE, props: approachProps });
  ensureAmbience(plan?.review ?? MARKET_SCENE.ambience ?? 'marketBazaar');
  setSceneContext({ level: 'level6', phase: 'approach' });
  await showLevelTitle('Level 6 - Der Ruf des Koenigs');
  await fadeToBase(600);

  await phaseMoabApproach(approachProps);

  const petorProps = createPetorProps();
  await transitionToPetor(plan, petorProps);

  await phaseEnvoyReception();
  await phaseEnvoyRings(petorProps);
  await phaseNightRevelation(petorProps);
  await phaseNightMeditation(petorProps);
  await phaseMorningRefusal(petorProps);

  const borderProps = cloneSceneProps(BORDER_SCENE.props);
  await transitionToBorder(plan, borderProps);
  await phaseBorderStations(borderProps);
  await phaseWatchfire(borderProps);

  setSceneContext({ phase: 'departure' });
  await donkeySay('Der Pfad nach Moab ist offen. Doch Balak hat neue Fuersten gesandt.');
  await narratorSay('Du folgst ihnen in die Nacht. Hinter euch glimmt das Wort לא wie ein stilles Schild.');
  await fadeToBlack(720);
}

function createMoabProps() {
  const props = cloneSceneProps(MARKET_SCENE.props);
  props.push({ id: 'moabWatcherWest', type: 'moabWallWatcher', x: 122, align: 'ground', parallax: 0.82 });
  props.push({ id: 'moabWatcherEast', type: 'moabWallWatcher', x: 524, align: 'ground', parallax: 0.94 });
  MOAB_RING_DEFS.forEach(def => {
    props.push({
      id: def.id,
      type: 'sandVisionRingDormant',
      x: def.x,
      align: 'ground',
      parallax: 1,
    });
  });
  return props;
}

function createPetorProps() {
  const props = cloneSceneProps(PETOR_SCENE.props);
  PETOR_RING_DEFS.forEach(def => {
    props.push({
      id: def.id,
      type: 'sandVisionRingDormant',
      x: def.x,
      align: 'ground',
      parallax: 1,
    });
  });
  return props;
}

async function phaseMoabApproach(props) {
  await narratorSay('Auf den Mauern von Moab blicken Wachen in die Steppe. Unter ihnen schimmern drei Ringe aus Licht.');
  await donkeySay('Balak will sehen, was Israel ist. Geh zu den Ringen, Meister, und schau hin.');

  for (const def of MOAB_RING_DEFS) {
    await donkeySay(`Stell dich in den ${def.label} Ring und blicke hinaus.`);
    await waitForWizardToReach(def.x, { tolerance: 18 });
    updateProp(props, def.id, { type: 'sandVisionRingActive' });
    await narratorSay(def.success);
    addProp(props, {
      id: `${def.id}Trail`,
      type: 'hoofSignTrail',
      x: wizard.x + 12,
      y: wizard.y - 18,
      parallax: 1.05,
    });
  }

  await narratorSay('Alle drei Ringe brennen nun still. Der Sand zeichnet eine Spur aus Licht hinter deinen Schritten.');
  await donkeySay('Was du gesehen hast, wird Balak hoeren wollen. Doch erst wartet Petor und die Nacht.');
}

async function transitionToPetor(plan, props) {
  await fadeToBlack(420);
  ensureAmbience(plan?.learn ?? 'marketBazaar');
  setSceneProps([]);
  applySceneConfig({ ...PETOR_SCENE, props }, { setAmbience: false });
  setSceneProps(props);
  setSceneContext({ level: 'level6', phase: 'envoys' });
  await fadeToBase(520);
}

async function phaseEnvoyReception() {
  await narratorSay('In Petor lodert nur ein stilles Feuer. Die Gesandten Balaks warten geduldig.');
  await donkeySay('Sie tragen Balaks Worte. Hoehre sie an, doch entscheide weise.');
  await wizardSay('Ich werde ueber Nacht hoeren, was der HERR spricht.');
}

async function phaseEnvoyRings(props) {
  setSceneContext({ phase: 'envoy-trial' });
  await donkeySay('Jeder Ring prueft dich mit dem, was du schon gelernt hast.');

  for (const def of PETOR_RING_DEFS) {
    await narratorSay(`Der ${def.label} Ring wabert. Schatten erwarten deine Antwort.`);
    await waitForWizardToReach(def.x, { tolerance: 18 });

    let attempts = 0;
    while (true) {
      const answerInput = await promptBubble(
        anchorX(wizard, -8),
        anchorY(wizard, -62),
        def.prompt,
        anchorX(wizard, -2),
        anchorY(wizard, -34),
      );
      const answer = normalizeHebrewInput(answerInput);

      if (def.spells.some(spell => spellEquals(answer, spell))) {
        updateProp(props, def.id, { type: 'sandVisionRingActive' });
        await celebrateGlyph(answer);
        if (def.fragmentId && def.fragmentLetter) {
          addProp(props, {
            id: def.fragmentId,
            type: 'noGlyphShard',
            x: wizard.x + 10,
            y: wizard.y - 40,
            parallax: 0.9,
            letter: def.fragmentLetter,
          });
        }
        await narratorSay(def.success);
        break;
      }

      attempts++;
      if (spellEquals(answer, 'lo', 'לא')) {
        await narratorSay('Das Wort לא ist noch verborgen. Die Schatten bleiben dicht.');
        continue;
      }
      if (spellEquals(answer, 'ash', 'אש')) {
        await narratorSay('Feuer flackert kurz auf, doch die Gesandten schrecken zurueck.');
        continue;
      }
      if (attempts === 1) {
        await donkeySay('Denk an das Wort, das dieser Ring verlangt. Du kennst es bereits.');
      } else if (attempts === 2) {
        await narratorSay('Der Ring verengt sich. Hoere in dich hinein und waehle erneut.');
      } else {
        attempts = 0;
        await donkeySay('Atme. Erinner dich an deine Reise: Licht, Wasser, Klang.');
      }
    }
  }

  addProp(props, {
    id: 'petorGlyphFusion',
    type: 'noGlyphShard',
    x: wizard.x + 24,
    y: wizard.y - 46,
    parallax: 0.92,
  });
  await narratorSay('Zwei Fragmente glimmen ueber deinem Grimoire: ל und א. Sie warten auf ihre Gestalt.');
}

async function phaseNightRevelation(props) {
  setSceneContext({ phase: 'night' });
  await donkeySay('Die Nacht kommt. Hoere, bevor Balaks Stimme dich erreicht.');
  addProp(props, { id: 'petorMeditationCircle', type: 'hearingGlyphFragment', x: wizard.x + 24, y: wizard.y - 18, parallax: 1 });

  await narratorSay('Der HERR spricht: Geh nicht mit ihnen. Verfluche das Volk nicht, denn es ist gesegnet.');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -64),
      'Das Wort formt sich: sprich לא (lo).',
      anchorX(wizard, -2),
      anchorY(wizard, -36),
    );
    const answer = normalizeHebrewInput(answerInput);

    if (spellEquals(answer, 'lo', 'לא')) {
      await celebrateGlyph(answer);
      await narratorSay('Das Nein legt sich wie ein Schild um dich. Die Fragmente verbinden sich zu לא.');
      break;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Sprich es klar. Zwei Buchstaben, stark wie ein Tor.');
    } else if (attempts === 2) {
      await narratorSay('Die Luft flimmert. Das Wort wartet, bis du es richtig sprichst.');
    } else {
      attempts = 0;
      await wizardSay('Ich atme ein und lasse alles andere schweigen.');
    }
  }
}

async function phaseNightMeditation(props) {
  setSceneContext({ phase: 'meditation' });
  await narratorSay('Ein Hoerkreis aus Licht erscheint. Du musst ihn mit לא halten.');

  const cycles = 3;
  for (let index = 0; index < cycles; index++) {
    const attemptInput = await promptBubble(
      anchorX(wizard, -4),
      anchorY(wizard, -62),
      'Halte den Kreis. Sprich לא (lo).',
      anchorX(wizard, 0),
      anchorY(wizard, -34),
    );
    const attempt = normalizeHebrewInput(attemptInput);

    if (spellEquals(attempt, 'lo', 'לא')) {
      await narratorSay('Der Kreis leuchtet heller. Der Atem der Welt wird ruhiger.');
      continue;
    }

    if (spellEquals(attempt, 'qol', 'קול')) {
      await narratorSay('Ein Ton jagt die Schatten fort, doch der Kreis verlangt weiter nach לא.');
      index--;
      continue;
    }

    await donkeySay('Noch einmal. Atme vier Herzschlaege und sage nicht mehr als לא.');
    index--;
  }

  updateProp(props, 'petorMeditationCircle', { type: 'listeningSanctum', x: wizard.x + 24 });
  await narratorSay('Die Nacht antwortet. Nicht jedes Wort muss gesprochen werden – manche muessen verneint werden.');
}

async function phaseMorningRefusal(props) {
  setSceneContext({ phase: 'morning' });
  addProp(props, { id: 'petorGift', type: 'temptationVessel', x: wizard.x + 44, align: 'ground', parallax: 1.04 });
  await narratorSay('Am Morgen liegen Geschenke bereit. Gold flackert in Balaks Farben.');

  let resolved = false;
  let attempts = 0;
  while (!resolved) {
    const answerInput = await promptBubble(
      anchorX(wizard, -2),
      anchorY(wizard, -58),
      'Welches Wort loescht Balaks Gabe?',
      anchorX(wizard, 4),
      anchorY(wizard, -32),
    );
    const answer = normalizeHebrewInput(answerInput);

    if (spellEquals(answer, 'lo', 'לא')) {
      resolved = true;
      await celebrateGlyph(answer);
      updateProp(props, 'petorGift', { type: 'temptationVesselAshes' });
      await narratorSay('Die Gabe verglimmt zu Staub. Balaks Stimme knistert vergeblich in der Luft.');
      break;
    }

    attempts++;
    if (spellEquals(answer, 'ash', 'אש')) {
      await narratorSay('Flammen schlagen hoch und verglimmen. Ohne לא bleiben sie gefaehrlich.');
      continue;
    }
    if (attempts === 1) {
      await donkeySay('Denke an das Wort der Nacht. Es reicht, um jeden Fluch zu bremsen.');
    } else if (attempts === 2) {
      await narratorSay('Goldene Linien kriechen auf dich zu. Sie warten auf ein klares Nein.');
    } else {
      attempts = 0;
      await wizardSay('Ich wiederhole das Wort, bis es bleibt: ל... א.');
    }
  }
}

async function transitionToBorder(plan, props) {
  await transitionAmbience(plan?.apply ?? 'marketBazaar', { fade: { toBlack: 360, toBase: 520 } });
  setSceneProps([]);
  applySceneConfig({ ...BORDER_SCENE, props }, { setAmbience: false });
  setSceneProps(props);
  setSceneContext({ level: 'level6', phase: 'border' });
}

async function phaseBorderStations(props) {
  await narratorSay('Der Weg nach Moab fuehrt entlang einer Grenze aus Sand und Schrift.');

  for (const station of BORDER_STATIONS) {
    await donkeySay('Dort vorn wartet ein weiteres Zeichen. Geh hin.');
    await waitForWizardToReach(station.x, { tolerance: 18 });

    let attempts = 0;
    while (true) {
      const answerInput = await promptBubble(
        anchorX(wizard, -6),
        anchorY(wizard, -58),
        station.prompt,
        anchorX(wizard, 0),
        anchorY(wizard, -32),
      );
      const answer = normalizeHebrewInput(answerInput);

      if (station.spells.some(spell => spellEquals(answer, spell))) {
        await celebrateGlyph(answer);
        await narratorSay(station.success);
        break;
      }

      attempts++;
      if (attempts === 1) {
        await donkeySay('Du kennst das Wort, Meister. Sprich es klar.');
      } else if (attempts === 2) {
        await narratorSay('Der Wind wird lauter. Ohne das richtige Wort bleibt der Weg verborgen.');
      } else {
        attempts = 0;
        await wizardSay('Noch einmal. Ich erinnere mich.');
      }
    }
  }
}

async function phaseWatchfire(props) {
  const fireProp = props.find(entry => entry.id === 'borderWatchFire');
  const target = fireProp ? fireProp.x + 18 : 508;
  await donkeySay('Das Wachfeuer Balaks glimmt. Zeig ihm Licht und verschliesse seinen Blick.');
  await waitForWizardToReach(target, { tolerance: 18 });

  let stage = 0;
  while (stage < 2) {
    const prompt = stage === 0
      ? 'Ein Schimmer im Feuer wartet auf אור.'
      : 'Verberge den Pfad vor Balaks Blick. Sprich לא.';
    const answerInput = await promptBubble(
      anchorX(wizard, -4),
      anchorY(wizard, -60),
      prompt,
      anchorX(wizard, 2),
      anchorY(wizard, -34),
    );
    const answer = normalizeHebrewInput(answerInput);

    if (stage === 0 && spellEquals(answer, 'or', 'אור')) {
      updateProp(props, 'borderWatchFire', { type: 'watchFireAwakened' });
      await celebrateGlyph(answer);
      await narratorSay('Licht hebt sich vom Feuer und zeigt einen versteckten Pfad durch die Steppe.');
      stage = 1;
      continue;
    }

    if (stage === 1 && spellEquals(answer, 'lo', 'לא')) {
      await celebrateGlyph(answer);
      updateProp(props, 'borderWatchFire', { type: 'watchFireVeiled' });
      await narratorSay('Der Pfad verduestert sich fuer Balaks Spione. Nur du siehst ihn noch.');
      stage = 2;
      break;
    }

    if (spellEquals(answer, 'ash', 'אש')) {
      await narratorSay('Die Flammen lodern kurz hoch. Ohne אור oder לא bleibt der Pfad offen sichtbar.');
      continue;
    }

    if (stage === 0) {
      await donkeySay('Zuerst das Licht, Meister.');
    } else {
      await donkeySay('Du musst Nein sagen, damit der Weg verborgen bleibt.');
    }
  }
}
