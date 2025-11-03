import {
  promptBubble,
  ensureAmbience,
  transitionAmbience,
  setSceneContext,
  levelAmbiencePlan,
  getCurrentAmbienceKey,
  fadeToBlack,
  fadeToBase,
  showLevelTitle,
} from '../scene.js';
import { transliterateToHebrew } from '../game.helpers.js';
import { narratorSay, wizardSay, donkeySay, anchorX, anchorY, wizard, donkey, isSkipRequested } from './utils.js';

const WORD_AOR = transliterateToHebrew('aor');

export async function runLevelOne() {
  const plan = levelAmbiencePlan.level1;

  while (true) {
    ensureAmbience(plan?.introduction ?? 'hutInteriorDark');
    setSceneContext({ level: 'level1', phase: 'introduction' });
    showLevelTitle('Level 1 - Das Licht');

    if (isSkipRequested()) return 'skip';
    const intro = await levelOneIntroduction();
    if (intro === 'skip' || isSkipRequested()) return 'skip';

    const learnResult = await levelOneLearning(plan);
    if (learnResult === 'skip' || isSkipRequested()) return 'skip';
    if (learnResult === 'restart') {
      continue;
    }

    const door = await levelOneDoorSequence(plan);
    if (door === 'skip' || isSkipRequested()) return 'skip';
    return;
  }
}

async function levelOneIntroduction() {
  if (isSkipRequested()) return 'skip';
  await narratorSay('Es ist dunkel in dieser Huette.');
  if (isSkipRequested()) return 'skip';
  await wizardSay('Wo bin ich? ... Ich sehe nichts.');
  if (isSkipRequested()) return 'skip';
  await donkeySay('Ich auch nicht, Meister. Vielleicht fehlt uns das richtige Wort.');
  if (isSkipRequested()) return 'skip';
  await wizardSay('Ein Wort?');
  if (isSkipRequested()) return 'skip';
  await donkeySay('Ja. Worte sind wie Schluessel. Versuch es mit dem Wort אור (AOR). Das Alef am Anfang ist still, das O schwingst du lang. Es bedeutet Licht.');
  if (isSkipRequested()) return 'skip';
  await narratorSay('Tipp: Sprich das Wort nach.');
  if (isSkipRequested()) return 'skip';
}

async function levelOneLearning(plan) {
  setSceneContext({ phase: 'learning' });

  let attemptsSinceRecap = 0;
  let illuminated = getCurrentAmbienceKey() === (plan?.illumination ?? 'hutInteriorLit');

  while (true) {
    if (isSkipRequested()) return 'skip';
    const input = await promptBubble(
      anchorX(wizard, -18),
      anchorY(wizard, -56),
      'Sprich das Wort אור (aor)',
      anchorX(wizard, -12),
      anchorY(wizard, -28)
    );

    if (input === 'skip') return 'skip';

    const answer = normalizeHebrewInput(input);
    if (answer === WORD_AOR) {
      if (!illuminated) {
        setSceneContext({ phase: 'illumination' });
        await transitionAmbience(plan?.illumination ?? 'hutInteriorLit', {
          fade: { toBlack: 180, toBase: 680 },
        });
        illuminated = true;
      }
      await narratorSay('Staub faengt an zu glimmen und die Oellampe flammt auf.');
      await donkeySay('Oho! Das war hell!');
      await wizardSay('Das Wort fuehlt sich warm an... wie eine Flamme in der Hand.');
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
      await narratorSay('Wir fangen noch einmal an. Atme tief durch.');
      await levelOneRecap();
      return 'restart';
    }
  }
}

async function levelOneRecap() {
  if (isSkipRequested()) return;
  setSceneContext({ phase: 'introduction' });
  await donkeySay('AO R bedeutet Licht. Stell es dir wie eine kleine Sonne in der Hand vor.');
  await wizardSay('Ich spreche es diesmal lauter.');
  setSceneContext({ phase: 'learning' });
}

async function levelOneDoorSequence(plan) {
  if (isSkipRequested()) return 'skip';
  setSceneContext({ phase: 'apply' });
  await narratorSay('Vor der Tuer erscheint eine leuchtende Rune. Sie wartet auf das Wort.');
  await narratorSay('Das Licht bleibt als Spur in der Luft – die Huette erinnert sich an אור.');
  await fadeToBlack(320);
  if (isSkipRequested()) return 'skip';
  ensureAmbience(plan?.door ?? 'exteriorDay');
  setSceneContext({ phase: 'exit' });
  await fadeToBase(600);
  if (isSkipRequested()) return 'skip';
  await narratorSay('Die Rune oeffnet sich, ohne dass du das Wort wiederholen musst.');
  await narratorSay('Du spuerst, wie der Morgen hereinsickert.');
  await donkeySay('Da draussen wartet der Tag.');
  await narratorSay('Ein warmer Morgen wartet vor der Tuer.');
  await fadeToBlack(600);
  if (isSkipRequested()) return 'skip';
}

function normalizeHebrewInput(value) {
  if (!value) return '';
  return value.replace(/\s+/g, '');
}
