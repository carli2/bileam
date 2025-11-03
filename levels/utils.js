import { say, wizard, donkey, isSkipRequested } from '../scene.js';

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

export { wizard, donkey, isSkipRequested } from '../scene.js';
