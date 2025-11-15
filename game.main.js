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
  SkipSignal,
  LevelRetrySignal,
  clearSkipState,
  setLifeBars,
} from './scene.js';
import { runLevelOne } from './levels/level1.js';
import { runLevelTwo } from './levels/level2.js';
import { runLevelThree } from './levels/level3.js';
import { runLevelFour } from './levels/level4.js';
import { runLevelFive } from './levels/level5.js';
import { runLevelFiveFive } from './levels/level5_5.js';
import { runLevelSix } from './levels/level6.js';
import { runLevelSeven } from './levels/level7.js';
import { runLevelEight } from './levels/level8.js';
import { runLevelNine } from './levels/level9.js';
import { runLevelTen } from './levels/level10.js';
import { runLevelTenFive } from './levels/level10_5.js';

const LEVELS = [
  { id: 'level1', run: runLevelOne },
  { id: 'level2', run: runLevelTwo },
  { id: 'level3', run: runLevelThree },
  { id: 'level4', run: runLevelFour },
  { id: 'level5', run: runLevelFive },
  { id: 'level5_5', run: runLevelFiveFive },
  { id: 'level6', run: runLevelSix },
  { id: 'level7', run: runLevelSeven },
  { id: 'level8', run: runLevelEight },
  { id: 'level9', run: runLevelNine },
  { id: 'level10', run: runLevelTen },
  { id: 'level10_5', run: runLevelTenFive },
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
  clearSkipState();
  setLifeBars(null);
  await fadeToBase(1500);
  const progress = loadProgress();
  let endingState = 'completed';

  for (let index = 0; index < LEVELS.length; index++) {
    const entry = LEVELS[index];
    let levelStatus;
    do {
      levelStatus = await runLevel(entry, index, progress);
      if (levelStatus === 'restart') {
        continue;
      }
      if (levelStatus === 'skipNext') {
        if (index === LEVELS.length - 1) {
          endingState = 'skip';
        }
        break;
      }
      if (levelStatus === 'completed') {
        endingState = 'completed';
        if (progress.highestLevel < index) {
          progress.highestLevel = index;
          progress.known = true;
          saveProgress(progress);
        }
      }
    } while (levelStatus === 'restart');

    if (levelStatus === 'skipNext' && endingState === 'skip') {
      break;
    }
  }

  await showEndingScreen(endingState);
}

async function runLevel(entry, index, progress) {
  const canSkip = (progress.highestLevel ?? -1) >= index;
  let resolvedReason = null;

  setSkipHandler(reason => {
    const decision = reason ?? (canSkip ? 'skip' : 'restart');
    resolvedReason = decision;
    return decision;
  });

  try {
    await entry.run();
    clearSkipState();
    return 'completed';
  } catch (error) {
    if (error instanceof LevelRetrySignal) {
      clearSkipState();
      setSceneProps([]);
      return 'restart';
    }
    if (error instanceof SkipSignal) {
      const reason = error.reason ?? resolvedReason ?? (canSkip ? 'skip' : 'restart');
      clearSkipState();
      setSceneProps([]);
      ensureAmbience('exteriorDay');
      return reason === 'restart' ? 'restart' : 'skipNext';
    }
    throw error;
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

  try {
    await Promise.all([
      showLevelTitle(title, 5000),
      say(() => wizard.x, () => wizard.y - 52, message),
    ]);
  } catch (error) {
    if (error instanceof SkipSignal) {
      return;
    }
    throw error;
  }
}

export function beginGame() {
  startScene(mainFlow);
}
