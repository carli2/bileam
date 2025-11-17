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
  lockDonkeyAt,
  unlockDonkey,
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
  spellEquals,
  updateProp,
  addProp,
  celebrateGlyph,
  propSay,
  divineSay,
  playHeavenCurtainEffect,
} from './utils.js';

const PROCESSION_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 78,
  donkeyOffset: -40,
  props: [
    { id: 'hoofStepOne', type: 'hoofSignTrail', x: 148, align: 'ground', parallax: 0.92 },
    { id: 'hoofStepTwo', type: 'hoofSignTrail', x: 252, align: 'ground', parallax: 0.94 },
    { id: 'hoofStepThree', type: 'hoofSignTrail', x: 356, align: 'ground', parallax: 0.96 },
    { id: 'processionAdvisorWest', type: 'balakAdvisor', x: 42, align: 'ground', parallax: 0.95 },
    { id: 'processionAdvisorEast', type: 'balakAdvisor', x: 66, align: 'ground', parallax: 0.97 },
  ],
};

const VINEYARD_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 84,
  donkeyOffset: -42,
  props: [
    { id: 'vineyardBoundaryWest', type: 'vineyardBoundary', x: 188, align: 'ground', parallax: 0.94 },
    { id: 'vineyardBoundaryEast', type: 'vineyardBoundary', x: 332, align: 'ground', parallax: 0.94 },
    { id: 'processionAdvisorWest', type: 'balakAdvisor', x: 48, align: 'ground', parallax: 0.95 },
    { id: 'processionAdvisorEast', type: 'balakAdvisor', x: 72, align: 'ground', parallax: 0.97 },
    { id: 'vineyardAngel', type: 'angelBladeForm', x: 360, align: 'ground', parallax: 0.96, visible: false },
  ],
};

const WALL_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 84,
  donkeyOffset: -42,
  props: [
    { id: 'processionAdvisorWest', type: 'balakAdvisor', x: 48, align: 'ground', parallax: 0.95 },
    { id: 'processionAdvisorEast', type: 'balakAdvisor', x: 72, align: 'ground', parallax: 0.97 },
    { id: 'wallAngel', type: 'angelBladeForm', x: 352, align: 'ground', parallax: 0.98, visible: false },
  ],
};

const PINCH_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 82,
  donkeyOffset: -42,
  props: [
    { id: 'processionAdvisorWest', type: 'balakAdvisor', x: 46, align: 'ground', parallax: 0.95 },
    { id: 'processionAdvisorEast', type: 'balakAdvisor', x: 70, align: 'ground', parallax: 0.97 },
    { id: 'pinchAngel', type: 'angelBladeForm', x: 248, align: 'ground', parallax: 0.98, visible: false },
  ],
};

const REVELATION_SCENE = {
  ambience: 'mirrorTower',
  wizardStartX: 90,
  donkeyOffset: -42,
  props: [
    { id: 'processionAdvisorWest', type: 'balakAdvisor', x: 54, align: 'ground', parallax: 0.95 },
    { id: 'processionAdvisorEast', type: 'balakAdvisor', x: 78, align: 'ground', parallax: 0.97 },
    { id: 'revelationAngel', type: 'angelBladeForm', x: 236, align: 'ground', parallax: 0.96, visible: false },
  ],
};

export async function runLevelSeven() {
  const plan = levelAmbiencePlan.level7;
  const processionProps = cloneSceneProps(PROCESSION_SCENE.props);
  applySceneConfig({ ...PROCESSION_SCENE, props: processionProps });
  ensureAmbience(plan?.review ?? PROCESSION_SCENE.ambience ?? 'mirrorTower');
  setSceneContext({ level: 'level7', phase: 'procession' });
  await showLevelTitle('Level 7 – Der Engel und die Eselin');
  await fadeToBase(600);

  await phaseProcessionIntro();
  await phaseHoofSteps(processionProps);
  await narratorSay('Die Fürsten nicken, als du schweigend zwischen den Bannern hindurch schreitest. Keine Aufgabe, nur der Blick nach vorn – zum Weinberg, wo der Weg schmal wird.');

  const vineyardProps = cloneSceneProps(VINEYARD_SCENE.props);
  await transitionToScene(plan?.learn, VINEYARD_SCENE, vineyardProps, 'first-resistance', { fade: false });
  await phaseFirstResistance(vineyardProps);

  const wallProps = cloneSceneProps(WALL_SCENE.props);
  await transitionToScene(plan?.learn, WALL_SCENE, wallProps, 'second-resistance', { fade: false });
  await phaseSecondResistance(wallProps);

  const pinchProps = cloneSceneProps(PINCH_SCENE.props);
  await transitionToScene(plan?.learn, PINCH_SCENE, pinchProps, 'third-resistance', { fade: false });
  await phaseThirdResistance(pinchProps);

  const revelationProps = cloneSceneProps(REVELATION_SCENE.props);
  await transitionToScene(plan?.learn, REVELATION_SCENE, revelationProps, 'revelation');
  const angelGuard = await phaseAngelRevelation(revelationProps);
  await phaseLearnMalak(angelGuard);

  await narratorSay('Die Fürsten reiten weiter nach Moab. Die Eselin folgt, der Engel bleibt auf dem Weg.');
  await donkeySay('Wer hört, erkennt.');
  await donkeySay('Und wer erkennt, weiss, dass alles nur gesprochen ist.');
  await fadeToBlack(720);
}

async function phaseProcessionIntro() {
  await narratorSay('Da stand Bileam am Morgen auf, sattelte seine Eselin und zog mit den Fürsten der Moabiter. Doch der Zorn אלוהים entbrannte, dass er hinzog.');
  await narratorSay('Grauer Morgen über den Hügeln, Nebel hängt wie feine Stoffbahnen, und die Banner der Fürsten rascheln hinter dir.');
  await showLevelTitle('Die Fürsten fordern Stille. Lausche sorgfältig.', 5200);
  await donkeySay('Wir werden hören müssen, nicht nur sehen.');
}

async function phaseHoofSteps(props) {
  const hoofThree = props.find(entry => entry.id === 'hoofStepThree');
  const forwardTarget = hoofThree ? hoofThree.x + 40 : wizard.x + 200;
  await narratorSay('Die Fürsten setzen sich in Bewegung. Folge ihnen bis an den Weinberg.');
  const stopAdvisorFollow = startAdvisorEscort(props);
  await waitForWizardToReach(forwardTarget, { tolerance: 14 });

  const lockX = donkey.x;
  lockDonkeyAt(lockX);
  const boundaryIds = ['processionBoundaryWest', 'processionBoundaryEast'];
  addProp(props, { id: boundaryIds[0], type: 'vineyardBoundary', x: lockX - 28, align: 'ground', parallax: 1 });
  addProp(props, { id: boundaryIds[1], type: 'vineyardBoundary', x: lockX + 36, align: 'ground', parallax: 1 });
  await narratorSay('Doch die Eselin bleibt stehen. Sie scharrt am Weg und weigert sich, weiterzugehen.');
  await narratorSay('Deine Eselin folgt dir nicht. Kehre zu ihr zurück.');
  await waitForWizardToReach(lockX - 6, { tolerance: 14 });
  await narratorSay('Wie einst auf dem Feld biegt sie vom Weg ab, und du hebst den Stock.');
  await narratorSay('Bevor du zuschlägst, hebt die Eselin den Kopf.');
  await donkeySay('Ich höre etwas, Meister. שמע – sche-MA – bedeutet hören, gehorchen, wahrnehmen.');
  await narratorSay('שמע schreibt man Schin-Mem-Ajin. Sprich es langsam: sche–MA. Dieses Wort öffnet Wege, die Augen nicht sehen.');
  await narratorSay('Das Ajin sieht aus wie ein Auge. Es klingt wie ein tiefes „A“, aber du gebrauchst den Hals – als würdest du durch die Kehle atmen.');
  await narratorSay('Die Eselin atmet aus und tritt zur Seite, als hielte sie etwas Unsichtbares auf.');
  boundaryIds.forEach(id => updateProp(props, id, { visible: false }));
  unlockDonkey();
  stopAdvisorFollow();
}

async function phaseFirstResistance(props) {
  await narratorSay('Der Pfad verengt sich in den Weinberg. Nebel liegt schwer, und die Eselin zögert, als hielte sie etwas Unsichtbares auf.');
  await narratorSay('Sie biegt in die Weinberge, presst Huf gegen Stein und sucht Raum, den es nicht gibt.');
  await narratorSay('Du schlägst sie, um sie zum Weg zurückzutreiben, doch sie hält an – gehorsam dem Hören, nicht deinem Stock.');
  await narratorSay('Die Fürsten flüstern. Sie sehen nur Staub, doch sie spüren, wie der Sand ringsum straffer wird.');
}

async function phaseSecondResistance(props) {
  await narratorSay('Zwischen den Mauern des Weinbergs wird der Pfad schmal. Die Eselin drängt sich an den Felsen und klemmt deinen Fuß ein.');
  await narratorSay('Du schreist sie an, schlägst sie zum zweiten Mal, doch sie bleibt an der Mauer. Dein Fuß schmerzt.');
  await narratorSay('Noch immer siehst du nichts – nur ihre Ohren, die lauschen.');
}

async function phaseThirdResistance(props) {
  await narratorSay('Der Pfad verengt sich zur Schlucht. Kein Platz mehr zum Ausweichen.');
  await donkeySay('Ich kann nicht weiter.');
  await narratorSay('Die Eselin faellt auf die Knie. Stille, nur tiefer Bordun.');
  await wizardSay('Wäre doch ein Schwert in meiner Hand, ich wollte dich töten!');
  await donkeySay('War ich je anders? Bin ich nicht deine Eselin, auf der du geritten bist von jeher bis heute?');
  const shamaNeeded = 3;
  for (let attempt = 0; attempt < shamaNeeded; attempt += 1) {
    await donkeySay('לא!');
    let heard = false;
    while (!heard) {
      const answer = await readWord('Wie antwortest du deiner Eselin?');
      if (spellEquals(answer, 'shama', 'שמע')) {
        heard = true;
        await narratorSay('Du hörst – tiefer als zuvor. Etwas aus Licht bewegt sich im Staub.');
      } else {
        await donkeySay('Sprich שמע – sche-MA. Höre, nicht schlagen.');
      }
    }
  }
  await wizardSay('לא... ich habe geirrt.');
  await playHeavenCurtainEffect(props, { centerX: wizard.x + 20 });
}

async function phaseAngelRevelation(props) {
  const angel = await ensureAngelBlocksPath(props, 'revelationAngel');
  await narratorSay('יהוה öffnet dir die Augen. Du faellst nieder vor dem Engel aus gebuendeltem Licht.');
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
      await divineSay('שמע בילעם בן בעור\nHöre, Bileam, Sohn des Beor.');
      await narratorSay('Das Wort klingt wie eine Saite. Die Welt antwortet mit stillem Klang.');
      await narratorSay('Dein Nein liegt nun wie ein unsichtbarer Wall hinter dir. Die Fürsten sehen nur Sand, doch sie stoßen daran.');
    } else {
      await donkeySay('Sprich es ruhig: sh – a – ma.');
    }
  }
}

async function phaseLearnMalak(angelGuard) {
  await narratorSay('Der Engel senkt sein Schwert. „Mein Name ist מלאך – Malak, Bote des Lichts. Sprich ihn, wenn Schatten dich bedrängen.“');
  let learnt = false;
  while (!learnt) {
    const answer = await readWord('Sprich מלאך (malak).');
    if (spellEquals(answer, 'malak', 'מלאך')) {
      learnt = true;
      await celebrateGlyph('מלאך');
      await narratorSay('Malak bedeutet Bote. Du wirst dieses Wort brauchen, wenn Balaks Schatten deinen Weg versperren.');
      await divineSay('מלאכי ניצב בדרך לעצור אותך\nMein Engel steht auf dem Weg, um dich aufzuhalten.');
    } else {
      await donkeySay('Sprich ma-lak – מלאך.');
    }
  }
  await releaseAngelBlock(angelGuard);
  await narratorSay('Die Klangfäden um dich schwingen aus und legen sich wie ein unsichtbarer Mantel. Mehr Prüfungen braucht es heute nicht.');
  await wizardSay('Vielleicht stand der Engel nicht vor mir, sondern hinter dem Vorhang, wo der Stoff der Welt zu Ende geht.');
  await wizardSay('Manche nennen es das Licht hinter dem Licht. Und wer lauscht, hört ein fernes Echo – das Summen des ersten Wortes.');
}

async function ensureAngelBlocksPath(props, id) {
  const angel = Array.isArray(props) ? props.find(entry => entry.id === id) : null;
  if (!angel) return null;
  updateProp(props, id, { visible: true });
  const stopX = (angel.x ?? wizard.x) - 36;
  await waitForWizardToReach(stopX, { tolerance: 10 });
  return angel;
}

async function releaseAngelBlock(angel) {
  if (!angel) return;
  const passX = (angel.x ?? wizard.x) + 44;
  await waitForWizardToReach(passX, { tolerance: 12 });
}

function startAdvisorEscort(props, {
  westId = 'processionAdvisorWest',
  eastId = 'processionAdvisorEast',
  westOffset = -42,
  eastOffset = -18,
} = {}) {
  if (!Array.isArray(props)) {
    return () => {};
  }
  const targets = [
    westId ? { id: westId, offset: westOffset } : null,
    eastId ? { id: eastId, offset: eastOffset } : null,
  ].filter(Boolean);
  if (targets.length === 0) {
    return () => {};
  }

  let active = true;
  let rafId = null;
  let timeoutId = null;
  const hasRaf = typeof requestAnimationFrame === 'function';

  const schedule = () => {
    if (hasRaf) {
      rafId = requestAnimationFrame(tick);
    } else {
      timeoutId = setTimeout(tick, 50);
    }
  };

  const cancel = () => {
    if (hasRaf && typeof cancelAnimationFrame === 'function' && rafId != null) {
      cancelAnimationFrame(rafId);
    }
    if (!hasRaf && timeoutId != null) {
      clearTimeout(timeoutId);
    }
    rafId = null;
    timeoutId = null;
  };

  const tick = () => {
    if (!active) {
      cancel();
      return;
    }
    targets.forEach(({ id, offset }) => {
      updateProp(props, id, { x: wizard.x + (offset ?? 0) });
    });
    schedule();
  };

  tick();
  return () => {
    active = false;
    cancel();
  };
}

async function transitionToScene(ambienceKey, sceneConfig, props, phase, options = {}) {
  const useFade = options.fade !== false;
  if (useFade) {
    await fadeToBlack(320);
  }
  ensureAmbience(ambienceKey ?? sceneConfig.ambience ?? 'mirrorTower');
  setSceneProps([]);
  applySceneConfig({ ...sceneConfig, props }, { setAmbience: false });
  setSceneProps(props);
  setSceneContext({ level: 'level7', phase });
  if (useFade) {
    await fadeToBase(360);
  }
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
