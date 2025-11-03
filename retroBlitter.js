const DEFAULT_TRANSPARENT = 0;

export class RetroPalette {
  constructor(colors) {
    if (!Array.isArray(colors) || colors.length !== 256) {
      throw new Error('Palette must have exactly 256 colors.');
    }
    this.colors = colors.map(normalizeColor);
  }

  getRgba(index) {
    return this.colors[index & 0xff];
  }
}

export class RetroBuffer {
  constructor(width, height, palette) {
    this.width = width;
    this.height = height;
    this.palette = palette;
    this.pixels = new Uint8Array(width * height);
  }

  fill(colorIndex) {
    this.pixels.fill(colorIndex & 0xff);
  }

  putPixel(x, y, colorIndex) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.pixels[y * this.width + x] = colorIndex & 0xff;
  }

  toImageData(ctx) {
    const imageData = ctx.createImageData(this.width, this.height);
    const data = imageData.data;
    const palette = this.palette;

    for (let i = 0; i < this.pixels.length; i++) {
      const rgba = palette.getRgba(this.pixels[i]);
      const dest = i * 4;
      data[dest] = rgba[0];
      data[dest + 1] = rgba[1];
      data[dest + 2] = rgba[2];
      data[dest + 3] = rgba[3];
    }
    return imageData;
  }
}

export class Sprite {
  constructor(width, height, pixels) {
    this.width = width;
    this.height = height;
    if (!(pixels instanceof Uint8Array) || pixels.length !== width * height) {
      throw new Error('Sprite pixels must be Uint8Array with width * height length.');
    }
    this.pixels = pixels;
  }
}

export function blitSprite(destBuffer, sprite, x, y, options = {}) {
  const transparent = options.transparent ?? DEFAULT_TRANSPARENT;

  for (let sy = 0; sy < sprite.height; sy++) {
    const dy = y + sy;
    if (dy < 0 || dy >= destBuffer.height) continue;

    const srcRow = sy * sprite.width;
    const destRow = dy * destBuffer.width;

    for (let sx = 0; sx < sprite.width; sx++) {
      const colorIndex = sprite.pixels[srcRow + sx];
      if (colorIndex === transparent) continue;

      const dx = x + sx;
      if (dx < 0 || dx >= destBuffer.width) continue;
      destBuffer.pixels[destRow + dx] = colorIndex;
    }
  }
}

function normalizeColor(color) {
  if (Array.isArray(color)) {
    const [r, g, b, a = 255] = color;
    return [clamp(r), clamp(g), clamp(b), clamp(a)];
  }

  if (typeof color === 'string') {
    const ctx = getColorParserContext();
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return [data[0], data[1], data[2], data[3]];
  }

  throw new Error('Color must be array [r,g,b,a] or CSS string.');
}

let colorParserContext;

function getColorParserContext() {
  if (!colorParserContext) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    colorParserContext = canvas.getContext('2d');
  }
  return colorParserContext;
}

function clamp(value) {
  return Math.max(0, Math.min(255, value | 0));
}
