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
  acknowledgeSpeech,
  wrapText,
  mapGlyphChar,
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

const narrationSpeech = createSpeechState();
const overlaySpeechStates = new Set();
let speechQueue = Promise.resolve();

const wizard = {
  sprites: null,
  x: 48,
  y: 0,
  vx: 0,
  vy: 0,
  facing: 1,
  onGround: true,
};

const donkey = {
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
let hutLightOn = false;
let pendingSpeechAck = null;

initSprites();
window.addEventListener('keydown', handleKeyDown, { passive: false });
window.addEventListener('keyup', handleKeyUp, { passive: false });
window.addEventListener('blur', () => {
  heldKeys.clear();
  pressedKeys.clear();
});
window.addEventListener('keydown', handleSpeechAdvance, true);
window.addEventListener('pointerdown', handleSpeechAdvance, true);

requestAnimationFrame(loop);
main();

async function main() {
  await paletteFader.fadeToBase(1500);
  await say(() => wizard.x - 16, () => wizard.y - 34, 'Es ist finster in dieser Huette');
  await runLevelOne();
}

function initSprites() {
  const wizardSprites = createWizardSprites(colors);
  const donkeySprites = createDonkeySprites(colors);
  const cloudSprites = createCloudSprites(colors);

  wizard.sprites = wizardSprites;
  wizard.y = groundLineFor(wizardSprites.right);
  donkey.sprites = donkeySprites;
  donkeyBaseY = groundLineFor(donkeySprites.right);
  donkey.x = wizard.x - 32;
  donkey.y = donkeyBaseY;
  clouds = createClouds(cloudSprites);
}

function handleKeyDown(event) {
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

  updateWizard(delta);
  updateDonkey(delta, time);

  const previousCameraX = cameraX;
  updateCamera();
  cameraDelta = cameraX - previousCameraX;
  if (cameraDelta !== 0) {
    grassPhase = (grassPhase + delta * GRASS_SWAY_SPEED) % (Math.PI * 2);
  }

  updateClouds(delta, time);
  updateSpeechState(narrationSpeech, time);
  overlaySpeechStates.forEach(state => {
    if (!state.locked) {
      updateSpeechState(state, time);
    }
  });
  if (activePrompt && typeof activePrompt.update === 'function') {
    activePrompt.update(delta);
  }

  drawScene();

  const frame = buffer.toImageData(ctx);
  ctx.putImageData(frame, 0, 0);

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

  if (wizard.x < 0) wizard.x = 0;

  const groundLine = groundLineFor(wizard.sprites.right);
  if (wizard.y > groundLine) {
    wizard.y = groundLine;
    wizard.vy = 0;
    wizard.onGround = true;
  } else {
    wizard.onGround = false;
  }

  if (wizard.y < 24) {
    wizard.y = 24;
    if (wizard.vy < 0) wizard.vy = 0;
  }
}

function updateDonkey(delta, time) {
  const followOffset = 28;
  const desired = wizard.x - followOffset;
  const gap = desired - donkey.x;
  const maxSpeed = 35 + Math.min(110, Math.abs(gap) * 1.5);
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
  drawCharacters();
  renderSpeechLayers();
}

function drawSky() {
  const pixels = buffer.pixels;
  for (let y = 0; y < HEIGHT; y++) {
    let color;
    if (hutLightOn) {
      if (y < 70) {
        color = colors.skyTop;
      } else if (y < 120) {
        color = colors.skyMid;
      } else {
        color = colors.skyBottom;
      }
    } else {
      color = colors.hillShadow;
    }
    const rowStart = y * WIDTH;
    pixels.fill(color, rowStart, rowStart + WIDTH);
  }
}

function drawCloudLayer() {
  for (const cloud of clouds) {
    const screenX = Math.round(cloud.x - cameraX * 0.4);
    const screenY = Math.round(cloud.y);
    blitSprite(buffer, cloud.sprite, screenX, screenY, { transparent: colors.transparent });
  }
}

function drawHills() {
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
      pixels[idx] = depth < 4 ? colors.hillLight : colors.hillShadow;
    }
  }
}

function drawTerrain() {
  const pixels = buffer.pixels;
  const grassStart = HEIGHT - GROUND_HEIGHT;
  const worldOffset = Math.floor(cameraX);
  for (let y = grassStart; y < HEIGHT; y++) {
    const rowStart = y * WIDTH;
    const layer = HEIGHT - y;
    for (let x = 0; x < WIDTH; x++) {
      const idx = rowStart + x;
      const worldX = worldOffset + x;
      if (layer >= 6) {
        const phase = cameraDelta !== 0 ? grassPhase + worldX * 0.05 : worldX * 0.05;
        const sway = Math.sin(phase);
        pixels[idx] = sway > 0 ? colors.grassBright : colors.grassDark;
      } else if (layer >= 4) {
        pixels[idx] = colors.grassShadow;
      } else {
        const pattern = ((worldX + y) & 1) === 0;
        pixels[idx] = pattern ? colors.dirt : colors.dirtDeep;
      }
    }
  }
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

async function say(x, y, text) {
  speechQueue = speechQueue.then(() => {
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
  return speechQueue;
}

function promptBubble(x1, y1, text, x2, y2) {
  if (activePrompt) {
    throw new Error('promptBubble already active');
  }

  const anchorQuestX = typeof x1 === 'function' ? x1 : () => x1;
  const anchorQuestY = typeof y1 === 'function' ? y1 : () => y1;
  const anchorInputX = typeof x2 === 'function' ? x2 : () => x2;
  const anchorInputY = typeof y2 === 'function' ? y2 : () => y2;

  const questState = createSpeechState();
  questState.charDelay = 0;
  questState.holdDuration = Number.POSITIVE_INFINITY;
  beginSpeech(questState, textRenderer, TEXT_WRAP, anchorQuestX, anchorQuestY, text);
  questState.visible = questState.totalChars;
  questState.locked = true;
  overlaySpeechStates.add(questState);

  const inputState = createSpeechState();
  inputState.charDelay = 0;
  inputState.holdDuration = Number.POSITIVE_INFINITY;
  inputState.anchor = { x: anchorInputX, y: anchorInputY };
  inputState.locked = true;
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

  const promise = new Promise((resolve, reject) => {
    state.resolve = resolve;
    state.reject = reject;
  });

  function detach(result, isReject = false) {
    overlaySpeechStates.delete(questState);
    overlaySpeechStates.delete(inputState);
    questState.active = false;
    inputState.active = false;
    window.removeEventListener('keydown', onKeyDown, true);
    gameplayInputEnabled = true;
    activePrompt = null;
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
    const cursorChar = state.cursorVisible ? '|' : ' ';
    let display;
    if (hebrew.length > 0) {
      display = hebrew + cursorChar;
    } else {
      display = cursorChar;
    }
    const lines = wrapText(display, TEXT_WRAP);
    const sequence = [];
    let maxLineLength = 0;
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      maxLineLength = Math.max(maxLineLength, line.length);
      for (let column = 0; column < line.length; column++) {
        const glyphChar = mapGlyphChar(line[column], textRenderer.glyphs) || ' ';
        sequence.push({ line: lineIndex, column, char: glyphChar });
      }
    }

    const charWidth = textRenderer.width;
    const charSpacing = textRenderer.spacing;
    const lineSpacing = textRenderer.lineSpacing;
    const charAdvance = charWidth + charSpacing;
    const lineAdvance = textRenderer.height + lineSpacing;

    const textWidth = maxLineLength > 0 ? maxLineLength * charAdvance - charSpacing : 0;
    const textHeight = lines.length > 0 ? lines.length * lineAdvance - lineSpacing : 0;

    inputState.lines = lines;
    inputState.sequence = sequence;
    inputState.totalChars = sequence.length;
    inputState.visible = sequence.length;
    inputState.width = Math.max(18, textWidth + inputState.paddingX * 2);
    inputState.height = Math.max(12, textHeight + inputState.paddingY * 2);
    inputState.anchor = { x: anchorInputX, y: anchorInputY };
    inputState.active = true;
    state.transliterated = hebrew.trim();
  }

  function onKeyDown(event) {
    const key = event.key;
    if (key === 'Enter') {
      event.preventDefault();
      const result = bufferChars.join('').trim();
      detach(result, false);
      return;
    }

    if (key === 'Escape') {
      event.preventDefault();
      detach('', false);
      return;
    }

    if (key === 'Backspace') {
      event.preventDefault();
      bufferChars.pop();
      refreshInputState();
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

async function runLevelOne() {
  await say(() => donkey.x - 20, () => donkey.y - 40, 'Esel sagt ich sehe nix');
  let attempts = 0;
  let solved = false;

  while (!solved) {
    const input = await promptBubble(
      () => wizard.x - 30,
      () => wizard.y - 55,
      'Sprich das Wort אור (aor)',
      () => wizard.x - 20,
      () => wizard.y - 20
    );

    const trimmed = input.trim().toLowerCase();
    if (trimmed === 'aor') {
      solved = true;
      hutLightOn = true;
      await say(() => wizard.x - 18, () => wizard.y - 42, 'אור (aor)');
    } else {
      attempts++;
      if (attempts === 1) {
        await say(() => donkey.x - 18, () => donkey.y - 38, 'Esel sagt vielleicht faengt es mit Alef an');
      } else {
        await say(() => wizard.x - 22, () => wizard.y - 42, 'Bileam sagt אור (aor) ist kurz und hell');
      }
    }
  }

  await paletteFader.fadeToBase(400);
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
      const nx = (x - centerX) / (width * 0.45);
      const ny = (y - centerY) / (height * 0.55);
      const dist = nx * nx + ny * ny;
      const idx = y * width + x;
      if (dist <= 1) {
        let shade = c.cloudLight;
        if (ny < -0.2) {
          shade = c.cloudHighlight;
        } else if (ny > 0.25) {
          shade = c.cloudShade;
        }
        pixels[idx] = shade;
      } else {
        pixels[idx] = c.transparent;
      }
    }
  }
  return new Sprite(width, height, pixels);
}

function groundLineFor(sprite) {
  return HEIGHT - GROUND_HEIGHT - sprite.height;
}
