import {
  promptBubble,
  ensureAmbience,
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
  propSay,
  anchorX,
  anchorY,
  wizard,
  normalizeHebrewInput,
  applySceneConfig,
  cloneSceneProps,
  FORGE_SCENE,
  spellEquals,
  findProp,
  updateProp,
  addProp,
  celebrateGlyph,
  divineSay,
  switchMusic,
} from './utils.js';

export async function runLevelFive() {
  const plan = levelAmbiencePlan.level5;
  const forgeProps = cloneSceneProps(FORGE_SCENE.props);

  ensureAmbience(plan?.learn ?? FORGE_SCENE.ambience ?? 'volcanoTrial');
  setSceneProps([]);
  applySceneConfig({ ...FORGE_SCENE, props: forgeProps }, { setAmbience: false });
  setSceneProps(forgeProps);
  setSceneContext({ level: 'level5', phase: 'arrival' });

  await showLevelTitle('Level 5 -\nDie Schmiede\nder Flammen');
  await fadeToBase(600);

  const ring = findForgeRing(forgeProps);
  await waitForWizardToReach(ring.x + 12, { tolerance: 28 });
  await phaseIntroduction(forgeProps);
  await phaseDormantForge(forgeProps);
  await phaseAshRevelation(forgeProps);
  await phaseAnvilChallenge(forgeProps);
  await phaseBalakChoice(forgeProps);
  await phaseReflection();

  await fadeToBlack(720);
}

async function phaseIntroduction(props) {
  await narratorSay('Die Schmiede unter dem Berg schläft. Kein Rauch, kein Glühen – nur kaltes Eisen.');
  await propSay(props, 'forgeBalakEcho', 'Lehrling, entfalte, was du gelernt hast. Entzünde das Feuer der Schöpfung!', { anchor: 'center', offsetY: -42 });
  await wizardSay('Feuer... ich kenne das Wort noch nicht.');
  await donkeySay('Dann wirst du es finden müssen. Höre auf den Stein, nicht auf Balaks Gier.');
  setSceneContext({ phase: 'search' });
}

async function phaseDormantForge(props) {
  const observed = new Set();

  await narratorSay('Der Ring ist von drei Rillen durchzogen – als würde er auf verschiedene Kräfte warten.');
  await donkeySay('Probier die Worte, die du schon gemeistert hast: Licht, Wasser, Stimme. Der Ring reagiert auf Erinnerungen.');

  while (observed.size < 3) {
    const attempt = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -60),
      'Welches deiner bekannten Worte legst du auf den Ring?',
      anchorX(wizard, 0),
      anchorY(wizard, -32),
    );
    const answer = normalizeHebrewInput(attempt);

    if (spellEquals(answer, 'ash', 'אש')) {
      await donkeySay('Das neue Wort ist noch verborgen. Suche zuerst nach seinen Zeichen.');
      continue;
    }

    if (spellEquals(answer, 'or', 'אור')) {
      observed.add('or');
      updateProp(props, 'forgeIgnitionRing', { type: 'sunStoneAwakened' });
      await celebrateGlyph(answer);
      await narratorSay('Licht flammt kurz auf, zittert und erlischt im kalten Eisen.');
      updateProp(props, 'forgeIgnitionRing', { type: 'sunStoneDormant' });
      continue;
    }

    if (spellEquals(answer, 'mayim', 'majim', 'mjm', 'מים')) {
      observed.add('mayim');
      updateProp(props, 'forgeWaterCistern', { type: 'fountainFilled' });
      await celebrateGlyph(answer);
      await narratorSay('Dampf steigt auf, der Boden zischt – doch kein Feuer bleibt.');
      updateProp(props, 'forgeWaterCistern', { type: 'fountainDry' });
      continue;
    }

    if (spellEquals(answer, 'qol', 'קול')) {
      observed.add('qol');
      const ring = findForgeRing(props);
      addProp(props, { id: 'forgeResonance', type: 'soundGlyph', x: ring.x + 18, y: ring.y - 26, parallax: 0.85 });
      await celebrateGlyph(answer);
      await narratorSay('Metall summt, Steine vibrieren – doch keine Flamme erwacht.');
      updateProp(props, 'forgeResonance', null);
      continue;
    }

    await donkeySay('Der Ring bleibt kalt. Versuch eines der Worte, die dir bereits dienen.');
  }

  await narratorSay('Rauch sammelt sich über dem Metallring. Zwei Zeichen leuchten kurz auf und warten.');
  setSceneContext({ phase: 'revelation-prelude' });
}

async function phaseAshRevelation(props) {
  setSceneContext({ phase: 'revelation' });
  const ring = findForgeRing(props);
  addProp(props, { id: 'forgeEmberGlyph', type: 'gardenBreadLight', x: ring.x + 12, y: ring.y - 28, parallax: 0.9 });

  await narratorSay('Im Metall erscheinen Linien, die zu einem neuen Wort verschmelzen.');
  await Promise.all([
    showLevelTitle('אש (ash)', 3000),
    donkeySay('Das ist אש – ash. Es bedeutet Feuer.'),
  ]);
  await wizardSay('Ash...');
  await donkeySay('Aleph ist Kraft – die unsichtbare Energie der Schöpfung. Shein, die Zähne, stehen für das Feuer, das verschlingt. Halte beides im Gleichgewicht.');
  await wizardSay('Und wenn das Gleichgewicht verloren geht?');
  await donkeySay('Dann brennt die Welt – oder das Herz dessen, der spricht.');

  let attempts = 0;
  while (true) {
    const attempt = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -62),
      'Sprich אש (ash)',
      anchorX(wizard, 0),
      anchorY(wizard, -36),
    );
    const answer = normalizeHebrewInput(attempt);

    if (spellEquals(answer, 'ash', 'אש')) {
      updateProp(props, 'forgeIgnitionRing', { type: 'sunStoneAwakened' });
      await celebrateGlyph(answer);
      await narratorSay('Der Ring entzündet sich. Flammen tanzen den Wänden entlang – die Schmiede lebt.');
      switchMusic('באש אשפט.mp3');
      await divineSay('באש אשפט\nMit Feuer werde ich richten.');
      return;
    }

    attempts += 1;
    if (attempts === 1) {
      await donkeySay('Atme. Sag das Aleph mit Stärke und das Shein mit Zügel.');
    } else if (attempts === 2) {
      await narratorSay('Flackernde Funken steigen auf und verglühen in der Luft.');
    } else {
      attempts = 0;
      await narratorSay('Aleph und Shein schweben getrennt vor dir, pulsieren gegeneinander. Finde das Gleichgewicht erneut.');
    }
  }
}

async function phaseAnvilChallenge(props) {
  setSceneContext({ phase: 'trial' });
  await narratorSay('Das Feuer greift nach dem Amboss. Glut rinnt über den Stahl.');

  let attempts = 0;
  while (true) {
    const attempt = await promptBubble(
      anchorX(wizard, -4),
      anchorY(wizard, -60),
      'Wie zähmst du das Schmiedefeuer?',
      anchorX(wizard, 2),
      anchorY(wizard, -34),
    );
    const answer = normalizeHebrewInput(attempt);

    if (spellEquals(answer, 'mayim', 'majim', 'mjm', 'מים')) {
      updateProp(props, 'forgeWaterCistern', { type: 'fountainFilled' });
      await celebrateGlyph(answer);
      await narratorSay('Zischendes Wasser löscht das Feuer. Dampf zeichnet Aleph und Shein in die Luft.');
      updateProp(props, 'forgeWaterCistern', { type: 'fountainDry' });
      return;
    }

    attempts += 1;
    if (spellEquals(answer, 'ash', 'אש')) {
      await propSay(props, 'forgeBalakEcho', 'Mehr Feuer! Stärke es und lass es für mich schmieden!', { anchor: 'center', offsetY: -42 });
    } else if (spellEquals(answer, 'or', 'אור')) {
      await narratorSay('Licht facht die Flammen weiter an. Der Amboss glüht heißer.');
    } else if (spellEquals(answer, 'qol', 'קול')) {
      await narratorSay('Der Amboss summt, aber das Feuer lacht über deinen Klang.');
    } else {
      await donkeySay('Das hilft nicht. Denke an das Wort, das Feuer besänftigt.');
    }

    if (attempts >= 3) {
      attempts = 0;
      await narratorSay('Der Raum bebt. Ohne Wasser wird die Schmiede alles verschlingen.');
    }
  }
}

async function phaseBalakChoice(props) {
  setSceneContext({ phase: 'choice' });
  await propSay(props, 'forgeBalakEcho', 'Ich sehe, du hast das Feuer gemeistert. Form es für mich – erschaffe ein Schwert aus Glut!', { anchor: 'center', offsetY: -42 });
  await donkeySay('Balaks Hunger wächst. Entscheide, wem das Feuer gehört.');

  while (true) {
    const attempt = await promptBubble(
      anchorX(wizard, -4),
      anchorY(wizard, -58),
      'Feuer nähren oder löschen – welches Wort sprichst du?',
      anchorX(wizard, 0),
      anchorY(wizard, -32),
    );
    const answer = normalizeHebrewInput(attempt);

    if (spellEquals(answer, 'ash', 'אש')) {
      await celebrateGlyph(answer);
      await narratorSay('Die Flammen wachsen zu einer Klinge aus Licht. Balaks Lachen hallt – kalt und gierig.');
      await propSay(props, 'forgeBalakEcho', 'So sei es! Mit diesem Feuer wird Moab regiert!', { anchor: 'center', offsetY: -42 });
      return;
    }

    if (spellEquals(answer, 'mayim', 'majim', 'mjm', 'מים')) {
      await celebrateGlyph(answer);
      await narratorSay('Wasser umschließt die Flammen. Nur ein glimmender Kern bleibt zurück.');
      await propSay(props, 'forgeBalakEcho', 'Narr! Du vernichtest mein Geschenk!', { anchor: 'center', offsetY: -42 });
      updateProp(props, 'forgeIgnitionRing', { type: 'sunStoneDormant' });
      updateProp(props, 'forgeEmberGlyph', null);
      return;
    }

    await donkeySay('Nur Feuer oder Wasser können diese Wahl treffen. Sprich klar.');
  }
}

async function phaseReflection() {
  setSceneContext({ phase: 'reflection' });
  await wizardSay('Ich wollte schaffen... und habe beinahe zerstört.');
  await donkeySay('Feuer ist kein Feind, aber auch kein Freund. Es gehört dem, der sein Herz zügelt.');
  await narratorSay('In den Hallen des Vulkans lernte der Lehrling das Gewicht seiner Stimme zu tragen.');
}

function findForgeRing(props) {
  const ring = findProp(props, 'forgeIgnitionRing');
  return ring ?? { x: wizard.x + 80, y: wizard.y - 16 };
}
