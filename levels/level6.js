import {
  promptBubble,
  ensureAmbience,
  setSceneContext,
  levelAmbiencePlan,
  fadeToBlack,
  fadeToBase,
  showLevelTitle,
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
  MARKET_SCENE,
  spellEquals,
  propSay,
  findProp,
  addProp,
  updateProp,
} from './utils.js';

export async function runLevelSix() {
  const plan = levelAmbiencePlan.level6;
  const marketProps = cloneSceneProps(MARKET_SCENE.props);
  applySceneConfig({ ...MARKET_SCENE, props: marketProps });
  ensureAmbience(plan?.review ?? MARKET_SCENE.ambience ?? 'marketBazaar');
  setSceneContext({ level: 'level6', phase: 'arrival' });

  await showLevelTitle('Level 6 -\nDie Stadt\nder Worte');
  await fadeToBase(600);

  await phaseIntroduction(marketProps);
  await phaseMarketWalk(marketProps);
  await phaseEmptyWordMerchant(marketProps);
  await phaseLearnDabar(marketProps);
  await phaseEmissaryTrial(marketProps);

  await fadeToBlack(720);
}

function merchantSay(props, text, options = {}) {
  return propSay(props, 'marketStallEast', text, {
    anchor: 'center',
    offsetY: -44,
    ...options,
  });
}

function scribeSay(props, text, options = {}) {
  return propSay(props, 'marketScribeBooth', text, {
    anchor: 'center',
    offsetY: -48,
    ...options,
  });
}

function emissarySay(props, text, options = {}) {
  return propSay(props, 'marketEmissary', text, {
    anchor: 'center',
    offsetY: -46,
    ...options,
  });
}

async function phaseIntroduction(props) {
  await narratorSay('Die Straßen von Moab sind voller Stimmen. Worte schweben wie Funken in der Luft.');
  await wizardSay('Esel, ich verstehe nicht – wie kann ein Laut etwas bewegen? Es sind doch nur Schwingungen in der Luft.');
  await donkeySay('So ist es. Schwingungen, aber nicht leere. Jede Schwingung trägt Bedeutung – wie Wellen im Wasser.');
  await wizardSay('Und wer hört sie?');
  await donkeySay('Zwei Arten von Wesen: solche aus Fleisch wie wir und solche aus Geist. Beide spüren wahre Worte.');
  await wizardSay('Geistwesen?');
  await donkeySay('Du wirst sie noch treffen. Sie hören nicht mit Ohren, sondern mit dem Herzen.');
  await donkeySay('Erinner dich an קול – die Stimme. Sprich es, und du wirst die Luft hören.');

  let attempts = 0;
  while (true) {
    const attempt = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -60),
      'Sprich קול (qol)',
      anchorX(wizard, 0),
      anchorY(wizard, -34),
    );
    const answer = normalizeHebrewInput(attempt);
    if (spellEquals(answer, 'qol', 'קול')) {
      await narratorSay('Der Marktplatz wird still, als wäre ein Echo entstanden.');
      await narratorSay('Der Lehrling begreift: Die Stimme ist kein Werkzeug – sie wartet darauf, gehört zu werden.');
      return;
    }
    attempts += 1;
    if (attempts === 1) {
      await donkeySay('Lass es aus dem Bauch kommen, nicht nur aus dem Kopf.');
    } else if (attempts === 2) {
      await narratorSay('Flüstern aus der Menge: „Wer ruft?“');
    } else {
      attempts = 0;
      await narratorSay('Rückblende: Die Felsenschlucht antwortete auf קול. Versuch es erneut.');
    }
  }
}

async function phaseMarketWalk(props) {
  setSceneContext({ phase: 'market' });
  await narratorSay('Händler rufen, Kinder laufen, Schriftrollen flattern im Wind. Worte leuchten wie kleine Geister.');
  await wizardSay('Was geschieht hier?');
  await donkeySay('Das ist דָּבָר – die Stadt, in der Worte gehandelt werden.');
  await wizardSay('Gehandelt?');
  await donkeySay('Manche kaufen Lob, andere verkaufen Lüge. Balak sammelt Worte, als wären sie Gold.');
  await wizardSay('Kann man Wahrheit kaufen?');
  await donkeySay('Das wirst du sehen.');
}

async function phaseEmptyWordMerchant(props) {
  setSceneContext({ phase: 'merchant' });
  const stall = findProp(props, 'marketStallEast');
  const target = stall ? stall.x + 32 : wizard.x + 110;
  await waitForWizardToReach(target, { tolerance: 20 });

  await merchantSay(props, 'Dieses Wort bringt Reichtum. Sprich es, und alle werden dir folgen.');
  const attempt = await promptBubble(
    anchorX(wizard, -6),
    anchorY(wizard, -60),
    'Sprich das angebotene Wort (beliebig)',
    anchorX(wizard, 0),
    anchorY(wizard, -34),
  );
  if (attempt?.trim()) {
    await narratorSay('Die Zeichen blitzen hohl auf, zerfallen zu Staub und verlieren jede Form.');
  }
  await donkeySay('Leere Worte klingen schön, aber tragen nichts. Nur wahre Worte bewegen das Herz.');
}

async function phaseLearnDabar(props) {
  setSceneContext({ phase: 'revelation' });
  const booth = findProp(props, 'marketScribeBooth');
  const target = booth ? booth.x + 28 : wizard.x + 160;
  await waitForWizardToReach(target, { tolerance: 18 });

  await scribeSay(props, 'Ich höre, du suchst das Wort hinter allen Worten.');
  await wizardSay('Ich suche zu verstehen, warum sie wirken.');
  await scribeSay(props, 'Dann lerne דָּבָר – dabar. Es bedeutet Wort – und Sache. Alles Gesagte nimmt Gestalt an.');
  await donkeySay('Wenn du dabar sprichst, achte darauf, was du fühlst. Wer das Wort spricht, erschafft die Sache.');

  const spirit = findProp(props, 'marketWordSpirit');
  if (spirit) {
    updateProp(props, 'marketWordSpirit', { visible: true, x: booth.x + 32 });
  }

  let attempts = 0;
  while (true) {
    const attempt = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -60),
      'Sprich דבר (dabar)',
      anchorX(wizard, 0),
      anchorY(wizard, -32),
    );
    const answer = normalizeHebrewInput(attempt);

    if (spellEquals(answer, 'dabar', 'דבר')) {
      await narratorSay('Die Buchstaben fliegen vom Steinbuch, ordnen sich in der Luft und hinterlassen goldenes Licht.');
      await scribeSay(props, 'Nun weißt du: Das Wort ist die Sache. Sprich falsch, und du erschaffst nur Lärm. Sprich wahr, und selbst Stein hört zu.');
      return;
    }

    attempts += 1;
    if (attempts === 1) {
      await donkeySay('Langsam – das ד klingt wie eine Tür, die sich öffnet.');
    } else if (attempts === 2) {
      await narratorSay('Das Buch pulsiert, doch kein Laut antwortet.');
    } else {
      attempts = 0;
      await narratorSay('Meditation: Du siehst ד ב ר vor dir, Atem formt das Wort. Versuche es erneut.');
    }
  }
}

async function phaseEmissaryTrial(props) {
  setSceneContext({ phase: 'apply' });
  const emissary = findProp(props, 'marketEmissary');
  const target = emissary ? emissary.x + 18 : wizard.x + 220;
  await waitForWizardToReach(target, { tolerance: 18 });

  await emissarySay(props, 'Balak wünscht, dass du deine Gabe nutzt – ein Wort genügt, um neue Anhänger zu bringen.');

  let attempts = 0;
  while (true) {
    const attempt = await promptBubble(
      anchorX(wizard, -6),
      anchorY(wizard, -60),
      'Prüfe den Gesandten mit דבר',
      anchorX(wizard, 0),
      anchorY(wizard, -34),
    );
    const answer = normalizeHebrewInput(attempt);

    if (spellEquals(answer, 'dabar', 'דבר')) {
      await narratorSay('Das Wort schlägt gegen die goldene Maske. Risse entstehen, darunter keine Gestalt – nur Leere.');
      await donkeySay('Du hast die Lüge erkannt.');
      return;
    }

    attempts += 1;
    if (attempts === 1) {
      await emissarySay(props, 'Komm, du brauchst dich nicht zu fürchten. Sprich, und die Menge wird dir folgen.');
    } else if (attempts === 2) {
      await narratorSay('Der Markt wird laut, Stimmen schwellen an.');
    } else {
      attempts = 0;
      await narratorSay('Ein inneres Echo erinnert dich: דבר – das Wort, das zur Sache wird. Sammle dich und versuche es erneut.');
    }
  }
}

