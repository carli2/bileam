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
  mapGlyphChar,
  wrapText,
} from './graphics.js';

/*
 * Engine Contract Notes
 * ---------------------
 * - Dialogue helpers (`say`, `promptBubble`, `showLevelTitle`, waiters) must
 *   abort immediately when a skip has been requested. This file owns the
 *   central guards so level scripts can rely on consistent behaviour.
 * - Skip handling always flows through `requestSkip` / `setSkipHandler`; do not
 *   short-circuit those paths inside level scripts.
 * - Level scripts must treat this module as the single source of gameplay
 *   control flow – they provide narrative sequencing only.
 */
import { transliterateToHebrew } from './game.helpers.js';
import { GLYPH_PATTERNS } from './glyphPatterns.js';

export class SkipSignal extends Error {
  constructor(reason = 'skip') {
    super(reason);
    this.reason = reason;
  }
}

const WIDTH = 320;
const HEIGHT = 200;
const GROUND_HEIGHT = 8;
const MOVE_SPEED = 78;
const GRAVITY = 280;
const JUMP_FORCE = 180;
const TEXT_WRAP = 26;
const CAMERA_MARGIN = 96;
const CAMERA_EASE = 0.12;
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
  skipRequested: false,
  skipReason: null,
  pendingSkipReason: null,
};

const hudState = {
  player: null,
  enemy: null,
};

function ensureSkipSignal(reason) {
  if (reason instanceof SkipSignal) return reason;
  const finalReason = reason ?? sceneState.skipReason ?? 'skip';
  return new SkipSignal(finalReason);
}

function throwIfSkipRequested() {
  if (sceneState.skipRequested) {
    throw ensureSkipSignal();
  }
}

const ambienceState = {
  key: null,
  config: null,
};

const narrationSpeech = createSpeechState();
const overlaySpeechStates = new Set();
let speechQueue = Promise.resolve();
const propSprites = {};
const propSpriteFactories = {};
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

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let touchControlsAttached = false;
const touchState = {
  id: null,
  startX: 0,
  startY: 0,
};

const controls = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright']);
const heldKeys = new Set();
const pressedKeys = new Set();
const SPEECH_ACK_KEYS = new Set(['Enter', ' ', 'Space', 'Spacebar']);

function haltPlayerMotion() {
  wizard.vx = 0;
  donkey.vx = 0;
  heldKeys.clear();
  pressedKeys.clear();
}

let gameplayInputEnabled = true;
let activePrompt = null;
let cameraX = 0;
let cameraDelta = 0;
const cameraFocusStack = [];
let lastTime = performance.now();
let pendingSpeechAck = null;
let sceneStarted = false;
let sceneSuspended = false;

let ambiencePresets;
export const levelAmbiencePlan = createLevelSceneMap();
const titleOverlay = {
  active: false,
  text: '',
  until: 0,
  resolve: null,
  reject: null,
  lines: [],
};

const glyphOverlay = {
  active: false,
  letter: '',
  label: '',
  meaning: '',
  until: 0,
  resolve: null,
  reject: null,
  previousInputEnabled: true,
};

let glyphFadeFrame = null;
let glyphFadeToken = 0;
let glyphFadeAlpha = 0;
let glyphFadeStart = 0;
let glyphFadeDuration = 0;
let glyphFadeStartAlpha = 0;
let glyphFadeTarget = 1;

const TITLE_WRAP_LIMIT = 22;

function prepareTitleLines(text) {
  if (text == null) return [''];
  const segments = String(text)
    .replace(/\r/g, '')
    .split(/\n+/)
    .map(chunk => chunk.trim())
    .filter(Boolean);
  if (segments.length === 0) {
    return [''];
  }
  const lines = [];
  segments.forEach(chunk => {
    const wrapped = wrapText(chunk, TITLE_WRAP_LIMIT);
    wrapped.forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        lines.push(trimmed);
      }
    });
  });
  return lines.length > 0 ? lines : [''];
}

function cancelGlyphFade() {
  glyphFadeToken += 1;
  if (glyphFadeFrame) {
    cancelAnimationFrame(glyphFadeFrame);
    glyphFadeFrame = null;
  }
}

function startGlyphFade(targetAlpha, duration, { resolveOnComplete = false } = {}) {
  if (!glyphOverlay.active) return;
  cancelGlyphFade();
  const token = ++glyphFadeToken;
  glyphFadeStart = performance.now();
  glyphFadeDuration = Math.max(1, duration);
  glyphFadeStartAlpha = glyphFadeAlpha;
  glyphFadeTarget = targetAlpha;

  const step = now => {
    if (glyphFadeToken !== token) return;
    const t = Math.min(1, (now - glyphFadeStart) / glyphFadeDuration);
    glyphFadeAlpha = glyphFadeStartAlpha + (glyphFadeTarget - glyphFadeStartAlpha) * t;
    if (t >= 1) {
      glyphFadeFrame = null;
      if (resolveOnComplete) {
        const resolver = glyphOverlay.resolve;
        glyphOverlay.resolve = null;
        resolver?.();
      }
      return;
    }
    glyphFadeFrame = requestAnimationFrame(step);
  };

  glyphFadeFrame = requestAnimationFrame(step);
}

export function startScene(mainCallback) {
  if (sceneStarted) {
    throw new Error('Scene already started');
  }
  sceneStarted = true;
  initSprites();
  setupEventListeners();
  if (isTouchDevice) {
    setupTouchMode();
  }
  lastTime = performance.now();
  requestAnimationFrame(loop);
  if (typeof mainCallback === 'function') {
    Promise.resolve().then(mainCallback).catch(err => {
      console.error(err);
    });
  }
}

export function say(x, y, text, options = {}) {
  if (sceneState.skipRequested) {
    return Promise.reject(ensureSkipSignal());
  }

  const runSpeech = async () => {
    throwIfSkipRequested();
    const wasEnabled = gameplayInputEnabled;
    gameplayInputEnabled = false;
    haltPlayerMotion();
    try {
      pendingSpeechAck = narrationSpeech;
      await beginSpeech(
        narrationSpeech,
        textRenderer,
        TEXT_WRAP,
        x,
        y,
        text,
        { ...options, awaitAck: options.awaitAck ?? true },
      );
      throwIfSkipRequested();
    } finally {
      if (pendingSpeechAck === narrationSpeech) {
        pendingSpeechAck = null;
      }
      gameplayInputEnabled = wasEnabled;
    }
  };

  const result = speechQueue.then(runSpeech);
  speechQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export function promptBubble(x1, y1, text, x2, y2) {
  return createPromptBubble(x1, y1, text, x2, y2);
}

export function setLifeBars(bars) {
  if (!bars) {
    hudState.player = null;
    hudState.enemy = null;
    return;
  }
  hudState.player = bars.player ?? null;
  hudState.enemy = bars.enemy ?? null;
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

export function pushCameraFocus(worldX) {
  const target = Math.max(0, worldX - CAMERA_MARGIN);
  cameraFocusStack.push(target);
}

export function popCameraFocus() {
  cameraFocusStack.pop();
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
  if (sceneState.skipRequested) return Promise.reject(ensureSkipSignal());
  const tolerance = Math.max(0, options.tolerance ?? 6);
  const direction = options.direction ?? (targetX >= getWizardCenterX() ? 1 : -1);
  const resultValue = options.value ?? 'reached';
  const abortOnSkip = options.abortOnSkip !== false;

  return new Promise((resolve, reject) => {
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
      reject,
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
    deactivateTitleOverlay();
    return Promise.resolve();
  }

  if (sceneState.skipRequested) {
    return Promise.reject(ensureSkipSignal());
  }

  deactivateTitleOverlay();

  titleOverlay.active = true;
  titleOverlay.text = String(text);
  titleOverlay.lines = prepareTitleLines(text);
  titleOverlay.until = performance.now() + Math.max(0, duration);

  return new Promise((resolve, reject) => {
    titleOverlay.resolve = resolve;
    titleOverlay.reject = reject;
  });
}

export function showGlyphReveal(letter, label, meaning, duration = 2100) {
  if (sceneState.skipRequested) {
    return Promise.reject(ensureSkipSignal());
  }
  const trimmedLetter = String(letter ?? '').trim();
  const trimmedLabel = String(label ?? '').trim();
  const trimmedMeaning = String(meaning ?? '').trim();
  if (!trimmedLetter || !trimmedLabel) {
    return Promise.resolve();
  }

  const previousInput = gameplayInputEnabled;
  deactivateGlyphOverlay(null);
  gameplayInputEnabled = false;
  haltPlayerMotion();

  glyphOverlay.active = true;
  glyphOverlay.letter = trimmedLetter;
  glyphOverlay.label = trimmedLabel;
  glyphOverlay.meaning = trimmedMeaning;
  glyphOverlay.until = Number.POSITIVE_INFINITY;
  glyphOverlay.previousInputEnabled = previousInput;
  glyphFadeAlpha = 0;
  cancelGlyphFade();
  startGlyphFade(1, Math.max(240, Math.min(duration, 720)));

  return new Promise((resolve, reject) => {
    glyphOverlay.resolve = resolve;
    glyphOverlay.reject = reject;
  });
}

function deactivateTitleOverlay(reason = null) {
  const resolver = titleOverlay.resolve;
  const rejecter = titleOverlay.reject;
  titleOverlay.resolve = null;
  titleOverlay.reject = null;
  const wasActive = titleOverlay.active;
  titleOverlay.active = false;
  titleOverlay.until = 0;
  titleOverlay.text = '';
  titleOverlay.lines = [];
  if (!wasActive && !resolver && !rejecter) return;

  if (reason instanceof SkipSignal) {
    rejecter?.(reason);
    return;
  }
  if (reason === 'skip') {
    rejecter?.(ensureSkipSignal('skip'));
    return;
  }

  resolver?.();
}

function deactivateGlyphOverlay(reason = null, { immediate = false } = {}) {
  if (!glyphOverlay.active) {
    if (immediate) {
      const resolver = glyphOverlay.resolve;
      glyphOverlay.resolve = null;
      resolver?.();
    }
    return;
  }

  const resolver = glyphOverlay.resolve;
  const rejecter = glyphOverlay.reject;
  const previousInput = glyphOverlay.previousInputEnabled ?? true;

  const finalize = finalReason => {
    cancelGlyphFade();
    glyphFadeAlpha = 0;
    glyphOverlay.active = false;
    glyphOverlay.letter = '';
    glyphOverlay.label = '';
    glyphOverlay.meaning = '';
    glyphOverlay.until = 0;
    glyphOverlay.resolve = null;
    glyphOverlay.reject = null;
    glyphOverlay.previousInputEnabled = true;
    gameplayInputEnabled = previousInput;

    if (finalReason instanceof SkipSignal) {
      rejecter?.(finalReason);
      return;
    }
    if (finalReason === 'skip') {
      rejecter?.(ensureSkipSignal('skip'));
      return;
    }
    resolver?.();
  };

  if (immediate) {
    finalize(reason);
    return;
  }

  glyphOverlay.resolve = () => finalize(reason ?? 'done');
  glyphOverlay.reject = rejecter;
  startGlyphFade(0, 280, { resolveOnComplete: true });
}

export async function fadeToBase(duration) {
  throwIfSkipRequested();
  await paletteFader.fadeToBase(duration);
  throwIfSkipRequested();
}

export async function fadeToBlack(duration) {
  throwIfSkipRequested();
  await paletteFader.fadeToBlack(duration);
  throwIfSkipRequested();
}

export function setSceneSuspended(suspended) {
  sceneSuspended = Boolean(suspended);
}

export function setSkipHandler(handler) {
  sceneState.skipRequested = false;
  sceneState.skipReason = null;
  sceneState.skipCurrentLevel = reason => {
    const finalReason = typeof handler === 'function'
      ? handler(reason)
      : reason;
    requestSkip(finalReason ?? 'skip');
  };
  if (sceneState.pendingSkipReason) {
    const pending = sceneState.pendingSkipReason;
    sceneState.pendingSkipReason = null;
    sceneState.skipCurrentLevel(pending);
  }
}

export function clearSkipHandler() {
  sceneState.skipCurrentLevel = null;
  sceneState.cancelPrompt = null;
  sceneState.skipRequested = false;
  sceneState.skipReason = null;
  sceneState.pendingSkipReason = null;
}

export function clearSkipState() {
  sceneState.skipRequested = false;
  sceneState.skipReason = null;
}

function requestSkip(reason = 'skip') {
  if (!sceneState.skipCurrentLevel) {
    sceneState.pendingSkipReason = reason ?? 'skip';
    return;
  }
  if (sceneState.skipRequested) return;
  sceneState.skipRequested = true;
  sceneState.skipReason = reason;
  hudState.player = null;
  hudState.enemy = null;
  const skipError = ensureSkipSignal(reason);
  deactivateTitleOverlay(skipError);
  deactivateGlyphOverlay(skipError, { immediate: true });
  resolveWaitersOnSkip(skipError);
  if (pendingSpeechAck) {
    acknowledgeSpeech(pendingSpeechAck, performance.now());
    pendingSpeechAck = null;
  }
  if (sceneState.cancelPrompt) {
    const cancel = sceneState.cancelPrompt;
    sceneState.cancelPrompt = null;
    cancel(skipError);
  }
  if (narrationSpeech.active) {
    narrationSpeech.active = false;
    narrationSpeech.sequence = [];
    narrationSpeech.lines = [];
    const reject = narrationSpeech.reject;
    narrationSpeech.resolve = null;
    narrationSpeech.reject = null;
    reject?.(skipError);
  }
  overlaySpeechStates.forEach(state => {
    state.active = false;
    state.sequence = [];
    state.lines = [];
    if (typeof state.reject === 'function') {
      const rejecter = state.reject;
      state.resolve = null;
      state.reject = null;
      rejecter(skipError);
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
  propSprites.stoneArch = createStoneArchSprite(colors);
  propSprites.fountainDry = createFountainSprite(colors, false);
  propSprites.fountainFilled = createFountainSprite(colors, true);
  propSprites.monolithDormant = createMonolithSprite(colors, false);
  propSprites.monolithAwakened = createMonolithSprite(colors, true);
  propSprites.soundGlyph = createSoundGlyphSprite(colors);
  propSprites.waterGlyph = createWaterGlyphSprite(colors);
  propSprites.basaltSpireTall = createBasaltSpireSprite(colors, 'tall');
  propSprites.basaltSpireMid = createBasaltSpireSprite(colors, 'mid');
  propSprites.basaltSpireShort = createBasaltSpireSprite(colors, 'short');
  propSprites.stalactite = createStalactiteSprite(colors);
  propSprites.canyonMist = createCanyonMistSprite(colors);
  propSprites.gardenBackdropTrees = createGardenBackdropSprite(colors);
  propSprites.balakStatue = createBalakStatueSprite(colors, false);
  propSprites.balakStatueOvergrown = createBalakStatueSprite(colors, true);
  propSprites.balakFigure = createBalakFigureSprite(colors);
  propSprites.irrigationChannels = createIrrigationSprite(colors);
  propSprites.sunStoneDormant = createSunStoneSprite(colors, false);
  propSprites.sunStoneAwakened = createSunStoneSprite(colors, true);
  propSprites.resonanceRockDormant = createResonanceRockSprite(colors, false);
  propSprites.resonanceRockAwakened = createResonanceRockSprite(colors, true);
  propSprites.gardenForegroundPlant = createGardenForegroundSprite(colors);
  propSprites.gardenWheatBundle = createGardenWheatSprite(colors, false);
  propSprites.gardenWheatHarvested = createGardenWheatSprite(colors, true);
  propSprites.gardenAltar = createGardenAltarSprite(colors);
  propSprites.gardenBreadLight = createGardenBreadLightSprite(colors);
  propSprites.golemGuardian = createGolemGuardianSprite(colors);
  propSprites.marketBackdrop = createMarketBackdropSprite(colors);
  propSprites.marketStall = createMarketStallSprite(colors);
  propSprites.marketBanner = createMarketBannerSprite(colors);
  propSprites.scribeBooth = createScribeBoothSprite(colors);
  propSprites.wordSpirit = createWordSpiritSprite(colors);
  propSprites.balakEmissary = createBalakEmissarySprite(colors);
  propSprites.balakAdvisor = createBalakAdvisorSprite(colors);
  propSprites.moabWallWatcher = createMoabWallWatcherSprite(colors);
  propSprites.hoofSignTrail = createHoofSignTrailSprite(colors);
  propSprites.sandVisionRingDormant = createSandVisionRingDormantSprite(colors);
  propSprites.sandVisionRingActive = createSandVisionRingActiveSprite(colors);
  propSprites.resonanceRingDormant = createResonanceRingDormantSprite(colors);
  propSprites.resonanceRingActive = createResonanceRingActiveSprite(colors);
  propSprites.nightCampfire = createNightCampfireSprite(colors);
  propSprites.envoyShadow = createEnvoyShadowSprite(colors);
  propSprites.temptationVessel = createTemptationVesselSprite(colors);
  propSprites.temptationVesselAshes = createTemptationVesselAshSprite(colors);
  propSprites.borderProcessionPath = createBorderProcessionPathSprite(colors);
  propSprites.borderMilestone = createBorderMilestoneSprite(colors);
  propSprites.borderThorn = createBorderThornSprite(colors);
  propSprites.watchFireDormant = createWatchFireSprite(colors, 'dormant');
  propSprites.watchFireAwakened = createWatchFireSprite(colors, 'awakened');
  propSprites.watchFireVeiled = createWatchFireSprite(colors, 'veiled');
  propSpriteFactories.noGlyphShard = definition => {
    const letter = definition?.data?.letter ?? definition?.letter ?? '';
    return createGlyphShardSprite(colors, letter);
  };
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
  if (event.key === 'Escape') {
    event.preventDefault();
    if (typeof sceneState.skipCurrentLevel === 'function') {
      sceneState.skipCurrentLevel('skip');
    } else {
      requestSkip('skip');
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
  if (glyphOverlay.active) {
    deactivateGlyphOverlay('done');
    if (event) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }
    return;
  }
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
  const delta = Math.min(0.05, (time - lastTime) / 1000);
  lastTime = time;

  if (sceneSuspended) {
    pressedKeys.clear();
    requestAnimationFrame(loop);
    return;
  }

  if (titleOverlay.active && time >= titleOverlay.until) {
    deactivateTitleOverlay('done');
  }

  updateWizard(delta);
  updateDonkey(delta, time);
  updateClouds(delta, time);

  const previousCameraX = cameraX;
  updateCamera();
  cameraDelta = cameraX - previousCameraX;
  processWaiters();

  drawScene();
  renderHud();

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
    const lines = (titleOverlay.lines && titleOverlay.lines.length > 0)
      ? titleOverlay.lines
      : [String(titleOverlay.text)];
    const lineHeight = 28;
    const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });
    ctx.restore();
  }

  if (glyphOverlay.active) {
    ctx.save();
    const alpha = Math.max(0, Math.min(1, glyphFadeAlpha));
    ctx.fillStyle = `rgba(0, 0, 0, ${0.68 * alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgba(255, 232, 168, ${alpha})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '96px \"Frank Ruehl\", \"Noto Sans Hebrew\", serif';
    ctx.fillText(glyphOverlay.letter, canvas.width / 2, canvas.height / 2 - 52);
    ctx.font = '32px \"Palatino Linotype\", \"Book Antiqua\", serif';
    ctx.fillText(glyphOverlay.label, canvas.width / 2, canvas.height / 2 + 6);
    if (glyphOverlay.meaning) {
      ctx.font = '20px \"Palatino Linotype\", \"Book Antiqua\", serif';
      ctx.fillText(glyphOverlay.meaning, canvas.width / 2, canvas.height / 2 + 44);
    }
    ctx.restore();
  }

  pressedKeys.clear();
  requestAnimationFrame(loop);
}

function updateWizard(delta) {
  const leftHeld = heldKeys.has('a') || heldKeys.has('arrowleft');
  const rightHeld = heldKeys.has('d') || heldKeys.has('arrowright');
  const downHeld = heldKeys.has('s') || heldKeys.has('arrowdown');
  const upHeld = heldKeys.has('w') || heldKeys.has('arrowup');
  const left = gameplayInputEnabled && leftHeld;
  const right = gameplayInputEnabled && rightHeld;
  const crouch = gameplayInputEnabled && downHeld;
  const jumpPressed = gameplayInputEnabled && (pressedKeys.has('w') || pressedKeys.has('arrowup'));

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
  if (!upHeld && wizard.vy < 0) {
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

function renderHud() {
  const lineAdvance = textRenderer.height + textRenderer.lineSpacing;
  if (hudState.player?.text) {
    const lines = String(hudState.player.text).split('\n');
    const totalHeight = lines.length * lineAdvance - textRenderer.lineSpacing;
    const baseY = buffer.height - totalHeight - 4;
    drawHudBlock(lines, 4, baseY, 'left');
  }
  if (hudState.enemy?.text) {
    const lines = String(hudState.enemy.text).split('\n');
    const totalHeight = lines.length * lineAdvance - textRenderer.lineSpacing;
    const baseY = 4;
    drawHudBlock(lines, buffer.width - 4, baseY, 'right');
  }
}

function drawHudBlock(lines, anchorX, startY, align) {
  const lineAdvance = textRenderer.height + textRenderer.lineSpacing;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const y = Math.round(startY + index * lineAdvance);
    drawHudLine(line, anchorX, y, align);
  }
}

function drawHudLine(text, anchorX, y, align) {
  if (!text) return;
  const glyphs = textRenderer.glyphs;
  const charWidth = textRenderer.width;
  const charSpacing = textRenderer.spacing;
  const length = text.length;
  if (length === 0) return;
  const totalWidth = length * (charWidth + charSpacing) - charSpacing;
  let startX = anchorX;
  if (align === 'right') {
    startX = anchorX - totalWidth;
  }
  for (let i = 0; i < length; i++) {
    const char = text[i];
    const glyphKey = mapGlyphChar(char, glyphs);
    const glyph = glyphs[glyphKey];
    if (!glyph) continue;
    const gx = Math.round(startX + i * (charWidth + charSpacing));
    blitSprite(buffer, glyph, gx, y, { transparent: colors.transparent });
  }
}

function setKeyState(key, pressed) {
  const lower = key.toLowerCase();
  if (pressed) {
    if (!heldKeys.has(lower)) {
      heldKeys.add(lower);
      pressedKeys.add(lower);
    }
  } else {
    heldKeys.delete(lower);
  }
}

function triggerKeyPress(key) {
  pressedKeys.add(key.toLowerCase());
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
            const wave = Math.sin(worldX * 0.045);
            if (wave > 0.3) {
              pixels[idx] = palette.bright;
            } else if (wave < -0.3) {
              pixels[idx] = palette.dark;
            } else {
              pixels[idx] = palette.shadow;
            }
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
  const sorted = sceneProps
    .map((prop, index) => ({ prop, index }))
    .sort((a, b) => {
      const layerA = a.prop.layer ?? 0;
      const layerB = b.prop.layer ?? 0;
      if (layerA !== layerB) {
        return layerA - layerB;
      }
      const parallaxA = a.prop.parallax ?? 1;
      const parallaxB = b.prop.parallax ?? 1;
      if (parallaxA !== parallaxB) {
        return parallaxA - parallaxB;
      }
      return a.index - b.index;
    });
  for (const entry of sorted) {
    const prop = entry.prop;
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
  let sprite = definition.sprite ?? null;
  if (!sprite && type) {
    const factory = propSpriteFactories[type];
    if (typeof factory === 'function') {
      sprite = factory(definition);
    } else {
      sprite = propSprites[type];
    }
  }
  if (!sprite) return null;

  const prop = {
    id: definition.id ?? type ?? null,
    type,
    sprite,
    x: definition.x ?? 0,
    y: definition.y ?? computePropY(sprite, definition.align ?? 'ground', definition.offsetY ?? 0),
    parallax: definition.parallax ?? 1,
    layer: definition.layer ?? 0,
    visible: definition.visible !== false,
    data: definition.data ?? (definition.letter ? { letter: definition.letter } : null),
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
      waiter.reject?.(ensureSkipSignal());
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

function resolveWaitersOnSkip(skipError) {
  if (activeWaiters.size === 0) return;
  for (const waiter of Array.from(activeWaiters)) {
    if (waiter.abortOnSkip === false) continue;
    activeWaiters.delete(waiter);
    waiter.reject?.(ensureSkipSignal(skipError));
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
      door: 'riverDawn',
    },
    level2: {
      review: 'riverDawn',
      learn: 'riverDawn',
      apply: 'riverDawn',
    },
    level3: {
      review: 'echoChamber',
      learn: 'echoChamber',
      apply: 'echoChamber',
    },
    level4: {
      review: 'gardenBloom',
      learn: 'gardenBloom',
      apply: 'gardenBloom',
    },
    level5_5: {
      review: 'echoChamber',
      learn: 'echoChamber',
      apply: 'echoChamber',
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
  const focusTarget = cameraFocusStack.length > 0
    ? cameraFocusStack[cameraFocusStack.length - 1]
    : Math.max(0, wizard.x - CAMERA_MARGIN);
  cameraX += (focusTarget - cameraX) * CAMERA_EASE;
}
function createPromptBubble(x1, y1, text, x2, y2) {
  if (sceneState.skipRequested) {
    return Promise.reject(ensureSkipSignal());
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
  beginSpeech(questState, textRenderer, TEXT_WRAP, anchorQuestX, anchorQuestY, text).catch(() => {});
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
    handleVirtualInput: null,
  };

  heldKeys.clear();
  pressedKeys.clear();
  gameplayInputEnabled = false;
  if (wizard) {
    wizard.vx = 0;
  }
  if (donkey) {
    donkey.vx = 0;
  }
  activePrompt = state;
  sceneState.cancelPrompt = reason => detach(reason ?? ensureSkipSignal(), true);

  const promise = new Promise((resolve, reject) => {
    state.resolve = resolve;
    state.reject = reject;
  });

  const handleInput = (key, event = null) => {
    const prevent = () => {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
    };

    if (key === 'Enter') {
      prevent();
      const ascii = bufferChars.join('');
      const result = (state.transliterated ?? transliterateToHebrew(ascii)).trim();
      detach(result, false);
      return;
    }

    if (key === 'Escape') {
      prevent();
      if (typeof sceneState.skipCurrentLevel === 'function') {
        sceneState.skipCurrentLevel('skip');
      } else {
        requestSkip('skip');
      }
      return;
    }

    if (key === 'Backspace') {
      prevent();
      if (bufferChars.length > 0) {
        bufferChars.pop();
      }
      refreshInputState();
      return;
    }

    if (key === ' ' || key === 'Space' || key === 'Spacebar') {
      prevent();
      if (bufferChars.length < MAX_INPUT_LENGTH) {
        bufferChars.push(' ');
        refreshInputState();
      }
      return;
    }

    if (typeof key === 'string' && key.length === 1) {
      const char = key.toLowerCase ? key.toLowerCase() : key;
      if (bufferChars.length < MAX_INPUT_LENGTH) {
        bufferChars.push(char);
        refreshInputState();
      }
      prevent();
    }
  };

  const onKeyDown = event => {
    handleInput(event.key, event);
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
    state.handleVirtualInput = null;
    if (isReject) {
      state.reject(ensureSkipSignal(result));
    } else {
      state.resolve(result);
    }
  }

  function refreshInputState() {
    const ascii = bufferChars.join('');
    const hebrew = transliterateToHebrew(ascii);
    state.transliterated = hebrew;
    const display = hebrew + '|';
    const {
      lines,
      sequence,
      lineLengths,
      maxLineLength,
      lineDirections,
    } = layoutText(display, textRenderer, TEXT_WRAP, {
      reverseHebrewInMixedLines: false,
    });

    const cursorGlyph = state.cursorVisible ? '|' : ' ';
    const primaryLineLength = lineLengths[0] ?? 0;
    const cursorColumn = Math.max(0, primaryLineLength - 1);
    const cursorNode = sequence.find(node => node.line === 0 && node.column === cursorColumn);
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
    inputState.lineDirections = lineDirections;
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

  state.handleVirtualInput = key => {
    handleInput(key, null);
  };

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

function createGolemGuardianSprite(c) {
  const baseArt = [
    '............hhhhh.............',
    '.........hhhGGGGGhhh..........',
    '.......hhGGGGGGGGGhh..........',
    '......hGGGGGGGGGGGGh..........',
    '.....hGGGGGGGGGGGGGGh.........',
    '.....hGGGGgGGGGgGGGGh.........',
    '....hGGGGGGGGGGGGGGGGh........',
    '....hGGGGGGGGGGGGGGGGh........',
    '...hGGGGGGGGGGGGGGGGGh........',
    '...hGGGGhhhGGGGGhhhGGh........',
    '...hGGGGh..hGGGGh..GGh........',
    '...hGGGGh..hGGGGh..GGh........',
    '...hGGGGh..hGGGGh..GGh........',
    '...hGGGGhhhGGGGGhhhGGh........',
    '...hGGGGGGGGGGGGGGGGGh........',
    '...hGGGGGGGGGGGGGGGGGh........',
    '...hGGGGGGGGGGGGGGGGGh........',
    '...hGGGGGGGGGGGGGGGGGh........',
    '...hGGGGhHHHHHHHHhGGGh........',
    '....hGGg........gGGh..........',
    '....hGGg........gGGh..........',
    '....hGGh........hGGh..........',
    '....hGGh........hGGh..........',
    '.....hh..........hh...........',
    '.....hh..........hh...........',
  ];
  const legend = {
    '.': c.transparent,
    'h': c.donkeyShadow,
    'G': c.donkeyFur,
    'g': c.donkeyHighlight,
    'H': c.courtMarble,
  };
  const factor = 4;
  const baseHeight = baseArt.length;
  const baseWidth = baseArt[0].length;
  const width = baseWidth * factor;
  const height = baseHeight * factor;
  const pixels = new Uint8Array(width * height);

  for (let by = 0; by < baseHeight; by++) {
    const row = baseArt[by];
    for (let bx = 0; bx < baseWidth; bx++) {
      const key = row[bx];
      const color = legend[key];
      if (color == null) continue;
      for (let fy = 0; fy < factor; fy++) {
        const y = by * factor + fy;
        for (let fx = 0; fx < factor; fx++) {
          const x = bx * factor + fx;
          pixels[y * width + x] = color;
        }
      }
    }
  }

  return new Sprite(width, height, pixels);
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

function createBalakFigureSprite(c) {
  const art = [
    '............okko.............',
    '...........okkkko............',
    '..........ookkkkoo...........',
    '.........oosssssoo...........',
    '........oossssssoo...........',
    '.......oosssssssso...........',
    '.......oosssssssso...........',
    '......oossnnnsssoo...........',
    '......oossnnnsssoo...........',
    '......oossnnnsssoo...........',
    '......oossnnnsssoo...........',
    '......oossnnnsssoo...........',
    '.....oorrRRRRRroo............',
    '....oorrRRRRRRroo............',
    '....oorrRRRRRRroo............',
    '...oorrRRRRRRRRoo............',
    '...oorrRRRRRRRRoo............',
    '...oorrRRRRRRRRoo............',
    '...oorrBBBBBBRRoo............',
    '...oorrBBBBBBRRoo............',
    '...oorrRRRRRRRRoo............',
    '...oorrRRRRRRRRoo............',
    '...oorrRRRRRRRRoo............',
    '...oorrRRRRRRRRoo............',
    '...oorrRRRRRRRRoo............',
    '...oo............oo..........',
  ];
  const legend = {
    '.': c.transparent,
    'o': c.wizardBoot,
    'k': c.wizardBelt,
    's': c.wizardSkin,
    'n': c.wizardBeardShadow,
    'r': c.wizardHat,
    'R': c.wizardHatHighlight,
    'B': c.marketFabric,
  };
  return spriteFromStrings(art, legend);
}

function createBalakAdvisorSprite(c) {
  const art = [
    '............hh............',
    '...........hHHh...........',
    '..........hHHHHh..........',
    '.........hHHHHHHh.........',
    '........hHHHHHHHHh........',
    '.......hHHHHHHHHHHh.......',
    '.......hHHbbbbbbHHh.......',
    '......hHHbbbbbbbbHHh......',
    '......hHHssssssssHHh......',
    '......hHHssssssssHHh......',
    '......hHHssssssssHHh......',
    '......hHHssssssssHHh......',
    '.....ooorrrrrrrrrroo......',
    '....ooorrrrrrrrrrroo......',
    '....oRRRRrrrrrrrrRRoo.....',
    '...oRRRRrrrrrrrrRRRoo.....',
    '...oRRRRrrrrrrrrRRRoo.....',
    '...oRRggggggggggRRRoo.....',
    '...oRRggggggggggRRRoo.....',
    '...oRRRRrrrrrrrrRRRoo.....',
    '...oRRRRrrrrrrrrRRRoo.....',
    '...oRRRRrrrrrrrrRRRoo.....',
    '...oRRRRrrrrrrrrRRRoo.....',
    '...oRRRRrrrrrrrrRRRoo.....',
    '...oo............oo.......',
  ];
  const legend = {
    '.': c.transparent,
    'h': c.wizardHat,
    'H': c.wizardHatHighlight,
    'b': c.wizardBeardShadow,
    's': c.wizardSkin,
    'o': c.wizardBoot,
    'r': c.marketFabric,
    'R': c.sanctumSky,
    'g': c.wizardBelt,
  };
  return spriteFromStrings(art, legend);
}

function createMoabWallWatcherSprite(c) {
  const art = [
    '............ttt.............',
    '............tTTt............',
    '............tTTTTt..........',
    '...........tTTTTTTt.........',
    '..........tTTsSSTTt.........',
    '..........tTTsSSTTt.........',
    '.........tTTsSSTTTt.........',
    '.........tTTddddTTt.........',
    '........tTTddddddTTt........',
    '........tTTddddddTTt........',
    '........tTTddddddTTt........',
    '........tTTddddddTTt........',
    '.......mMMDDDDDdMMMm........',
    '.......mMMDDDDDdMMMm........',
    '......mMMDDDDDDDMMMm........',
    '......mMMDDDDDDDMMMm........',
    '......mMMDDGGGDDMMMm........',
    '......mMMDDGGGDDMMMm........',
    '......mMMDDGggDDMMMm........',
    '......mMMDDGggDDMMMm........',
    '......mMMDDDDDDDMMMm........',
    '......mMMDDDDDDDMMMm........',
    '......mMMDDDDDDDMMMm........',
    '......mMMDDDDDDDMMMm........',
    '......mm.........mm.........',
  ];
  const legend = {
    '.': c.transparent,
    't': c.wizardHat,
    'T': c.wizardHatHighlight,
    's': c.wizardSkin,
    'S': c.wizardBeardShadow,
    'd': c.marketFabric,
    'D': c.hutGlow,
    'm': c.wizardBoot,
    'M': c.desertSand,
    'g': c.sanctumSky,
    'G': c.wizardBelt,
  };
  return spriteFromStrings(art, legend);
}

function createHoofSignTrailSprite(c) {
  const art = [
    '................',
    '.......dd.......',
    '......dggd......',
    '.......gg.......',
    '......ddgg......',
    '.....ggggdd.....',
    '......dd........',
    '................',
  ];
  const legend = {
    '.': c.transparent,
    'd': c.desertSand,
    'g': c.hutGlow,
  };
  return spriteFromStrings(art, legend);
}

function createOvalRingSprite(width, height, {
  base,
  highlight,
  innerFill = null,
  glow = null,
  innerScale = 0.68,
}) {
  const pixels = new Uint8Array(width * height);
  pixels.fill(colors.transparent);
  const centerX = (width - 1) / 2;
  const centerY = (height - 1) / 2;
  const outerRadiusX = Math.max(1, (width - 2) / 2);
  const outerRadiusY = Math.max(1, (height - 2) / 2);
  const innerRadiusX = outerRadiusX * innerScale;
  const innerRadiusY = outerRadiusY * innerScale;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dxOuter = (x - centerX) / outerRadiusX;
      const dyOuter = (y - centerY) / outerRadiusY;
      const outerMag = dxOuter * dxOuter + dyOuter * dyOuter;
      const dxInner = (x - centerX) / innerRadiusX;
      const dyInner = (y - centerY) / innerRadiusY;
      const innerMag = dxInner * dxInner + dyInner * dyInner;
      const idx = y * width + x;

      if (outerMag <= 1 && innerMag >= 1) {
        let color = base;
        if (highlight && (outerMag > 0.82 || innerMag < 1.12)) {
          color = highlight;
        }
        pixels[idx] = color;
      } else if (innerFill && innerMag < 1) {
        let color = innerFill;
        if (glow && innerMag < 0.48) {
          color = glow;
        }
        pixels[idx] = color;
      }
    }
  }

  return new Sprite(width, height, pixels);
}

function createSandVisionRingSprite(c, active) {
  const base = active ? c.hutGlow : c.desertSand;
  const highlight = active ? c.marketFabric : c.dirt;
  const innerFill = active ? c.marketFabric : c.desertSand;
  const glow = active ? c.wizardBelt : null;
  return createOvalRingSprite(46, 20, {
    base,
    highlight,
    innerFill,
    glow,
    innerScale: active ? 0.6 : 0.7,
  });
}

function createResonanceRingSprite(c, active) {
  const base = active ? c.sanctumSky : c.towerGlass;
  const highlight = active ? c.wizardBelt : c.sanctumSky;
  const innerFill = active ? c.sanctumSky : c.towerGlass;
  const glow = active ? c.hutGlow : null;
  return createOvalRingSprite(44, 18, {
    base,
    highlight,
    innerFill,
    glow,
    innerScale: active ? 0.62 : 0.72,
  });
}

function createNightCampfireSprite(c) {
  const art = [
    '..........',
    '....kk....',
    '...kFFk...',
    '..kFFfFk..',
    '.kFFFffFk.',
    '.kFffgFFk.',
    '.kffffggk.',
    '.kffffggk.',
    '.kffffggk.',
    '..kffggk..',
    '..kggggk..',
    '...kkkk...',
    '....kk....',
  ];
  const legend = {
    '.': c.transparent,
    'k': c.wizardBoot,
    'F': c.lavaGlow,
    'f': c.hutGlow,
    'g': c.marketFabric,
  };
  return spriteFromStrings(art, legend);
}

function createEnvoyShadowSprite(c) {
  const art = [
    '............',
    '....sss.....',
    '...sSSSs....',
    '...sSSSs....',
    '..sSSSSSs...',
    '..sSSSSSs...',
    '..sSSSSSs...',
    '..sSSSSSs...',
    '.sSSSSSSSs..',
    '.sSSSSSSSs..',
    '.sSgSSSgSs..',
    '.sSgSSSgSs..',
    '.sSSSSSSSs..',
    '.sSSSSSSSs..',
    '.sSSSSSSSs..',
    '.sSSSSSSSs..',
    '.sSSSSSSSs..',
    '.sSSSSSSSs..',
    '.sSSSSSSSs..',
    '..sSSSSSs...',
    '..sSSSSSs...',
    '..sSSSSSs...',
    '..sSSSSSs...',
    '..sSSSSSs...',
    '..sSSSSSs...',
    '..sssssS....',
    '..sssssS....',
    '..s....s....',
  ];
  const legend = {
    '.': c.transparent,
    's': c.donkeyShadow,
    'S': c.nightSkyBottom,
    'g': c.marketFabric,
  };
  return spriteFromStrings(art, legend);
}

function createTemptationVesselSprite(c) {
  const art = [
    '....................',
    '....................',
    '.......cccccc.......',
    '......cFFFFFfc......',
    '.....cFFgggFFc......',
    '....cFFgggggFFc.....',
    '....cFFgggggFFc.....',
    '...cFFgggggggFFc....',
    '...cFFgggggggFFc....',
    '..cFFgggggggggFFc...',
    '..cFFgggggggggFFc...',
    '..cFFgggggggggFFc...',
    '..cFFgggggggggFFc...',
    '..cFFgggggggggFFc...',
    '..cFFgggggggggFFc...',
    '..cFFgggggggggFFc...',
    '..cFFgggggggggFFc...',
    '..cFFFFFFFFFFFFc....',
    '..cccccccccccccc....',
  ];
  const legend = {
    '.': c.transparent,
    'c': c.wizardBoot,
    'F': c.wizardBelt,
    'f': c.hutGlow,
    'g': c.marketFabric,
  };
  return spriteFromStrings(art, legend);
}

function createTemptationVesselAshSprite(c) {
  const art = [
    '....................',
    '....................',
    '.......cccccc.......',
    '......cSSSSSSc......',
    '.....cSSgggSSc......',
    '....cSSgggggSSc.....',
    '....cSSgggggSSc.....',
    '...cSSgggggggSSc....',
    '...cSSgggggggSSc....',
    '..cSSgggggggggSSc...',
    '..cSSgggggggggSSc...',
    '..cSSgggggggggSSc...',
    '..cSSgggggggggSSc...',
    '..cSSgggggggggSSc...',
    '..cSSgggggggggSSc...',
    '..cSSgggggggggSSc...',
    '..cSSgggggggggSSc...',
    '..cSSSSSSSSSSSSc....',
    '..cccccccccccccc....',
  ];
  const legend = {
    '.': c.transparent,
    'c': c.wizardBoot,
    'S': c.donkeyShadow,
    'g': c.desertSand,
  };
  return spriteFromStrings(art, legend);
}

function createWatchFireSprite(c, state) {
  const artDormant = [
    '.......',
    '..ccc..',
    '..cVc..',
    '..cVc..',
    '..cVc..',
    '..cVc..',
    '..cVc..',
    '.cVcVc.',
    '.cVcVc.',
    '.cVcVc.',
    '.cVcVc.',
    '.cVcVc.',
    '.cVcVc.',
    '.cVcVc.',
    '.cVcVc.',
    '.cVcVc.',
    '..ccc..',
    '..ccc..',
    '...c...',
    '...c...',
  ];
  const artAwakened = [
    '.......',
    '..ccc..',
    '..cVc..',
    '..cFc..',
    '..cFc..',
    '..cFc..',
    '..cFc..',
    '.cFFFc.',
    '.cFFFc.',
    '.cFfFc.',
    '.cFfFc.',
    '.cFFFc.',
    '.cFFFc.',
    '.cFFFc.',
    '.cFfFc.',
    '.cFfFc.',
    '..ccc..',
    '..ccc..',
    '...c...',
    '...c...',
  ];
  const artVeiled = [
    '.......',
    '..ccc..',
    '..cVc..',
    '..cFc..',
    '..cFc..',
    '..cVc..',
    '..cVc..',
    '.cVFVc.',
    '.cVFVc.',
    '.cVfVc.',
    '.cVfVc.',
    '.cVFVc.',
    '.cVFVc.',
    '.cVFVc.',
    '.cVfVc.',
    '.cVfVc.',
    '..ccc..',
    '..ccc..',
    '...c...',
    '...c...',
  ];
  const legendDormant = {
    '.': c.transparent,
    'c': c.wizardBoot,
    'V': c.desertSand,
  };
  const legendActive = {
    '.': c.transparent,
    'c': c.wizardBoot,
    'F': c.lavaGlow,
    'f': c.hutGlow,
    'V': c.desertSand,
  };
  const legendVeiled = {
    '.': c.transparent,
    'c': c.wizardBoot,
    'F': c.hutGlow,
    'f': c.desertSand,
    'V': c.donkeyShadow,
  };
  switch (state) {
    case 'awakened':
      return spriteFromStrings(artAwakened, legendActive);
    case 'veiled':
      return spriteFromStrings(artVeiled, legendVeiled);
    case 'dormant':
    default:
      return spriteFromStrings(artDormant, legendDormant);
  }
}

function createBorderMilestoneSprite(c) {
  const art = [
    '......',
    '..dd..',
    '.dDDd.',
    '.dDDd.',
    '.dDDd.',
    '.dDDd.',
    '.dDDd.',
    '.dDDd.',
    '.dDDd.',
    '.dDDd.',
    '.dDDd.',
    '.dDDd.',
    '.dDDd.',
    '.dDDd.',
    '.dDDd.',
    '.dDDd.',
    '.dDDd.',
    '..dd..',
    '..dd..',
    '.dddd.',
  ];
  const legend = {
    '.': c.transparent,
    'd': c.desertSand,
    'D': c.sanctumSky,
  };
  return spriteFromStrings(art, legend);
}

function createBorderThornSprite(c) {
  const art = [
    '..............',
    '.....ggg......',
    '....ggggg.....',
    '...gggggg.....',
    '..ggggggg.....',
    '.ggggggggg....',
    '.gggGGGggg....',
    '..ggGGGgg.....',
    '..ggGGGgg.....',
    '..gggGggg.....',
    '..ggggggg.....',
    '..ggggggg.....',
    '..ggggggg.....',
    '...ggggg......',
    '....ggg.......',
  ];
  const legend = {
    '.': c.transparent,
    'g': c.gardenLeaf,
    'G': c.donkeyShadow,
  };
  return spriteFromStrings(art, legend);
}

function createBorderProcessionPathSprite(c) {
  const width = 240;
  const height = 48;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);
  const base = c.desertSand;
  const accent = c.hutGlow;
  const shadow = c.dirt;
  const glyph = c.marketFabric;

  for (let y = 0; y < height; y++) {
    const rowStart = y * width;
    const gradient = base;
    const tone = y < 10
      ? accent
      : y > height - 10
        ? shadow
        : gradient;
    for (let x = 0; x < width; x++) {
      let color = tone;
      if (y >= 10 && y <= height - 12) {
        const band = ((y - 10) / (height - 20));
        if (band < 0.12 || band > 0.88) {
          color = shadow;
        }
      }
      if (y % 6 === 0 && y > 8 && y < height - 8) {
        color = accent;
      }
      if (x % 28 === 0 && y > 12 && y < height - 12) {
        color = glyph;
      }
      pixels[rowStart + x] = color;
    }
  }

  return new Sprite(width, height, pixels);
}

function createSandVisionRingActiveSprite(c) {
  return createSandVisionRingSprite(c, true);
}

function createSandVisionRingDormantSprite(c) {
  return createSandVisionRingSprite(c, false);
}

function createResonanceRingActiveSprite(c) {
  return createResonanceRingSprite(c, true);
}

function createResonanceRingDormantSprite(c) {
  return createResonanceRingSprite(c, false);
}

function createGlyphShardSprite(c, letter) {
  const width = 22;
  const height = 20;
  const pixels = new Uint8Array(width * height);
  const frameColor = c.wizardHat;
  const fillColor = c.sanctumSky;
  const glowColor = c.wizardHatHighlight;
  const textColor = c.textPrimary;
  const accentColor = c.marketFabric;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      let color = fillColor;
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        color = frameColor;
      } else if (x === 1 || y === 1 || x === width - 2 || y === height - 2) {
        color = glowColor;
      } else if ((x + y) % 6 === 0) {
        color = accentColor;
      }
      pixels[idx] = color;
    }
  }

  const text = String(letter ?? '').trim();
  if (text.length > 0) {
    const chars = Array.from(text);
    const charWidth = 5;
    const charSpacing = 2;
    const totalChars = Math.min(chars.length, 3);
    const textWidth = totalChars * charWidth + (totalChars - 1) * charSpacing;
    const offsetX = Math.max(2, Math.floor((width - textWidth) / 2));
    const offsetY = Math.max(2, Math.floor((height - 7) / 2));
    for (let i = 0; i < totalChars; i++) {
      const raw = chars[i];
      const pattern = GLYPH_PATTERNS[raw] || GLYPH_PATTERNS[raw?.toUpperCase?.()] || null;
      if (!pattern) continue;
      const left = offsetX + i * (charWidth + charSpacing);
      for (let gy = 0; gy < pattern.length; gy++) {
        const row = pattern[gy];
        for (let gx = 0; gx < row.length; gx++) {
          if (row[gx] !== '#') continue;
          const px = left + gx;
          const py = offsetY + gy;
          if (px <= 0 || px >= width - 1 || py <= 0 || py >= height - 1) continue;
          pixels[py * width + px] = textColor;
        }
      }
    }
  }

  return new Sprite(width, height, pixels);
}

function createMarketBackdropSprite(c) {
  const width = 240;
  const height = 68;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);

  const roofHeight = 10;
  for (let y = 0; y < roofHeight; y++) {
    const offset = y * width;
    for (let x = 0; x < width; x++) {
      pixels[offset + x] = c.marketFabric;
    }
  }

  const wallTop = roofHeight;
  const wallBottom = height - 12;
  for (let y = wallTop; y < wallBottom; y++) {
    const offset = y * width;
    for (let x = 8; x < width - 8; x++) {
      pixels[offset + x] = c.courtMarble;
      if (y % 14 === 6 && x > 12 && x < width - 12) {
        pixels[offset + x] = c.marketFabric;
      }
    }
  }

  const baseTop = wallBottom;
  for (let y = baseTop; y < height; y++) {
    const offset = y * width;
    for (let x = 0; x < width; x++) {
      pixels[offset + x] = c.hutFloor;
    }
  }

  for (let y = wallTop + 4; y < wallBottom - 6; y += 18) {
    for (let x = 24; x < width - 24; x += 28) {
      for (let yy = 0; yy < 12; yy++) {
        for (let xx = 0; xx < 12; xx++) {
          const px = x + xx;
          const py = y + yy;
          if (px >= width - 8) continue;
          const idx = py * width + px;
          const isBorder = yy === 0 || yy === 11 || xx === 0 || xx === 11;
          pixels[idx] = isBorder ? c.hutShadow : c.marketFabric;
        }
      }
    }
  }

  return new Sprite(width, height, pixels);
}

function createMarketStallSprite(c) {
  const width = 72;
  const height = 44;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);

  for (let y = 0; y < 8; y++) {
    for (let x = 2; x < width - 2; x++) {
      pixels[y * width + x] = c.marketFabric;
    }
  }

  for (let y = 8; y < 12; y++) {
    for (let x = 4; x < width - 4; x++) {
      pixels[y * width + x] = c.courtMarble;
    }
  }

  for (let y = 12; y < height; y++) {
    for (let x = 6; x < width - 6; x++) {
      const color = (y - 12) % 8 < 4 ? c.courtMarble : c.marketFabric;
      pixels[y * width + x] = color;
    }
  }

  for (let y = 8; y < height; y++) {
    pixels[y * width + 6] = c.hutShadow;
    pixels[y * width + (width - 7)] = c.hutShadow;
  }

  return new Sprite(width, height, pixels);
}

function createMarketBannerSprite(c) {
  const width = 96;
  const height = 26;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);

  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < width; x++) {
      pixels[y * width + x] = c.marketFabric;
    }
  }

  for (let y = 4; y < height; y++) {
    for (let x = 4; x < width - 4; x++) {
      pixels[y * width + x] = (y % 6 < 3) ? c.courtMarble : c.marketFabric;
    }
  }

  for (let x = 0; x < width; x++) {
    pixels[(height - 1) * width + x] = c.hutShadow;
  }

  return new Sprite(width, height, pixels);
}

function createScribeBoothSprite(c) {
  const width = 64;
  const height = 60;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);

  for (let y = 0; y < 8; y++) {
    for (let x = 4; x < width - 4; x++) {
      pixels[y * width + x] = c.marketFabric;
    }
  }

  for (let y = 8; y < height - 8; y++) {
    for (let x = 6; x < width - 6; x++) {
      pixels[y * width + x] = c.courtMarble;
    }
  }

  for (let y = height - 8; y < height; y++) {
    for (let x = 0; x < width; x++) {
      pixels[y * width + x] = c.hutFloor;
    }
  }

  for (let y = 8; y < height - 8; y++) {
    pixels[y * width + 6] = c.hutShadow;
    pixels[y * width + (width - 7)] = c.hutShadow;
  }

  for (let y = 12; y < 28; y++) {
    for (let x = 20; x < width - 20; x++) {
      pixels[y * width + x] = c.marketFabric;
    }
  }

  for (let y = 28; y < 44; y++) {
    for (let x = 24; x < width - 24; x++) {
      pixels[y * width + x] = c.wizardBelt;
    }
  }

  return new Sprite(width, height, pixels);
}

function createWordSpiritSprite(c) {
  const width = 26;
  const height = 32;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);

  const core = c.marketFabric;
  const glow = c.wizardRobeHighlight;

  for (let y = 4; y < height - 4; y++) {
    for (let x = 6; x < width - 6; x++) {
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const color = dist < 6 ? core : dist < 10 ? glow : null;
      if (color != null) {
        pixels[y * width + x] = color;
      }
    }
  }

  return new Sprite(width, height, pixels);
}

function createBalakEmissarySprite(c) {
  const width = 32;
  const height = 60;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);

  for (let y = 0; y < height; y++) {
    for (let x = 10; x < width - 10; x++) {
      let color = c.wizardRobeHighlight;
      if (y < 12) color = c.marketFabric;
      else if (y < 24) color = c.courtMarble;
      else if (y > height - 12) color = c.hutFloor;
      pixels[y * width + x] = color;
    }
  }

  for (let y = 12; y < 24; y++) {
    for (let x = 12; x < width - 12; x++) {
      const idx = y * width + x;
      const border = y === 12 || y === 23 || x === 12 || x === width - 13;
      pixels[idx] = border ? c.hutShadow : c.marketFabric;
    }
  }

  for (let y = 24; y < height - 12; y++) {
    pixels[y * width + 12] = c.hutShadow;
    pixels[y * width + (width - 13)] = c.hutShadow;
  }

  return new Sprite(width, height, pixels);
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

function createStoneArchSprite(c) {
  const width = 72;
  const height = 48;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);

  const archTop = 6;
  const baseTop = height - 8;
  const outerA = (width - 10) / 2;
  const outerB = baseTop - archTop;
  const innerA = outerA - 6;
  const innerB = outerB - 4;
  const centerX = (width - 1) / 2;
  const stone = c.caveStone ?? c.hillShadow;
  const highlight = c.hillLight ?? c.wizardHatHighlight;
  const shade = c.hillShadow ?? stone;

  for (let y = archTop; y < baseTop; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const outer = (dx * dx) / (outerA * outerA) + ((y - archTop) * (y - archTop)) / (outerB * outerB);
      if (outer > 1) continue;
      const inner = (dx * dx) / (innerA * innerA) + ((y - (archTop + 3)) * (y - (archTop + 3))) / (innerB * innerB);
      if (inner < 1 && y < baseTop - 2) continue;
      const idx = y * width + x;
      const edge = Math.abs(dx) > outerA - 1 || y < archTop + 2;
      pixels[idx] = edge ? highlight : stone;
    }
  }

  for (let y = baseTop; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const edge = x < 6 || x >= width - 6;
      pixels[idx] = edge ? shade : stone;
    }
  }

  return new Sprite(width, height, pixels);
}

function createFountainSprite(c, filled) {
  const width = 52;
  const height = 30;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);
  const stone = c.caveStone ?? c.hillShadow;
  const highlight = c.hillLight ?? c.wizardHatHighlight;
  const waterTop = Math.floor(height * 0.6);
  const bowlTop = Math.floor(height * 0.35);

  for (let y = bowlTop; y < height; y++) {
    for (let x = 4; x < width - 4; x++) {
      const idx = y * width + x;
      const rim = y < bowlTop + 2 || y > height - 3 || x < 6 || x >= width - 6;
      pixels[idx] = rim ? highlight : stone;
    }
  }

  if (filled) {
    for (let y = waterTop; y < height - 4; y++) {
      for (let x = 8; x < width - 8; x++) {
        const idx = y * width + x;
        const wave = Math.sin((x - 8) * 0.4 + y * 0.3);
        pixels[idx] = wave > 0 ? c.riverWater : c.dawnSkyMid;
      }
    }
  }

  return new Sprite(width, height, pixels);
}

function createMonolithSprite(c, awakened) {
  const width = 26;
  const height = 54;
  const pixels = new Uint8Array(width * height);
  const stone = c.caveStone ?? c.hillShadow;
  const highlight = c.hillLight ?? c.wizardHatHighlight;
  const glow = awakened ? (c.wizardBelt ?? c.hutGlow) : highlight;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const edge = x <= 2 || x >= width - 3;
      pixels[idx] = edge ? highlight : stone;
    }
  }

  for (let y = 8; y < height - 6; y += 6) {
    for (let x = Math.floor(width / 2) - 2; x <= Math.floor(width / 2) + 2; x++) {
      const idx = y * width + x;
      pixels[idx] = glow;
    }
  }

  return new Sprite(width, height, pixels);
}

function createSoundGlyphSprite(c) {
  const width = 40;
  const height = 32;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);
  const primary = c.wizardHatHighlight ?? c.hutGlow;
  const secondary = c.wizardRobeHighlight ?? c.marketFabric;
  const centerX = (width - 1) / 2;
  const centerY = (height - 1) / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 3) {
        pixels[y * width + x] = primary;
      } else if (distance < 7) {
        if ((x + y) % 2 === 0) {
          pixels[y * width + x] = secondary;
        }
      } else if (distance < 12 && Math.abs(Math.sin(distance * 0.6)) > 0.55) {
        pixels[y * width + x] = primary;
      }
    }
  }

  return new Sprite(width, height, pixels);
}

function createWaterGlyphSprite(c) {
  const width = 42;
  const height = 24;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);
  const surface = c.riverWater ?? c.dawnSkyMid;
  const highlight = c.dawnSkyMid ?? c.cloudHighlight;
  const shadow = c.nightSkyMid ?? c.hillShadow;
  const centerY = height - 6;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const wave = Math.sin((x / width) * Math.PI * 4 + y * 0.45);
      const falloff = Math.exp(-Math.pow((y - centerY) / (height * 0.9), 2));
      if (y >= centerY - 3 && y <= centerY + 3) {
        pixels[idx] = wave > 0 ? highlight : surface;
      } else if (y > centerY + 3) {
        pixels[idx] = shadow;
      } else if (Math.abs(wave) > 0.75 * falloff) {
        pixels[idx] = highlight;
      } else if (Math.abs(wave) > 0.45 * falloff) {
        pixels[idx] = surface;
      }
    }
  }

  return new Sprite(width, height, pixels);
}

function createBasaltSpireSprite(c, variant = 'mid') {
  const heightMap = {
    tall: 110,
    mid: 90,
    short: 70,
  };
  const width = 26;
  const height = heightMap[variant] ?? heightMap.mid;
  const pixels = new Uint8Array(width * height);
  const stone = c.caveStone ?? c.hillShadow;
  const highlight = c.hillLight ?? c.wizardHatHighlight;
  const shadow = c.nightSkyMid ?? stone;

  for (let y = 0; y < height; y++) {
    const taper = 1 + Math.cos((y / height) * Math.PI) * 6;
    const left = Math.max(0, Math.floor((width - taper) / 2));
    const right = Math.min(width, Math.ceil(width - left));
    for (let x = left; x < right; x++) {
      const idx = y * width + x;
      const edge = x === left || x === right - 1;
      const vein = ((x + y) % 6 === 0);
      pixels[idx] = edge ? highlight : vein ? shadow : stone;
    }
  }

  return new Sprite(width, height, pixels);
}

function createStalactiteSprite(c) {
  const width = 36;
  const height = 48;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);
  const stone = c.hillShadow ?? c.caveStone;
  const highlight = c.hillLight ?? c.wizardHatHighlight;

  for (let y = 0; y < height; y++) {
    const span = Math.max(2, Math.floor((width / 2) - (y * 0.55)));
    const left = Math.floor(width / 2) - span;
    const right = Math.floor(width / 2) + span;
    for (let x = left; x <= right; x++) {
      if (x < 0 || x >= width) continue;
      const idx = y * width + x;
      const edge = x === left || x === right || y === 0;
      pixels[idx] = edge ? highlight : stone;
    }
  }

  return new Sprite(width, height, pixels);
}

function createCanyonMistSprite(c) {
  const width = 200;
  const height = 48;
  const pixels = new Uint8Array(width * height);
  const base = c.dawnSkyMid ?? c.hillLight;
  const shadow = c.caveStone ?? c.hillShadow;

  for (let y = 0; y < height; y++) {
    const alpha = 1 - y / height;
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const noise = Math.sin((x + y * 3) * 0.08) * 0.5 + Math.sin((x - y * 2) * 0.04) * 0.3;
      pixels[idx] = noise * alpha > 0.2 ? base : shadow;
    }
  }

  return new Sprite(width, height, pixels);
}

function createGardenBackdropSprite(c) {
  const width = 220;
  const height = 80;
  const pixels = new Uint8Array(width * height);
  const sky = c.gardenLeaf ?? c.grassBright;
  const shadow = c.grassShadow ?? c.hillShadow;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const noise = Math.sin((x + y * 2) * 0.05) * 0.4 + Math.cos((x - y) * 0.08) * 0.2;
      pixels[idx] = noise > 0 ? sky : shadow;
    }
  }

  return new Sprite(width, height, pixels);
}

function createBalakStatueSprite(c, overgrown = false) {
  const width = 48;
  const height = 90;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);
  const stone = c.courtMarble ?? c.hillLight;
  const moss = c.gardenLeaf ?? c.grassBright;
  const crack = c.hillShadow ?? c.caveStone;

  for (let y = 0; y < height; y++) {
    const left = 10;
    const right = width - 10;
    for (let x = left; x < right; x++) {
      const idx = y * width + x;
      const edge = x === left || x === right - 1 || y === 0;
      pixels[idx] = edge ? crack : stone;
    }
  }

  for (let y = Math.floor(height * 0.55); y < height - 10; y += 4) {
    for (let x = 12; x < width - 12; x += 6) {
      const idx = y * width + x;
      pixels[idx] = crack;
    }
  }

  if (overgrown) {
    for (let y = 8; y < height; y += 2) {
      for (let x = 6; x < width - 6; x++) {
        if ((x + y * 2) % 5 === 0) {
          const idx = y * width + x;
          pixels[idx] = moss;
        }
      }
    }
  } else {
    for (let y = 12; y < height; y += 3) {
      for (let x = 8; x < width - 8; x++) {
        if ((x + y) % 7 === 0) {
          const idx = y * width + x;
          pixels[idx] = moss;
        }
      }
    }
  }

  return new Sprite(width, height, pixels);
}

function createIrrigationSprite(c) {
  const width = 220;
  const height = 26;
  const pixels = new Uint8Array(width * height);
  const soil = c.dirt ?? c.hutFloor;
  const channel = c.riverWater ?? c.dawnSkyMid;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (y % 8 === 0 || y % 8 === 1) {
        pixels[idx] = channel;
      } else {
        pixels[idx] = soil;
      }
    }
  }

  return new Sprite(width, height, pixels);
}

function createSunStoneSprite(c, awakened) {
  const width = 58;
  const height = 54;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);
  const base = c.courtMarble ?? c.hillLight;
  const petals = c.wizardHatHighlight ?? c.hutGlow;
  const glow = awakened ? (c.gardenLeaf ?? c.grassBright) : petals;

  for (let y = 10; y < height; y++) {
    for (let x = 8; x < width - 8; x++) {
      const idx = y * width + x;
      const radial = Math.sin((x + y) * 0.12);
      pixels[idx] = radial > 0 ? base : petals;
    }
  }

  if (awakened) {
    for (let y = 14; y < height - 6; y += 4) {
      for (let x = 10; x < width - 10; x++) {
        if ((x + y) % 5 === 0) {
          pixels[y * width + x] = glow;
        }
      }
    }
  }

  return new Sprite(width, height, pixels);
}

function createResonanceRockSprite(c, awakened) {
  const width = 62;
  const height = 50;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);
  const stone = c.caveStone ?? c.hillShadow;
  const highlight = c.hillLight ?? c.wizardHatHighlight;
  const resonance = awakened ? (c.marketFabric ?? c.wizardRobeHighlight) : highlight;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const ellipse = ((x - width / 2) ** 2) / (width * 6) + ((y - height + 8) ** 2) / (height * 4);
      if (ellipse < 1) {
        pixels[idx] = stone;
      }
    }
  }

  if (awakened) {
    for (let y = 8; y < height - 4; y += 3) {
      const ring = Math.sin((y / height) * Math.PI * 2);
      for (let x = 12; x < width - 12; x++) {
        if (Math.abs(Math.sin((x + y) * 0.18)) > 0.6) {
          pixels[y * width + x] = ring > 0 ? resonance : highlight;
        }
      }
    }
  }

  return new Sprite(width, height, pixels);
}

function createGardenForegroundSprite(c) {
  const width = 44;
  const height = 46;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);
  const stem = c.grassDark ?? c.gardenLeaf;
  const bloom = c.hutGlow ?? c.wizardBelt;

  for (let y = 0; y < height; y++) {
    const span = Math.max(1, Math.floor((width * 0.35) - y * 0.2));
    const center = Math.floor(width / 2 + Math.sin(y * 0.25) * 2);
    for (let x = center - span; x <= center + span; x++) {
      if (x < 0 || x >= width) continue;
      const idx = y * width + x;
      pixels[idx] = stem;
    }
  }

  for (let y = 4; y < 16; y++) {
    for (let x = 12; x < width - 12; x++) {
      if ((x + y) % 3 === 0) {
        pixels[y * width + x] = bloom;
      }
    }
  }

  return new Sprite(width, height, pixels);
}

function createGardenWheatSprite(c, harvested) {
  const width = 38;
  const height = 34;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);
  const stem = c.grassDark ?? c.gardenLeaf;
  const grain = c.hutGlow ?? c.wizardBelt;
  const soil = c.dirt ?? c.hutFloor;

  for (let y = height - 6; y < height; y++) {
    for (let x = 0; x < width; x++) {
      pixels[y * width + x] = soil;
    }
  }

  if (!harvested) {
    for (let stalk = 4; stalk < width; stalk += 6) {
      for (let y = 6; y < height - 6; y++) {
        pixels[y * width + stalk] = stem;
        if (y < 12 && (y + stalk) % 2 === 0) {
          pixels[y * width + stalk] = grain;
        }
      }
    }
  }

  return new Sprite(width, height, pixels);
}

function createGardenAltarSprite(c) {
  const width = 46;
  const height = 32;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);
  const stone = c.courtMarble ?? c.hillLight;
  const shadow = c.hillShadow ?? c.caveStone;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const isTop = y < 8;
      pixels[idx] = isTop ? stone : shadow;
    }
  }

  return new Sprite(width, height, pixels);
}

function createGardenBreadLightSprite(c) {
  const width = 28;
  const height = 32;
  const pixels = new Uint8Array(width * height);
  pixels.fill(c.transparent);
  const aura = c.hutGlow ?? c.wizardBelt;
  const bread = c.grassBright ?? c.gardenLeaf;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const ry = y - height + 10;
      const distance = Math.sqrt((x - width / 2) ** 2 + ry * ry);
      if (distance < 6) {
        pixels[idx] = bread;
      } else if (distance < 12 && Math.sin(distance * 0.6) > 0) {
        pixels[idx] = aura;
      }
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

function setupTouchMode() {
  if (touchControlsAttached) return;
  touchControlsAttached = true;
  document.body.classList.add('touch-mode');
  createTouchKeyboard();
  setupTouchMovement();
}

function setupTouchMovement() {
  if (!canvas) return;
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
  canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
}

function handleTouchStart(event) {
  if (touchState.id != null) return;
  const touch = event.changedTouches?.[0];
  if (!touch) return;
  touchState.id = touch.identifier;
  touchState.startX = touch.clientX;
  touchState.startY = touch.clientY;
  updateTouchMovement(touch, true);
  event.preventDefault();
}

function handleTouchMove(event) {
  const touch = getTrackedTouch(event.changedTouches);
  if (!touch) return;
  updateTouchMovement(touch, false);
  event.preventDefault();
}

function handleTouchEnd(event) {
  const touch = getTrackedTouch(event.changedTouches);
  if (touchState.id != null && (!touch || touch.identifier === touchState.id)) {
    setKeyState('a', false);
    setKeyState('d', false);
    setKeyState('s', false);
    touchState.id = null;
  }
  event.preventDefault();
}

function getTrackedTouch(list) {
  if (!list) return null;
  for (let i = 0; i < list.length; i++) {
    if (list[i].identifier === touchState.id) {
      return list[i];
    }
  }
  return null;
}

function updateTouchMovement(touch, initial) {
  const rect = canvas.getBoundingClientRect();
  const dx = touch.clientX - touchState.startX;
  const dy = touch.clientY - touchState.startY;
  const threshold = Math.max(rect.width, rect.height) * 0.05;

  let moveLeft = false;
  let moveRight = false;
  let moveDown = false;

  if (!initial) {
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -threshold) moveLeft = true;
      else if (dx > threshold) moveRight = true;
    } else {
      if (dy > threshold) moveDown = true;
      else if (dy < -threshold) {
        triggerKeyPress('w');
      }
    }
  }

  if (initial && !moveLeft && !moveRight) {
    const relativeX = touch.clientX - rect.left;
    if (relativeX < rect.width * 0.4) moveLeft = true;
    else if (relativeX > rect.width * 0.6) moveRight = true;
  }

  setKeyState('a', moveLeft);
  setKeyState('d', moveRight);
  setKeyState('s', moveDown);
}

function createTouchKeyboard() {
  const container = document.getElementById('touch-ui');
  if (!container || container.dataset.ready === 'true') return;
  container.innerHTML = '';
  container.dataset.ready = 'true';

  const keyboard = document.createElement('div');
  keyboard.id = 'touch-keyboard';

  const letters = [
    { label: 'א', value: 'a' },
    { label: 'ב', value: 'b' },
    { label: 'ג', value: 'g' },
    { label: 'ד', value: 'd' },
    { label: 'ה', value: 'h' },
    { label: 'ו', value: 'o' },
    { label: 'ז', value: 'z' },
    { label: 'ח', value: 'x' },
    { label: 'ט', value: 'y' },
    { label: 'י', value: 'i' },
    { label: 'כ', value: 'k' },
    { label: 'ל', value: 'l' },
    { label: 'מ', value: 'm' },
    { label: 'נ', value: 'n' },
    { label: 'ס', value: 's' },
    { label: 'ע', value: 'e' },
    { label: 'פ', value: 'p' },
    { label: 'צ', value: 'c' },
    { label: 'ק', value: 'q' },
    { label: 'ר', value: 'r' },
    { label: 'ש', value: 'w' },
    { label: 'ת', value: 't' },
    { label: 'ך', value: 'k' },
    { label: 'ם', value: 'm' },
    { label: 'ן', value: 'n' },
    { label: 'ף', value: 'p' },
    { label: 'ץ', value: 'c' },
  ];
  const specials = [
    { label: '␣', value: ' ', className: 'special' },
    { label: '⌫', value: 'Backspace', className: 'special' },
    { label: 'ENTER', value: 'Enter', className: 'special primary' },
    { label: 'Skip', value: 'skip', className: 'special secondary' },
  ];

  const addButton = (label, key, className) => {
    const button = document.createElement('button');
    button.textContent = label;
    if (className) {
      className.split(/\s+/).forEach(name => button.classList.add(name));
    }
    const press = value => handleVirtualKeyPress(value, label);
    button.addEventListener('touchstart', event => {
      event.preventDefault();
      press(key);
    }, { passive: false });
    button.addEventListener('click', event => {
      event.preventDefault();
      press(key);
    });
    keyboard.appendChild(button);
  };

  letters.forEach(entry => addButton(entry.label, entry.value, entry.className));
  specials.forEach(entry => addButton(entry.label, entry.value, entry.className));

  container.appendChild(keyboard);
}

function handleVirtualKeyPress(key, displayLabel) {
  if (!key) return;
  if (key === 'skip') {
    if (typeof sceneState.skipCurrentLevel === 'function') {
      sceneState.skipCurrentLevel('skip');
    } else {
      requestSkip('skip');
    }
    return;
  }
  if (activePrompt && typeof activePrompt.handleVirtualInput === 'function') {
    const normalized = (typeof key === 'string' && key.length === 1)
      ? key.toLowerCase()
      : key;
    activePrompt.handleVirtualInput(normalized);
    return;
  }
  const down = new KeyboardEvent('keydown', { key, bubbles: true });
  window.dispatchEvent(down);
  const up = new KeyboardEvent('keyup', { key, bubbles: true });
  window.dispatchEvent(up);
}

function groundLineFor(sprite) {
  return HEIGHT - GROUND_HEIGHT - sprite.height;
}

ambiencePresets = createAmbiencePresets(colors);
setAmbience('exteriorDay', { immediate: true });
