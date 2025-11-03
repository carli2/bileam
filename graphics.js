import { Sprite, blitSprite } from './retroBlitter.js';
import { VGA_PALETTE } from './vgaPalette.js';

export function createPalette() {
  const palette = VGA_PALETTE.map((rgba, index) => {
    const clone = rgba.slice(0, 4);
    if (index === 0) {
      clone[3] = 0;
    }
    return clone;
  });

  const colorNames = {
    transparent: 0,
  };

  const targets = {
    skyTop: [18, 42, 92],
    skyMid: [32, 68, 128],
    skyBottom: [70, 104, 150],
    cloudHighlight: [236, 244, 255],
    cloudLight: [208, 226, 244],
    cloudShade: [168, 192, 220],
    hillLight: [58, 84, 118],
    hillShadow: [40, 64, 100],
    grassBright: [52, 170, 96],
    grassDark: [34, 136, 76],
    grassShadow: [20, 92, 52],
    dirt: [104, 72, 48],
    dirtDeep: [78, 54, 36],
    wizardHat: [32, 60, 132],
    wizardHatHighlight: [92, 130, 210],
    wizardSkin: [236, 200, 168],
    wizardBeard: [220, 228, 236],
    wizardBeardShadow: [168, 176, 192],
    wizardRobe: [108, 56, 146],
    wizardRobeHighlight: [172, 96, 190],
    wizardBelt: [225, 185, 84],
    wizardGlove: [206, 160, 96],
    wizardBoot: [70, 52, 68],
    staffWood: [146, 96, 54],
    donkeyShadow: [62, 64, 78],
    donkeyFur: [138, 142, 160],
    donkeyHighlight: [198, 202, 214],
    donkeyMuzzle: [188, 180, 172],
    donkeyEarInner: [226, 176, 166],
    donkeyEyeWhite: [245, 248, 250],
    donkeyEye: [42, 48, 70],
    textPrimary: [245, 244, 254],
    bubbleFill: [22, 28, 52],
    bubbleBorder: [118, 200, 255],
  };

  for (const [name, rgb] of Object.entries(targets)) {
    colorNames[name] = nearestColorIndex(rgb, VGA_PALETTE);
  }

  return { palette, colors: colorNames };
}

export function createPaletteFader(retroPalette, transparentIndex) {
  const basePalette = clonePalette(retroPalette.colors);
  const blackPalette = basePalette.map((color, index) => (
    index === transparentIndex ? [0, 0, 0, 0] : [0, 0, 0, 255]
  ));
  let currentPalette = clonePalette(blackPalette);
  applyPalette(blackPalette);
  let queue = Promise.resolve();

  function applyPalette(source) {
    for (let i = 0; i < source.length; i++) {
      const src = source[i];
      const dest = retroPalette.colors[i];
      dest[0] = src[0];
      dest[1] = src[1];
      dest[2] = src[2];
      dest[3] = src[3];
    }
  }

  function fadeTo(target, duration) {
    if (duration <= 0) {
      applyPalette(target);
      currentPalette = clonePalette(target);
      return Promise.resolve();
    }

    const from = clonePalette(currentPalette);
    const start = performance.now();

    return new Promise(resolve => {
      function step(now) {
        const t = Math.min(1, (now - start) / duration);
        for (let i = 0; i < target.length; i++) {
          const src = from[i];
          const dst = target[i];
          const dest = retroPalette.colors[i];
          dest[0] = Math.round(lerp(src[0], dst[0], t));
          dest[1] = Math.round(lerp(src[1], dst[1], t));
          dest[2] = Math.round(lerp(src[2], dst[2], t));
          dest[3] = Math.round(lerp(src[3], dst[3], t));
        }

        if (t >= 1) {
          applyPalette(target);
          currentPalette = clonePalette(target);
          resolve();
        } else {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    });
  }

  return {
    fadeToBase(duration) {
      queue = queue.then(() => fadeTo(basePalette, duration));
      return queue;
    },
    fadeToBlack(duration) {
      queue = queue.then(() => fadeTo(blackPalette, duration));
      return queue;
    },
    basePalette,
    blackPalette,
  };
}

export function beginSpeech(speechState, textRenderer, wrapLimit, x, y, text) {
  return new Promise(resolve => {
    const now = performance.now();
    const lines = wrapText(String(text ?? ''), wrapLimit);
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

export function updateSpeechState(speechState, time) {
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

export function renderSpeechBubble(speechState, { buffer, colors, cameraX, textRenderer }) {
  if (!speechState.active || (
    speechState.totalChars === 0 &&
    speechState.visible === 0 &&
    speechState.holdUntil === Infinity
  )) {
    return;
  }

  const anchorXWorld = speechState.anchor?.x?.();
  const anchorYWorld = speechState.anchor?.y?.();
  if (anchorXWorld == null || anchorYWorld == null) return;

  const anchorX = Math.round(anchorXWorld - cameraX);
  const anchorY = Math.round(anchorYWorld);

  const width = speechState.width;
  const height = speechState.height;
  const bubbleLeftLimit = 2;
  const bubbleRightLimit = buffer.width - width - 2;
  let bubbleX = clamp(anchorX - Math.floor(width / 2), bubbleLeftLimit, bubbleRightLimit);
  const bubbleBottom = anchorY - speechState.tipHeight;
  const bubbleY = bubbleBottom - height;
  const bubbleRight = bubbleX + width;

  fillRect(buffer.pixels, buffer.width, buffer.height, bubbleX, bubbleY, width, height, colors.bubbleFill);
  drawBubbleTip(
    bubbleX,
    bubbleBottom,
    bubbleRight,
    anchorX,
    anchorY,
    speechState.tipBaseHalf,
    colors.bubbleFill,
    colors.bubbleBorder,
    buffer.pixels,
    buffer.width,
    buffer.height,
  );
  strokeRect(buffer.pixels, buffer.width, buffer.height, bubbleX, bubbleY, width, height, colors.bubbleBorder);

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

export function createTextRenderer(c) {
  const glyphWidth = 5;
  const glyphHeight = 7;
  const spacing = 1;
  const lineSpacing = 2;
  const glyphs = {};
  const blank = new Sprite(glyphWidth, glyphHeight, new Uint8Array(glyphWidth * glyphHeight));
  glyphs[' '] = blank;

  const baseLegend = {
    '.': c.transparent,
    '#': c.textPrimary,
  };

  const patterns = getGlyphPatterns();
  for (const [char, rows] of Object.entries(patterns)) {
    glyphs[char] = spriteFromStrings(rows, baseLegend);
  }
  glyphs['.'] = spriteFromStrings([
    '.....',
    '.....',
    '.....',
    '.....',
    '.....',
    '..##.',
    '..##.',
  ], baseLegend);
  glyphs[','] = spriteFromStrings([
    '.....',
    '.....',
    '.....',
    '.....',
    '..##.',
    '..#..',
    '.#...',
  ], baseLegend);
  glyphs['-'] = spriteFromStrings([
    '.....',
    '.....',
    '.....',
    '#####',
    '.....',
    '.....',
    '.....',
  ], baseLegend);

  return { glyphs, width: glyphWidth, height: glyphHeight, spacing, lineSpacing };
}

export function spriteFromStrings(rows, legend) {
  const height = rows.length;
  const width = rows[0].length;
  const pixels = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const row = rows[y];
    for (let x = 0; x < width; x++) {
      const key = row[x];
      const color = legend[key];
      if (color === undefined) {
        throw new Error(`Sprite legend missing key "${key}"`);
      }
      pixels[y * width + x] = color;
    }
  }
  return new Sprite(width, height, pixels);
}

export function mirrorSprite(sprite) {
  const mirrored = new Uint8Array(sprite.width * sprite.height);
  for (let y = 0; y < sprite.height; y++) {
    const rowStart = y * sprite.width;
    for (let x = 0; x < sprite.width; x++) {
      mirrored[rowStart + x] = sprite.pixels[rowStart + (sprite.width - 1 - x)];
    }
  }
  return new Sprite(sprite.width, sprite.height, mirrored);
}

export function createSpeechState() {
  return {
    active: false,
    anchor: null,
    width: 0,
    height: 0,
    paddingX: 4,
    paddingY: 4,
    tipHeight: 10,
    tipBaseHalf: 5,
    charDelay: 60,
    holdDuration: 1400,
    lines: [],
    sequence: [],
    totalChars: 0,
    visible: 0,
    nextCharTime: 0,
    holdUntil: Infinity,
    resolve: null,
  };
}

export function wrapText(text, limit) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  if (words.length === 0) {
    return [''];
  }

  for (const word of words) {
    const next = current.length === 0 ? word : `${current} ${word}`;
    if (next.length <= limit) {
      current = next;
      continue;
    }
    if (current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      let remaining = word;
      while (remaining.length > limit) {
        lines.push(remaining.slice(0, limit));
        remaining = remaining.slice(limit);
      }
      current = remaining;
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [''];
}

export function mapGlyphChar(char, glyphs) {
  if (char === ' ') return ' ';
  if (char === ',') return ',';
  if (char === '.') return '.';
  if (char === '-') return '-';
  const upper = char.toUpperCase();
  return glyphs[upper] ? upper : ' ';
}

export function drawBubbleTip(left, bubbleBottom, right, anchorX, anchorY, baseHalf, fillColor, borderColor, buffer, width, height) {
  const tipHeight = Math.max(1, Math.min(24, anchorY - bubbleBottom));
  const clampedAnchorX = clamp(anchorX, left + 2, right - 3);
  for (let i = 0; i < tipHeight; i++) {
    const rowY = bubbleBottom + i;
    if (rowY < 0 || rowY >= height) continue;
    const t = tipHeight > 1 ? i / (tipHeight - 1) : 1;
    const half = Math.max(0, Math.round(baseHalf * (1 - t)));
    const start = clamp(clampedAnchorX - half, left, right - 1);
    const end = clamp(clampedAnchorX + half, left, right - 1);
    for (let x = start; x <= end; x++) {
      buffer[rowY * width + x] = fillColor;
    }
    if (rowY > bubbleBottom) {
      if (start >= left && start < right) {
        buffer[rowY * width + start] = borderColor;
      }
      if (end >= left && end < right) {
        buffer[rowY * width + end] = borderColor;
      }
    }
  }
  const tipY = clamp(anchorY, 0, height - 1);
  const tipX = clamp(anchorX, 0, width - 1);
  buffer[tipY * width + tipX] = borderColor;
}

export function fillRect(buffer, bufferWidth, bufferHeight, x, y, width, height, color) {
  if (width <= 0 || height <= 0) return;
  const startX = Math.max(0, Math.min(bufferWidth, x));
  const endX = Math.max(0, Math.min(bufferWidth, x + width));
  const startY = Math.max(0, Math.min(bufferHeight, y));
  const endY = Math.max(0, Math.min(bufferHeight, y + height));
  for (let yy = startY; yy < endY; yy++) {
    const offset = yy * bufferWidth;
    buffer.fill(color, offset + startX, offset + endX);
  }
}

export function strokeRect(buffer, bufferWidth, bufferHeight, x, y, width, height, color) {
  if (width <= 0 || height <= 0) return;
  const x1 = x;
  const x2 = x + width - 1;
  const y1 = y;
  const y2 = y + height - 1;
  drawHorizontalLine(buffer, bufferWidth, bufferHeight, x1, x2, y1, color);
  drawHorizontalLine(buffer, bufferWidth, bufferHeight, x1, x2, y2, color);
  drawVerticalLine(buffer, bufferWidth, bufferHeight, x1, y1, y2, color);
  drawVerticalLine(buffer, bufferWidth, bufferHeight, x2, y1, y2, color);
}

export function drawHorizontalLine(buffer, bufferWidth, bufferHeight, x1, x2, y, color) {
  if (y < 0 || y >= bufferHeight) return;
  const start = Math.max(0, Math.min(x1, x2));
  const end = Math.min(bufferWidth - 1, Math.max(x1, x2));
  const offset = y * bufferWidth;
  for (let x = start; x <= end; x++) {
    buffer[offset + x] = color;
  }
}

export function drawVerticalLine(buffer, bufferWidth, bufferHeight, x, y1, y2, color) {
  if (x < 0 || x >= bufferWidth) return;
  const start = Math.max(0, Math.min(y1, y2));
  const end = Math.min(bufferHeight - 1, Math.max(y1, y2));
  for (let y = start; y <= end; y++) {
    buffer[y * bufferWidth + x] = color;
  }
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function clonePalette(palette) {
  return palette.map(color => color.slice());
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function nearestColorIndex(target, palette) {
  const [rt, gt, bt] = target;
  let bestIndex = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const [r, g, b] = palette[i];
    const dr = r - rt;
    const dg = g - gt;
    const db = b - bt;
    const distance = dr * dr + dg * dg + db * db;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function getGlyphPatterns() {
  return {
    A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
    C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
    D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
    E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
    F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
    G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
    H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
    J: ['#####', '...#.', '...#.', '...#.', '#..#.', '#..#.', '.##..'],
    K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
    L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
    M: ['#...#', '##.##', '#.#.#', '#.#.#', '#.#.#', '#...#', '#...#'],
    N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
    O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
    Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
    R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
    T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
    W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
    X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
    Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
    Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
    Ö: ['.#.#.', '.###.', '#...#', '#...#', '#...#', '#...#', '.###.'],
    א: ['.#.#.', '#.#.#', '#.#.#', '#####', '#...#', '#...#', '#...#'],
    ו: ['#....', '#....', '#....', '#....', '#....', '#....', '.###.'],
    ר: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  };
}
