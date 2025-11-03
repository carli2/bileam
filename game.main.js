import {
  startScene,
  fadeToBase,
  fadeToBlack,
  setSkipHandler,
  clearSkipHandler,
  ensureAmbience,
  setSceneContext,
  setSceneProps,
  showLevelTitle,
  wizard,
  donkey,
  say,
} from './scene.js';
import { runLevelOne } from './levels/level1.js';
import { runLevelTwo } from './levels/level2.js';
import { runLevelThree } from './levels/level3.js';

startScene(mainFlow);

const LEVELS = [
  { id: 'level1', run: runLevelOne },
  { id: 'level2', run: runLevelTwo },
  { id: 'level3', run: runLevelThree },
];

async function mainFlow() {
  await fadeToBase(1500);
  let endingState = 'completed';

  for (let index = 0; index < LEVELS.length; index++) {
    const { run } = LEVELS[index];
    const result = await runLevel(run);
    if (result === 'skip') {
      if (index === LEVELS.length - 1) {
        endingState = 'skip';
        break;
      }
      continue;
    }
    endingState = result;
  }

  await showEndingScreen(endingState);
}

async function runLevel(fn) {
  let resolveSkip;
  const skipPromise = new Promise(resolve => {
    resolveSkip = resolve;
  });

  setSkipHandler(() => resolveSkip('skip'));

  try {
    const result = await Promise.race([fn(), skipPromise]);
    if (result === 'skip') {
      ensureAmbience('exteriorDay');
      await fadeToBase(0);
      return 'skip';
    }
    return 'completed';
  } finally {
    clearSkipHandler();
  }
}

async function showEndingScreen(state) {
  clearSkipHandler();
  await fadeToBlack(420);
  setSceneProps([]);
  const ambienceKey = state === 'skip' ? 'exteriorDay' : 'sanctumFinale';
  ensureAmbience(ambienceKey);
  setSceneContext({ level: 'ending', phase: state });

  wizard.vx = 0;
  wizard.vy = 0;
  wizard.onGround = true;
  wizard.x = 148;
  donkey.x = wizard.x + 34;

  await fadeToBase(900);

  const title = state === 'skip' ? 'Reise unterbrochen' : 'Reise gemeistert';
  const message = state === 'skip'
    ? 'Du legst den Stab fuer heute beiseite. Danke, dass du mit Bileam gereist bist.'
    : 'Alle Missionen gemeistert – Worte leuchten weiter. Danke fuers Spielen!';

  const [titleResult, speechResult] = await Promise.all([
    showLevelTitle(title, 5000),
    say(() => wizard.x, () => wizard.y - 52, message),
  ]);
  if (titleResult === 'skip' || speechResult === 'skip') return;
}
