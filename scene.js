import { RetroPalette, RetroBuffer, Sprite, blitSprite } from './retroBlitter.js';
import {
  createPalette,
  createPaletteFader,
  createTextRenderer,
  spriteFromStrings,
  mirrorSprite,
  createSpeechState,
  beginSpeech,
  updateSpeechState,
  renderSpeechBubble,
  layoutText,
  acknowledgeSpeech,
  clamp,
} from './graphics.js';
import { transliterateToHebrew } from './game.helpers.js';

const WIDTH = 320;
const HEIGHT = 200;
const GROUND_HEIGHT = 8;
const MOVE_SPEED = 78;
const GRAVITY = 280;
const JUMP_FORCE = 180;
const TEXT_WRAP = 26;
const CAMERA_MARGIN = 96;
const GRASS_SWAY_SPEED = 4;
const MAX_INPUT_LENGTH = 18;

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');

const { palette, colors } = createPalette();
const retroPalette = new RetroPalette(palette);
const buffer = new RetroBuffer(WIDTH, HEIGHT, retroPalette);
const paletteFader = createPaletteFader(retroPalette, colors.transparent);

const textRenderer = createTextRenderer(colors);

const sceneState = {
  level: null,
  phase: null,
  ambience: null,
  location: 'outside',
  skipCurrentLevel: null,
};

const ambienceState = {
  key: null,
  config: null,
};

const narrationSpeech = createSpeechState();
const overlaySpeechStates = new Set();
let speechQueue = Promise.resolve();
const propSprites = {};
let sceneProps = [];
const activeWaiters = new Set();

export const wizard = {
  sprites: null,
  x: 48,
  y: 0,
  vx: 0,
  vy: 0,
  facing: 1,
  onGround: true,
};

export const donkey = {
  sprites: null,
  x: 0,
  y: 0,
  facing: 1,
};

let donkeyBaseY = 0;
let clouds = [];

const controls = new Set(['w', 'a', 's', 'd']);
const heldKeys = new Set();
const pressedKeys = new Set();
const SPEECH_ACK_KEYS = new Set(['Enter', ' ', 'Space', 'Spacebar']);

let gameplayInputEnabled = true;
let activePrompt = null;
let cameraX = 0;
let cameraDelta = 0;
let grassPhase = 0;
let lastTime = performance.now();
let pendingSpeechAck = null;
let sceneStarted = false;

let ambiencePresets;
export const levelAmbiencePlan = createLevelSceneMap();
const titleOverlay = {
  active: false,
  text: '',
  until: 0,
  resolve: null,
};

export function startScene(mainCallback) {
  if (sceneStarted) {
    throw new Error('Scene already started');
  }
  sceneStarted = true;
  initSprites();
  setupEventListeners();
  lastTime = performance.now();
  requestAnimationFrame(loop);
  if (typeof mainCallback === 'function') {
    Promise.resolve().then(mainCallback).catch(err => {
      console.error(err);
    });
  }
}

export function say(x, y, text) {
  if (sceneState.skipRequested) return Promise.resolve('skip');
  speechQueue = speechQueue.then(() => {
    if (sceneState.skipRequested) return 'skip';
    const wasEnabled = gameplayInputEnabled;
    gameplayInputEnabled = false;
    const promise = beginSpeech(
      narrationSpeech,
      textRenderer,
      TEXT_WRAP,
      x,
      y,
      text,
      { awaitAck: true }
    );
    pendingSpeechAck = narrationSpeech;
    return promise.finally(() => {
      if (pendingSpeechAck === narrationSpeech) {
        pendingSpeechAck = null;
      }
      gameplayInputEnabled = wasEnabled;
    });
  });
  return speechQueue.then(value => (sceneState.skipRequested ? 'skip' : value));
}

export function promptBubble(x1, y1, text, x2, y2) {
  return createPromptBubble(x1, y1, text, x2, y2);
}

export function ensureAmbience(key) {
  if (!key) return;
  if (ambienceState.key !== key) {
    setAmbience(key, { immediate: true });
  }
}

export function transitionAmbience(key, options = {}) {
  return performAmbienceTransition(key, options);
}

export function setSceneContext({ level, phase } = {}) {
  if (level) {
    sceneState.level = level;
  }
  if (phase) {
    sceneState.phase = phase;
  }
}

export function getSceneContext() {
  return { ...sceneState };
}

export function getCurrentAmbienceKey() {
  return ambienceState.key;
}

export function setSceneProps(definitions = []) {
  const list = Array.isArray(definitions) ? definitions : [definitions];
  sceneProps = list.map(instantiatePropDefinition).filter(Boolean);
}

export function getScenePropBounds(key) {
  if (!key) return null;
  const prop = sceneProps.find(entry => entry.id === key || entry.type === key);
  if (!prop) return null;
  return {
    id: prop.id,
    type: prop.type,
    left: prop.x,
    right: prop.x + prop.sprite.width,
    top: prop.y,
    bottom: prop.y + prop.sprite.height,
    width: prop.sprite.width,
    height: prop.sprite.height,
  };
}

export function waitForWizardToReach(targetX, options = {}) {
  if (sceneState.skipRequested) return Promise.resolve('skip');
  const tolerance = Math.max(0, options.tolerance ?? 6);
  const direction = options.direction ?? (targetX >= getWizardCenterX() ? 1 : -1);
  const resultValue = options.value ?? 'reached';
  const abortOnSkip = options.abortOnSkip !== false;

  return new Promise(resolve => {
    const condition = () => {
      const center = getWizardCenterX();
      return direction >= 0
        ? center >= targetX - tolerance
        : center <= targetX + tolerance;
    };

    if (condition()) {
      resolve(resultValue);
      return;
    }

    const waiter = {
      type: 'wizard-position',
      condition,
      resolve,
      resultValue,
      abortOnSkip,
    };
    activeWaiters.add(waiter);
  });
}

function requestSpeechFastForward() {
  accelerateSpeechState(narrationSpeech);
  overlaySpeechStates.forEach(state => accelerateSpeechState(state));
}

function accelerateSpeechState(state) {
  if (!state || !state.active) return;
  if (state.fastForward) return;
  const slow = state.charDelaySlow ?? state.charDelay;
  if (!(slow > 0)) return;
  let fast = state.charDelayFast ?? 0;
  if (!(fast > 0 && fast < slow)) {
    fast = Math.max(1, Math.floor(slow / 5));
    if (fast >= slow) {
      fast = Math.max(1, Math.round(slow / 5));
    }
    if (fast >= slow) {
      fast = Math.max(1, slow - 1);
    }
  }
  if (!(fast > 0)) return;
  if (fast >= slow) fast = Math.max(1, slow - 1);
  state.charDelayFast = fast;
  state.charDelay = fast;
  state.fastForward = true;
  const now = performance.now();
  if (state.nextCharTime - now > state.charDelay) {
    state.nextCharTime = now + state.charDelay;
  }
}

export function showLevelTitle(text, duration = 2600) {
  if (!text) {
    deactivateTitleOverlay(sceneState.skipRequested ? 'skip' : 'cancel');
    return Promise.resolve(sceneState.skipRequested ? 'skip' : 'cancel');
  }

  if (sceneState.skipRequested) {
    deactivateTitleOverlay('skip');
    return Promise.resolve('skip');
  }

  deactivateTitleOverlay('cancel');

  titleOverlay.active = true;
  titleOverlay.text = String(text);
  titleOverlay.until = performance.now() + Math.max(0, duration);

  return new Promise(resolve => {
    titleOverlay.resolve = resolve;
  });
}

function deactivateTitleOverlay(reason = 'cancel') {
  const resolver = titleOverlay.resolve;
  titleOverlay.resolve = null;
  const wasActive = titleOverlay.active;
  titleOverlay.active = false;
  titleOverlay.until = 0;
  titleOverlay.text = '';
  if ((wasActive || resolver) && typeof resolver === 'function') {
    resolver(reason);
  }
}

export function fadeToBase(duration) {
  if (sceneState.skipRequested) return paletteFader.fadeToBase(0);
  return paletteFader.fadeToBase(duration).then(() => {
    if (sceneState.skipRequested) return;
  });
}

export function fadeToBlack(duration) {
  if (sceneState.skipRequested) return paletteFader.fadeToBlack(0);
  return paletteFader.fadeToBlack(duration).then(() => {
    if (sceneState.skipRequested) return;
  });
}

export function setSkipHandler(handler) {
  sceneState.skipRequested = false;
  sceneState.skipCurrentLevel = () => {
    requestSkip();
    if (typeof handler === 'function') handler();
  };
}

export function clearSkipHandler() {
  sceneState.skipCurrentLevel = null;
  sceneState.cancelPrompt = null;
  sceneState.skipRequested = false;
}

export function isSkipRequested() {
  return sceneState.skipRequested;
}

function requestSkip() {
  if (sceneState.skipRequested) return;
  sceneState.skipRequested = true;
  deactivateTitleOverlay('skip');
  resolveWaitersOnSkip();
  if (pendingSpeechAck) {
    acknowledgeSpeech(pendingSpeechAck, performance.now());
    pendingSpeechAck = null;
  }
  if (sceneState.cancelPrompt) {
    const cancel = sceneState.cancelPrompt;
    sceneState.cancelPrompt = null;
    cancel('skip');
  }
  if (narrationSpeech.active) {
    narrationSpeech.active = false;
    narrationSpeech.sequence = [];
    narrationSpeech.lines = [];
    const resolve = narrationSpeech.resolve;
    narrationSpeech.resolve = null;
    if (typeof resolve === 'function') resolve('skip');
  }
  overlaySpeechStates.forEach(state => {
    state.active = false;
    state.sequence = [];
    state.lines = [];
    if (typeof state.resolve === 'function') {
      const resolver = state.resolve;
      state.resolve = null;
      resolver('skip');
    }
  });
  overlaySpeechStates.clear();
  speechQueue = Promise.resolve();
}

function setupEventListeners() {
  window.addEventListener('keydown', handleKeyDown, { passive: false });
  window.addEventListener('keyup', handleKeyUp, { passive: false });
  window.addEventListener('blur', () => {
    heldKeys.clear();
    pressedKeys.clear();
  });
  window.addEventListener('keydown', handleSpeechAdvance, true);
  window.addEventListener('pointerdown', handleSpeechAdvance, true);
}

function initSprites() {
  const wizardSprites = createWizardSprites(colors);
  const donkeySprites = createDonkeySprites(colors);
  const cloudSprites = createCloudSprites(colors);
  propSprites.door = createDoorSprite(colors);
  propSprites.water = createWaterSprite(colors);
  sceneProps = [];

  wizard.sprites = wizardSprites;
  wizard.y = groundLineFor(wizardSprites.right);
  donkey.sprites = donkeySprites;
  donkeyBaseY = groundLineFor(donkeySprites.right);
  donkey.x = wizard.x - 32;
  donkey.y = donkeyBaseY;
  clouds = createClouds(cloudSprites);
}
function handleKeyDown(event) {
  if (event.key === 'Tab') {
    event.preventDefault();
    if (typeof sceneState.skipCurrentLevel === 'function') {
      sceneState.skipCurrentLevel();
    } else {
      requestSkip();
    }
    return;
  }
  requestSpeechFastForward();
  if (!gameplayInputEnabled) {
    return;
  }
  const key = event.key.toLowerCase();
  if (!controls.has(key)) return;
  if (!heldKeys.has(key)) {
    pressedKeys.add(key);
  }
  heldKeys.add(key);
  event.preventDefault();
}

function handleKeyUp(event) {
  if (!gameplayInputEnabled) {
    return;
  }
  const key = event.key.toLowerCase();
  if (!controls.has(key)) return;
  heldKeys.delete(key);
  pressedKeys.delete(key);
  event.preventDefault();
}

function handleSpeechAdvance(event) {
  requestSpeechFastForward();
  if (!pendingSpeechAck || activePrompt) return;
  const state = pendingSpeechAck;
  if (state.visible < state.totalChars) return;

  if (event.type === 'keydown') {
    if (event.repeat) return;
    if (!SPEECH_ACK_KEYS.has(event.key)) return;
  } else if (event.type === 'pointerdown') {
    if (event.button !== 0) return;
  } else {
    return;
  }

  acknowledgeSpeech(state, performance.now());
  pendingSpeechAck = null;
  event.preventDefault();
  event.stopPropagation();
}

function loop(time) {
  if (titleOverlay.active && time >= titleOverlay.until) {
    deactivateTitleOverlay('done');
  }

  const delta = Math.min(0.05, (time - lastTime) / 1000);
  lastTime = time;

  updateWizard(delta);
  updateDonkey(delta, time);
  updateClouds(delta, time);

  const previousCameraX = cameraX;
  updateCamera();
  cameraDelta = cameraX - previousCameraX;
  if (cameraDelta !== 0) {
    grassPhase = (grassPhase + delta * GRASS_SWAY_SPEED) % (Math.PI * 2);
  }

  processWaiters();

  drawScene();

  updateSpeechState(narrationSpeech, time);
  overlaySpeechStates.forEach(state => {
    if (!state.locked) {
      updateSpeechState(state, time);
    }
  });
  if (activePrompt && typeof activePrompt.update === 'function') {
    activePrompt.update(delta);
  }

  const frame = buffer.toImageData(ctx);
  ctx.putImageData(frame, 0, 0);

  if (titleOverlay.active) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffe8a8';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = String(titleOverlay.text).split('\n');
    const lineHeight = 28;
    const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });
    ctx.restore();
  }

  pressedKeys.clear();
  requestAnimationFrame(loop);
}

function updateWizard(delta) {
  const left = gameplayInputEnabled && heldKeys.has('a');
  const right = gameplayInputEnabled && heldKeys.has('d');
  const crouch = gameplayInputEnabled && heldKeys.has('s');
  const jumpPressed = gameplayInputEnabled && pressedKeys.has('w');

  let desired = 0;
  if (left) desired -= MOVE_SPEED;
  if (right) desired += MOVE_SPEED;

  wizard.vx = desired;
  if (desired !== 0) {
    wizard.facing = desired > 0 ? 1 : -1;
  }

  if (jumpPressed && wizard.onGround) {
    wizard.vy = -JUMP_FORCE;
    wizard.onGround = false;
  }

  const gravityForce = GRAVITY * delta;
  wizard.vy += gravityForce;
  if (!heldKeys.has('w') && wizard.vy < 0) {
    wizard.vy += GRAVITY * 0.35 * delta;
  }
  if (crouch && wizard.vy > 0) {
    wizard.vy += GRAVITY * 0.5 * delta;
  }

  wizard.x += wizard.vx * delta;
  wizard.y += wizard.vy * delta;

  const ground = HEIGHT - GROUND_HEIGHT - wizard.sprites.right.height;
  if (wizard.y >= ground) {
    wizard.y = ground;
    wizard.vy = 0;
    wizard.onGround = true;
  }
}

function updateDonkey(delta, time) {
  const gap = wizard.x - donkey.x - 32;
  const maxSpeed = 42;
  donkey.x += clamp(gap, -maxSpeed * delta, maxSpeed * delta);

  if (Math.abs(gap) > 0.5) {
    donkey.facing = gap > 0 ? 1 : -1;
  }

  const maxLead = wizard.x + 36;
  if (donkey.x > maxLead) {
    donkey.x = maxLead;
  }

  donkey.y = donkeyBaseY + Math.sin(time * 0.003 + donkey.x * 0.02) * 1.5;
}

function updateClouds(delta, time) {
  const ambience = getCurrentAmbience();
  if (!ambience.features?.clouds) return;
  const span = WIDTH + 160;
  for (const cloud of clouds) {
    cloud.x += cloud.speed * delta;
    const parallaxX = cloud.x - cameraX * 0.4;
    if (parallaxX < -cloud.sprite.width - 40) {
      cloud.x += span;
    } else if (parallaxX > span) {
      cloud.x -= span;
    }
    cloud.y = cloud.baseY + Math.sin(time * 0.0006 + cloud.phase) * 4;
  }
}

function drawScene() {
  drawSky();
  drawCloudLayer();
  drawHills();
  drawTerrain();
  drawProps();
  drawCharacters();
  renderSpeechLayers();
}

function drawSky() {
  const ambience = getCurrentAmbience();
  const sky = ambience.sky;
  const pixels = buffer.pixels;
  if (!sky) {
    pixels.fill(colors.hillShadow);
    return;
  }

  if (sky.type === 'solid') {
    const color = sky.color;
    for (let y = 0; y < HEIGHT; y++) {
      const rowStart = y * WIDTH;
      pixels.fill(color, rowStart, rowStart + WIDTH);
    }
    return;
  }

  if (sky.type === 'gradient') {
    const stops = sky.stops ?? [];
    for (let y = 0; y < HEIGHT; y++) {
      const color = pickSkyColor(stops, y);
      const rowStart = y * WIDTH;
      pixels.fill(color, rowStart, rowStart + WIDTH);
    }
  }
}

function drawCloudLayer() {
  const ambience = getCurrentAmbience();
  if (!ambience.features?.clouds) return;
  for (const cloud of clouds) {
    const screenX = Math.round(cloud.x - cameraX * 0.4);
    const screenY = Math.round(cloud.y);
    blitSprite(buffer, cloud.sprite, screenX, screenY, { transparent: colors.transparent });
  }
}

function drawHills() {
  const ambience = getCurrentAmbience();
  if (!ambience.features?.hills) return;
  const hillColors = ambience.hills ?? { light: colors.hillLight, shadow: colors.hillShadow };
  const pixels = buffer.pixels;
  const horizon = HEIGHT - GROUND_HEIGHT - 1;
  const parallax = cameraX * 0.6;
  for (let x = 0; x < WIDTH; x++) {
    const worldX = parallax + x;
    const height = 18 + Math.sin(worldX * 0.02) * 8 + Math.sin(worldX * 0.045) * 6;
    const hillTop = Math.max(36, Math.floor(horizon - height));
    for (let y = hillTop; y <= horizon; y++) {
      const idx = y * WIDTH + x;
      const depth = horizon - y;
      pixels[idx] = depth < 4 ? hillColors.light : hillColors.shadow;
    }
  }
}

function drawTerrain() {
  const ambience = getCurrentAmbience();
  const ground = ambience.ground ?? { type: 'grass' };
  const pixels = buffer.pixels;
  const grassStart = HEIGHT - GROUND_HEIGHT;
  const worldOffset = Math.floor(cameraX);

  switch (ground.type) {
    case 'grass': {
      const palette = ground.colors ?? {
        bright: colors.grassBright,
        dark: colors.grassDark,
        shadow: colors.grassShadow,
        soil: colors.dirt,
        soilDeep: colors.dirtDeep,
      };
      for (let y = grassStart; y < HEIGHT; y++) {
        const rowStart = y * WIDTH;
        const layer = HEIGHT - y;
        for (let x = 0; x < WIDTH; x++) {
          const idx = rowStart + x;
          const worldX = worldOffset + x;
          if (layer >= 6) {
            const phase = cameraDelta !== 0 ? grassPhase + worldX * 0.05 : worldX * 0.05;
            const sway = Math.sin(phase);
            pixels[idx] = sway > 0 ? palette.bright : palette.dark;
          } else if (layer >= 4) {
            pixels[idx] = palette.shadow;
          } else {
            const pattern = ((worldX + y) & 1) === 0;
            pixels[idx] = pattern ? (palette.soil ?? colors.dirt) : (palette.soilDeep ?? palette.soil ?? colors.dirtDeep);
          }
        }
      }
      break;
    }
    case 'floor': {
      const base = ground.color ?? colors.dirt;
      const accent = ground.highlight ?? base;
      for (let y = grassStart; y < HEIGHT; y++) {
        const rowStart = y * WIDTH;
        for (let x = 0; x < WIDTH; x++) {
          const idx = rowStart + x;
          const pattern = ((x >> 2) + y) & 1;
          pixels[idx] = pattern ? base : accent;
        }
      }
      break;
    }
    case 'sand': {
      const base = ground.color ?? colors.desertSand ?? colors.dirt;
      const accent = ground.highlight ?? colors.dirt;
      for (let y = grassStart; y < HEIGHT; y++) {
        const rowStart = y * WIDTH;
        for (let x = 0; x < WIDTH; x++) {
          const idx = rowStart + x;
          const pattern = ((x + (y << 1)) & 3) === 0;
          pixels[idx] = pattern ? accent : base;
        }
      }
      break;
    }
    case 'stone': {
      const base = ground.color ?? colors.caveStone ?? colors.hillShadow;
      const accent = ground.highlight ?? colors.hillLight;
      for (let y = grassStart; y < HEIGHT; y++) {
        const rowStart = y * WIDTH;
        for (let x = 0; x < WIDTH; x++) {
          const idx = rowStart + x;
          const pattern = ((x ^ y) & 3) === 0;
          pixels[idx] = pattern ? accent : base;
        }
      }
      break;
    }
    default: {
      const base = ground.color ?? colors.dirt;
      for (let y = grassStart; y < HEIGHT; y++) {
        const rowStart = y * WIDTH;
        pixels.fill(base, rowStart, rowStart + WIDTH);
      }
    }
  }
}

function drawProps() {
  if (sceneProps.length === 0) return;
  for (const prop of sceneProps) {
    if (!prop || prop.visible === false || !prop.sprite) continue;
    const parallax = prop.parallax ?? 1;
    const screenX = Math.round(prop.x - cameraX * parallax);
    const screenY = Math.round(prop.y);
    blitSprite(buffer, prop.sprite, screenX, screenY, { transparent: colors.transparent });
  }
}

function instantiatePropDefinition(definition) {
  if (!definition) return null;
  const type = definition.type ?? null;
  const sprite = definition.sprite ?? (type ? propSprites[type] : null);
  if (!sprite) return null;

  const prop = {
    id: definition.id ?? type ?? null,
    type,
    sprite,
    x: definition.x ?? 0,
    y: definition.y ?? computePropY(sprite, definition.align ?? 'ground', definition.offsetY ?? 0),
    parallax: definition.parallax ?? 1,
    visible: definition.visible !== false,
    data: definition.data ?? null,
  };

  return prop;
}

function computePropY(sprite, align, offsetY) {
  switch (align) {
    case 'top':
      return (offsetY ?? 0) | 0;
    case 'bottom':
      return HEIGHT - sprite.height + ((offsetY ?? 0) | 0);
    case 'center':
      return Math.round((HEIGHT - sprite.height) / 2 + (offsetY ?? 0));
    case 'ground':
    default:
      return groundLineFor(sprite) + ((offsetY ?? 0) | 0);
  }
}

function processWaiters() {
  if (activeWaiters.size === 0) return;
  for (const waiter of Array.from(activeWaiters)) {
    if (sceneState.skipRequested && waiter.abortOnSkip !== false) {
      activeWaiters.delete(waiter);
      waiter.resolve('skip');
      continue;
    }
    if (typeof waiter.condition === 'function' && waiter.condition()) {
      activeWaiters.delete(waiter);
      waiter.resolve(waiter.resultValue);
    }
  }
}

function getWizardCenterX() {
  const sprite = wizard.sprites?.right ?? wizard.sprites?.left;
  const width = sprite?.width ?? 32;
  return wizard.x + width / 2;
}

function resolveWaitersOnSkip() {
  if (activeWaiters.size === 0) return;
  for (const waiter of Array.from(activeWaiters)) {
    if (waiter.abortOnSkip === false) continue;
    activeWaiters.delete(waiter);
    waiter.resolve('skip');
  }
}
function pickSkyColor(stops, y) {
  if (!stops || stops.length === 0) {
    return colors.hillShadow;
  }
  for (let i = 0; i < stops.length; i++) {
    if (y < stops[i].until) {
      return stops[i].color;
    }
  }
  return stops[stops.length - 1].color;
}

function getCurrentAmbience() {
  if (!ambienceState.config) {
    setAmbience('exteriorDay', { immediate: true });
  }
  return ambienceState.config;
}

function setAmbience(key, { immediate = false } = {}) {
  const preset = ambiencePresets[key] ?? ambiencePresets.exteriorDay;
  if (ambienceState.key === key && ambienceState.config) {
    return;
  }
  ambienceState.key = key;
  ambienceState.config = cloneAmbience(preset);
  sceneState.ambience = key;
  if (ambienceState.config?.location) {
    sceneState.location = ambienceState.config.location;
  }
  if (!immediate) {
    // reserved for future timed transitions
  }
}

async function performAmbienceTransition(key, options = {}) {
  if (!key || ambienceState.key === key) {
    return;
  }
  if (sceneState.skipRequested) {
    setAmbience(key, { immediate: true });
    return;
  }
  const fade = options.fade ?? null;
  if (fade) {
    const toBlack = Math.max(0, fade.toBlack | 0);
    const toBase = Math.max(0, fade.toBase | 0);
    if (toBlack > 0) {
      await fadeToBlack(toBlack);
      if (sceneState.skipRequested) {
        setAmbience(key, { immediate: true });
        return;
      }
    }
    setAmbience(key);
    if (toBase > 0) {
      await fadeToBase(toBase);
    }
    return;
  }

  if (options.paletteFade === false) {
    setAmbience(key);
    return;
  }

  await fadeToBlack(180);
  if (sceneState.skipRequested) {
    setAmbience(key, { immediate: true });
    return;
  }
  setAmbience(key);
  await fadeToBase(420);
}

function createAmbiencePresets(c) {
  const gradient = (top, mid, bottom) => ({
    type: 'gradient',
    stops: [
      { until: Math.floor(HEIGHT * 0.34), color: top },
      { until: Math.floor(HEIGHT * 0.64), color: mid },
      { until: HEIGHT, color: bottom },
    ],
  });
  const solid = color => ({ type: 'solid', color });
  const grassGround = colors => ({
    type: 'grass',
    colors,
  });

  const defaultGrass = grassGround({
    bright: c.grassBright,
    dark: c.grassDark,
    shadow: c.grassShadow,
    soil: c.dirt,
    soilDeep: c.dirtDeep,
  });

  return {
    exteriorDay: {
      key: 'exteriorDay',
      label: 'Outside – Daylight Meadow',
      location: 'outside',
      sky: gradient(c.skyTop, c.skyMid, c.skyBottom),
      features: { clouds: true, hills: true },
      ground: defaultGrass,
    },
    hutInteriorDark: {
      key: 'hutInteriorDark',
      label: 'Hut Interior (Dark)',
      location: 'hut',
      sky: solid(c.hutShadow),
      features: { clouds: false, hills: false },
      ground: { type: 'floor', color: c.hutFloor, highlight: c.hutShadow },
      lighting: 'dim',
    },
    hutInteriorLit: {
      key: 'hutInteriorLit',
      label: 'Hut Interior (Lit)',
      location: 'hut',
      sky: gradient(c.hutGlow, c.hutWall, c.hutFloor),
      features: { clouds: false, hills: false },
      ground: { type: 'floor', color: c.hutFloor, highlight: c.hutGlow },
      lighting: 'warm',
    },
    riverDawn: {
      key: 'riverDawn',
      label: 'Riverbank Dawn',
      location: 'outside',
      sky: gradient(c.dawnSkyTop, c.dawnSkyMid, c.dawnSkyBottom),
      features: { clouds: true, hills: true },
      ground: grassGround({
        bright: c.grassBright,
        dark: c.grassDark,
        shadow: c.grassShadow,
        soil: c.riverWater,
        soilDeep: c.dirtDeep,
      }),
    },
    echoChamber: {
      key: 'echoChamber',
      label: 'Echo Chamber',
      location: 'cave',
      sky: solid(c.caveStone),
      features: { clouds: false, hills: false },
      ground: { type: 'stone', color: c.caveStone, highlight: c.hillShadow },
    },
    gardenBloom: {
      key: 'gardenBloom',
      label: 'Garden Bloom',
      location: 'outside',
      sky: gradient(c.skyTop, c.gardenLeaf, c.skyBottom),
      features: { clouds: true, hills: true },
      ground: grassGround({
        bright: c.gardenLeaf,
        dark: c.grassDark,
        shadow: c.grassShadow,
        soil: c.dirt,
        soilDeep: c.dirtDeep,
      }),
    },
    volcanoTrial: {
      key: 'volcanoTrial',
      label: 'Volcano Trial',
      location: 'mountain',
      sky: gradient(c.lavaGlow, c.hillShadow, c.hillShadow),
      features: { clouds: false, hills: false },
      ground: { type: 'stone', color: c.caveStone, highlight: c.lavaGlow },
    },
    marketBazaar: {
      key: 'marketBazaar',
      label: 'Market Bazaar',
      location: 'town',
      sky: gradient(c.dawnSkyTop, c.marketFabric, c.hutFloor),
      features: { clouds: false, hills: false },
      ground: { type: 'floor', color: c.marketFabric, highlight: c.hutFloor },
    },
    mirrorTower: {
      key: 'mirrorTower',
      label: 'Mirror Tower',
      location: 'tower',
      sky: gradient(c.towerGlass, c.sanctumSky, c.towerGlass),
      features: { clouds: false, hills: false },
      ground: { type: 'floor', color: c.towerGlass, highlight: c.courtMarble },
    },
    desertTravel: {
      key: 'desertTravel',
      label: 'Desert Travel',
      location: 'desert',
      sky: gradient(c.dawnSkyTop, c.dawnSkyMid, c.nightSkyBottom),
      features: { clouds: false, hills: false },
      ground: { type: 'sand', color: c.desertSand, highlight: c.dirt },
    },
    courtAudience: {
      key: 'courtAudience',
      label: 'Royal Court',
      location: 'palace',
      sky: solid(c.courtMarble),
      features: { clouds: false, hills: false },
      ground: { type: 'floor', color: c.courtMarble, highlight: c.marketFabric },
    },
    sanctumFinale: {
      key: 'sanctumFinale',
      label: 'Sanctum Finale',
      location: 'sanctum',
      sky: gradient(c.sanctumSky, c.towerGlass, c.hutGlow),
      features: { clouds: false, hills: false },
      ground: { type: 'floor', color: c.towerGlass, highlight: c.sanctumSky },
    },
  };
}

function createLevelSceneMap() {
  return {
    level1: {
      introduction: 'hutInteriorDark',
      illumination: 'hutInteriorLit',
      door: 'exteriorDay',
    },
    level2: {
      review: 'riverDawn',
      learn: 'riverDawn',
      apply: 'riverDawn',
    },
    level3: {
      review: 'riverDawn',
      learn: 'echoChamber',
      apply: 'echoChamber',
    },
    level4: {
      review: 'gardenBloom',
      learn: 'gardenBloom',
      apply: 'gardenBloom',
    },
    level5: {
      review: 'gardenBloom',
      learn: 'volcanoTrial',
      apply: 'volcanoTrial',
    },
    level6: {
      review: 'marketBazaar',
      learn: 'marketBazaar',
      apply: 'marketBazaar',
    },
    level7: {
      review: 'mirrorTower',
      learn: 'mirrorTower',
      apply: 'mirrorTower',
    },
    level8: {
      review: 'desertTravel',
      learn: 'desertTravel',
      apply: 'desertTravel',
    },
    level9: {
      review: 'courtAudience',
      learn: 'courtAudience',
      apply: 'courtAudience',
    },
    level10: {
      review: 'sanctumFinale',
      learn: 'sanctumFinale',
      apply: 'sanctumFinale',
    },
  };
}

function cloneAmbience(preset) {
  if (!preset) return null;
  return {
    ...preset,
    features: preset.features ? { ...preset.features } : undefined,
    sky: preset.sky
      ? preset.sky.type === 'gradient'
        ? { ...preset.sky, stops: (preset.sky.stops ?? []).map(stop => ({ ...stop })) }
        : { ...preset.sky }
      : undefined,
    ground: preset.ground
      ? {
          ...preset.ground,
          colors: preset.ground.colors ? { ...preset.ground.colors } : undefined,
        }
      : undefined,
    hills: preset.hills ? { ...preset.hills } : undefined,
  };
}

function drawCharacters() {
  const wizardSprite = wizard.facing >= 0 ? wizard.sprites.left : wizard.sprites.right;
  const wizardX = Math.round(wizard.x - cameraX);
  const wizardY = Math.round(wizard.y);
  blitSprite(buffer, wizardSprite, wizardX, wizardY, { transparent: colors.transparent });

  const donkeySprite = donkey.facing >= 0 ? donkey.sprites.right : donkey.sprites.left;
  const donkeyX = Math.round(donkey.x - cameraX);
  const donkeyY = Math.round(donkey.y);
  blitSprite(buffer, donkeySprite, donkeyX, donkeyY, { transparent: colors.transparent });
}

function renderSpeechLayers() {
  const renderContext = { buffer, colors, cameraX, textRenderer };
  renderSpeechBubble(narrationSpeech, renderContext);
  overlaySpeechStates.forEach(state => renderSpeechBubble(state, renderContext));
}

function updateCamera() {
  const margin = CAMERA_MARGIN;
  const leftEdge = cameraX + margin;
  const rightEdge = cameraX + WIDTH - margin;
  if (wizard.x < leftEdge) {
    cameraX = Math.max(0, wizard.x - margin);
  } else if (wizard.x > rightEdge) {
    cameraX = Math.max(0, wizard.x - (WIDTH - margin));
  }
}
function createPromptBubble(x1, y1, text, x2, y2) {
  if (sceneState.skipRequested) {
    return Promise.resolve('skip');
  }
  if (activePrompt) {
    throw new Error('promptBubble already active');
  }

  const anchorQuestX = typeof x1 === 'function' ? x1 : () => x1;
  const anchorQuestY = typeof y1 === 'function' ? y1 : () => y1;
  const anchorInputX = typeof x2 === 'function' ? x2 : () => x2;
  const anchorInputY = typeof y2 === 'function' ? y2 : () => y2;

  const questState = createSpeechState();
  questState.charDelay = 0;
  questState.charDelaySlow = 0;
  questState.charDelayFast = 0;
  questState.holdDuration = Number.POSITIVE_INFINITY;
  beginSpeech(questState, textRenderer, TEXT_WRAP, anchorQuestX, anchorQuestY, text);
  questState.visible = questState.totalChars;
  questState.locked = true;
  overlaySpeechStates.add(questState);

  const inputState = createSpeechState();
  inputState.charDelay = 0;
  inputState.charDelaySlow = 0;
  inputState.charDelayFast = 0;
  inputState.holdDuration = Number.POSITIVE_INFINITY;
  inputState.anchor = { x: anchorInputX, y: anchorInputY };
  inputState.locked = true;
  inputState.align = 'rtl';
  overlaySpeechStates.add(inputState);

  const bufferChars = [];
  const state = {
    questState,
    inputState,
    bufferChars,
    resolve: null,
    reject: null,
    cursorVisible: true,
    blinkTimer: 0,
    update: null,
  };

  heldKeys.clear();
  pressedKeys.clear();
  gameplayInputEnabled = false;
  activePrompt = state;
  sceneState.cancelPrompt = result => detach(result ?? 'skip', false);

  const promise = new Promise((resolve, reject) => {
    state.resolve = resolve;
    state.reject = reject;
  });

  const onKeyDown = event => {
    const key = event.key;
    if (key === 'Enter') {
      event.preventDefault();
      const ascii = bufferChars.join('');
      const result = (state.transliterated ?? transliterateToHebrew(ascii)).trim();
      detach(result, false);
      return;
    }

    if (key === 'Escape') {
      event.preventDefault();
      detach('', true);
      return;
    }

    if (key === 'Backspace') {
      event.preventDefault();
      bufferChars.pop();
      refreshInputState();
      return;
    }

    if (key === ' ' || key === 'Space' || key === 'Spacebar') {
      event.preventDefault();
      if (bufferChars.length < MAX_INPUT_LENGTH) {
        bufferChars.push(' ');
        refreshInputState();
      }
      return;
    }

    if (key.length === 1) {
      const lower = key.toLowerCase();
      if (/^[a-z ]$/.test(lower)) {
        if (bufferChars.length < MAX_INPUT_LENGTH) {
          bufferChars.push(lower);
          refreshInputState();
        }
        event.preventDefault();
      }
    }
  };

  function detach(result, isReject = false) {
    overlaySpeechStates.delete(questState);
    overlaySpeechStates.delete(inputState);
    questState.active = false;
    inputState.active = false;
    window.removeEventListener('keydown', onKeyDown, true);
    gameplayInputEnabled = true;
    activePrompt = null;
    sceneState.cancelPrompt = null;
    if (isReject) {
      state.reject(result);
    } else {
      state.resolve(result);
    }
  }

  function refreshInputState() {
    const ascii = bufferChars.join('');
    const hebrew = transliterateToHebrew(ascii);
    state.transliterated = hebrew;
    const display = '|' + hebrew;
    const { lines, sequence, lineLengths, maxLineLength } = layoutText(display, textRenderer, TEXT_WRAP);

    const cursorGlyph = state.cursorVisible ? '|' : ' ';
    const cursorNode = sequence.find(node => node.line === 0 && node.column === 0);
    if (cursorNode) {
      cursorNode.char = cursorGlyph;
    }

    const charWidth = textRenderer.width;
    const charSpacing = textRenderer.spacing;
    const lineSpacing = textRenderer.lineSpacing;
    const charAdvance = charWidth + charSpacing;
    const lineAdvance = textRenderer.height + lineSpacing;

    const textWidth = maxLineLength > 0 ? maxLineLength * charAdvance - charSpacing : 0;
    const textHeight = lines.length > 0 ? lines.length * lineAdvance - lineSpacing : 0;

    inputState.lines = lines;
    inputState.lineLengths = lineLengths;
    inputState.sequence = sequence;
    inputState.totalChars = sequence.length;
    inputState.visible = sequence.length;
    inputState.width = Math.max(18, textWidth + inputState.paddingX * 2);
    inputState.height = Math.max(12, textHeight + inputState.paddingY * 2);
    inputState.anchor = { x: anchorInputX, y: anchorInputY };
    inputState.active = true;
    state.transliterated = hebrew.trim();
  }

  refreshInputState();
  window.addEventListener('keydown', onKeyDown, true);

  state.update = delta => {
    state.blinkTimer += delta;
    if (state.blinkTimer >= 0.5) {
      state.blinkTimer = 0;
      state.cursorVisible = !state.cursorVisible;
      refreshInputState();
    }
  };

  return promise.finally(() => {
    questState.active = false;
    inputState.active = false;
  });
}

function createWizardSprites(c) {
  const art = [
    '..........hhh............',
    '.........hhHHh...........',
    '........hhHHHHh..........',
    '........hhHHHHh..........',
    '.......hhHHHHHHh.........',
    '......thhHHHHHHht........',
    '......thHHHHHHHHt........',
    '.....thhHHHHHHHHht.......',
    '.....thhHHHHHHHHht.......',
    '....thhhHHHHHHHHhht......',
    '....thhhhhHHHHhhhhht.....',
    '....thhhhhHHHHhhhhht.....',
    '....thhhhhHHHHhhhhht.....',
    '.....thhhhHHHHhhhhht.....',
    '......thhhhHHhhhhht......',
    '.......thhhhhhhhht.......',
    '........thssssshht.......',
    '.........tbbbbbbt........',
    '.........tbbdbbbt........',
    '........tsbbdbbbst.......',
    '.......tsrbbdbrrst.......',
    '......tsrrbbdrrrst.......',
    '.....tsrrrbdrrrrst.......',
    '....tsrrRRRRRRRRst.......',
    '...tsrRRRRRRRRRRst.......',
    '...tsRRRRRRRRRRRst.......',
    '..tsRRRRRRRRRRRRst.......',
    '..tsRRRRRRRRRRRRst.......',
    '..tsRRRRRRRRRRRRst.......',
    '..tsRRRRRRRRRRRRst.......',
    '..tsRRRRRRRRRRRRst.......',
    '..csRRRRRRRRRRRRst.......',
    '..csRRRRRRRRRRRRst.......',
    '..cgRRRRRRRRRRRRgt.......',
    '..cgRRRRRRRRRRRRgt.......',
    '..cgRRRRRRRRRRRRgt.......',
    '..cgRRRRRRRRRRRRgt.......',
    '..cgRRRRRRRRRRRRgt.......',
    '..cgRRRRRRRRRRRRgt.......',
    '..cgRRRRRRRRRRRRgt.......',
    '..BBRRRRRRRRRRRRBB.......',
  ];
  const legend = {
    '.': c.transparent,
    'h': c.wizardHat,
    'H': c.wizardHatHighlight,
    't': c.staffWood,
    's': c.wizardSkin,
    'b': c.wizardBeard,
    'd': c.wizardBeardShadow,
    'r': c.wizardRobe,
    'R': c.wizardRobeHighlight,
    'c': c.wizardGlove,
    'g': c.wizardBelt,
    'B': c.wizardBoot,
  };
  const right = spriteFromStrings(art, legend);
  return { right, left: mirrorSprite(right) };
}

function createDoorSprite(c) {
  const width = 24;
  const height = 44;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);
  const frame = c.hutShadow;
  const panel = c.hutFloor;
  const glow = c.hutGlow;
  const metal = c.wizardBelt;

  const frameThickness = 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const onBorder =
        y < frameThickness ||
        y >= height - frameThickness ||
        x < frameThickness ||
        x >= width - frameThickness;

      if (onBorder) {
        pixels[idx] = frame;
        continue;
      }

      let color = panel;
      if (x === frameThickness || x === frameThickness + 1) {
        color = glow;
      } else if ((x - frameThickness) % 6 === 0) {
        color = glow;
      } else if (y % 8 === 0) {
        color = c.dirt;
      }

      pixels[idx] = color;
    }
  }

  const handleY = Math.floor(height * 0.52);
  for (let y = handleY - 1; y <= handleY + 1; y++) {
    const idx = y * width + (width - frameThickness - 3);
    pixels[idx] = metal;
  }

  return new Sprite(width, height, pixels);
}

function createDonkeySprites(c) {
  const art = [
    '..............................1111',
    '..............................2211',
    '...........................112217.',
    '.........................11222177.',
    '.......................2122222112.',
    '.....................212221111122.',
    '...22211122.......2112222111111222',
    '..22211111122211111111121171111222',
    '..22111111111111111171111172211122',
    '.222111111111111112111111172211143',
    '.222111111111111112211111111222432',
    '.222211111111111112221121111224421',
    '.22221221111111111122112221...4217',
    '22222122111111111122212221........',
    '2122224222111111112221222.........',
    '2124242144422222222422222.........',
    '112442172444444442233222..........',
    '.1234177.42222221113321...........',
    '11142111..211111112342............',
    '1242242.......2..43342............',
    '1342442..........3432.............',
    '.33444...........3432.............',
    '.33.44..........33434.............',
    '333.44..........34434.............',
    '334.222.........34433.............',
    '444.222.........3343..............',
  ];
  const legend = {
    '.': c.transparent,
    '1': c.donkeyShadow,
    '2': c.donkeyFur,
    '3': c.donkeyHighlight,
    '4': c.donkeyMuzzle,
    '5': c.donkeyEarInner,
    '6': c.donkeyEyeWhite,
    '7': c.donkeyEye,
  };
  const right = spriteFromStrings(art, legend);
  return { right, left: mirrorSprite(right) };
}

function createWaterSprite(c) {
  const width = 128;
  const height = 28;
  const pixels = new Uint8Array(width * height);
  const highlight = c.dawnSkyMid;
  const surface = c.riverWater;
  const depth = c.nightSkyMid;

  for (let y = 0; y < height; y++) {
    const ratio = y / (height - 1);
    let baseColor;
    if (ratio < 0.25) {
      baseColor = highlight;
    } else if (ratio < 0.65) {
      baseColor = surface;
    } else {
      baseColor = depth;
    }

    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      let color = baseColor;

      if (y < 6) {
        const wave = Math.sin((x / width) * Math.PI * 4 + y * 0.6);
        if (wave > 0.3) {
          color = highlight;
        }
      }

      if (y > height - 6) {
        const undertow = Math.sin((x / width) * Math.PI * 2 + y * 0.4);
        if (undertow < -0.2) {
          color = depth;
        }
      }

      pixels[idx] = color;
    }
  }

  return new Sprite(width, height, pixels);
}

function createCloudSprites(c) {
  const sizes = [
    { width: 46, height: 16 },
    { width: 38, height: 14 },
    { width: 52, height: 18 },
  ];
  return sizes.map(size => generateCloudSprite(size.width, size.height, c));
}

function createClouds(cloudSprites) {
  const list = [];
  for (let i = 0; i < 6; i++) {
    const sprite = cloudSprites[i % cloudSprites.length];
    list.push({
      sprite,
      x: i * 72 + Math.random() * 40,
      baseY: 28 + (i % 3) * 18,
      y: 0,
      speed: 6 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return list;
}

function generateCloudSprite(width, height, c) {
  const pixels = new Uint8Array(width * height);
  const centerX = (width - 1) / 2;
  const centerY = (height - 1) / 2;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - centerX) / (width / 2);
      const dy = (y - centerY) / (height / 2);
      const dist = Math.sqrt(dx * dx * 0.6 + dy * dy);
      let color;
      if (dist < 0.55) {
        color = c.cloudHighlight;
      } else if (dist < 0.85) {
        color = c.cloudLight;
      } else if (dist < 1) {
        color = c.cloudShade;
      } else {
        color = c.transparent;
      }
      pixels[y * width + x] = color;
    }
  }
  return new Sprite(width, height, pixels);
}

function groundLineFor(sprite) {
  return HEIGHT - GROUND_HEIGHT - sprite.height;
}

ambiencePresets = createAmbiencePresets(colors);
setAmbience('exteriorDay', { immediate: true });
