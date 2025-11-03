import { RetroPalette, RetroBuffer, Sprite, blitSprite } from './retroBlitter.js';
import {
  createPalette,
  createPaletteFader,
  createTextRenderer,
  spriteFromStrings,
  mirrorSprite,
  createSpeechState,
  wrapText,
  mapGlyphChar,
  drawBubbleTip,
  fillRect,
  strokeRect,
  clamp,
} from './graphics.js';

const WIDTH = 320;
const HEIGHT = 200;
const GROUND_HEIGHT = 8;
const MOVE_SPEED = 78;
const GRAVITY = 280;
const JUMP_FORCE = 180;
const TEXT_WRAP = 26;
const CAMERA_MARGIN = 96;
const GRASS_SWAY_SPEED = 4;

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');

const { palette, colors } = createPalette();
const retroPalette = new RetroPalette(palette);
const buffer = new RetroBuffer(WIDTH, HEIGHT, retroPalette);
const paletteFader = createPaletteFader(retroPalette, colors.transparent);

async function fadeIn(duration) {
  await paletteFader.fadeToBase(duration);
}

async function fadeOut(duration) {
  await paletteFader.fadeToBlack(duration);
}

const wizardSprites = createWizardSprites(colors);
const donkeySprites = createDonkeySprites(colors);
const cloudSprites = createCloudSprites(colors);
const textRenderer = createTextRenderer(colors);

const wizard = {
  sprites: wizardSprites,
  x: 48,
  y: groundLineFor(wizardSprites.right),
  vx: 0,
  vy: 0,
  facing: 1,
  onGround: true,
};

const donkeyBaseY = groundLineFor(donkeySprites.right);
const donkey = {
  sprites: donkeySprites,
  x: wizard.x - 32,
  y: donkeyBaseY,
  facing: 1,
};

const clouds = createClouds(cloudSprites);

const controls = new Set(['w', 'a', 's', 'd']);
const heldKeys = new Set();
const pressedKeys = new Set();

const speechState = createSpeechState();
let speechQueue = Promise.resolve();

let cameraX = 0;
let cameraDelta = 0;
let grassPhase = 0;
let lastTime = performance.now();

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('blur', () => {
  heldKeys.clear();
  pressedKeys.clear();
});

requestAnimationFrame(loop);
main();

async function main() {
  await fadeIn(1500);
  await say(
    () => wizard.x + wizard.sprites.right.width / 2,
    () => wizard.y + 6,
    'Hallo, ich bin Harald Töpfer, der Zauberlehrling'
  );
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  if (!controls.has(key)) return;
  if (!heldKeys.has(key)) {
    pressedKeys.add(key);
  }
  heldKeys.add(key);
  event.preventDefault();
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  if (!controls.has(key)) return;
  heldKeys.delete(key);
  pressedKeys.delete(key);
  event.preventDefault();
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
  updateSpeech(time);
  drawScene();

  const frame = buffer.toImageData(ctx);
  ctx.putImageData(frame, 0, 0);

  pressedKeys.clear();
  requestAnimationFrame(loop);
}

function updateWizard(delta) {
  const left = heldKeys.has('a');
  const right = heldKeys.has('d');
  const crouch = heldKeys.has('s');
  const jumpPressed = pressedKeys.has('w');

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

function updateSpeech(time) {
  if (!speechState.active) return;

  if (speechState.visible < speechState.totalChars) {
    while (time >= speechState.nextCharTime && speechState.visible < speechState.totalChars) {
      speechState.visible++;
      speechState.nextCharTime += speechState.charDelay;
    }
    if (speechState.visible >= speechState.totalChars && speechState.holdUntil === Infinity) {
      speechState.holdUntil = time + speechState.holdDuration;
    }
  } else if (time >= speechState.holdUntil) {
    speechState.active = false;
    speechState.sequence = [];
    speechState.lines = [];
    speechState.anchor = null;
    const resolve = speechState.resolve;
    speechState.resolve = null;
    if (resolve) resolve();
  }
}

function drawScene() {
  drawSky();
  drawCloudLayer();
  drawHills();
  drawTerrain();
  drawCharacters();
  drawSpeechBubble();
}

function drawSky() {
  const pixels = buffer.pixels;
  for (let y = 0; y < HEIGHT; y++) {
    let color = colors.skyBottom;
    if (y < 70) {
      color = colors.skyTop;
    } else if (y < 120) {
      color = colors.skyMid;
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
  const wizardSprite = wizard.facing >= 0 ? wizard.sprites.right : wizard.sprites.left;
  const wizardX = Math.round(wizard.x - cameraX);
  const wizardY = Math.round(wizard.y);
  blitSprite(buffer, wizardSprite, wizardX, wizardY, { transparent: colors.transparent });

  const donkeySprite = donkey.facing >= 0 ? donkey.sprites.right : donkey.sprites.left;
  const donkeyX = Math.round(donkey.x - cameraX);
  const donkeyY = Math.round(donkey.y);
  blitSprite(buffer, donkeySprite, donkeyX, donkeyY, { transparent: colors.transparent });
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

function drawSpeechBubble() {
  if (!speechState.active || (speechState.totalChars === 0 && speechState.visible === 0 && speechState.holdUntil === Infinity)) {
    return;
  }

  const anchorXWorld = resolveAnchor(speechState.anchor?.x, wizard.x + wizard.sprites.right.width / 2);
  const anchorYWorld = resolveAnchor(speechState.anchor?.y, wizard.y);

  const anchorX = Math.round(anchorXWorld - cameraX);
  const anchorY = Math.round(anchorYWorld);

  const width = speechState.width;
  const height = speechState.height;
  const bubbleLeftLimit = 2;
  const bubbleRightLimit = WIDTH - width - 2;
  let bubbleX = clamp(anchorX - Math.floor(width / 2), bubbleLeftLimit, bubbleRightLimit);
  const bubbleBottom = anchorY - speechState.tipHeight;
  const bubbleY = bubbleBottom - height;
  const bubbleRight = bubbleX + width;

  fillRect(buffer.pixels, WIDTH, HEIGHT, bubbleX, bubbleY, width, height, colors.bubbleFill);
  drawBubbleTip(bubbleX, bubbleBottom, bubbleRight, anchorX, anchorY, speechState.tipBaseHalf, colors.bubbleFill, colors.bubbleBorder, buffer.pixels, WIDTH, HEIGHT);
  strokeRect(buffer.pixels, WIDTH, HEIGHT, bubbleX, bubbleY, width, height, colors.bubbleBorder);

  const textStartX = bubbleX + speechState.paddingX;
  const textStartY = bubbleY + speechState.paddingY;
  const charAdvance = textRenderer.width + textRenderer.spacing;
  const lineAdvance = textRenderer.height + textRenderer.lineSpacing;

  for (let i = 0; i < speechState.visible && i < speechState.sequence.length; i++) {
    const node = speechState.sequence[i];
    if (!node) continue;
    const glyph = textRenderer.glyphs[node.char];
    if (!glyph) continue;
    const gx = textStartX + node.column * charAdvance;
    const gy = textStartY + node.line * lineAdvance;
    blitSprite(buffer, glyph, gx, gy, { transparent: colors.transparent });
  }
}

function resolveAnchor(source, fallback) {
  if (typeof source === 'function') return source();
  if (typeof source === 'number') return source;
  return fallback;
}

async function say(x, y, text) {
  speechQueue = speechQueue.then(() => startSpeech(x, y, String(text ?? '')));
  return speechQueue;
}

function startSpeech(x, y, text) {
  return new Promise(resolve => {
    const now = performance.now();
    const lines = wrapText(text, TEXT_WRAP);
    const sequence = [];
    let maxLineLength = 0;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      maxLineLength = Math.max(maxLineLength, line.length);
      for (let column = 0; column < line.length; column++) {
        const rawChar = line[column];
        const glyphChar = mapGlyphChar(rawChar, textRenderer.glyphs);
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

    speechState.active = true;
    speechState.anchor = {
      x: typeof x === 'function' ? x : () => x,
      y: typeof y === 'function' ? y : () => y,
    };
    speechState.width = Math.max(12, textWidth + speechState.paddingX * 2);
    speechState.height = Math.max(10, textHeight + speechState.paddingY * 2);
    speechState.lines = lines;
    speechState.sequence = sequence;
    speechState.totalChars = sequence.length;
    speechState.visible = 0;
    speechState.nextCharTime = now;
    speechState.holdUntil = sequence.length === 0 ? now + speechState.holdDuration : Infinity;
    speechState.resolve = resolve;
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

function createDonkeySprites(c) {
  const art = [
    '...........2...............................',
    '...........114.............................',
    '...........1722............................',
    '.............22.22.........................',
    '.................222.......................',
    '...........21...7..222.....................',
    '...........21...77...2.1...................',
    '...........1...217.....7................2..',
    '..........41...217.......................4.',
    '..........34...2.........................2.',
    '..........2342.........22...............224',
    '..........123......2...22...............224',
    '..................22...22...........22..222',
    '...................22..22...........22..22.',
    '...................22..222.......222242242.',
    '....................2244422444444442724442.',
    '......................434.224444444.172442.',
    '......................434...22222...271441.',
    '......................2334............1222.',
    '2..2...................433............42.4.',
    '.......................444............24.42',
    '...................77712444...........24.44',
    '777777771777777777777772424...........22.24',
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
