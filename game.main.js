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
import { runLevelFour } from './levels/level4.js';

startScene(mainFlow);

const LEVELS = [
  { id: 'level1', run: runLevelOne },
  { id: 'level2', run: runLevelTwo },
  { id: 'level3', run: runLevelThree },
  { id: 'level4', run: runLevelFour },
];

const STORAGE_KEY = 'bileamProgress';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { known: false, highestLevel: -1 };
    }
    const parsed = JSON.parse(raw);
    return {
      known: Boolean(parsed?.known),
      highestLevel: Number.isInteger(parsed?.highestLevel) ? parsed.highestLevel : -1,
    };
  } catch (error) {
    console.warn('Failed to load progress', error);
    return { known: false, highestLevel: -1 };
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn('Failed to save progress', error);
  }
}

async function mainFlow() {
  await fadeToBase(1500);
  const progress = loadProgress();
  let endingState = 'completed';

  for (let index = 0; index < LEVELS.length; index++) {
    const entry = LEVELS[index];
    const result = await runLevel(entry, index, progress);
    if (result === 'skip') {
      if (index === LEVELS.length - 1) {
        endingState = 'skip';
        break;
      }
      continue;
    }
    endingState = result;
    if (endingState === 'completed' && progress.highestLevel < index) {
      progress.highestLevel = index;
      progress.known = true;
      saveProgress(progress);
    }
  }

  await showEndingScreen(endingState);
}

async function runLevel(entry, index, progress) {
  let resolveSkip;
  const skipPromise = new Promise(resolve => {
    resolveSkip = resolve;
  });

  const canSkip = (progress.highestLevel ?? -1) >= index;
  setSkipHandler(() => {
    if (canSkip) {
      resolveSkip('skip');
    } else {
      showLevelTitle('Noch nicht freigeschaltet', 1800);
    }
  });

  try {
    const result = await Promise.race([entry.run(), skipPromise]);
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
    : 'Alle Missionen gemeistert. Danke fuers Spielen!';

  const [titleResult, speechResult] = await Promise.all([
    showLevelTitle(title, 5000),
    say(() => wizard.x, () => wizard.y - 52, message),
  ]);
  if (titleResult === 'skip' || speechResult === 'skip') return;
}
