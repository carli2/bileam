const PLAYLIST_URL = new URL('./music/playlist.json', import.meta.url);

let audioElement = null;
let playlist = [];
let lastIndex = -1;
let unlockEventsAttached = false;
let startRequested = false;
let playbackUnlocked = false;
let startInProgress = false;

const FADE_OUT_DURATION = 500;
const FADE_IN_DURATION = 1400;
let baseVolume = 1;
let fadeLevel = 1;
let fadeTarget = 1;
let fadeStartLevel = 1;
let fadeDuration = 0;
let fadeStartTime = 0;
let fadeFrame = null;
let fadeToken = 0;
let focusSuppressed = false;
let focusPaused = false;
let pendingFocusResume = false;

const playlistPromise = fetchPlaylist();

function fetchPlaylist() {
  return fetch(PLAYLIST_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Playlist request failed with ${response.status}`);
      }
      return response.json();
    })
    .then(entries => {
      if (!Array.isArray(entries)) {
        return [];
      }
      return entries
        .map(item => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean);
    })
    .catch(error => {
      console.warn('Failed to load music playlist', error);
      return [];
    });
}

function attachUnlockEvents() {
  if (unlockEventsAttached) return;
  window.addEventListener('pointerdown', handleUnlockEvent, true);
  window.addEventListener('keydown', handleUnlockEvent, true);
  unlockEventsAttached = true;
}

function detachUnlockEvents() {
  if (!unlockEventsAttached) return;
  window.removeEventListener('pointerdown', handleUnlockEvent, true);
  window.removeEventListener('keydown', handleUnlockEvent, true);
  unlockEventsAttached = false;
}

function ensureAudioElement() {
  if (audioElement) return;
  audioElement = new Audio();
  audioElement.loop = false;
  audioElement.preload = 'auto';
  applyVolume();
  audioElement.addEventListener('ended', () => {
    queueNextTrack();
  });
  audioElement.addEventListener('error', event => {
    const sourceError = event?.target?.error;
    if (sourceError) {
      console.warn('Music playback error', sourceError);
    }
    queueNextTrack();
  });
}

function handleUnlockEvent() {
  startRequested = true;
  beginPlayback().catch(error => {
    console.warn('Music playback could not start', error);
  });
}

function pickNextTrack() {
  if (playlist.length === 0) {
    return null;
  }
  if (playlist.length === 1) {
    lastIndex = 0;
    return playlist[0];
  }
  let index = lastIndex;
  while (index === lastIndex) {
    index = Math.floor(Math.random() * playlist.length);
  }
  lastIndex = index;
  return playlist[index];
}

async function playTrack(trackName) {
  if (!audioElement || !trackName) return;
  const url = new URL(`./music/${trackName}`, import.meta.url);
  audioElement.src = url.toString();
  audioElement.currentTime = 0;
  applyVolume();
  await audioElement.play();
}

async function queueNextTrack() {
  if (!playlist.length) {
    playbackUnlocked = false;
    return;
  }
  try {
    const next = pickNextTrack();
    await playTrack(next);
  } catch (error) {
    console.warn('Failed to queue next music track', error);
  }
}

async function beginPlayback() {
  if (playbackUnlocked || startInProgress) {
    if (audioElement && audioElement.paused && playbackUnlocked) {
      try {
        applyVolume();
        await audioElement.play();
      } catch (error) {
        console.warn('Failed to resume music playback', error);
      }
    }
    return;
  }
  if (!playlist.length || !audioElement) {
    return;
  }
  startInProgress = true;
  detachUnlockEvents();
  try {
    await queueNextTrack();
    playbackUnlocked = true;
    startRequested = false;
  } catch (error) {
    attachUnlockEvents();
    throw error;
  } finally {
    startInProgress = false;
  }
}

export function initMusicPlayer() {
  attachUnlockEvents();
  playlistPromise.then(list => {
    playlist = list;
    ensureAudioElement();
    applyInitialFocusState();
    if (startRequested && playlist.length) {
      beginPlayback().catch(error => {
        console.warn('Music playback failed after playlist load', error);
      });
    }
  });
  window.addEventListener('blur', handleWindowBlur, true);
  window.addEventListener('focus', handleWindowFocus, true);
  document.addEventListener('visibilitychange', handleVisibilityChange, true);
}

export function isMusicPlaying() {
  return Boolean(audioElement && !audioElement.paused);
}

export function stopMusic() {
  if (!audioElement) return;
  audioElement.pause();
}

export function setMusicVolume(volume) {
  baseVolume = Math.min(1, Math.max(0, volume));
  applyVolume();
}

export async function switchMusicTrack(trackName, options = {}) {
  if (!trackName) return;
  ensureAudioElement();
  const fadeOutDuration = Math.max(0, options.fadeOut ?? FADE_OUT_DURATION);
  const fadeInDuration = Math.max(0, options.fadeIn ?? FADE_IN_DURATION);
  try {
    if (audioElement && playbackUnlocked) {
      fadeTo(0, fadeOutDuration);
      if (fadeOutDuration > 0) {
        await delay(fadeOutDuration);
      }
    }
    await playTrack(trackName);
    playbackUnlocked = true;
    startRequested = false;
    fadeTo(1, fadeInDuration);
  } catch (error) {
    console.warn('Failed to switch music track', error);
  }
}

// initialise playlist fetch immediately but allow consumers to re-attempt start
playlistPromise.then(list => {
  if (!list.length) {
    console.warn('Music playlist is empty; background music disabled');
  }
  if (startRequested && list.length) {
    ensureAudioElement();
    beginPlayback().catch(error => {
      console.warn('Music playback failed during initialisation', error);
    });
  }
});

function applyVolume() {
  if (!audioElement) return;
  const level = Math.min(1, Math.max(0, baseVolume * fadeLevel));
  audioElement.volume = level;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fadeTo(level, duration) {
  const clampedLevel = Math.min(1, Math.max(0, level));
  if (duration <= 0) {
    fadeLevel = clampedLevel;
    fadeTarget = clampedLevel;
    if (fadeFrame) {
      cancelAnimationFrame(fadeFrame);
      fadeFrame = null;
    }
    applyVolume();
    return;
  }
  fadeTarget = clampedLevel;
  fadeStartLevel = fadeLevel;
  fadeDuration = duration;
  fadeStartTime = performance.now();
  const token = ++fadeToken;
  const step = now => {
    const elapsed = now - fadeStartTime;
    const t = Math.min(1, elapsed / fadeDuration);
    const eased = t * t * (3 - 2 * t);
    fadeLevel = fadeStartLevel + (fadeTarget - fadeStartLevel) * eased;
    applyVolume();
    if (t < 1 && token === fadeToken) {
      fadeFrame = requestAnimationFrame(step);
    } else {
      fadeFrame = null;
      fadeLevel = fadeTarget;
      applyVolume();
    }
  };
  if (fadeFrame) {
    cancelAnimationFrame(fadeFrame);
    fadeFrame = null;
  }
  fadeFrame = requestAnimationFrame(step);
}

function handleWindowBlur() {
  focusSuppressed = true;
  applyFocusState();
}

function handleWindowFocus() {
  focusSuppressed = false;
  applyFocusState();
}

function handleVisibilityChange() {
  applyFocusState();
}

function applyFocusState() {
  const hidden = document.hidden === true;
  const shouldMute = hidden || focusSuppressed;
  if (shouldMute) {
    if (hidden) {
      const wasPlaying = Boolean(audioElement && !audioElement.paused && playbackUnlocked);
      fadeTo(0, 0);
      if (wasPlaying) {
        focusPaused = true;
        try {
          audioElement.pause();
        } catch (error) {
          console.warn('Music pause failed on focus loss', error);
        }
      }
      pendingFocusResume = false;
    } else {
      fadeTo(0, FADE_OUT_DURATION);
    }
    return;
  }

  if (focusPaused && playbackUnlocked && !pendingFocusResume) {
    pendingFocusResume = true;
    fadeTo(0, 0);
    setTimeout(() => {
      pendingFocusResume = false;
      if (!audioElement) {
        ensureAudioElement();
      }
      beginPlayback()
        .then(() => {
          fadeTo(1, FADE_IN_DURATION);
        })
        .catch(error => {
          focusPaused = true;
          console.warn('Music resume failed after focus change', error);
        });
    }, 0);
    focusPaused = false;
    return;
  }

  fadeTo(1, FADE_IN_DURATION);
}

function applyInitialFocusState() {
  const hasFocus = typeof document.hasFocus === 'function' ? document.hasFocus() : true;
  focusSuppressed = !hasFocus;
  const hidden = document.hidden === true;
  if (hidden || focusSuppressed) {
    fadeLevel = 0;
    fadeTarget = 0;
    if (audioElement && !audioElement.paused && playbackUnlocked) {
      focusPaused = true;
      try {
        audioElement.pause();
      } catch (error) {
        console.warn('Music pause failed during initial focus state', error);
      }
    }
  } else {
    fadeLevel = 1;
    fadeTarget = 1;
    focusPaused = false;
  }
  applyVolume();
}
