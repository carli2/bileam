import {
  ensureAmbience,
  setSceneContext,
  levelAmbiencePlan,
  fadeToBase,
  fadeToBlack,
  showLevelTitle,
  setLifeBars,
} from '../scene.js';
import {
  divineSay,
  applySceneConfig,
  cloneSceneProps,
  switchMusic,
} from './utils.js';

const LEVEL_MUSIC = [
  { sceneId: 'review_moab', track: 'מי האנשים האלה עמך.mp3' },
  { sceneId: 'review_night', track: 'מי האנשים האלה עמך.mp3' },
  { sceneId: 'review_angel', track: 'The Donkey\'s Cry.mp3' },
  { sceneId: 'review_altars', track: 'Echoes of the Divine.mp3' },
  { sceneId: 'review_truth', track: 'The Wizard and the King.mp3' },
  { sceneId: 'review_starlight', track: 'secher belam ben beor-full.mp3' },
];

const REVIEW_SCENES = [
  {
    id: 'review_moab',
    ambience: 'marketBazaar',
    wizardStartX: 72,
    donkeyOffset: -36,
    props: [
      { id: 'reviewMoabStallWest', type: 'marketStall', x: 212, align: 'ground', parallax: 0.92 },
      { id: 'reviewMoabStallEast', type: 'marketStall', x: 360, align: 'ground', parallax: 0.96 },
      { id: 'reviewMoabBalakFigure', type: 'balakFigure', x: 520, align: 'ground', parallax: 1.04 },
      { id: 'reviewMoabEnvoy', type: 'envoyShadow', x: 268, align: 'ground', parallax: 1.02 },
      { id: 'reviewMoabTrail', type: 'hoofSignTrail', x: 140, align: 'ground', parallax: 0.88 },
    ],
  },
  {
    id: 'review_night',
    ambience: 'marketBazaar',
    wizardStartX: 88,
    donkeyOffset: -30,
    props: [
      { id: 'reviewNightBackdrop', type: 'marketBackdrop', x: -140, align: 'ground', parallax: 0.28 },
      { id: 'reviewNightMist', type: 'canyonMist', x: -32, align: 'ground', offsetY: -58, parallax: 0.5 },
      { id: 'reviewNightCampfire', type: 'nightCampfire', x: 236, align: 'ground', parallax: 0.92 },
      { id: 'reviewNightEnvoy', type: 'envoyShadow', x: 172, align: 'ground', parallax: 0.94 },
      { id: 'reviewNightOffering', type: 'temptationVessel', x: 320, align: 'ground', parallax: 0.96 },
    ],
  },
  {
    id: 'review_angel',
    ambience: 'mirrorTower',
    wizardStartX: 84,
    donkeyOffset: -28,
    props: [
      { id: 'reviewAngelBlade', type: 'angelBladeForm', x: 256, align: 'ground', parallax: 0.98 },
      { id: 'reviewTerraceBasalt', type: 'basaltSpireTall', x: 180, align: 'ground', parallax: 0.9 },
      { id: 'reviewResonance', type: 'resonanceRingDormant', x: 420, align: 'ground', parallax: 1.06 },
      { id: 'reviewTerraceMist', type: 'canyonMist', x: -40, align: 'ground', offsetY: -50, parallax: 0.5 },
    ],
  },
  {
    id: 'review_altars',
    ambience: 'desertTravel',
    wizardStartX: 90,
    donkeyOffset: -32,
    props: [
      { id: 'reviewAltarNorth', type: 'altarGlyphPlateDormant', x: 160, align: 'ground', parallax: 0.94 },
      { id: 'reviewAltarCenter', type: 'altarGlyphPlateDormant', x: 316, align: 'ground', parallax: 0.98 },
      { id: 'reviewAltarSouth', type: 'altarGlyphPlateDormant', x: 468, align: 'ground', parallax: 1.02 },
      { id: 'reviewBlessingOrbit', type: 'blessingFragmentOrbit', x: 260, y: -48, parallax: 0.92, letter: 'ברך' },
      { id: 'reviewBalakAdvisor', type: 'balakAdvisor', x: 544, align: 'ground', parallax: 1.06 },
      { id: 'reviewAltarTorchWest', type: 'watchFireAwakened', x: 120, align: 'ground', parallax: 0.9 },
      { id: 'reviewAltarTorchEast', type: 'watchFireAwakened', x: 520, align: 'ground', parallax: 1.08 },
      { id: 'reviewAltarTorchCenter', type: 'watchFireAwakened', x: 320, align: 'ground', parallax: 1.0 },
      { id: 'reviewAltarFlameNorth', type: 'anvilFlame', x: 150, align: 'ground', offsetY: -44, parallax: 0.94 },
      { id: 'reviewAltarFlameCenter', type: 'anvilFlame', x: 306, align: 'ground', offsetY: -42, parallax: 0.98 },
      { id: 'reviewAltarFlameSouth', type: 'anvilFlame', x: 458, align: 'ground', offsetY: -40, parallax: 1.02 },
    ],
  },
  {
    id: 'review_truth',
    ambience: 'courtAudience',
    wizardStartX: 78,
    donkeyOffset: -34,
    props: [
      { id: 'reviewTruthPlateOne', type: 'pisgaAltarPlate', x: 160, align: 'ground', parallax: 0.92 },
      { id: 'reviewTruthPlateTwo', type: 'pisgaAltarPlate', x: 224, align: 'ground', parallax: 0.94 },
      { id: 'reviewTruthPlateThree', type: 'pisgaAltarPlate', x: 288, align: 'ground', parallax: 0.96 },
      { id: 'reviewTruthBanner', type: 'princeProcessionBanner', x: 110, align: 'ground', parallax: 0.88 },
      { id: 'reviewTruthBalak', type: 'balakFigure', x: 576, align: 'ground', parallax: 1.04 },
    ],
  },
  {
    id: 'review_starlight',
    ambience: 'sanctumFinale',
    wizardStartX: 96,
    donkeyOffset: -36,
    props: [
      { id: 'reviewShadowWest', type: 'shadowFracture', x: 162, align: 'ground', parallax: 0.92 },
      { id: 'reviewShadowCore', type: 'balakProcessCore', x: 320, align: 'ground', parallax: 0.98 },
      { id: 'reviewShadowEast', type: 'shadowFracture', x: 468, align: 'ground', parallax: 1.04 },
      { id: 'reviewActiveCore', type: 'balakProcessCoreActive', x: 320, align: 'ground', parallax: 1.02 },
    ],
  },
];

const VERSE_SCENE_SEGMENTS = [
  { chapter: 22, from: 1, to: 19, scene: 'review_moab' },
  { chapter: 22, from: 20, to: 21, scene: 'review_night' },
  { chapter: 22, from: 22, to: 35, scene: 'review_angel' },
  { chapter: 22, from: 36, to: 41, scene: 'review_moab' },
  { chapter: 23, from: 1, to: 12, scene: 'review_altars' },
  { chapter: 23, from: 13, to: 26, scene: 'review_truth' },
  { chapter: 23, from: 27, to: 30, scene: 'review_altars' },
  { chapter: 24, from: 1, to: 13, scene: 'review_truth' },
  { chapter: 24, from: 14, to: 25, scene: 'review_starlight' },
];

function sceneForReference(ref) {
  if (!ref) return 'review_moab';
  const [chapterStr, verseStr] = ref.split(':');
  const chapter = Number(chapterStr);
  const verse = Number(verseStr);
  const segment = VERSE_SCENE_SEGMENTS.find(entry => entry.chapter === chapter && verse >= entry.from && verse <= entry.to);
  return segment?.scene ?? 'review_moab';
}


export async function runLevelTwelve() {
  const plan = levelAmbiencePlan.level12;
  const fallbackAmbience = plan?.apply ?? 'voidFinale';
  const verses = await loadOriginalVerses();
  let currentSceneId = sceneForReference(verses[0]?.ref) ?? REVIEW_SCENES[0]?.id ?? 'review_moab';

  const activateScene = sceneId => {
    const blueprint = REVIEW_SCENES.find(scene => scene.id === sceneId) ?? REVIEW_SCENES[0];
    if (!blueprint) {
      applySceneConfig({
        ambience: fallbackAmbience,
        wizardStartX: 96,
        donkeyOffset: -34,
        props: cloneSceneProps([]),
      });
      ensureAmbience(fallbackAmbience);
      setSceneContext({ level: 'level12', phase: 'original' });
      return;
    }
    const config = {
      ...blueprint,
      props: cloneSceneProps(blueprint.props),
    };
    applySceneConfig(config);
    ensureAmbience(blueprint.ambience ?? fallbackAmbience);
    setSceneContext({ level: 'level12', phase: blueprint.id ?? 'review' });
    const track = LEVEL_MUSIC.find(entry => entry.sceneId === blueprint.id)?.track ?? null;
    if (track) {
      switchMusic(track);
    }
  };

  activateScene(currentSceneId);
  setLifeBars(null);

  await showLevelTitle('Originalstory');
  await fadeToBase(600);

  for (const verse of verses) {
    const targetScene = sceneForReference(verse.ref);
    if (targetScene && targetScene !== currentSceneId) {
      currentSceneId = targetScene;
      activateScene(currentSceneId);
    }
    const sanitizedHebrew = verse.hebrew || '—';
    const germanLine = verse.german || `Numeri ${verse.ref.replace(':', ',')} – Worte bleiben bestehen.`;
    const referenceLine = `            Numeri ${verse.ref}`;
    await divineSay(`${sanitizedHebrew}\n${germanLine}\n${referenceLine}`);
  }

  await fadeToBlack(900);
  setLifeBars(null);
}

async function loadOriginalVerses() {
  const [hebrewRaw, germanRaw] = await Promise.all([
    fetch(new URL('./original.txt', import.meta.url)).then(response => (response.ok ? response.text() : '')),
    fetch(new URL('./original-deutsch.txt', import.meta.url)).then(response => (response.ok ? response.text() : '')),
  ]);
  const hebrewMap = parseHebrewVerses(hebrewRaw);
  const germanEntries = parseGermanVerses(germanRaw);
  if (germanEntries.length === 0) {
    return Array.from(hebrewMap.entries()).map(([ref, hebrew]) => ({ ref, hebrew, german: '' }));
  }
  return germanEntries.map(entry => ({
    ref: entry.ref,
    hebrew: hebrewMap.get(entry.ref) ?? '—',
    german: entry.german,
  }));
}

function stripDirectionalControls(text) {
  return text.replace(/[\u202a-\u202e]/g, '');
}

function stripNiqqud(text) {
  return text.replace(/[\u0591-\u05C7]/g, '');
}

function parseHebrewVerses(raw) {
  const map = new Map();
  if (!raw) return map;
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const cleaned = stripDirectionalControls(line).trim();
    if (!cleaned) continue;
    const match = cleaned.match(/^(\d+)\s+\u05C3(\d+)\s+(.+)$/u);
    if (!match) continue;
    const verseNumber = match[1];
    const chapterNumber = match[2];
    const hebrew = stripNiqqud(match[3]).trim();
    if (!hebrew) continue;
    map.set(`${chapterNumber}:${verseNumber}`, hebrew);
  }
  return map;
}

function parseGermanVerses(raw) {
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);
  let currentChapter = null;
  let buffer = '';
  const verses = [];
  const flushBuffer = () => {
    if (!currentChapter || !buffer.trim()) return;
    const normalized = buffer.replace(/[\u2000-\u200b]/g, ' ');
    const regex = /(\d+)\s+(.+?)(?=(\d+)\s+|$)/gs;
    let match;
    while ((match = regex.exec(normalized)) !== null) {
      const verseNumber = match[1];
      const content = match[2]?.trim();
      if (!content) continue;
      verses.push({ ref: `${currentChapter}:${verseNumber}`, german: content });
    }
    buffer = '';
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const chapterMatch = trimmed.match(/^#\s*(\d+)/);
    if (chapterMatch) {
      flushBuffer();
      currentChapter = chapterMatch[1];
      continue;
    }
    if (!currentChapter) continue;
    buffer += (buffer ? ' ' : '') + trimmed;
  }
  flushBuffer();
  return verses;
}
