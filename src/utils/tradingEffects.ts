// Trading sound effects and animations
// Uses Web Audio API for sounds and CSS animations for visuals
import { useAudio } from '@/composables/useAudio';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Get volume from settings
function getSfxVolume(): number {
  const saved = localStorage.getItem('gameSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    return settings.sfxVolume ?? 0.7;
  }
  return 0.7;
}

function isMuted(): boolean {
  const { isMuted } = useAudio();
  return isMuted.value;
}

// Play a profit sound (ascending arpeggio)
export function playProfitSound(intensity: 'small' | 'medium' | 'big' = 'medium') {
  if (isMuted()) return;

  // Use mp3 file via useAudio
  const { playSound } = useAudio();
  playSound('tradeProfit');
}

// Legacy Web Audio implementation (kept for reference)
function _playProfitSoundWebAudio(intensity: 'small' | 'medium' | 'big' = 'medium') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const volume = getSfxVolume();

    const baseFreq = intensity === 'big' ? 440 : intensity === 'medium' ? 392 : 349;
    const notes = [1, 1.25, 1.5, 2]; // Major chord progression
    const duration = intensity === 'big' ? 0.15 : 0.1;

    notes.forEach((mult, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = baseFreq * mult;
      osc.type = 'sine';

      const startTime = now + i * duration;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15 * volume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 2);

      osc.start(startTime);
      osc.stop(startTime + duration * 2);
    });

    // Extra sparkle for big wins
    if (intensity === 'big') {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1 * volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }, 400);
    }
  } catch (e) {
    console.warn('Audio not available:', e);
  }
}

// Play a loss sound (descending tone)
export function playLossSound(intensity: 'small' | 'medium' | 'big' = 'medium') {
  if (isMuted()) return;

  // Use mp3 file via useAudio
  const { playSound } = useAudio();
  playSound('tradeLoss');
}

// Play buy/sell confirmation sound
export function playTradeSound(type: 'buy' | 'sell') {
  if (isMuted()) return;

  // Use mp3 file via useAudio
  const { playSound } = useAudio();
  playSound(type === 'buy' ? 'buy' : 'sell');
}

// Play research reveal sound
export function playResearchSound() {
  if (isMuted()) return;

  // Use mp3 file via useAudio
  const { playSound } = useAudio();
  playSound('research');
}

// Create confetti explosion animation
export function triggerConfetti(container: HTMLElement, color: 'gold' | 'green' | 'rainbow' = 'gold') {
  const colors = color === 'rainbow'
    ? ['#ff0000', '#ff7700', '#ffdd00', '#00ff00', '#00ddff', '#7700ff']
    : color === 'green'
    ? ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
    : ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d'];

  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'confetti-particle';
    particle.style.cssText = `
      position: absolute;
      width: ${4 + Math.random() * 6}px;
      height: ${4 + Math.random() * 6}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      left: 50%;
      top: 50%;
      pointer-events: none;
      z-index: 1000;
    `;

    container.appendChild(particle);

    const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
    const velocity = 100 + Math.random() * 150;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 100;

    particle.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${vx}px), calc(-50% + ${vy + 200}px)) scale(0) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ], {
      duration: 800 + Math.random() * 400,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => particle.remove();
  }
}

// Shake animation for losses
export function triggerShake(element: HTMLElement, intensity: 'small' | 'medium' | 'big' = 'medium') {
  const magnitude = intensity === 'big' ? 10 : intensity === 'medium' ? 6 : 3;
  const duration = intensity === 'big' ? 500 : intensity === 'medium' ? 350 : 200;

  element.animate([
    { transform: 'translateX(0)' },
    { transform: `translateX(-${magnitude}px)` },
    { transform: `translateX(${magnitude}px)` },
    { transform: `translateX(-${magnitude * 0.7}px)` },
    { transform: `translateX(${magnitude * 0.7}px)` },
    { transform: `translateX(-${magnitude * 0.4}px)` },
    { transform: `translateX(${magnitude * 0.4}px)` },
    { transform: 'translateX(0)' }
  ], {
    duration,
    easing: 'ease-out'
  });
}

// Flash red for losses
export function triggerRedFlash(element: HTMLElement) {
  const originalBg = element.style.background;

  element.animate([
    { background: 'rgba(239, 68, 68, 0.3)' },
    { background: originalBg || 'transparent' }
  ], {
    duration: 400,
    easing: 'ease-out'
  });
}

// Pulse green for profits
export function triggerGreenPulse(element: HTMLElement) {
  element.animate([
    { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.5)' },
    { boxShadow: '0 0 20px 10px rgba(16, 185, 129, 0.3)' },
    { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }
  ], {
    duration: 600,
    easing: 'ease-out'
  });
}

// Number counter animation
export function animateNumber(
  element: HTMLElement,
  from: number,
  to: number,
  duration: number = 500,
  prefix: string = '$',
  suffix: string = 'M'
) {
  const startTime = performance.now();
  const diff = to - from;

  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function
    const eased = 1 - Math.pow(1 - progress, 3);

    const current = from + diff * eased;
    element.textContent = `${prefix}${current.toFixed(0)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Money flying animation (coins/bills)
export function triggerMoneyFly(container: HTMLElement, direction: 'in' | 'out', amount: number) {
  const symbols = direction === 'in' ? ['$', '💵', '💰'] : ['💸', '💨'];
  const count = Math.min(Math.ceil(amount / 50), 15);

  for (let i = 0; i < count; i++) {
    const symbol = document.createElement('div');
    symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    symbol.style.cssText = `
      position: absolute;
      font-size: ${16 + Math.random() * 12}px;
      left: ${direction === 'in' ? -20 : 50}%;
      top: ${30 + Math.random() * 40}%;
      pointer-events: none;
      z-index: 1000;
    `;

    container.appendChild(symbol);

    const endX = direction === 'in' ? 50 + Math.random() * 30 : 110 + Math.random() * 20;
    const wobble = (Math.random() - 0.5) * 40;

    symbol.animate([
      {
        transform: 'translateY(0) rotate(0deg)',
        opacity: direction === 'in' ? 0 : 1
      },
      {
        transform: `translateX(${endX - (direction === 'in' ? -20 : 50)}%) translateY(${wobble}px) rotate(${Math.random() * 360}deg)`,
        opacity: direction === 'in' ? 1 : 0
      }
    ], {
      duration: 600 + Math.random() * 300,
      delay: i * 50,
      easing: 'ease-out'
    }).onfinish = () => symbol.remove();
  }
}
