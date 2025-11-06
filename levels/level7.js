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

const PROCESSION_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 74,
  donkeyOffset: -40,
  props: [
    { id: 'processionBackdrop', type: 'processionPathDawn', x: -40, align: 'ground', parallax: 0.6 },
    { id: 'processionBannerNorth', type: 'princeProcessionBanner', x: 178, align: 'ground', parallax: 0.94 },
    { id: 'processionBannerCenter', type: 'princeProcessionBanner', x: 326, align: 'ground', parallax: 0.96 },
    { id: 'processionBannerSouth', type: 'princeProcessionBanner', x: 478, align: 'ground', parallax: 0.98 },
    { id: 'processionWatcher', type: 'princeProcessionWatcher', x: 96, align: 'ground', parallax: 0.88 },
    { id: 'processionWatcherEast', type: 'princeProcessionWatcher', x: 542, align: 'ground', parallax: 1.04 },
  ],
};

const VINEYARD_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 84,
  donkeyOffset: -44,
  props: [
    { id: 'vineyardBackdrop', type: 'vineyardThreshold', x: -52, align: 'ground', parallax: 0.58 },
    { id: 'vineyardAngel', type: 'angelBladeForm', x: 348, align: 'ground', parallax: 0.94 },
  ],
};

const WALL_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 84,
  donkeyOffset: -44,
  props: [
    { id: 'wallBackdrop', type: 'mirrorWallPassage', x: -56, align: 'ground', parallax: 0.6 },
    { id: 'wallMasonry', type: 'stonePressureWalls', x: 214, align: 'ground', parallax: 0.92 },
    { id: 'wallAngel', type: 'angelBladeForm', x: 356, align: 'ground', parallax: 0.96 },
  ],
};

const PINCH_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 82,
  donkeyOffset: -44,
  props: [
    { id: 'pinchBackdrop', type: 'mirrorNarrowPass', x: -40, align: 'ground', parallax: 0.62 },
    { id: 'pinchGround', type: 'mirrorStoneNarrow', x: 248, align: 'ground', parallax: 0.94 },
    { id: 'pinchAngel', type: 'angelBladeForm', x: 360, align: 'ground', parallax: 0.98 },
  ],
};

const REVELATION_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 88,
  donkeyOffset: -44,
  props: [
    { id: 'revelationGlow', type: 'angelRevelationField', x: 312, align: 'ground', parallax: 0.96 },
    { id: 'revelationAngel', type: 'angelBladeForm', x: 336, align: 'ground', parallax: 0.98 },
  ],
};

const ALTAR_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 92,
  donkeyOffset: -42,
  props: [
    { id: 'altarBackdrop', type: 'listeningSanctum', x: 148, align: 'ground', parallax: 0.9 },
    { id: 'altarGlyph', type: 'hearingAltar', x: 332, align: 'ground', parallax: 0.96 },
  ],
};

const PROCESSION_BANNERS = [
  {
    id: 'processionBannerNorth',
    x: 178,
    prompt: 'Welches Wort legt Licht auf die Banner der Fuersten?',
    spells: ['or', 'אור'],
    success: 'Die Banner glimmen warm. Angst weicht fuer einen Atemzug.',
  },
  {
    id: 'processionBannerCenter',
    x: 326,
    prompt: 'Welches Wort laesst die Pferde ruhig atmen?',
    spells: ['mayim', 'majim', 'mjm', 'מים'],
    success: 'Tau legt sich auf die Zaegel. Die Tiere senken den Kopf.',
  },
  {
    id: 'processionBannerSouth',
    x: 478,
    prompt: 'Welches Wort offenbart, was Balaks Gesandte fluestern?',
    spells: ['qol', 'קול'],
    success: 'Ein Echo legt Balaks Befehl offen: "Bring ihn zum Koenig."',
  },
];

export async function runLevelSeven() {
  const plan = levelAmbiencePlan.level7;
  const processionProps = cloneSceneProps(PROCESSION_SCENE.props);

  applySceneConfig({ ...PROCESSION_SCENE, props: processionProps });
  ensureAmbience(plan?.review ?? PROCESSION_SCENE.ambience ?? 'mirrorTower');
  setSceneContext({ level: 'level7', phase: 'procession' });
  await showLevelTitle('Level 7 - Der Engel und die Eselin');
  await fadeToBase(600);

  await phaseProcessionIntro();
  await phaseProcessionBanners(processionProps);

  const vineyardProps = cloneSceneProps(VINEYARD_SCENE.props);
  await transitionToScene(plan?.learn, VINEYARD_SCENE, vineyardProps, 'first-resistance');
  await phaseFirstResistance(vineyardProps);

  const wallProps = cloneSceneProps(WALL_SCENE.props);
  await transitionToScene(plan?.learn, WALL_SCENE, wallProps, 'second-resistance');
  await phaseSecondResistance(wallProps);

  const pinchProps = cloneSceneProps(PINCH_SCENE.props);
  await transitionToScene(plan?.learn, PINCH_SCENE, pinchProps, 'third-resistance');
  await phaseThirdResistance(pinchProps);

  const revelationProps = cloneSceneProps(REVELATION_SCENE.props);
  await transitionToScene(plan?.learn, REVELATION_SCENE, revelationProps, 'revelation');
  await phaseAngelRevelation(revelationProps);

  const altarProps = cloneSceneProps(ALTAR_SCENE.props);
  await transitionToScene(plan?.apply, ALTAR_SCENE, altarProps, 'altar');
  await phaseListeningAltar(altarProps);

  setSceneContext({ phase: 'departure' });
  await narratorSay('Die Fuersten ziehen weiter Richtung Moab. Der Engel bleibt auf dem Pfad aus Licht.');
  await donkeySay('Wir folgen – aber nur mit dem Wort, das hoert.');
  await fadeToBlack(720);
}

async function phaseProcessionIntro() {
  await narratorSay('Die Fuersten Balaks erwarten dich vor dem Tor. Banner aus Licht zittern im Morgenwind.');
  await donkeySay('Sie pruefen dich, bevor du gehst. Nutze, was du gelernt hast.');
}

async function phaseProcessionBanners(props) {
  setSceneContext({ phase: 'procession-banners' });

  for (const banner of PROCESSION_BANNERS) {
    await donkeySay('Geh zum Banner und pruefe seine Zeichen.');
    await waitForWizardToReach(banner.x, { tolerance: 18 });

    let attempts = 0;
    while (true) {
      const answerInput = await promptBubble(
        anchorX(wizard, -8),
        anchorY(wizard, -62),
        banner.prompt,
        anchorX(wizard, -2),
        anchorY(wizard, -34),
      );
      const answer = normalizeHebrewInput(answerInput);

      if (banner.spells.some(spell => spellEquals(answer, spell))) {
        updateProp(props, banner.id, { type: 'princeProcessionBannerLit' });
        await celebrateGlyph(answer);
        addProp(props, {
          id: `${banner.id}Trail`,
          type: 'hoofSignTrail',
          x: wizard.x + 10,
          y: wizard.y - 16,
          parallax: 1.04,
        });
        await narratorSay(banner.success);
        break;
      }

      attempts++;
      if (attempts === 1) {
        await donkeySay('Denk an die Reise. Du kennst das Wort, das dieses Banner erwartet.');
      } else if (attempts === 2) {
        await narratorSay('Das Banner flackert. Die Schrift wartet auf die richtige Silbe.');
      } else {
        attempts = 0;
        await wizardSay('Noch einmal. Ich erinnere mich an das Lager, an Wasser, an Klang.');
      }
    }
  }

  await narratorSay('Die Banner schweben nun still. In deinem Inneren zuckt ein neuer Laut.');
  await donkeySay('Ein neues Wort wartet. Du wirst es gleich brauchen.');
}

async function phaseFirstResistance(props) {
  setSceneContext({ phase: 'first-stand' });
  await narratorSay('Der Weg durch den Weinberg verengt sich. Ein Engel aus Licht steht vor dir, Schwert erhoben.');
  await donkeySay('Da steht etwas – ich fuehle sein Licht. Aber du siehst es nicht.');

  let shamaResonance = 0;
  while (shamaResonance < 2) {
    const answerInput = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -60),
      'Was antwortest du dem Licht im Weg?',
      anchorX(wizard, 0),
      anchorY(wizard, -34),
    );
    const answer = normalizeHebrewInput(answerInput);

    if (spellEquals(answer, 'shama', 'שמע')) {
      shamaResonance++;
      updateProp(props, 'vineyardAngel', { type: 'angelBladeFormGlow' });
      await narratorSay('Linien aus Licht verbinden deine Worte mit dem Engel. Die Eselin erstarrt vor Ehrfurcht.');
      continue;
    }

    if (spellEquals(answer, 'lo', 'לא')) {
      await narratorSay('Das Nein haelt die Zeit an, aber der Weg bleibt blockiert.');
      continue;
    }

    if (spellEquals(answer, 'ash', 'אש')) {
      await narratorSay('Feuer glimmt in der Luft, doch der Engel bewegt sich nicht.');
      continue;
    }

    await donkeySay('Hoere zuerst, Meister. Das Wort liegt nicht in den Haenden, sondern in den Ohren.');
  }

  await narratorSay('Die Eselin weicht auf das Feld aus. Der Engel bleibt stehen – geduldig.');
}

async function phaseSecondResistance(props) {
  setSceneContext({ phase: 'second-stand' });
  await narratorSay('Zwischen Mauern wird der Pfad eng. Der Engel steht wieder, Schwert blitzend.');
  await donkeySay('Schon wieder – und rechts und links kein Platz.');

  let stabilized = false;
  let heard = false;
  while (!stabilized || !heard) {
    const answerInput = await promptBubble(
      anchorX(wizard, -4),
      anchorY(wizard, -60),
      'Der Weg klemmt. Welches Wort sprichst du?',
      anchorX(wizard, 2),
      anchorY(wizard, -34),
    );
    const answer = normalizeHebrewInput(answerInput);

    if (!heard && spellEquals(answer, 'shama', 'שמע')) {
      heard = true;
      updateProp(props, 'wallAngel', { type: 'angelBladeFormGlow' });
      await narratorSay('Die Mauern beginnen zu singen. Glyphen leuchten in den Steinen.');
      continue;
    }

    if (!stabilized && spellEquals(answer, 'lo', 'לא')) {
      stabilized = true;
      await narratorSay('Der Boden stabilisiert sich. Die Eselin stemmt sich gegen die Wand und haelt stand.');
      continue;
    }

    if (spellEquals(answer, 'aor', 'or', 'אור')) {
      await narratorSay('Licht gleisst an der Wand, doch ohne Hoeren und Nein bleibt der Weg blockiert.');
      continue;
    }

    if (spellEquals(answer, 'ash', 'אש')) {
      await narratorSay('Funken springen, aber die Mauern ruehren sich nicht.');
      continue;
    }

    await donkeySay('Hoere – und sprich Nein. Erst dann findest du Platz.');
  }

  await narratorSay('Die Eselin quetscht sich an der Mauer entlang. Dein Fuss schmerzt – doch der Engel wartet weiter vorne.');
}

async function phaseThirdResistance(props) {
  setSceneContext({ phase: 'third-stand' });
  await narratorSay('Der Pfad wird so eng, dass kein Schritt mehr bleibt. Die Eselin sinkt auf die Knie.');
  await donkeySay('Ich kann nicht weiter.');
  await wizardSay('Waere doch ein Schwert in meiner Hand!');
  await donkeySay('War ich je anders? Bin ich nicht deine Eselin?');

  let kneelAttempts = 0;
  while (kneelAttempts < 2) {
    const answerInput = await promptBubble(
      anchorX(wizard, -4),
      anchorY(wizard, -60),
      'Wie antwortest du deiner Eselin?',
      anchorX(wizard, 2),
      anchorY(wizard, -32),
    );
    const answer = normalizeHebrewInput(answerInput);
    if (spellEquals(answer, 'lo', 'לא')) {
      kneelAttempts++;
      await narratorSay('Das Nein laesst deinen Zorn verstummen.');
      continue;
    }

    if (spellEquals(answer, 'shama', 'שמע')) {
      await narratorSay('Der Klang eines fernen Herzschlags fuellt den Pfad. Der Engel wird deutlicher.');
      continue;
    }

    await donkeySay('Hoere auf mich. Sag Nein – und dann hoere.');
  }

  await narratorSay('Der Himmel reisst auf. Du siehst die Gestalt aus Licht ganz deutlich.');
}

async function phaseAngelRevelation(props) {
  setSceneContext({ phase: 'angel-revelation' });
  await narratorSay('Der HERR oeffnet dir die Augen. Der Engel steht im Lichtkreis, Schwert erhoben.');
  await wizardSay('Ich habe gesuendigt. Ich wusste nicht, dass du mir entgegenstandest.');
  await narratorSay('Der Engel spricht: "Zieh hin mit den Maennern. Aber nur das Wort, das ich dir gebe, sollst du reden."');

  await Promise.all([
    showLevelTitle('שמע (shama)', 3200),
    donkeySay('Das ist שמע – shama. Hoeren, erkennen, gehorchen.'),
  ]);
  await wizardSay('Shama...');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -62),
      'Sprich שמע (shama)',
      anchorX(wizard, -2),
      anchorY(wizard, -36),
    );
    const answer = normalizeHebrewInput(answerInput);

    if (spellEquals(answer, 'shama', 'שמע')) {
      addProp(props, { id: 'revelationGlyph', type: 'hearingGlyphFragment', x: wizard.x + 18, y: wizard.y - 46, parallax: 0.92 });
      await celebrateGlyph(answer);
      await narratorSay('Das Wort klingt wie eine Saite, die Welt antwortet mit stillem Klang.');
      break;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Achte auf die drei Laute: sh – a – ma. Lass sie sich tragen.');
    } else {
      attempts = 0;
      await wizardSay('Sh... a... ma. Ich versuche es erneut.');
    }
  }
}

async function phaseListeningAltar(props) {
  setSceneContext({ phase: 'altar-rest' });
  await narratorSay('Ein Hoeraltar wartet. Klangfaeden fallen wie Lichtregen.');

  const sequence = [
    { required: 'shama', variants: ['shama', 'שמע'], description: 'Der erste Faden sucht dein Hoeren.' },
    { required: 'lo', variants: ['lo', 'לא'], description: 'Der zweite Faden verlangt ein Nein.' },
    { required: 'shama', variants: ['shama', 'שמע'], description: 'Der dritte Faden ruft nach erneutem Hoeren.' },
    { required: 'barak', variants: ['barak', 'ברכה'], description: 'Der vierte will einen Segen.' },
    { required: 'shama', variants: ['shama', 'שמע'], description: 'Der letzte Faden ruht auf deinem Lauschen.' },
  ];

  for (const step of sequence) {
    await narratorSay(step.description);
    while (true) {
      const answerInput = await promptBubble(
        anchorX(wizard, -4),
        anchorY(wizard, -60),
        'Welches Wort faengt den Faden?',
        anchorX(wizard, 2),
        anchorY(wizard, -34),
      );
      const answer = normalizeHebrewInput(answerInput);
      if (spellEquals(answer, ...step.variants)) {
        await celebrateGlyph(answer);
        await narratorSay('Der Faden verschwindet im Grimoire. Ein Schutzmuster entsteht.');
        break;
      }

      if (spellEquals(answer, 'qol', 'קול')) {
        await narratorSay('Ein Echo schwingt, aber der Faden wartet auf das andere Wort.');
        continue;
      }

      await donkeySay('Der Altar reagiert nur auf das richtige Wort. Versuch es erneut.');
    }
  }

  await narratorSay('Die Schutzform vollendet sich. Du spuerst den Titel Wahrheitsbote auf deinem Herzen.');
}

async function transitionToScene(targetAmbience, sceneConfig, props, phase) {
  await fadeToBlack(320);
  ensureAmbience(targetAmbience ?? sceneConfig.ambience ?? 'mirrorTower');
  setSceneProps([]);
  applySceneConfig({ ...sceneConfig, props }, { setAmbience: false });
  setSceneProps(props);
  setSceneContext({ level: 'level7', phase });
  await fadeToBase(360);
}
