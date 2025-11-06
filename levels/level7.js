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
} from './utils.js';

const PROCESSION_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 78,
  donkeyOffset: -40,
  props: [
    { id: 'hoofStepOne', type: 'hoofSignTrail', x: 148, align: 'ground', parallax: 0.92 },
    { id: 'hoofStepTwo', type: 'hoofSignTrail', x: 252, align: 'ground', parallax: 0.94 },
    { id: 'hoofStepThree', type: 'hoofSignTrail', x: 356, align: 'ground', parallax: 0.96 },
    { id: 'bannerOne', type: 'princeProcessionBanner', x: 252, align: 'ground', parallax: 0.94 },
    { id: 'bannerTwo', type: 'princeProcessionBanner', x: 356, align: 'ground', parallax: 0.96 },
    { id: 'bannerThree', type: 'princeProcessionBanner', x: 460, align: 'ground', parallax: 0.98 },
  ],
};

const VINEYARD_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 84,
  donkeyOffset: -42,
  props: [
    { id: 'vineyardAngel', type: 'angelBladeForm', x: 360, align: 'ground', parallax: 0.96 },
  ],
};

const WALL_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 84,
  donkeyOffset: -42,
  props: [
    { id: 'wallAngel', type: 'angelBladeForm', x: 352, align: 'ground', parallax: 0.98 },
  ],
};

const PINCH_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 82,
  donkeyOffset: -42,
  props: [
    { id: 'pinchAngel', type: 'angelBladeForm', x: 360, align: 'ground', parallax: 0.98 },
  ],
};

const REVELATION_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 90,
  donkeyOffset: -42,
  props: [
    { id: 'revelationAngel', type: 'angelBladeForm', x: 336, align: 'ground', parallax: 0.96 },
  ],
};

const ALTAR_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 96,
  donkeyOffset: -40,
  props: [
    { id: 'listeningAltar', type: 'hearingAltar', x: 332, align: 'ground', parallax: 0.96 },
  ],
};

const PROCESSION_BANNERS = [
  {
    id: 'bannerOne',
    introPrompt: 'Die Schrift verlangt nach Licht.',
    wordPrompt: 'Sprich אור (or).',
    spells: ['or', 'אור'],
    sealPrompt: 'Versiegle das Banner mit לא (lo).',
    response: 'Das Banner klärt sich. Balaks Befehl verliert an Kraft.',
  },
  {
    id: 'bannerTwo',
    introPrompt: 'Hitze staut sich unter dem Tuch.',
    wordPrompt: 'Sprich מים (mayim).',
    spells: ['mayim', 'majim', 'mjm', 'מים'],
    sealPrompt: 'Sprich לא, um Balaks Auftrag zu verneinen.',
    response: 'Tau legt sich über die Schrift, das Banner wird still.',
  },
  {
    id: 'bannerThree',
    introPrompt: 'Flüstern reisst an deinen Ohren.',
    wordPrompt: 'Sprich קול (qol).',
    spells: ['qol', 'קול'],
    sealPrompt: 'Beende das Echo mit לא.',
    response: 'Balaks Befehlszeilen verstummen. Der Pfad bereitet sich.',
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
  await phaseHoofSteps(processionProps);
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

  await narratorSay('Die Fürsten reiten weiter nach Moab. Die Eselin folgt, der Engel bleibt auf dem Weg.');
  await donkeySay('Wer hört, erkennt.');
  await donkeySay('Und wer erkennt, weiss, dass alles nur gesprochen ist. Bewahre shama und lo.');
  await fadeToBlack(720);
}

async function phaseProcessionIntro() {
  await narratorSay('Da stand Bileam am Morgen auf, sattelte seine Eselin und zog mit den Fürsten der Moabiter. Doch der Zorn Gottes entbrannte, dass er hinzog.');
  await narratorSay('Grauer Morgen über den Hügeln, Nebel hängt wie feine Stoffbahnen, Banner zittern im Wind.');
  await showLevelTitle('Das Wort לא bleibt aktiv. Neues Lernwort: שמע (shama) – höre und erkenne. Aufgabe: Folge den Fürsten, ohne den inneren Klang zu verlieren.', 5200);
  await donkeySay('Bewahre das Nein, Meister. Wir werden hören müssen, nicht nur sehen.');
}

async function phaseHoofSteps(props) {
  const steps = ['hoofStepOne', 'hoofStepTwo', 'hoofStepThree'];
  for (const id of steps) {
    const target = props.find(entry => entry.id === id)?.x ?? wizard.x + 120;
    await waitForWizardToReach(target, { tolerance: 14 });
    let sealed = false;
    while (!sealed) {
      const answer = await readWord('Stabilisiere den Pfad mit לא (lo).');
      if (spellEquals(answer, 'lo', 'לא')) {
        sealed = true;
        await celebrateGlyph(answer);
        await narratorSay('Der Pfad bestaetigt dein Nein. Die Eselin schreitet sicher.');
      } else {
        await donkeySay('Sprich das Nein, das du gelernt hast.');
      }
    }
  }
}

async function phaseProcessionBanners(props) {
  await narratorSay('Die Fürsten tragen Schriftbanner. Prüfe sie mit deinen Worten.');
  for (const banner of PROCESSION_BANNERS) {
    const anchor = props.find(entry => entry.id === banner.id)?.x ?? wizard.x + 180;
    await waitForWizardToReach(anchor, { tolerance: 16 });
    let lit = false;
    while (!lit) {
      const answer = await readWord(banner.wordPrompt);
      if (banner.spells.some(spell => spellEquals(answer, spell))) {
        lit = true;
        await celebrateGlyph(answer);
        await narratorSay(banner.introPrompt);
      } else {
        await donkeySay('Nutze das passende Wort.');
      }
    }

    let sealed = false;
    while (!sealed) {
      const answerSeal = await readWord(banner.sealPrompt);
      if (spellEquals(answerSeal, 'lo', 'לא')) {
        sealed = true;
        updateProp(props, banner.id, { type: 'princeProcessionBannerLit' });
        await celebrateGlyph(answerSeal);
        await narratorSay(banner.response);
      } else {
        await donkeySay('Versiegle das Banner mit einem klaren Nein.');
      }
    }
  }
  await narratorSay('Die Banner schweigen. Das Wort שמע wartet noch im Verborgenen.');
}

async function phaseFirstResistance(props) {
  await narratorSay('Der Engel des HERRN steht im Weinberg. Sonne bricht durch Nebel, doch du siehst ihn nicht.');
  await donkeySay('Da steht etwas vor uns... aber du siehst es nicht.');
  await wizardSay('Es ist nur ein Flimmern, führe mich weiter!');
  let shamaCount = 0;
  while (shamaCount < 2) {
    const answer = await readWord('Wie antwortest du dem Licht im Weg?');
    if (spellEquals(answer, 'shama', 'שמע')) {
      shamaCount += 1;
      await narratorSay('Ein Hörstrahl verbindet dich mit dem Engel.');
    } else if (spellEquals(answer, 'lo', 'לא')) {
      await narratorSay('Das Nein hält die Zeit an, doch der Engel bleibt.');
    } else if (spellEquals(answer, 'ash', 'אש')) {
      await narratorSay('Hitze flackert, aber der Engel ruht unbewegt.');
    } else {
      await donkeySay('Höre zuerst. Sprich שמע.');
    }
  }
  await narratorSay('Die Eselin weicht auf das Feld aus. Der Engel wartet weiter.');
}

async function phaseSecondResistance(props) {
  await narratorSay('Zwischen Weinmauern steht der Engel erneut mit erhobenem Schwert.');
  await donkeySay('Schon wieder... da, zwischen den Steinen!');
  await wizardSay('Du treibst Mutwillen!');
  await narratorSay('Die Eselin draengt sich an den Felsen und klemmt deinen Fuss ein.');
  let heard = false;
  let denied = false;
  while (!heard || !denied) {
    const answer = await readWord('Der Weg klemmt. Welches Wort sprichst du?');
    if (!heard && spellEquals(answer, 'shama', 'שמע')) {
      heard = true;
      await narratorSay('Die Mauern beginnen zu singen. Glyphen glimmen.');
    } else if (!denied && spellEquals(answer, 'lo', 'לא')) {
      denied = true;
      await narratorSay('Der Boden stabilisiert sich. Die Eselin hält stand.');
    } else if (spellEquals(answer, 'aor', 'or', 'אור')) {
      await narratorSay('Licht beleuchtet den Engel, doch ohne Hören bleibt er still.');
    } else {
      await donkeySay('Höre – und sag Nein. Sonst kommen wir nicht weiter.');
    }
  }
  await narratorSay('Die Eselin drängt sich an der Mauer vorbei. Dein Fuß schmerzt, aber der Weg wird frei.');
}

async function phaseThirdResistance(props) {
  await narratorSay('Der Pfad verengt sich zur Schlucht. Kein Platz mehr zum Ausweichen.');
  await donkeySay('Ich kann nicht weiter.');
  await narratorSay('Die Eselin faellt auf die Knie. Stille, nur tiefer Bordun.');
  await wizardSay('Wäre doch ein Schwert in meiner Hand, ich wollte dich töten!');
  await donkeySay('War ich je anders? Bin ich nicht deine Eselin, auf der du geritten bist von jeher bis heute?');
  let loCount = 0;
  let shamaHeard = false;
  while (loCount < 2 || !shamaHeard) {
    const answer = await readWord('Wie antwortest du deiner Eselin?');
    if (spellEquals(answer, 'lo', 'לא')) {
      loCount += 1;
      await narratorSay('Dein Zorn verstummt.');
    } else if (spellEquals(answer, 'shama', 'שמע')) {
      shamaHeard = true;
      await narratorSay('Du hörst den Herzschlag der Eselin – und den Engel deutlicher.');
    } else {
      await donkeySay('Nie schlagen. Sag Nein – und höre.');
    }
  }
  await wizardSay('Nein... lo.');
  await narratorSay('Der Himmel öffnet sich. Du siehst den Engel klar vor dir.');
}

async function phaseAngelRevelation(props) {
  await narratorSay('Der HERR öffnet dir die Augen. Du faellst nieder vor dem Engel aus gebuendeltem Licht.');
  await propSay(props, 'revelationAngel', 'Warum hast du deine Eselin dreimal geschlagen? Ich stand dir entgegen, denn dein Weg führt ins Verderben.', { anchor: 'center' });
  await propSay(props, 'revelationAngel', 'Wäre sie mir nicht ausgewichen, ich hätte dich getötet, sie aber leben lassen.', { anchor: 'center' });
  await wizardSay('Ich habe gesündigt. Ich wusste nicht, dass du mir entgegenstandest. Wenn es dir nicht gefällt, will ich umkehren.');
  await propSay(props, 'revelationAngel', 'Zieh hin mit den Männern, aber nichts anderes, als was ich dir sagen werde, sollst du reden.', { anchor: 'center' });
  await Promise.all([
    showLevelTitle('שמע (shama)', 2800),
    donkeySay('Das ist שמע – shama. Höre, erkenne, gehorche.'),
  ]);

  let learnt = false;
  while (!learnt) {
    const answer = await readWord('Sprich שמע (shama).');
    if (spellEquals(answer, 'shama', 'שמע')) {
      learnt = true;
      addProp(props, { id: 'shamaGlyph', type: 'hearingGlyphFragment', x: wizard.x + 18, y: wizard.y - 46, parallax: 0.92 });
      await celebrateGlyph(answer);
      await narratorSay('Das Wort klingt wie eine Saite. Die Welt antwortet mit stillem Klang.');
      await narratorSay('Grenze bleibt bestehen: lo – bewahre das Nein. Gabe erhalten: Divine Pass – 1.');
    } else {
      await donkeySay('Sprich es ruhig: sh – a – ma.');
    }
  }
}

async function phaseListeningAltar(props) {
  await narratorSay('Ein Höraltar wartet. Klangfäden fallen herab.');
  for (let index = 1; index <= 6; index += 1) {
    const expectsLo = index % 4 === 0;
    const expected = expectsLo ? 'lo' : 'shama';
    const prompt = expectsLo
      ? 'Der Faden spannt sich. Sprich לא, damit er nicht reisst.'
      : 'Ein Faden singt. Antworte mit שמע.';
    let ok = false;
    while (!ok) {
      const answer = await readWord(prompt);
      const variant = expected === 'lo' ? 'לא' : 'שמע';
      if (spellEquals(answer, expected, variant)) {
        ok = true;
        await celebrateGlyph(answer);
        await narratorSay('Der Faden verwebt sich in deinem Grimoire.');
      } else if (spellEquals(answer, 'qol', 'קול')) {
        await narratorSay('Ein Echo schwingt, doch der Faden wartet auf das andere Wort.');
      } else {
        await donkeySay('Der Altar reagiert nur auf das rechte Wort.');
      }
    }
  }
  await narratorSay('Die Schutzform vollendet sich. Du fühlst dich als Wahrheitsbote.');
  await narratorSay('Innere Stimme: Vielleicht stand der Engel nicht vor mir, sondern hinter dem Vorhang, wo der Stoff der Welt zu Ende geht.');
  await narratorSay('Innere Stimme: Manche nennen es das Licht hinter dem Licht. Und wer lauscht, hört ein fernes Echo – das Summen des ersten Wortes.');
}

async function transitionToScene(ambienceKey, sceneConfig, props, phase) {
  await fadeToBlack(320);
  ensureAmbience(ambienceKey ?? sceneConfig.ambience ?? 'mirrorTower');
  setSceneProps([]);
  applySceneConfig({ ...sceneConfig, props }, { setAmbience: false });
  setSceneProps(props);
  setSceneContext({ level: 'level7', phase });
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
