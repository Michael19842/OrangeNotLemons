<template>
  <div class="game-header">
    <div class="turn-info">
      <span class="term-badge">Term {{ term }}</span>
      <span class="date">{{ monthName }} Year {{ year }}</span>
      <span class="turn-counter">{{ currentTurn }}/{{ maxTurns }}</span>
    </div>

    <div class="timer-container" :class="{ urgent: !isUnlimited && timeRemaining <= 10, critical: !isUnlimited && timeRemaining <= 5, unlimited: isUnlimited }">
      <div class="timer-ring">
        <svg viewBox="0 0 36 36">
          <path
            class="timer-bg"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            class="timer-progress"
            :stroke-dasharray="`${timerProgress}, 100`"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span class="timer-text">{{ timerDisplay }}</span>
      </div>
    </div>

    <div class="score-info">
      <div class="current-score">
        <span class="score-label">Score</span>
        <span class="score-value">{{ currentScore }}</span>
      </div>
      <div class="high-score">
        <span class="score-label">Best</span>
        <span class="score-value">{{ highScore }}</span>
      </div>
      <button class="mute-btn" @click="toggleMute">
        {{ isMuted ? '🔇' : '🔊' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useAudio } from '@/composables/useAudio';

const gameStore = useGameStore();
const { isMuted, toggleMute } = useAudio();

const currentTurn = computed(() => gameStore.currentTurn);
const maxTurns = computed(() => gameStore.maxTurns);
const term = computed(() => gameStore.term);
const monthName = computed(() => gameStore.monthName);
const year = computed(() => gameStore.year);
const timeRemaining = computed(() => gameStore.timeRemaining);
const turnDuration = computed(() => gameStore.turnDuration);
const currentScore = computed(() => gameStore.currentScore);
const highScore = computed(() => gameStore.highScore);

// Is unlimited time mode?
const isUnlimited = computed(() => turnDuration.value === 0);

// Timer progress based on actual turn duration (or 100% if unlimited)
const timerProgress = computed(() => {
  if (isUnlimited.value) return 100;
  const maxTime = turnDuration.value || 90;
  return (timeRemaining.value / maxTime) * 100;
});

// Display text for timer (show infinity symbol if unlimited)
const timerDisplay = computed(() => {
  if (isUnlimited.value) return '∞';
  return timeRemaining.value;
});
</script>

<style scoped>
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.2) 100%);
  border-bottom: 2px solid rgba(255, 107, 53, 0.3);
}

.turn-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.term-badge {
  background: #ff6b35;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
}

.date {
  font-size: 0.85rem;
  font-weight: bold;
  color: white;
}

.turn-counter {
  font-size: 0.7rem;
  color: #888;
}

.timer-container {
  position: relative;
}

.timer-ring {
  width: 50px;
  height: 50px;
  position: relative;
}

.timer-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.timer-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 3;
}

.timer-progress {
  fill: none;
  stroke: #22c55e;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.timer-container.urgent .timer-progress {
  stroke: #f59e0b;
}

.timer-container.critical .timer-progress {
  stroke: #ef4444;
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1rem;
  font-weight: bold;
  color: white;
}

.timer-container.critical .timer-text {
  color: #ef4444;
}

.timer-container.unlimited .timer-progress {
  stroke: #3b82f6;
}

.timer-container.unlimited .timer-text {
  color: #3b82f6;
  font-size: 1.2rem;
}

.score-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.current-score, .high-score {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.score-label {
  font-size: 0.65rem;
  color: #888;
  text-transform: uppercase;
}

.current-score .score-value {
  font-size: 1rem;
  font-weight: bold;
  color: #ff6b35;
}

.high-score .score-value {
  font-size: 0.8rem;
  color: #888;
}

.mute-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 4px;
}

.mute-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
