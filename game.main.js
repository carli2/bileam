import {
  startScene,
  say,
  promptBubble,
  ensureAmbience,
  transitionAmbience,
  setSceneContext,
  fadeToBase,
  fadeToBlack,
  levelAmbiencePlan,
  getCurrentAmbienceKey,
  wizard,
  donkey,
} from './scene.js';

startScene(async () => {
  ensureAmbience('hutInteriorDark');
  setSceneContext({ level: 'level1', phase: 'introduction' });
  await fadeToBase(1500);
  await say(() => wizard.x - 16, () => wizard.y - 34, 'Es ist finster in dieser Huette');
  await runLevelOne();
});

async function runLevelOne() {
  const plan = levelAmbiencePlan.level1;
  ensureAmbience(plan?.introduction ?? 'hutInteriorDark');
  setSceneContext({ level: 'level1', phase: 'introduction' });

  await levelOneIntroduction();
  await levelOneLearning(plan);
  await levelOneDoorSequence(plan);
}

function narratorSay(text) {
  return say(
    () => (wizard.x + donkey.x) / 2,
    () => Math.min(wizard.y, donkey.y) - 72,
    text,
  );
}

function wizardSay(text) {
  return say(() => wizard.x - 16, () => wizard.y - 48, text);
}

function donkeySay(text) {
  return say(() => donkey.x - 20, () => donkey.y - 40, text);
}

async function levelOneIntroduction() {
  await narratorSay('Es ist dunkel in dieser Huette.');
  await wizardSay('Wo bin ich? ... Ich sehe nichts.');
  await donkeySay('Ich auch nicht, Meister. Vielleicht fehlt uns das richtige Wort.');
  await wizardSay('Ein Wort?');
  await donkeySay('Ja. Worte sind wie Schluessel. Versuch es mit dem Wort AO R. Es bedeutet Licht.');
  await narratorSay('Tipp: Sprich das Wort nach.');
}

async function levelOneLearning(plan) {
  setSceneContext({ phase: 'learning' });

  let attemptsSinceRecap = 0;
  let illuminated = getCurrentAmbienceKey() === (plan?.illumination ?? 'hutInteriorLit');

  while (true) {
    const input = await promptBubble(
      () => wizard.x - 30,
      () => wizard.y - 55,
      'Sprich das Wort אור (aor)',
      () => wizard.x - 20,
      () => wizard.y - 20
    );

    const trimmed = input.trim().toLowerCase();
    if (trimmed === 'aor') {
      if (!illuminated) {
        setSceneContext({ phase: 'illumination' });
        await transitionAmbience(plan?.illumination ?? 'hutInteriorLit', {
          fade: { toBlack: 180, toBase: 680 },
        });
        illuminated = true;
      await narratorSay('Staub faengt an zu glimmen und die Oellampe flammt auf.');
      await donkeySay('Oho! Das war hell!');
      await wizardSay('Das Wort fuehlt sich warm an... wie eine Flamme in der Hand.');
    }
    await wizardSay('אור (aor)');
    setSceneContext({ phase: 'exploration' });
    break;
  }

    attemptsSinceRecap++;
    if (attemptsSinceRecap === 1) {
      await donkeySay('Fast! Versuch, es laenger zu ziehen: A... O... R.');
    } else if (attemptsSinceRecap === 2) {
      await narratorSay('Das Wort verhallt, aber kein Licht kommt. Erinner dich an die Reihenfolge.');
      await narratorSay('A  O  R');
    } else {
      attemptsSinceRecap = 0;
      const choice = await levelOneRemediationChoice();
      if (choice === 'explain') {
        await levelOneRecap();
      } else {
        await narratorSay('Gut, dann versuchen wir es noch einmal.');
      }
    }
  }
}

async function levelOneRecap() {
  setSceneContext({ phase: 'introduction' });
  await donkeySay('AO R bedeutet Licht. Stell es dir wie eine kleine Sonne in der Hand vor.');
  await wizardSay('Ich spreche es diesmal lauter.');
  setSceneContext({ phase: 'learning' });
}

async function levelOneRemediationChoice() {
      await narratorSay('Noch einmal ueben oder zurueck zur Erklaerung?');
  while (true) {
    const choice = (await promptBubble(
      () => wizard.x - 26,
      () => wizard.y - 55,
      'Tippe ueben oder erklaerung',
      () => wizard.x - 18,
      () => wizard.y - 18,
    )).trim().toLowerCase();
    if (choice === 'ueben' || choice === 'uebung' || choice === 'nochmal') {
      return 'practice';
    }
    if (choice === 'erklaerung' || choice === 'zurueck') {
      return 'explain';
    }
    await narratorSay('Ich habe das nicht verstanden. Tippe ueben oder erklaerung.');
  }
}

async function levelOneDoorSequence(plan) {
  setSceneContext({ phase: 'apply' });
  await narratorSay('Vor der Tuer erscheint eine leuchtende Rune. Sie wartet auf das Wort.');
  await narratorSay('Beruehre die Tuer und sprich noch einmal das Wort, um hinauszugehen.');

  let doorOpened = false;
  while (!doorOpened) {
    const answer = (await promptBubble(
      () => wizard.x + 42,
      () => wizard.y - 52,
      'Sprich erneut אור (aor), um die Tuer zu oeffnen',
      () => wizard.x + 22,
      () => wizard.y - 18,
    )).trim().toLowerCase();

    if (answer === 'aor') {
      doorOpened = true;
      await narratorSay('Die Rune glueht auf, die Huette fuellt sich mit Morgenlicht.');
      await donkeySay('Da draussen wartet der Tag.');
      await transitionAmbience(plan?.door ?? 'exteriorDay', { fade: { toBlack: 160, toBase: 420 } });
      setSceneContext({ phase: 'exit' });
      await fadeToBlack(800);
    } else {
      await narratorSay('Die Tuer bleibt verschlossen. Sprich das Wort klar und vollstaendig.');
    }
  }
}
