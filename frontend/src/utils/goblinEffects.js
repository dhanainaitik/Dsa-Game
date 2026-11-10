/**
 * Goblin Defeat Effects: Evil Laugh Sound + Haptic Vibration + Screen Shake
 * Enhanced incorrect-submission experience for Codo2Living.
 */

const GOBLIN_SOUND_PATH = '/sounds/goblin-laugh.wav';
const GOBLIN_VOLUME = 0.55; // Strictly 55% of maximum volume
const VIBRATION_PATTERN = [100, 50, 150, 50, 200];

// State & Preload references
let preloadedAudio = null;
let currentAudioInstance = null;
let lastTriggerTime = 0;
const TRIGGER_DEBOUNCE_MS = 1400; // Prevent overlapping audio within 1.4s

/**
 * Check if the user has muted sounds
 */
export function isSoundMuted() {
  if (typeof window === 'undefined') return true;
  try {
    return (
      localStorage.getItem('codo_sound_muted') === 'true' ||
      localStorage.getItem('codo-sound-muted') === 'true' ||
      localStorage.getItem('sound_muted') === 'true'
    );
  } catch {
    return false;
  }
}

/**
 * Set user sound mute preference
 */
export function setSoundMuted(muted) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('codo_sound_muted', muted ? 'true' : 'false');
  } catch {
    // ignore
  }
}

/**
 * Preload the Goblin laugh audio asset to minimize playback delay
 */
export function preloadGoblinAudio() {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
  if (!preloadedAudio) {
    try {
      preloadedAudio = new Audio(GOBLIN_SOUND_PATH);
      preloadedAudio.preload = 'auto';
      preloadedAudio.volume = GOBLIN_VOLUME;
      // Preload trigger
      preloadedAudio.load();
    } catch (e) {
      console.warn('Goblin audio preload failed:', e);
    }
  }
}

// Automatically preload on module import in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    preloadGoblinAudio();
  } else {
    window.addEventListener('DOMContentLoaded', preloadGoblinAudio, { once: true });
  }
}

/**
 * Play device haptic vibration where supported
 * Pattern: [100, 50, 150, 50, 200]
 */
export function triggerFailureVibration(pattern = VIBRATION_PATTERN) {
  if (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  ) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Gracefully handle browsers/devices without vibration or permission blocks
    }
  }
}

/**
 * Web Audio API procedural synthesizer fallback
 * Plays an evil high-pitched goblin cackle at 55% volume if audio file is blocked
 */
function playProceduralGoblinLaugh(volume = GOBLIN_VOLUME) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Goblin Laugh Pulses
    const pulses = [
      { t: 0.05, dur: 0.14, pitch: 420, endPitch: 460 },
      { t: 0.23, dur: 0.16, pitch: 470, endPitch: 530 },
      { t: 0.44, dur: 0.19, pitch: 560, endPitch: 630 },
      { t: 0.69, dur: 0.22, pitch: 640, endPitch: 580 },
      { t: 0.96, dur: 0.22, pitch: 590, endPitch: 510 },
      { t: 1.24, dur: 0.21, pitch: 520, endPitch: 430 },
      { t: 1.50, dur: 0.45, pitch: 450, endPitch: 280 },
    ];

    pulses.forEach(p => {
      const startTime = ctx.currentTime + p.t;
      const osc = ctx.createOscillator();
      const growlOsc = ctx.createOscillator();
      const growlGain = ctx.createGain();
      const pulseGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Formant Bandpass Filter (goblin throat nasality)
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, startTime);
      filter.Q.setValueAtTime(3.5, startTime);

      // Pitch sweep
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(p.pitch, startTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(100, p.endPitch), startTime + p.dur);

      // Throat Growl FM (raspy villain undertone)
      growlOsc.type = 'sine';
      growlOsc.frequency.setValueAtTime(32, startTime);
      growlGain.gain.setValueAtTime(p.pitch * 0.15, startTime);
      growlOsc.connect(growlGain);
      growlGain.connect(osc.frequency);

      // Amplitude envelope
      pulseGain.gain.setValueAtTime(0.001, startTime);
      pulseGain.gain.linearRampToValueAtTime(0.7, startTime + 0.03);
      pulseGain.gain.exponentialRampToValueAtTime(0.001, startTime + p.dur);

      osc.connect(filter);
      filter.connect(pulseGain);
      pulseGain.connect(masterGain);

      growlOsc.start(startTime);
      osc.start(startTime);
      growlOsc.stop(startTime + p.dur);
      osc.stop(startTime + p.dur);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 2400);
  } catch (err) {
    console.warn('Procedural goblin laugh failed:', err);
  }
}

/**
 * Play the Goblin evil laugh sound at 55% volume
 * Handles preloaded audio, browser autoplay, single instance, and cleanup
 */
export function playGoblinLaugh(volume = GOBLIN_VOLUME) {
  if (isSoundMuted()) return;

  const now = Date.now();
  if (now - lastTriggerTime < TRIGGER_DEBOUNCE_MS) {
    return; // Prevent rapid overlapping cacophony
  }
  lastTriggerTime = now;

  try {
    // Stop any existing instance
    if (currentAudioInstance) {
      try {
        currentAudioInstance.pause();
        currentAudioInstance.currentTime = 0;
      } catch {
        // ignore
      }
      currentAudioInstance = null;
    }

    // Reuse preloaded audio or create fresh element
    const audio = preloadedAudio || new Audio(GOBLIN_SOUND_PATH);
    audio.volume = Math.max(0, Math.min(1, volume)); // strictly 0.55
    audio.currentTime = 0;
    currentAudioInstance = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        // If HTML5 audio playback was blocked by browser policy, fallback to Web Audio
        console.info('HTML5 audio blocked by browser policy, attempting Web Audio synthesis fallback...');
        playProceduralGoblinLaugh(volume);
      });
    }

    audio.onended = () => {
      if (currentAudioInstance === audio) {
        currentAudioInstance = null;
      }
    };
  } catch {
    // Fallback if Audio constructor fails
    playProceduralGoblinLaugh(volume);
  }
}

/**
 * Trigger Screen Shake effect using GSAP if present, or CSS fallback
 */
export function triggerScreenShakeEffect(targetSelector = '.battle-arena') {
  if (typeof window === 'undefined') return;
  const target =
    document.querySelector(targetSelector) ||
    document.querySelector('.battle-arena') ||
    document.querySelector('.bg-arena') ||
    document.querySelector('.mp-arena') ||
    document.querySelector('.page-content');

  if (!target) return;

  if (window.gsap) {
    window.gsap.fromTo(
      target,
      { x: -6 },
      {
        x: 6,
        duration: 0.05,
        repeat: 5,
        yoyo: true,
        onComplete: () => window.gsap.set(target, { x: 0 }),
      }
    );
  } else {
    target.animate(
      [
        { transform: 'translateX(0px)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(0px)' },
      ],
      { duration: 300, easing: 'ease-in-out' }
    );
  }
}

/**
 * Combined Goblin Defeat Sequence:
 * Simultaneously executes:
 * 1. Screen shake animation
 * 2. Device vibration ([100, 50, 150, 50, 200])
 * 3. Goblin evil laugh sound at 55% volume
 *
 * ONLY to be called upon authoritative incorrect submission (test cases failed).
 */
export function triggerGoblinDefeatEffects(options = {}) {
  const {
    targetSelector = '.battle-arena',
    customScreenShake = null,
    volume = GOBLIN_VOLUME,
    vibrationPattern = VIBRATION_PATTERN,
  } = options;

  // 1. Screen Shake
  if (typeof customScreenShake === 'function') {
    try {
      customScreenShake();
    } catch {
      triggerScreenShakeEffect(targetSelector);
    }
  } else {
    triggerScreenShakeEffect(targetSelector);
  }

  // 2. Device Vibration
  triggerFailureVibration(vibrationPattern);

  // 3. Goblin Evil Laugh Audio at 55% Volume
  playGoblinLaugh(volume);
}

