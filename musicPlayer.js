const PLAYLIST_URL = new URL('./music/playlist.json', import.meta.url);

let audioElement = null;
let playlist = [];
let lastIndex = -1;
let unlockEventsAttached = false;
let startRequested = false;
let playbackUnlocked = false;
let startInProgress = false;

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
    if (startRequested && playlist.length) {
      beginPlayback().catch(error => {
        console.warn('Music playback failed after playlist load', error);
      });
    }
  });
}

export function isMusicPlaying() {
  return Boolean(audioElement && !audioElement.paused);
}

export function stopMusic() {
  if (!audioElement) return;
  audioElement.pause();
}

export function setMusicVolume(volume) {
  if (!audioElement) return;
  audioElement.volume = Math.min(1, Math.max(0, volume));
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
