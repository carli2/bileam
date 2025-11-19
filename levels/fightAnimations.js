import {
  addProp,
  updateProp,
  sleep,
  wizard,
  findProp,
} from './utils.js';
import { getScenePropBounds } from '../scene.js';

let effectCounter = 0;
const makeEffectId = prefix => {
  effectCounter = (effectCounter + 1) % 100000;
  return `fx_${prefix}_${Date.now()}_${effectCounter}`;
};

function normalizePosition(pos) {
  if (!pos) {
    return {
      x: wizard.x + 100,
      top: wizard.y,
      bottom: wizard.y + 80,
    };
  }
  const top = Number.isFinite(pos.top) ? pos.top : (pos.bottom != null && Number.isFinite(pos.bottom) && Number.isFinite(pos.height)
    ? pos.bottom - pos.height
    : (pos.y ?? wizard.y));
  const bottom = Number.isFinite(pos.bottom) ? pos.bottom : top + (pos.height ?? 72);
  const x = Number.isFinite(pos.x)
    ? pos.x
    : Number.isFinite(pos.left) && Number.isFinite(pos.width)
      ? pos.left + pos.width / 2
      : wizard.x + 100;
  return {
    x,
    top,
    bottom,
    height: bottom - top,
  };
}

const STATE_EFFECTS = {
  start: dustPulse,
  obedienceEcho: echoLoop,
  obedienceBind: echoLoop,
  listening: echoLoop,
  negation: sandShield,
  burning: flameHalo,
  radiant: lightShard,
  flooded: waveRush,
  steamChamber: steamBurst,
  echoing: stalactiteCrash,
  resonantTrap: stalactiteCrash,
  spoken: glyphChant,
  truth: truthGleam,
  truthPrism: prismBurst,
  radiantPrism: prismBurst,
  angelic: angelStrike,
  angelicChorus: angelStrike,
  blessing: blessingGlow,
  blessingOrbit: blessingGlow,
  overgrown: vineBurst,
};

export function createStateAnimationHandler({ propsRef, getTargetPosition }) {
  return async payload => {
    if (!payload || !payload.state) return;
    const effect = STATE_EFFECTS[payload.state];
    if (!effect) return;
    const props = propsRef?.current;
    if (!Array.isArray(props) || typeof getTargetPosition !== 'function') return;
    const actorSide = payload.actor ?? 'player';
    const targetSide = actorSide === 'player' ? 'enemy' : 'player';
    const actorPos = normalizePosition(getTargetPosition(actorSide));
    const targetPos = normalizePosition(getTargetPosition(targetSide));
    await effect({
      props,
      actorSide,
      targetSide,
      actorPos,
      targetPos,
      reason: payload.reason ?? 'transition',
    });
  };
}

export function createTargetResolver({ enemyId, propsRef, fallbackX = wizard.x + 160 }) {
  const resolvePlayer = () => {
    const sprite = wizard.sprites?.right ?? wizard.sprites?.left;
    const width = sprite?.width ?? 32;
    const height = sprite?.height ?? 64;
    return {
      x: wizard.x + width / 2,
      top: wizard.y,
      bottom: wizard.y + height,
    };
  };

  const resolveEnemy = () => {
    const bounds = getScenePropBounds(enemyId);
    if (bounds) {
      return {
        x: bounds.left + bounds.width / 2,
        top: bounds.top,
        bottom: bounds.bottom,
      };
    }
    const props = propsRef?.current ?? [];
    const prop = findProp(props, enemyId);
    if (prop) {
      const width = prop.sprite?.width ?? prop.width ?? 120;
      const height = prop.sprite?.height ?? prop.height ?? 140;
      const x = (prop.x ?? fallbackX) + width / 2;
      const top = prop.y ?? wizard.y;
      return {
        x,
        top,
        bottom: top + height,
      };
    }
    return {
      x: fallbackX,
      top: wizard.y,
      bottom: wizard.y + 100,
    };
  };

  return side => (side === 'player' ? resolvePlayer() : resolveEnemy());
}

async function dustPulse({ props, actorPos }) {
  if (!actorPos) return;
  const id = makeEffectId('dust');
  addProp(props, {
    id,
    type: 'canyonMist',
    x: Math.round(actorPos.x - 60),
    align: 'ground',
    offsetY: -56,
    parallax: 0.58,
    layer: -1,
  });
  await sleep(220);
  updateProp(props, id, null);
}

async function echoLoop({ props, targetPos }) {
  if (!targetPos) return;
  const id = makeEffectId('echo');
  const baseX = Math.round(targetPos.x - 40);
  const baseY = Math.round(targetPos.bottom - 72);
  addProp(props, {
    id,
    type: 'resonanceRingActive',
    x: baseX,
    y: baseY,
    parallax: 1.02,
    layer: 1,
  });
  for (let step = 0; step < 4; step += 1) {
    await sleep(70);
    updateProp(props, id, { y: baseY - step * 4 });
  }
  await sleep(90);
  updateProp(props, id, null);
}

async function sandShield({ props, targetPos }) {
  if (!targetPos) return;
  const id = makeEffectId('sand');
  const baseX = Math.round(targetPos.x - 48);
  const baseY = Math.round(targetPos.bottom - 66);
  addProp(props, {
    id,
    type: 'sandVisionRingActive',
    x: baseX,
    y: baseY,
    parallax: 1,
    layer: 1,
  });
  for (let step = 0; step < 3; step += 1) {
    await sleep(80);
    updateProp(props, id, { x: baseX + (step % 2 === 0 ? 4 : -4) });
  }
  await sleep(100);
  updateProp(props, id, null);
}

async function waveRush({ props, actorPos, targetPos }) {
  const from = actorPos ?? targetPos;
  const to = targetPos ?? actorPos;
  if (!from || !to) return;
  const id = makeEffectId('wave');
  addProp(props, {
    id,
    type: 'riverWave',
    x: Math.round(from.x - 32),
    align: 'ground',
    parallax: 0.96,
    layer: -1,
  });
  const steps = 8;
  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    const x = from.x + (to.x - from.x) * progress;
    updateProp(props, id, { x: Math.round(x - 32) });
    await sleep(36);
  }
  await sleep(70);
  updateProp(props, id, null);
}

async function steamBurst({ props, targetPos }) {
  if (!targetPos) return;
  const id = makeEffectId('steam');
  const baseX = Math.round(targetPos.x - 60);
  addProp(props, {
    id,
    type: 'canyonMist',
    x: baseX,
    align: 'ground',
    offsetY: -62,
    parallax: 0.62,
    layer: 0,
  });
  for (let step = 0; step < 4; step += 1) {
    await sleep(60);
    updateProp(props, id, { x: baseX + step * 8 });
  }
  await sleep(120);
  updateProp(props, id, null);
}

async function stalactiteCrash({ props, targetPos }) {
  if (!targetPos) return;
  const id = makeEffectId('stal');
  const startY = -120;
  const endY = Math.round(targetPos.top + 18);
  addProp(props, {
    id,
    type: 'stalactite',
    x: Math.round(targetPos.x - 8),
    align: 'top',
    y: startY,
    parallax: 0.32,
    layer: 1,
  });
  const steps = 6;
  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    const y = startY + (endY - startY) * progress;
    updateProp(props, id, { y: Math.round(y) });
    await sleep(48);
  }
  await sleep(80);
  updateProp(props, id, null);
}

async function glyphChant({ props, actorPos }) {
  if (!actorPos) return;
  const id = makeEffectId('glyph');
  const startY = Math.round(actorPos.top + 12);
  addProp(props, {
    id,
    type: 'soundGlyph',
    x: Math.round(actorPos.x - 10),
    y: startY,
    parallax: 1.06,
    layer: 2,
  });
  for (let step = 0; step < 4; step += 1) {
    await sleep(70);
    updateProp(props, id, { y: startY - step * 12 });
  }
  await sleep(100);
  updateProp(props, id, null);
}

async function truthGleam({ props, targetPos }) {
  if (!targetPos) return;
  const id = makeEffectId('truth');
  addProp(props, {
    id,
    type: 'resonanceRockAwakened',
    x: Math.round(targetPos.x - 24),
    y: Math.round(targetPos.top),
    parallax: 0.92,
    layer: 1,
  });
  for (let step = 0; step < 3; step += 1) {
    await sleep(90);
    updateProp(props, id, { y: Math.round(targetPos.top - step * 4) });
  }
  await sleep(90);
  updateProp(props, id, null);
}

async function prismBurst({ props, targetPos }) {
  if (!targetPos) return;
  const centerX = Math.round(targetPos.x - 18);
  const topY = Math.round(targetPos.top - 20);
  const prismId = makeEffectId('prism');
  const ringId = makeEffectId('ring');
  addProp(props, {
    id: prismId,
    type: 'sunStoneAwakened',
    x: centerX,
    y: topY,
    parallax: 0.88,
    layer: 1,
  });
  addProp(props, {
    id: ringId,
    type: 'resonanceRingActive',
    x: centerX - 18,
    y: Math.round(targetPos.bottom - 58),
    parallax: 1.04,
    layer: 1,
  });
  for (let step = 0; step < 4; step += 1) {
    await sleep(70);
    updateProp(props, ringId, { y: Math.round(targetPos.bottom - 58 - step * 3) });
  }
  updateProp(props, prismId, null);
  await sleep(100);
  updateProp(props, ringId, null);
}

async function flameHalo({ props, targetPos }) {
  if (!targetPos) return;
  const id = makeEffectId('flame');
  const baseY = Math.round(targetPos.bottom - 68);
  addProp(props, {
    id,
    type: 'anvilFlame',
    x: Math.round(targetPos.x - 16),
    y: baseY,
    parallax: 1.02,
    layer: 1,
  });
  const steps = 8;
  for (let step = 0; step < steps; step += 1) {
    const angle = (Math.PI * 2 * step) / steps;
    const x = Math.round(targetPos.x - 16 + Math.sin(angle) * 18);
    const y = Math.round(baseY - Math.cos(angle) * 10);
    updateProp(props, id, { x, y });
    await sleep(45);
  }
  updateProp(props, id, null);
}

async function lightShard({ props, targetPos }) {
  if (!targetPos) return;
  const id = makeEffectId('light');
  addProp(props, {
    id,
    type: 'sunStoneAwakened',
    x: Math.round(targetPos.x - 16),
    y: Math.round(targetPos.top - 10),
    parallax: 0.94,
    layer: 1,
  });
  for (let step = 0; step < 3; step += 1) {
    await sleep(70);
    updateProp(props, id, { y: Math.round(targetPos.top - 10 - step * 6) });
  }
  await sleep(80);
  updateProp(props, id, null);
}

async function blessingGlow({ props, targetPos }) {
  if (!targetPos) return;
  const id = makeEffectId('bless');
  addProp(props, {
    id,
    type: 'gardenBreadLight',
    x: Math.round(targetPos.x - 20),
    y: Math.round(targetPos.bottom - 80),
    parallax: 1,
    layer: 1,
  });
  for (let step = 0; step < 4; step += 1) {
    await sleep(60);
    updateProp(props, id, { x: Math.round(targetPos.x - 20 + (step % 2 === 0 ? 6 : -6)) });
  }
  updateProp(props, id, null);
}

async function vineBurst({ props, targetPos }) {
  if (!targetPos) return;
  const leftId = makeEffectId('vineL');
  const rightId = makeEffectId('vineR');
  const baseY = Math.round(targetPos.bottom - 36);
  addProp(props, {
    id: leftId,
    type: 'gardenForegroundPlant',
    x: Math.round(targetPos.x - 46),
    y: baseY + 12,
    parallax: 1.04,
    layer: 1,
  });
  addProp(props, {
    id: rightId,
    type: 'gardenForegroundPlant',
    x: Math.round(targetPos.x + 10),
    y: baseY + 16,
    parallax: 1.06,
    layer: 1,
  });
  for (let step = 0; step < 4; step += 1) {
    await sleep(70);
    updateProp(props, leftId, { y: baseY + 12 - step * 6 });
    updateProp(props, rightId, { y: baseY + 16 - step * 5 });
  }
  await sleep(120);
  updateProp(props, leftId, null);
  updateProp(props, rightId, null);
}

async function angelStrike({ props, targetPos }) {
  if (!targetPos) return;
  const id = makeEffectId('angel');
  const startY = Math.round(targetPos.top - 140);
  const endY = Math.round(targetPos.top - 12);
  addProp(props, {
    id,
    type: 'angelBladeForm',
    x: Math.round(targetPos.x - 18),
    y: startY,
    parallax: 0.9,
    layer: 2,
  });
  const steps = 6;
  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    const y = startY + (endY - startY) * progress;
    updateProp(props, id, { y: Math.round(y) });
    await sleep(50);
  }
  await sleep(120);
  updateProp(props, id, null);
}
