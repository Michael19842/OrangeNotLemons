import { ref } from 'vue';

// Audio file paths - all audio files go in public/audio/
const AUDIO_FILES = {
  // Background music
  bgm: '/audio/bgm.mp3',

  // UI sounds
  click: '/audio/click.mp3',

  // Slot machine sounds
  spin: '/audio/click.mp3',       // Use click as fallback
  slotStop: '/audio/slot-stop.mp3',

  // Result sounds
  win: '/audio/win.mp3',
  lose: '/audio/lose.mp3',
  jackpot: '/audio/jackpot.mp3',

  // Timer sounds (use notification as fallback)
  warning: '/audio/notification.mp3',
  timeout: '/audio/lose.mp3',
  tick: '/audio/click.mp3',

  // Game events
  research: '/audio/research.mp3',
  notification: '/audio/notification.mp3',

  // Game over sounds
  victory: '/audio/win.mp3',
  death: '/audio/lose.mp3',
  leaked: '/audio/leaked.mp3',
  termEnd: '/audio/win.mp3',
} as const;

type SoundName = keyof typeof AUDIO_FILES;

// Audio cache to prevent reloading
const audioCache = new Map<string, HTMLAudioElement>();

// Global state
const isMuted = ref(false);
const musicVolume = ref(0.15);
const sfxVolume = ref(0.5);
const audioUnlocked = ref(false);
let bgmAudio: HTMLAudioElement | null = null;
let currentGameOverSound: HTMLAudioElement | null = null;

// Unlock audio context on first user interaction (required for mobile)
function unlockAudio() {
  if (audioUnlocked.value) return;
  
  // Create and play a silent audio to unlock the audio context
  const silentAudio = new Audio();
  silentAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4T/////////////////MP3/AAAAAAAAAAAAAAAAAAAAAP/7kGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
  silentAudio.volume = 0;
  
  const playPromise = silentAudio.play();
  if (playPromise) {
    playPromise.then(() => {
      audioUnlocked.value = true;
      console.log('Audio unlocked for mobile');
    }).catch(() => {
      // Still locked, will try again on next interaction
    });
  }
}

function getAudio(name: SoundName): HTMLAudioElement | null {
  const path = AUDIO_FILES[name];

  if (audioCache.has(path)) {
    return audioCache.get(path)!;
  }

  try {
    const audio = new Audio(path);
    audio.preload = 'auto';
    audioCache.set(path, audio);
    return audio;
  } catch (e) {
    console.warn(`Failed to load audio: ${path}`);
    return null;
  }
}

function preloadAudio() {
  // Preload all audio files
  Object.keys(AUDIO_FILES).forEach((name) => {
    getAudio(name as SoundName);
  });
  
  // Try to unlock audio on load (may fail, but worth trying)
  unlockAudio();
}

function playSound(name: SoundName, volume?: number) {
  if (isMuted.value) return;

  // Try to unlock audio on first sound play
  unlockAudio();

  const audio = getAudio(name);
  if (!audio) return;

  // Clone for overlapping sounds
  const clone = audio.cloneNode() as HTMLAudioElement;
  clone.volume = volume ?? sfxVolume.value;

  // Force load and play
  clone.load();
  const playPromise = clone.play();
  if (playPromise) {
    playPromise.catch((error) => {
      console.warn(`Failed to play sound ${name}:`, error);
    });
  }
}

function playGameOverSound(name: SoundName, volume?: number) {
  // Stop any existing game over sound first
  stopGameOverSound();

  if (isMuted.value) return;

  unlockAudio();

  const audio = getAudio(name);
  if (!audio) return;

  currentGameOverSound = audio.cloneNode() as HTMLAudioElement;
  currentGameOverSound.volume = volume ?? sfxVolume.value;
  currentGameOverSound.load();

  const playPromise = currentGameOverSound.play();
  if (playPromise) {
    playPromise.catch((error) => {
      console.warn(`Failed to play game over sound ${name}:`, error);
    });
  }
}

function stopGameOverSound() {
  if (currentGameOverSound) {
    currentGameOverSound.pause();
    currentGameOverSound.currentTime = 0;
    currentGameOverSound = null;
  }
}

function playMusic() {
  if (bgmAudio) {
    bgmAudio.play().catch(() => {});
    return;
  }

  bgmAudio = getAudio('bgm');
  if (!bgmAudio) return;

  bgmAudio.loop = true;
  bgmAudio.volume = musicVolume.value;
  // Ensure seamless looping
  bgmAudio.preload = 'auto';
  bgmAudio.addEventListener('ended', () => {
    bgmAudio!.currentTime = 0;
    bgmAudio!.play().catch(() => {});
  });
  bgmAudio.play().catch(() => {
    // Autoplay blocked - will start on first user interaction
  });
}

function stopMusic() {
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
  }
}

function pauseMusic() {
  if (bgmAudio) {
    bgmAudio.pause();
  }
}

function resumeMusic() {
  if (bgmAudio && !isMuted.value) {
    bgmAudio.play().catch(() => {});
  }
}

function setMusicVolume(volume: number) {
  musicVolume.value = Math.max(0, Math.min(1, volume));
  if (bgmAudio) {
    bgmAudio.volume = musicVolume.value;
  }
}

function setSfxVolume(volume: number) {
  sfxVolume.value = Math.max(0, Math.min(1, volume));
}

function toggleMute() {
  isMuted.value = !isMuted.value;
  if (bgmAudio) {
    if (isMuted.value) {
      bgmAudio.pause();
    } else {
      bgmAudio.play().catch(() => {});
    }
  }
}

function setMuted(muted: boolean) {
  isMuted.value = muted;
  if (bgmAudio) {
    if (muted) {
      bgmAudio.pause();
    } else {
      bgmAudio.play().catch(() => {});
    }
  }
}

export function useAudio() {
  return {
    // State
    isMuted,
    musicVolume,
    sfxVolume,
    audioUnlocked,

    // Methods
    unlockAudio,
    preloadAudio,
    playSound,
    playGameOverSound,
    stopGameOverSound,
    playMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    setMusicVolume,
    setSfxVolume,
    toggleMute,
    setMuted,

    // Sound names for convenience
    sounds: AUDIO_FILES,
  };
}
