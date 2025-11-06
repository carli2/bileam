import {
  promptBubble,
  ensureAmbience,
  transitionAmbience,
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
  donkey,
  normalizeHebrewInput,
  applySceneConfig,
  CANYON_SCENE,
  cloneSceneProps,
  spellEquals,
  findProp,
  updateProp,
  addProp,
  celebrateGlyph,
  divineSay,
} from './utils.js';

export async function runLevelThree() {
  const plan = levelAmbiencePlan.level3;
  const canyonProps = cloneSceneProps(CANYON_SCENE.props);
  applySceneConfig({ ...CANYON_SCENE, props: canyonProps });
  ensureAmbience(plan?.review ?? CANYON_SCENE.ambience ?? 'echoChamber');
  setSceneContext({ level: 'level3', phase: 'review' });
  await showLevelTitle('Level 3 -\nDie Stimme aus\ndem Stein');
  await fadeToBase(600);

  await phasePreparation();
  await phaseStoneArch(canyonProps, plan);
  await phaseDryFountain(canyonProps, plan);
  await phaseRevelation(canyonProps);
  await phaseResonanceWalk(plan, canyonProps);

  await fadeToBlack(720);
}

async function phasePreparation() {
  await narratorSay('Die Schlucht flüstert – doch kein Wort ist zu verstehen.');
  await wizardSay('Ich spüre, dass hier ein Zauber aus Stein ruht.');
  await donkeySay('Dann findest du ihn wohl nur, wenn du zuhörst, was der Fels verlangt.');
  await wizardSay('Aber ich kenne das Wort noch nicht.');
  await donkeySay('Nutze, was du gelernt hast. Manchmal braucht der Stein Licht – manchmal Wasser.');
}

async function phaseStoneArch(canyonProps, plan) {
  setSceneContext({ phase: 'puzzle-light' });

  const archProp = findProp(canyonProps, 'canyonArch');
  const archTarget = archProp ? archProp.x + 36 : wizard.x + 140;
  await donkeySay('Der Steinbogen dort vorne pulsiert. Geh hin und hör hin.');
  await waitForWizardToReach(archTarget, { tolerance: 16 });
  await narratorSay('Ein Onyxauge sitzt im Bogen – es atmet schwach und wartet auf Licht.');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -8),
      anchorY(wizard, -60),
      'Sprich אור (OR)',
      anchorX(wizard, -2),
      anchorY(wizard, -34),
    );
    const answer = normalizeHebrewInput(answerInput);

    if (spellEquals(answer, 'or', 'אור')) {
      updateProp(canyonProps, 'canyonArch', null);
      await celebrateGlyph(answer);
      await narratorSay('Der Onyx beginnt zu glühen. Der Bogen spaltet sich lautlos, Lichtadern ziehen durch den Stein.');
      setSceneContext({ phase: 'puzzle-water' });
      return;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Hm... der Stein reagiert nicht. Vielleicht fehlt ihm der Schein.');
    } else if (attempts === 2) {
      await narratorSay('Ein dumpfer Schlag hallt, Staub faellt von der Decke.');
    } else {
      attempts = 0;
      await fadeToBlack(220);
      ensureAmbience(plan?.review ?? CANYON_SCENE.ambience ?? 'echoChamber');
      await fadeToBase(420);
      await narratorSay('Erinnerung: In der Hütte entzündest du Licht mit אור.');
    }
  }
}

async function phaseDryFountain(canyonProps, plan) {
  const fountainProp = findProp(canyonProps, 'canyonFountain');
  const fountainTarget = fountainProp ? fountainProp.x + 24 : wizard.x + 160;
  await donkeySay('Weiter vorn ist ein trockenes Becken. Lass uns nachsehen.');
  await waitForWizardToReach(fountainTarget, { tolerance: 14 });
  await narratorSay('Hinter dem Bogen wartet ein Brunnenbecken aus Stein – ausgetrocknet. In die Kante ist eingeritzt: "Durst löscht, wer das Fließen ruft."');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -4),
      anchorY(wizard, -62),
      'Sprich מים (mayim)',
      anchorX(wizard, 2),
      anchorY(wizard, -36),
    );
    const answer = normalizeHebrewInput(answerInput);

    if (spellEquals(answer, 'mayim', 'majim', 'mjm', 'מים')) {
      updateProp(canyonProps, 'canyonFountain', { type: 'fountainFilled' });
      await celebrateGlyph(answer);
      await narratorSay('Ein Rauschen beginnt, das Becken füllt sich. Das Wasser spiegelt kurz ein Ohr aus Licht.');
      return;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Der Stein bleibt still. Vielleicht braucht er mehr Bewegung?');
    } else if (attempts === 2) {
      await narratorSay('Ein Rinnsal läuft kurz, versiegt wieder.');
    } else {
      attempts = 0;
      await fadeToBlack(180);
      ensureAmbience(plan?.learn ?? 'echoChamber');
      await fadeToBase(320);
      await donkeySay('Erinnere dich an den Fluss: MAYIM – das Wasserwort.');
    }
  }
}

async function phaseRevelation(canyonProps) {
  setSceneContext({ phase: 'revelation' });
  addProp(canyonProps, { id: 'canyonMonolith', type: 'monolithDormant', x: 548 });

  await donkeySay('Da ist er, Meister – der Stein, der spricht.');
  await wizardSay('Er... spricht wirklich?');
  await donkeySay('Nicht mit Worten wie wir. Er spricht mit Klang. Du wirst es hören, wenn du das neue Wort lernst.');

  await Promise.all([
    showLevelTitle('קול (qol)', 3200),
    narratorSay('Eine Schriftlinie erscheint auf dem Stein: קול – Stimme.'),
  ]);

  await donkeySay('ק – das tiefe Grollen in der Erde, ו – das Rollen des Atems, ל – das sanfte Nachklingen. Sprich es, und die Steine antworten.');

  let attempts = 0;
  while (true) {
    const answerInput = await promptBubble(
      anchorX(wizard, -10),
      anchorY(wizard, -64),
      'Sprich קול (qol)',
      anchorX(wizard, -4),
      anchorY(wizard, -38),
    );
    const answer = normalizeHebrewInput(answerInput);

    if (spellEquals(answer, 'qol', 'קול')) {
      updateProp(canyonProps, 'canyonMonolith', { type: 'monolithAwakened' });
      addProp(canyonProps, { id: 'canyonGlyph', type: 'soundGlyph', x: 596, y: 38, parallax: 0.8 });
      await celebrateGlyph(answer);
      await narratorSay('Der Stein singt zurück – ein klarer Ton rollt durch die Schlucht, Staub und Licht steigen auf.');
      await divineSay('Vor meiner Stimme erzittern die Völker.\nבקולי ירעדו גוים');
      return;
    }

    attempts++;
    if (attempts === 1) {
      await donkeySay('Versuch, den Laut aus dem Bauch zu holen. Nicht flüstern – sprechen.');
    } else if (attempts === 2) {
      await narratorSay('Der Fels bleibt stumm. Die Schrift verblasst und wartet.');
    } else {
      attempts = 0;
      await narratorSay('Meditation: Du siehst die Buchstaben, hörst die Laute – קול. Atme und versuche es erneut.');
    }
  }
}

async function phaseResonanceWalk(plan, canyonProps) {
  setSceneContext({ phase: 'apply' });
  addProp(canyonProps, { id: 'canyonPathLight', type: 'soundGlyph', x: wizard.x + 90, y: wizard.y - 12, parallax: 0.7 });
  const echoMarker = wizard.x + 120;
  await showLevelTitle('Folge dem Echo\nund sprich קול');
  await donkeySay('Hör auf das Echo, Meister.');
  await waitForWizardToReach(echoMarker, { tolerance: 14 });
  const echoSequences = [
    {
      prompt: 'Ein Echo rollt von den Wänden. Sprich קול, um den Pfad zu stärken.',
      success: 'Der Klang stabilisiert den Weg unter deinen Füßen.',
    },
    {
      prompt: 'Ein zweites Echo antwortet tiefer aus dem Stein. Sprich קול erneut.',
      success: 'Die Schlucht trägt deine Stimme weiter. Der Pfad bleibt offen.',
    },
  ];

  for (const sequence of echoSequences) {
    await narratorSay(sequence.prompt);

    let correct = false;
    let attempts = 0;
    while (!correct) {
      const answerInput = await promptBubble(
        anchorX(wizard, 2),
        anchorY(wizard, -60),
        'Antwort auf das Echo',
        anchorX(wizard, 6),
        anchorY(wizard, -32),
      );
      const answer = normalizeHebrewInput(answerInput);
      if (spellEquals(answer, 'qol', 'קול')) {
        correct = true;
        await celebrateGlyph(answer);
        await narratorSay(sequence.success);
      } else {
        attempts++;
        if (attempts === 1) {
          await donkeySay('Lass das Wort weiter klingen: QO-L.');
        } else {
          await narratorSay('Das Echo wartet noch einmal.');
        }
      }
    }
  }

  await donkeySay('Gut, Meister. Nun kannst du mit den Steinen sprechen.');
  await wizardSay('Oder sie mit mir.');
  await narratorSay('So verliess der Lehrling die Schlucht – mit einer Stimme, die Berge bewegen konnte.');
  await transitionAmbience(plan?.apply ?? plan?.learn ?? 'echoChamber', { fade: { toBlack: 180, toBase: 420 } });
}
