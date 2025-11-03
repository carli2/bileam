import {
  say,
  wizard,
  donkey,
  isSkipRequested,
  setSceneProps,
  ensureAmbience,
} from '../scene.js';

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
  if (isSkipRequested()) return Promise.resolve();
  return say(
    () => (actorCenterX(wizard) + actorCenterX(donkey)) / 2,
    () => Math.min(actorTopY(wizard), actorTopY(donkey)) - 70,
    text,
  );
}

export function wizardSay(text) {
  if (isSkipRequested()) return Promise.resolve();
  return say(
    anchorX(wizard),
    () => actorBubbleY(wizard, -46),
    text,
  );
}

export function donkeySay(text) {
  if (isSkipRequested()) return Promise.resolve();
  return say(
    anchorX(donkey),
    () => actorBubbleY(donkey, -40),
    text,
  );
}

export function normalizeHebrewInput(value) {
  if (!value) return '';
  return value.replace(/\s+/g, '');
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
    { id: 'canyonArch', type: 'stoneArch', x: 268 },
    { id: 'canyonFountain', type: 'fountainDry', x: 452 },
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

export { wizard, donkey, isSkipRequested } from '../scene.js';
