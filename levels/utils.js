import {
  say,
  wizard,
  donkey,
  setSceneProps,
  ensureAmbience,
  getScenePropBounds,
  showGlyphReveal,
  pushCameraFocus,
  popCameraFocus,
} from '../scene.js';

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
    { tipDirection: 'up' },
  );
}

const DIVINE_BUBBLE_STYLE = {
  fill: 'bubbleFill',
  border: 'wizardBelt',
  borderWidth: 2,
  tipBaseHalf: 7,
};

export function divineSay(text) {
  return say(
    () => (actorCenterX(wizard) + actorCenterX(donkey)) / 2,
    () => Math.min(actorTopY(wizard), actorTopY(donkey)) - 120,
    text,
    {
      tipDirection: 'up',
      bubbleStyle: DIVINE_BUBBLE_STYLE,
    },
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
    () => actorBubbleY(donkey, -14),
    text,
    { tipDirection: 'down' },
  );
}

const SPELL_ALIASES = {
  // אור
  aor: 'אור',
  or: 'אור',
  אור: 'אור',
  // מים
  mayim: 'מים',
  majim: 'מים',
  mjm: 'מים',
  מים: 'מים',
  // לא
  lo: 'לא',
  לא: 'לא',
  // שמע
  shama: 'שמע',
  shema: 'שמע',
  שמע: 'שמע',
  // קול
  qol: 'קול',
  kol: 'קול',
  קול: 'קול',
  // חיים
  chayim: 'חיים',
  chaim: 'חיים',
  xayim: 'חיים',
  chajim: 'חיים',
  חיים: 'חיים',
  // אש
  ash: 'אש',
  esh: 'אש',
  אש: 'אש',
  // דבר
  dabar: 'דבר',
  davar: 'דבר',
  dbr: 'דבר',
  דבר: 'דבר',
  // אמת
  emet: 'אמת',
  amet: 'אמת',
  אמת: 'אמת',
  // מלאך
  malak: 'מלאך',
  malach: 'מלאך',
  mlak: 'מלאך',
  מלאך: 'מלאך',
  // ארור
  arur: 'ארור',
  aror: 'ארור',
  ארור: 'ארור',
  // ברך / ברכה
  barak: 'ברך',
  ברך: 'ברך',
  beraka: 'ברכה',
  beracha: 'ברכה',
  bracha: 'ברכה',
  brcha: 'ברכה',
  ברכה: 'ברכה',
  // המלחמה
  hamilchama: 'המלחמה',
  milchama: 'המלחמה',
  hmlchmh: 'המלחמה',
  hamilchamah: 'המלחמה',
  milchamah: 'המלחמה',
  המלחמה: 'המלחמה',
};

const GLYPH_STORAGE_KEY = 'bileamKnownGlyphs';
const LETTER_DETAILS = {
  'א': { glyph: 'א', label: 'Aleph', meaning: 'Stier, Stärke' },
  'ב': { glyph: 'ב', label: 'Bet', meaning: 'Haus, Zuflucht' },
  'ג': { glyph: 'ג', label: 'Gimel', meaning: 'Kamel, Gabe' },
  'ד': { glyph: 'ד', label: 'Dalet', meaning: 'Tür, Durchgang' },
  'ה': { glyph: 'ה', label: 'He', meaning: 'Fenster, Atem' },
  'ו': { glyph: 'ו', label: 'Vav', meaning: 'Nagel, Verbindung' },
  'ז': { glyph: 'ז', label: 'Zajin', meaning: 'Waffe, Nahrung' },
  'ח': { glyph: 'ח', label: 'Chet', meaning: 'Zaun, Lebenspforte' },
  'ט': { glyph: 'ט', label: 'Tet', meaning: 'Korb, Güte' },
  'י': { glyph: 'י', label: 'Yod', meaning: 'Hand, Funke' },
  'כ': { glyph: 'כ', label: 'Kaf', meaning: 'Handfläche, Empfang' },
  'ך': { glyph: 'ך', label: 'Finales Kaf', meaning: 'Handfläche, Empfang' },
  'ל': { glyph: 'ל', label: 'Lamed', meaning: 'Stab, Lehre' },
  'מ': { glyph: 'מ', label: 'Mem', meaning: 'Wasser, Strömung' },
  'ם': { glyph: 'ם', label: 'Finales Mem', meaning: 'Wasser, Strömung' },
  'נ': { glyph: 'נ', label: 'Nun', meaning: 'Fisch, Wachstum' },
  'ן': { glyph: 'ן', label: 'Finales Nun', meaning: 'Fisch, Wachstum' },
  'ס': { glyph: 'ס', label: 'Samech', meaning: 'Stütze, Schutz' },
  'ע': { glyph: 'ע', label: 'Ayin', meaning: 'Auge, Wahrnehmung' },
  'פ': { glyph: 'פ', label: 'Pe', meaning: 'Mund, Ausdruck' },
  'ף': { glyph: 'ף', label: 'Finales Pe', meaning: 'Mund, Ausdruck' },
  'צ': { glyph: 'צ', label: 'Zadi', meaning: 'Angel, Gerechtigkeit' },
  'ץ': { glyph: 'ץ', label: 'Finales Zadi', meaning: 'Angel, Gerechtigkeit' },
  'ק': { glyph: 'ק', label: 'Qof', meaning: 'Nacken, Tiefe' },
  'ר': { glyph: 'ר', label: 'Resh', meaning: 'Kopf, Anführer' },
  'ש': { glyph: 'ש', label: 'Shin', meaning: 'Zahn, Feuer' },
  'ת': { glyph: 'ת', label: 'Tav', meaning: 'Zeichen, Bund' },
};

const knownGlyphs = (() => {
  if (typeof localStorage === 'undefined') {
    return new Set();
  }
  try {
    const raw = localStorage.getItem(GLYPH_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter(value => typeof value === 'string').map(value => value.trim()).filter(Boolean));
  } catch (error) {
    console.warn('Failed to load glyph progress', error);
    return new Set();
  }
})();

function persistKnownGlyphs() {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(GLYPH_STORAGE_KEY, JSON.stringify(Array.from(knownGlyphs)));
  } catch (error) {
    console.warn('Failed to persist glyph progress', error);
  }
}

export function normalizeHebrewInput(value) {
  if (value == null) return '';
  return String(value)
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

export function canonicalSpell(value) {
  const normalized = normalizeHebrewInput(value);
  if (!normalized) return '';
  return SPELL_ALIASES[normalized] ?? normalized;
}

export function splitSpellInput(value) {
  if (value == null) return [];
  const trimmed = String(value).normalize('NFC').trim();
  if (!trimmed) return [];
  return trimmed
    .split(/\s+/)
    .map(token => canonicalSpell(token))
    .filter(Boolean);
}

export function canonicalizeSequence(words = []) {
  return words.map(word => canonicalSpell(word));
}

export function consumeSequenceTokens(answer, canonicalSequence, startIndex = 0) {
  if (!Array.isArray(canonicalSequence) || canonicalSequence.length === 0) {
    return 0;
  }
  const tokens = splitSpellInput(answer);
  if (tokens.length <= 1) return 0;
  let consumed = 0;
  while (consumed < tokens.length) {
    const expectedIndex = startIndex + consumed;
    if (expectedIndex >= canonicalSequence.length || tokens[consumed] !== canonicalSequence[expectedIndex]) {
      return 0;
    }
    consumed += 1;
  }
  return consumed;
}

export async function celebrateGlyph(spell) {
  const canonical = canonicalSpell(spell);
  if (!canonical) return;
  const letters = Array.from(canonical).filter(char => LETTER_DETAILS[char]);
  if (letters.length === 0) return;
  const uniqueLetters = Array.from(new Set(letters));
  const unknownLetters = uniqueLetters.filter(letter => !knownGlyphs.has(letter));

  let letter;
  if (unknownLetters.length > 0) {
    letter = unknownLetters[0];
    knownGlyphs.add(letter);
    persistKnownGlyphs();
  } else {
    const randomIndex = Math.floor(Math.random() * uniqueLetters.length);
    letter = uniqueLetters[randomIndex];
  }

  const details = LETTER_DETAILS[letter];
  if (!details) return;
  await showGlyphReveal(details.glyph, details.label, details.meaning);
}

export function spellEquals(answer, ...variants) {
  const canonical = canonicalSpell(answer);
  if (!variants || variants.length === 0) return false;
  return variants.some(option => canonicalSpell(option) === canonical);
}

export function findProp(list, id) {
  if (!Array.isArray(list)) return null;
  return list.find(entry => entry.id === id) ?? null;
}

export function propSay(props, id, text, options = {}) {
  const {
    offsetX = 0,
    offsetY = -24,
    anchor = 'right',
    anchorX: anchorXOverride = null,
    anchorY: anchorYOverride = null,
  } = options;

  const resolveBaseX = () => {
    if (typeof anchorXOverride === 'function') {
      return anchorXOverride();
    }

    const runtime = getScenePropBounds(id);
    if (runtime) {
      const { left, right, width } = runtime;
      switch (anchor) {
        case 'left':
          return left;
        case 'center':
          return left + width / 2;
        default:
          return right;
      }
    }

    const prop = findProp(props, id);
    if (prop) {
      const width = prop.sprite?.width ?? prop.width ?? 0;
      const left = prop.x ?? 0;
      if (anchor === 'left') return left;
      if (anchor === 'center') return left + width / 2;
      return left + width;
    }

    const wizardBase = anchor === 'left'
      ? wizard.x
      : actorCenterX(wizard);
    return wizardBase;
  };

  const resolveBaseY = () => {
    if (typeof anchorYOverride === 'function') {
      return anchorYOverride();
    }

    const runtime = getScenePropBounds(id);
    if (runtime) {
      return runtime.top - 16;
    }

    const prop = findProp(props, id);
    if (prop && typeof prop.y === 'number') {
      return prop.y - 16;
    }

    return actorBubbleY(wizard, -46);
  };

  const anchorX = () => Math.round(resolveBaseX() + offsetX);
  const anchorY = () => Math.round(resolveBaseY() + offsetY);

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

export function getPropCenterX(props, id) {
  const bounds = getScenePropBounds(id);
  if (bounds) {
    return (bounds.left + bounds.right) / 2;
  }
  const prop = findProp(props, id);
  if (!prop) return wizard.x;
  const width = prop.sprite?.width ?? prop.width ?? 0;
  return (prop.x ?? 0) + width / 2;
}

export function withCameraFocus(centerX, task) {
  pushCameraFocus(centerX);
  const finalize = () => popCameraFocus();
  const run = async () => {
    try {
      if (typeof task === 'function') {
        return await task();
      }
      return undefined;
    } finally {
      finalize();
    }
  };
  return run();
}

export function withCameraFocusOnProp(props, id, task) {
  const centerX = getPropCenterX(props, id);
  return withCameraFocus(centerX, task);
}

export function sleep(ms) {
  return new Promise(resolve => {
    if (!(ms > 0)) {
      resolve();
      return;
    }
    setTimeout(resolve, ms);
  });
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
    { id: 'gardenBackgroundTrees', type: 'gardenBackdropTrees', x: -12, align: 'ground', parallax: 0.25, layer: -3 },
    { id: 'gardenBalakStatue', type: 'balakStatue', x: 312, align: 'ground', parallax: 0.55, layer: -1 },
    { id: 'gardenIrrigation', type: 'irrigationChannels', x: -28, align: 'ground', parallax: 0.9, layer: 0 },
    { id: 'gardenDryBasin', type: 'fountainDry', x: 248, align: 'ground', layer: 1 },
    { id: 'gardenSunStone', type: 'sunStoneDormant', x: 410, align: 'ground', layer: 1 },
    { id: 'gardenEchoRock', type: 'resonanceRockDormant', x: 552, align: 'ground', layer: 1 },
    { id: 'gardenAltar', type: 'gardenAltar', x: 612, align: 'ground', layer: 1 },
    { id: 'gardenForegroundStem', type: 'gardenForegroundPlant', x: 120, align: 'ground', parallax: 1.05, layer: 2 },
    { id: 'gardenBalakFigure', type: 'balakFigure', x: 232, align: 'ground', parallax: 0.95, layer: 4 },
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

export const MARKET_SCENE = {
  ambience: 'marketBazaar',
  wizardStartX: 62,
  donkeyOffset: -38,
  props: [
    { id: 'marketBackdrop', type: 'marketBackdrop', x: -48, align: 'ground', parallax: 0.4 },
    { id: 'marketBanner', type: 'marketBanner', x: 96, align: 'ground', offsetY: -32, parallax: 0.85 },
    { id: 'marketStallEast', type: 'marketStall', x: 180, align: 'ground', parallax: 0.95 },
    { id: 'marketStallWest', type: 'marketStall', x: 310, align: 'ground', parallax: 1 },
    { id: 'marketScribeBooth', type: 'scribeBooth', x: 420, align: 'ground', parallax: 1.02 },
    { id: 'marketWordSpirit', type: 'wordSpirit', x: 444, align: 'ground', offsetY: -46, parallax: 1.02, visible: false },
    { id: 'marketEmissary', type: 'balakEmissary', x: 560, align: 'ground', parallax: 1.08 },
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
