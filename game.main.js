import { startScene, fadeToBase, setSkipHandler, clearSkipHandler, ensureAmbience } from './scene.js';
import { runLevelOne } from './levels/level1.js';
import { runLevelTwo } from './levels/level2.js';

startScene(mainFlow);

async function mainFlow() {
  await fadeToBase(1500);
  await runLevel(runLevelOne);
  await runLevel(runLevelTwo);
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
      return;
    }
  } finally {
    clearSkipHandler();
  }
}
