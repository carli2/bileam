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

function actorCenterX(actor) {
  const sprite = actor.sprites?.right ?? actor.sprites?.left;
  const width = sprite?.width ?? 32;
  return actor.x + width / 2;
}

function actorTopY(actor) {
  return actor.y ?? 0;
}

function actorBubbleY(actor, offset = -20) {
  return actorTopY(actor) + offset;
}

function actorAnchorX(actor, offset = 0) {
  return () => actorCenterX(actor) + offset;
}

function actorAnchorY(actor, offset = -32) {
  return () => actorBubbleY(actor, offset);
}

startScene(async () => {
  ensureAmbience('hutInteriorDark');
  setSceneContext({ level: 'level1', phase: 'introduction' });
  await fadeToBase(1500);
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
    () => (actorCenterX(wizard) + actorCenterX(donkey)) / 2,
    () => Math.min(actorTopY(wizard), actorTopY(donkey)) - 70,
    text,
  );
}

function wizardSay(text) {
  return say(
    () => actorCenterX(wizard),
    () => actorBubbleY(wizard, -46),
    text,
  );
}

function donkeySay(text) {
  return say(
    () => actorCenterX(donkey),
    () => actorBubbleY(donkey, -40),
    text,
  );
}

async function levelOneIntroduction() {
  await narratorSay('Es ist dunkel in dieser Huette.');
  await wizardSay('Wo bin ich? ... Ich sehe nichts.');
  await donkeySay('Ich auch nicht, Meister. Vielleicht fehlt uns das richtige Wort.');
  await wizardSay('Ein Wort?');
  await donkeySay('Ja. Worte sind wie Schluessel. Versuch es mit dem Wort אור (AOR). Es bedeutet Licht.');
  await narratorSay('Tipp: Sprich das Wort nach.');
}

async function levelOneLearning(plan) {
  setSceneContext({ phase: 'learning' });

  let attemptsSinceRecap = 0;
  let illuminated = getCurrentAmbienceKey() === (plan?.illumination ?? 'hutInteriorLit');

  while (true) {
    const input = await promptBubble(
      actorAnchorX(wizard, -18),
      actorAnchorY(wizard, -56),
      'Sprich das Wort אור (aor)',
      actorAnchorX(wizard, -12),
      actorAnchorY(wizard, -28)
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
      await narratorSay('Das Wort verhallt, aber kein Licht kommt. Versuche, dich zu erinnern.');
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
      actorAnchorX(wizard, -16),
      actorAnchorY(wizard, -56),
      'Tippe ueben oder erklaerung',
      actorAnchorX(wizard, -10),
      actorAnchorY(wizard, -30),
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
  await narratorSay('Das Licht bleibt als Spur in der Luft – die Huette erinnert sich an אור.');
  await narratorSay('Die Rune oeffnet sich, ohne dass du das Wort wiederholen musst.');
  await narratorSay('Du spuerst, wie der Morgen hereinsickert.');
  await donkeySay('Da draussen wartet der Tag.');
  await transitionAmbience(plan?.door ?? 'exteriorDay', { fade: { toBlack: 160, toBase: 420 } });
  await narratorSay('Ein warmer Morgen wartet vor der Tuer.');
  setSceneContext({ phase: 'exit' });
  await fadeToBlack(800);
}
