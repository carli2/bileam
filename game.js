import './game.helpers.js';
import { initMusicPlayer } from './musicPlayer.js';
import { beginGame } from './game.main.js';
import { setSceneSuspended } from './scene.js';

initMusicPlayer();

const canvas = document.getElementById('screen');
const ctx = canvas?.getContext('2d');

const WIDTH = canvas?.width ?? 320;
const HEIGHT = canvas?.height ?? 200;

const fullscreenCandidates = [
  canvas,
  canvas?.parentElement ?? null,
  document.documentElement,
].filter(Boolean);

const fullscreenEnabled = Boolean(
  document.fullscreenEnabled
  || document.webkitFullscreenEnabled
  || document.mozFullScreenEnabled
  || document.msFullscreenEnabled,
);

const fullscreenSupported = fullscreenEnabled && fullscreenCandidates.some(element => {
  if (!element) return false;
  return Boolean(
    element.requestFullscreen
      || element.webkitRequestFullscreen
      || element.mozRequestFullScreen
      || element.msRequestFullscreen,
  );
});

const TITLE_FONT = '36px "Palatino Linotype", "Book Antiqua", serif';
const SUBTITLE_FONT = '18px "Frank Ruehl", "Noto Sans Hebrew", "Times New Roman", serif';
const HINT_FONT = '13px "Palatino Linotype", "Book Antiqua", serif';

let gameStarted = false;
let gateActive = true;
const primarySubtitle = 'אש — bitte klicken — מים';

let gateHint = fullscreenSupported ? '' : 'Klicke, um zu starten.';
let fullscreenRequestInFlight = false;

if (ctx) {
  ctx.imageSmoothingEnabled = false;
}

function fullscreenElement() {
  return document.fullscreenElement
    || document.webkitFullscreenElement
    || document.mozFullScreenElement
    || document.msFullscreenElement
    || null;
}

function isFullscreenActive() {
  return Boolean(fullscreenElement());
}

function layoutHintLines(text, maxWidth) {
  if (!ctx) return [];
  const content = String(text ?? '').trim();
  if (!content) {
    return [];
  }
  const words = content.split(/\s+/);
  const lines = [];
  let current = words.shift();
  ctx.font = HINT_FONT;
  while (words.length > 0) {
    const nextWord = words.shift();
    const candidate = `${current} ${nextWord}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = nextWord;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.slice(0, 3);
}

function drawGateScreen(hintText = gateHint) {
  if (!ctx) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, 'rgba(10, 12, 20, 0.96)');
  gradient.addColorStop(1, 'rgba(5, 6, 12, 0.96)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = 'rgba(244, 210, 127, 0.28)';
  ctx.fillRect(18, 24, WIDTH - 36, HEIGHT - 48);

  ctx.fillStyle = '#05060c';
  ctx.fillRect(20, 26, WIDTH - 40, HEIGHT - 52);

  ctx.strokeStyle = 'rgba(244, 210, 127, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(20.5, 26.5, WIDTH - 41, HEIGHT - 53);

  const centerY = HEIGHT / 2;
  const titleY = centerY - 32;
  const separatorY = centerY - 8;
  const subtitleY = centerY + 18;
  const hintBaseY = centerY + 46;

  ctx.fillStyle = '#f4d27f';
  ctx.font = TITLE_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Bileam', WIDTH / 2, titleY);

  ctx.strokeStyle = 'rgba(244, 210, 127, 0.42)';
  ctx.beginPath();
  ctx.moveTo(70, separatorY);
  ctx.lineTo(WIDTH - 70, separatorY);
  ctx.stroke();

  ctx.fillStyle = '#ffe8a8';
  ctx.font = SUBTITLE_FONT;
  ctx.fillText(primarySubtitle, WIDTH / 2, subtitleY);

  ctx.fillStyle = 'rgba(255, 232, 168, 0.78)';
  ctx.font = HINT_FONT;
  const hintLines = layoutHintLines(hintText, WIDTH - 48);
  if (hintLines.length > 0) {
    const baseY = hintBaseY - ((hintLines.length - 1) * 14) / 2;
    hintLines.forEach((line, index) => {
      ctx.fillText(line, WIDTH / 2, baseY + index * 14);
    });
  }

  ctx.restore();
}

function activateGate(message) {
  if (message) {
    gateHint = message;
  }
  gateActive = true;
  drawGateScreen(gateHint);
}

function deactivateGate() {
  gateActive = false;
}

async function requestFullscreen() {
  if (fullscreenRequestInFlight) {
    return false;
  }
  if (!fullscreenSupported) {
    return false;
  }
  fullscreenRequestInFlight = true;

  for (const element of fullscreenCandidates) {
    const request =
      element.requestFullscreen
      || element.webkitRequestFullscreen
      || element.mozRequestFullScreen
      || element.msRequestFullscreen;
    if (typeof request === 'function') {
      try {
        await request.call(element);
        fullscreenRequestInFlight = false;
        return isFullscreenActive();
      } catch (error) {
        console.warn('Fullscreen request failed', error);
        fullscreenRequestInFlight = false;
        return false;
      }
    }
  }

  fullscreenRequestInFlight = false;
  return isFullscreenActive();
}

function updateFullscreenState() {
  if (!fullscreenSupported) {
    if (gateActive && gameStarted) {
      deactivateGate();
    }
    setSceneSuspended(false);
    return;
  }
  const active = isFullscreenActive();
  if (gameStarted) {
    setSceneSuspended(!active);
  }
  if (!active) {
    const message = gameStarted
      ? 'Vollbild erneut aktivieren, um weiterzuspielen.'
      : 'Bitte bestätige das Vollbild, um fortzufahren.';
    activateGate(message);
  } else if (gateActive && gameStarted) {
    deactivateGate();
  }
}

function ensureGameStarted() {
  if (gameStarted) return;
  beginGame();
  gameStarted = true;
}

async function handleGateActivation(event) {
  if (!gateActive) {
    return;
  }
  if (event?.type === 'keydown') {
    if (event.repeat) return;
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
  } else if (event?.type === 'pointerdown') {
    if (event.button !== 0) return;
    event.preventDefault();
  } else {
    return;
  }

  if (!fullscreenSupported) {
    ensureGameStarted();
    deactivateGate();
    setSceneSuspended(false);
    return;
  }

  if (isFullscreenActive()) {
    if (!gameStarted) {
      ensureGameStarted();
    }
    deactivateGate();
    setSceneSuspended(false);
    return;
  }

  activateGate('Bestätige die Vollbild-Anfrage, um die Reise zu beginnen.');

  const success = await requestFullscreen();
  if (!success) {
    activateGate('Vollbild konnte nicht aktiviert werden. Bitte erlaube Vollbild und versuche es erneut.');
    return;
  }

  ensureGameStarted();
  deactivateGate();
  setSceneSuspended(false);
}

if (canvas) {
  canvas.addEventListener('pointerdown', handleGateActivation);
}
window.addEventListener('keydown', handleGateActivation, true);

if (fullscreenSupported) {
  document.addEventListener('fullscreenchange', () => {
    updateFullscreenState();
    if (isFullscreenActive() && gameStarted) {
      deactivateGate();
    }
  });
  document.addEventListener('webkitfullscreenchange', () => {
    updateFullscreenState();
    if (isFullscreenActive() && gameStarted) {
      deactivateGate();
    }
  });
}

activateGate(gateHint);
