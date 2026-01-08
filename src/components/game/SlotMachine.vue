<template>
  <div class="slot-machine">
    <div class="slot-header">
      <h3>{{ selectedPlan?.emoji }} {{ selectedPlan?.name || 'Select a Plan' }}</h3>
      <div class="spins-remaining">
        Spins: <span class="spin-count">{{ spinsRemaining }}</span>/3
      </div>
    </div>

    <!-- Outcome Preview -->
    <div class="outcome-preview" v-if="selectedPlan">
      <div class="outcomes-row">
        <div
          v-for="outcome in selectedPlan.outcomes"
          :key="outcome.minScore"
          class="outcome-tier"
          :class="{ active: totalScore > 0 && isOutcomeActive(outcome) }"
        >
          <span class="outcome-range">{{ outcome.minScore }}-{{ outcome.maxScore }}</span>
          <span class="outcome-title">{{ outcome.title }}</span>
          <span class="outcome-effects">
            <span class="effect-line" v-for="(value, key) in outcome.immediateEffects" :key="key">
              {{ getStatIcon(key) }}<span v-if="value !== undefined" class="effect-value" :class="value > 0 ? 'positive' : 'negative'">{{ value > 0 ? '+' : '' }}{{ value }}</span>
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- Slot Machine Frame -->
    <div class="machine-frame">
      <!-- Reels Container -->
      <div class="reels-container">
        <div
          v-for="(reel, index) in displayReels"
          :key="index"
          class="reel"
          :class="{ spinning: isSpinning && !reelsStopped[index] }"
        >
          <div class="reel-inner" :style="getReelStyle(index)">
            <span class="symbol">{{ reel.emoji }}</span>
          </div>
        </div>
      </div>

      <!-- Score Display ON the machine -->
      <div class="machine-display">
        <div v-if="lastResult" class="spin-result" :class="{ positive: lastResult.score > 0, negative: lastResult.score < 0, jackpot: lastResult.isJackpot }">
          <span v-if="lastResult.isJackpot" class="jackpot-text">🎊 JACKPOT! 🎊</span>
          <div class="result-details">
            <span class="result-score">{{ lastResult.score > 0 ? '+' : '' }}{{ lastResult.score }}</span>
            <span class="result-label">points</span>
          </div>
        </div>
        
        <div v-if="spinsRemaining === 0 && allResults.length > 0" class="total-display">
          <div class="total-label">TOTAL SCORE</div>
          <div class="total-value" :class="getScoreClass(totalScore)">{{ totalScore }}</div>
          <div class="total-breakdown">
            <span v-for="(result, i) in allResults" :key="i" class="breakdown-item">
              {{ result.reels.map(r => r.emoji).join('') }}
              <span :class="{ positive: result.score > 0, negative: result.score < 0 }">
                {{ result.score > 0 ? '+' : '' }}{{ result.score }}
              </span>
            </span>
          </div>
        </div>

        <div v-else-if="!lastResult" class="ready-display">
          <div class="ready-text">Ready to Spin!</div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <button
        v-if="spinsRemaining > 0"
        class="spin-btn"
        :disabled="isSpinning"
        @click="spin"
      >
        🎲 SPIN!
      </button>

      <button
        v-if="spinsRemaining === 3"
        class="blind-btn"
        :disabled="isSpinning"
        @click="executeBlind"
        title="Skip slots and play blind - based on your stats"
      >
        <span class="blind-text">{{ blindButtonText }}</span>
        <span class="blind-penalty">(😴 Laziness -5)</span>
      </button>

      <button
        v-if="spinsRemaining === 0 || (spinsRemaining < 3 && !isSpinning)"
        class="execute-btn"
        @click="execute"
      >
        ✓ Execute Plan
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useAudio } from '@/composables/useAudio';
import { SLOT_SYMBOLS } from '@/types/game';
import type { SlotResult, SlotSymbol, PlanOutcome } from '@/types/game';

const gameStore = useGameStore();
const { playSound } = useAudio();

const isSpinning = ref(false);
const reelsStopped = ref([true, true, true]);
const displayReels = ref<SlotSymbol[]>([
  SLOT_SYMBOLS[0],
  SLOT_SYMBOLS[0],
  SLOT_SYMBOLS[0]
]);
const lastResult = ref<SlotResult | null>(null);
const spinAnimation = ref([0, 0, 0]);

const BLIND_TEXTS = [
  '🎲 YOLO!',
  '⚡ BELIEVE ME!',
  '🚀 HUGE!',
  '💪 THE BEST!',
  '🔥 BIGLY!',
  '⭐ TREMENDOUS!',
  '🎯 TRUST ME BRO!',
  '💎 SO GOOD!',
  '🦅 MANY SAY!',
  '👑 PERFECT!',
  '🍊 SO GREAT!',
  '💰 YUGE WIN!',
  '🏆 WINNING!',
  '🎪 BELIEVE IT!',
  '⚡ UNSTOPPABLE!'
];

const blindButtonText = ref(BLIND_TEXTS[Math.floor(Math.random() * BLIND_TEXTS.length)]);

const spinsRemaining = computed(() => gameStore.slotSpinsRemaining);
const totalScore = computed(() => gameStore.currentSlotTotal);
const allResults = computed(() => gameStore.slotResults);
const selectedPlan = computed(() => gameStore.selectedPlan);

function getReelStyle(index: number) {
  if (isSpinning.value && !reelsStopped.value[index]) {
    return {
      animation: `spin ${0.1}s linear infinite`
    };
  }
  return {};
}

function isOutcomeActive(outcome: PlanOutcome): boolean {
  return totalScore.value >= outcome.minScore && totalScore.value <= outcome.maxScore;
}

function getScoreClass(score: number): string {
  if (score >= 70) return 'excellent';
  if (score >= 50) return 'good';
  if (score >= 30) return 'average';
  return 'poor';
}

function getStatIcon(stat: string): string {
  const icons: Record<string, string> = {
    health: '❤️',
    money: '💰',
    loyalty: '👥',
    support: '📊',
    luck: '🍀'
  };
  return icons[stat] || '•';
}

function getScoreRating(): string {
  const score = totalScore.value;
  if (score >= 70) return '🎉 Excellent outcome! Maximum benefits!';
  if (score >= 50) return '✅ Good result - positive effects ahead';
  if (score >= 30) return '⚖️ Average outcome - mixed results';
  return '⚠️ Poor score - prepare for consequences';
}

async function spin() {
  if (isSpinning.value || spinsRemaining.value <= 0) return;

  isSpinning.value = true;
  reelsStopped.value = [false, false, false];
  lastResult.value = null;

  // Play spin sound
  playSound('spin');

  // Animate reels
  const spinInterval = setInterval(() => {
    displayReels.value = displayReels.value.map(() =>
      SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
    );
  }, 50);

  // Stop reels one by one
  await delay(500);
  const result = gameStore.spinSlot();

  await delay(300);
  reelsStopped.value[0] = true;
  displayReels.value[0] = result.reels[0];
  playSound('slotStop');

  await delay(300);
  reelsStopped.value[1] = true;
  displayReels.value[1] = result.reels[1];
  playSound('slotStop');

  await delay(300);
  reelsStopped.value[2] = true;
  displayReels.value[2] = result.reels[2];
  playSound('slotStop');

  clearInterval(spinInterval);

  // Play result sound
  if (result.isJackpot) {
    playSound('jackpot');
  } else if (result.score > 0) {
    playSound('win');
  } else if (result.score < 0) {
    playSound('lose');
  }

  lastResult.value = result;
  isSpinning.value = false;
}

function executeBlind() {
  if (isSpinning.value) return;
  
  playSound('click');
  gameStore.executeBlindPlay();
}

function execute() {
  playSound('click');
  gameStore.executePlan();
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Reset when new plan selected
watch(() => gameStore.selectedPlan, () => {
  displayReels.value = [SLOT_SYMBOLS[0], SLOT_SYMBOLS[0], SLOT_SYMBOLS[0]];
  lastResult.value = null;
  // Randomize blind button text
  blindButtonText.value = BLIND_TEXTS[Math.floor(Math.random() * BLIND_TEXTS.length)];
});
</script>

<style scoped>
.slot-machine {
  background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
  border-radius: 16px;
  padding: 12px;
  border: 3px solid #ff6b35;
  box-shadow: 0 0 30px rgba(255, 107, 53, 0.3);
  max-height: 75vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.slot-header h3 {
  margin: 0;
  color: #ff6b35;
  font-size: 1.2rem;
  text-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
}

.spins-remaining {
  font-size: 0.9rem;
  color: #888;
}

.spin-count {
  color: #ff6b35;
  font-weight: bold;
  font-size: 1.1rem;
}

/* Outcome Preview */
.machine-frame {
  background: linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 50%, #2a2a3e 100%);
  border-radius: 20px;
  border: 4px solid #ff6b35;
  box-shadow: 
    inset 0 0 20px rgba(0, 0, 0, 0.8),
    0 5px 15px rgba(0, 0, 0, 0.5);
  padding: 8px;
  margin-bottom: 12px;
  position: relative;
  flex-shrink: 0;
}

/* Reels Container */
.reels-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 15px 10px;
  background: linear-gradient(180deg, #0a0a15 0%, #1a1a2e 50%, #0a0a15 100%);
  border-radius: 12px;
  margin: 10px 0;
  box-shadow: inset 0 3px 10px rgba(0, 0, 0, 0.8);
}

.reel {
  width: 60px;
  height: 70px;
  background: linear-gradient(180deg, 
    rgba(0,0,0,0.8) 0%, 
    rgba(255,255,255,0.05) 50%, 
    rgba(0,0,0,0.8) 100%
  );
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 107, 53, 0.4);
  overflow: hidden;
  box-shadow: 
    inset 0 2px 5px rgba(255, 255, 255, 0.1),
    0 3px 8px rgba(0, 0, 0, 0.5);
  position: relative;
}

.reel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20%;
  background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%);
  pointer-events: none;
}

.reel::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20%;
  background: linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 100%);
  pointer-events: none;
}

.reel.spinning {
  border-color: #ff6b35;
  box-shadow: 
    inset 0 2px 5px rgba(255, 255, 255, 0.1),
    0 0 15px rgba(255, 107, 53, 0.6);
  animation: reel-glow 0.3s ease-in-out infinite alternate;
}

@keyframes reel-glow {
  from { border-color: #ff6b35; }
  to { border-color: #ffaa35; }
}

.reel-inner {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.symbol {
  display: block;
  animation: symbol-appear 0.2s ease-out;
}

@keyframes symbol-appear {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes spin {
  0% { transform: translateY(-100%) scale(0.9); opacity: 0.5; }
  50% { opacity: 1; }
  100% { transform: translateY(100%) scale(0.9); opacity: 0.5; }
}

/* Machine Display */
.machine-display {
  background: linear-gradient(145deg, #0a0a15 0%, #1a1a2e 100%);
  border-radius: 12px;
  padding: 12px;
  height: 120px;
  border: 2px solid rgba(255, 107, 53, 0.3);
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.spin-result {
  text-align: center;
  animation: result-appear 0.4s ease-out;
}

@keyframes result-appear {
  from { transform: scale(0.5) rotate(-10deg); opacity: 0; }
  to { transform: scale(1) rotate(0); opacity: 1; }
}

.spin-result.jackpot {
  animation: jackpot-celebration 0.6s ease-out;
}

@keyframes jackpot-celebration {
  0% { transform: scale(0); }
  50% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0); }
}

.jackpot-text {
  display: block;
  color: #ffd700;
  font-size: 1rem;
  font-weight: bold;
  text-shadow: 
    0 0 10px #ffd700,
    0 0 20px #ffd700;
  margin-bottom: 6px;
  animation: jackpot-pulse 1s ease-in-out infinite;
  line-height: 1;
}

@keyframes jackpot-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.result-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.result-score {
  font-size: 1.8rem;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  line-height: 1;
}

.spin-result.positive .result-score {
  color: #22c55e;
  text-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
}

.spin-result.negative .result-score {
  color: #ef4444;
  text-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
}

.result-label {
  font-size: 0.9rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
}

.total-display {
  text-align: center;
  width: 100%;
}

.total-label {
  font-size: 0.9rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.total-value {
  font-size: 2rem;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 20px currentColor;
  line-height: 1;
  margin-bottom: 8px;
}

.total-value.excellent {
  color: #10b981;
  animation: score-excellent 2s ease-in-out infinite;
}

.total-value.good {
  color: #22c55e;
}

.total-value.average {
  color: #eab308;
}

.total-value.poor {
  color: #ef4444;
}

@keyframes score-excellent {
  0%, 100% { text-shadow: 0 0 20px currentColor; }
  50% { text-shadow: 0 0 30px currentColor, 0 0 40px currentColor; }
}

.total-breakdown {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 107, 53, 0.2);
  max-height: 40px;
  overflow: hidden;
}

.breakdown-item {
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  border: 1px solid rgba(255, 107, 53, 0.4);
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.breakdown-item:hover {
  transform: scale(1.05);
  border-color: #ff6b35;
}

.breakdown-item .positive {
  color: #22c55e;
  font-weight: bold;
}

.breakdown-item .negative {
  color: #ef4444;
  font-weight: bold;
}

.ready-display {
  text-align: center;
}

.ready-text {
  font-size: 1.2rem;
  color: #888;
  font-style: italic;
}

/* Controls */
.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.spin-btn {
  background: linear-gradient(145deg, #ff6b35 0%, #ff8c35 100%);
  border: none;
  color: white;
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.spin-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.6);
}

.spin-btn:active:not(:disabled) {
  transform: translateY(0);
}

.spin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.blind-btn {
  background: linear-gradient(145deg, #6366f1 0%, #4f46e5 100%);
  border: 2px solid rgba(99, 102, 241, 0.5);
  color: white;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 15px rgba(99, 102, 241, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.blind-text {
  font-size: 1rem;
  line-height: 1;
  font-weight: 800;
}

.blind-penalty {
  font-size: 0.65rem;
  opacity: 0.85;
  font-weight: 600;
  color: #fbbf24;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  line-height: 1;
}

.blind-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.blind-btn:hover:not(:disabled)::before {
  left: 100%;
}

.blind-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 
    0 6px 25px rgba(99, 102, 241, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border-color: rgba(99, 102, 241, 0.8);
}

.blind-btn:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 
    0 3px 15px rgba(99, 102, 241, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.blind-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.execute-btn {
  background: linear-gradient(145deg, #22c55e 0%, #16a34a 100%);
  border: none;
  color: white;
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.execute-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.6);
}

.execute-btn:active {
  transform: translateY(0);
}

/* Outcome Preview */
.outcome-preview {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 10px;
  border: 1px solid rgba(255, 107, 53, 0.3);
  margin-bottom: 12px;
  flex-shrink: 0;
}

.outcomes-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.score-explanation {
  text-align: center;
  margin-bottom: 12px;
  padding: 12px;
  background: rgba(255, 107, 53, 0.15);
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.explanation-title {
  color: #e2e8f0;
  font-size: 1rem;
  margin-bottom: 6px;
}

.explanation-title strong {
  color: #ff6b35;
  font-size: 1.3rem;
  text-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
}

.explanation-subtitle {
  color: #888;
  font-size: 0.85rem;
  font-style: italic;
}

.outcome-tier {
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  opacity: 0.6;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.outcome-tier.active {
  opacity: 1;
  background: rgba(255, 107, 53, 0.15);
  border: 2px solid #ff6b35;
  box-shadow: 0 0 15px rgba(255, 107, 53, 0.3);
  animation: outcome-highlight 1s ease-in-out infinite alternate;
  padding: 5px 9px;
}

@keyframes outcome-highlight {
  from { box-shadow: 0 0 15px rgba(255, 107, 53, 0.3); }
  to { box-shadow: 0 0 25px rgba(255, 107, 53, 0.5); }
}

.outcome-range {
  font-size: 0.7rem;
  color: #888;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.outcome-tier.active .outcome-range {
  background: #ff6b35;
  color: white;
}

.outcome-title {
  font-weight: bold;
  color: #e2e8f0;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.outcome-tier.active .outcome-title {
  color: #ff6b35;
}

.outcome-effects {
  display: flex;
  gap: 6px;
  align-items: center;
}

.effect-line {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.75rem;
}

.effect-value {
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.effect-value.positive {
  color: #22c55e;
}

.effect-value.negative {
  color: #ef4444;
}
</style>
