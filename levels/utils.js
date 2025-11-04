import { say, wizard, donkey, setSceneProps, ensureAmbience } from '../scene.js';

/*
 * Level Coding Rules
 * ------------------
 * - Files under `levels/` export async story flows only. Shared logic,
 *   branching helpers, or prop mutation utilities live here (or another helper
 *   module), keeping level scripts focused on narrative sequencing.
 * - Helper utilities must remain side-effect free except when they deliberately
 *   call back into `scene.js` (e.g. `setSceneProps`).
 */

function actorSprite(actor) {
  return actor.sprites?.right ?? actor.sprites?.left;
}

function actorCenterX(actor) {
  const sprite = actorSprite(actor);
  const width = sprite?.width ?? 32;
  return actor.x + width / 2;
}

function actorTopY(actor) {
  return actor.y ?? 0;
}

function actorBubbleY(actor, offset = -20) {
  return actorTopY(actor) + offset;
}

export function anchorX(actor, offset = 0) {
  return () => actorCenterX(actor) + offset;
}

export function anchorY(actor, offset = -28) {
  return () => actorBubbleY(actor, offset);
}

export function narratorSay(text) {
  return say(
    () => (actorCenterX(wizard) + actorCenterX(donkey)) / 2,
    () => Math.min(actorTopY(wizard), actorTopY(donkey)) - 70,
    text,
  );
}

export function wizardSay(text) {
  return say(
    anchorX(wizard),
    () => actorBubbleY(wizard, -46),
    text,
  );
}

export function donkeySay(text) {
  return say(
    anchorX(donkey),
    () => actorBubbleY(donkey, -40),
    text,
  );
}

export function normalizeHebrewInput(value) {
  if (value == null) return '';
  return String(value)
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

export function spellEquals(answer, ...variants) {
  const normalized = normalizeHebrewInput(answer);
  if (!variants || variants.length === 0) return false;
  return variants.some(option => normalizeHebrewInput(option) === normalized);
}

export function findProp(list, id) {
  if (!Array.isArray(list)) return null;
  return list.find(entry => entry.id === id) ?? null;
}

export function propSay(props, id, text, options = {}) {
  const { offsetX = 0, offsetY = -24 } = options;
  const anchorX = () => {
    const prop = findProp(props, id);
    if (prop?.sprite) {
      const width = prop.sprite.width ?? 0;
      return (prop.x ?? 0) + width / 2 + offsetX;
    }
    return actorCenterX(wizard) + offsetX;
  };

  const anchorY = () => {
    const prop = findProp(props, id);
    if (prop?.sprite) {
      return (prop.y ?? 0) - 16 + offsetY;
    }
    return actorBubbleY(wizard, -46) + offsetY;
  };

  return say(anchorX, anchorY, text);
}

export function updateProp(list, id, changes) {
  if (!Array.isArray(list)) return;
  const index = list.findIndex(entry => entry.id === id);
  if (index === -1) return;
  if (changes == null) {
    list.splice(index, 1);
  } else {
    list[index] = { ...list[index], ...changes };
  }
  setSceneProps(list);
}

export function addProp(list, definition) {
  if (!Array.isArray(list) || !definition) return;
  const existingIndex = definition?.id ? list.findIndex(entry => entry.id === definition.id) : -1;
  if (existingIndex >= 0) {
    list[existingIndex] = { ...list[existingIndex], ...definition };
  } else {
    list.push({ ...definition });
  }
  setSceneProps(list);
}

export const RIVER_SCENE = {
  ambience: 'riverDawn',
  wizardStartX: 96,
  donkeyOffset: -36,
  props: [
    { id: 'riverPool', type: 'water', x: 620 },
  ],
};

export const CANYON_SCENE = {
  ambience: 'echoChamber',
  wizardStartX: 64,
  donkeyOffset: -40,
  props: [
    { id: 'canyonBackSpireLeft', type: 'basaltSpireTall', x: 140, offsetY: -6, parallax: 0.35 },
    { id: 'canyonBackSpireRight', type: 'basaltSpireMid', x: 360, offsetY: -4, parallax: 0.42 },
    { id: 'canyonMist', type: 'canyonMist', x: 0, align: 'ground', offsetY: -54, parallax: 0.55 },
    { id: 'canyonStalactiteLeft', type: 'stalactite', x: 90, align: 'top', offsetY: 8, parallax: 0.3 },
    { id: 'canyonStalactiteRight', type: 'stalactite', x: 308, align: 'top', offsetY: 10, parallax: 0.38 },
    { id: 'canyonArch', type: 'stoneArch', x: 268 },
    { id: 'canyonFountain', type: 'fountainDry', x: 452 },
    { id: 'canyonForegroundSpire', type: 'basaltSpireShort', x: 512, offsetY: -2, parallax: 0.85 },
  ],
};

export const GARDEN_SCENE = {
  ambience: 'gardenBloom',
  wizardStartX: 72,
  donkeyOffset: -38,
  props: [
    { id: 'gardenBackgroundTrees', type: 'gardenBackdropTrees', x: -12, align: 'ground', parallax: 0.25 },
    { id: 'gardenBalakStatue', type: 'balakStatue', x: 312, align: 'ground', parallax: 0.55 },
    { id: 'gardenBalakFigure', type: 'balakFigure', x: 352, align: 'ground', parallax: 0.95 },
    { id: 'gardenIrrigation', type: 'irrigationChannels', x: -28, align: 'ground', parallax: 0.9 },
    { id: 'gardenDryBasin', type: 'fountainDry', x: 248, align: 'ground' },
    { id: 'gardenSunStone', type: 'sunStoneDormant', x: 410, align: 'ground' },
    { id: 'gardenEchoRock', type: 'resonanceRockDormant', x: 552, align: 'ground' },
    { id: 'gardenAltar', type: 'gardenAltar', x: 612, align: 'ground' },
    { id: 'gardenForegroundStem', type: 'gardenForegroundPlant', x: 120, align: 'ground', parallax: 1.05 },
  ],
};

export const FORGE_SCENE = {
  ambience: 'volcanoTrial',
  wizardStartX: 68,
  donkeyOffset: -34,
  props: [
    { id: 'forgeBackSpireLeft', type: 'basaltSpireTall', x: 110, offsetY: -10, parallax: 0.3 },
    { id: 'forgeBackSpireRight', type: 'basaltSpireMid', x: 360, offsetY: -8, parallax: 0.36 },
    { id: 'forgeCinderMist', type: 'canyonMist', x: -24, align: 'ground', offsetY: -48, parallax: 0.62 },
    { id: 'forgeWaterCistern', type: 'fountainDry', x: 220, align: 'ground' },
    { id: 'forgeIgnitionRing', type: 'sunStoneDormant', x: 336, align: 'ground' },
    { id: 'forgeAnvil', type: 'gardenAltar', x: 468, align: 'ground' },
    { id: 'forgeBalakEcho', type: 'balakFigure', x: 548, align: 'ground', parallax: 0.92 },
  ],
};

export function applySceneConfig(config, options = {}) {
  if (!config) return;
  const {
    setAmbience: useAmbience = true,
    position = true,
    props = true,
  } = options;

  if (props !== false && Array.isArray(config.props)) {
    setSceneProps(config.props);
  }

  if (useAmbience && config.ambience) {
    ensureAmbience(config.ambience);
  }

  if (position) {
    if (typeof config.wizardStartX === 'number') {
      wizard.x = config.wizardStartX;
      wizard.vx = 0;
      wizard.vy = 0;
      wizard.onGround = true;
    }
    if (typeof config.donkeyX === 'number') {
      donkey.x = config.donkeyX;
    } else if (typeof config.wizardStartX === 'number') {
      const offset = config.donkeyOffset ?? -36;
      donkey.x = config.wizardStartX + offset;
    }
    donkey.vx = 0;
  }
}

export function cloneSceneProps(definitions = []) {
  return Array.isArray(definitions) ? definitions.map(def => ({ ...def })) : [];
}

export { wizard, donkey } from '../scene.js';
