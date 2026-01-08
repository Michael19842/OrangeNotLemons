<template>
  <div class="slot-machine">
    <div class="slot-header">
      <h3>🎰 Fruit Machine</h3>
      <div class="spins-remaining">
        Spins: <span class="spin-count">{{ spinsRemaining }}</span>/3
      </div>
    </div>

    <!-- Slot Machine Frame -->
    <div class="machine-frame">
      <!-- Top Half Emoji -->
      <div class="frame-top">
        <div class="half-emoji top">🎲</div>
      </div>

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

      <!-- Bottom Half Emoji -->
      <div class="frame-bottom">
        <div class="half-emoji bottom">🎲</div>
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
        v-if="spinsRemaining === 0 || (spinsRemaining < 3 && !isSpinning)"
        class="execute-btn"
        @click="execute"
      >
        ✓ Execute Plan
      </button>
    </div>

    <!-- Outcome Preview -->
    <div class="outcome-preview" v-if="selectedPlan && totalScore > 0">
      <h4>📊 Score Impact Analysis</h4>
      <div class="score-explanation">
        <div class="explanation-title">Your score: <strong>{{ totalScore }}</strong> points</div>
        <div class="explanation-subtitle">
          {{ getScoreRating() }}
        </div>
      </div>
      <div
        v-for="outcome in selectedPlan.outcomes"
        :key="outcome.minScore"
        class="outcome-tier"
        :class="{ active: isOutcomeActive(outcome) }"
      >
        <div class="outcome-header">
          <span class="outcome-range">{{ outcome.minScore }} to {{ outcome.maxScore }}</span>
          <span class="outcome-title">{{ outcome.title }}</span>
        </div>
        <div v-if="isOutcomeActive(outcome)" class="outcome-effects">
          <div class="effect-line" v-for="(value, key) in outcome.immediateEffects" :key="key">
            <span class="effect-icon">{{ getStatIcon(key) }}</span>
            <span v-if="value !== undefined" class="effect-value" :class="value > 0 ? 'positive' : 'negative'">
              {{ value > 0 ? '+' : '' }}{{ value }}
            </span>
          </div>
        </div>
      </div>
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
  font-size: 1rem;
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

/* Machine Frame */
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

/* Frame Decorations */
.frame-top, .frame-bottom {
  display: flex;
  justify-content: center;
  overflow: hidden;
  height: 25px;
  position: relative;
}

.half-emoji {
  font-size: 3.5rem;
  line-height: 1;
  opacity: 0.4;
  filter: blur(0.5px);
  text-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
}

.half-emoji.top {
  position: relative;
  top: 15px;
  animation: emoji-glow 3s ease-in-out infinite;
}

.half-emoji.bottom {
  position: relative;
  top: -35px;
  animation: emoji-glow 3s ease-in-out infinite;
  animation-delay: 1.5s;
}

@keyframes emoji-glow {
  0%, 100% { 
    opacity: 0.4;
    text-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
  }
  50% { 
    opacity: 0.6;
    text-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
  }
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
  min-height: 100px;
  border: 2px solid rgba(255, 107, 53, 0.3);
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 
    0 0 10px #ffd700,
    0 0 20px #ffd700;
  margin-bottom: 8px;
  animation: jackpot-pulse 1s ease-in-out infinite;
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
  font-size: 2rem;
  font-weight: bold;
  font-family: 'Courier New', monospace;
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
  font-size: 2.5rem;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 20px currentColor;
  line-height: 1;
  margin-bottom: 10px;
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
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 107, 53, 0.2);
}

.breakdown-item {
  background: rgba(0, 0, 0, 0.4);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid rgba(255, 107, 53, 0.4);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
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
  padding: 12px;
  border: 1px solid rgba(255, 107, 53, 0.3);
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.outcome-preview h4 {
  margin: 0 0 12px 0;
  color: #ff6b35;
  font-size: 1rem;
  text-align: center;
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
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  opacity: 0.4;
  transition: all 0.3s;
}

.outcome-tier.active {
  opacity: 1;
  background: rgba(255, 107, 53, 0.15);
  border: 2px solid #ff6b35;
  box-shadow: 0 0 15px rgba(255, 107, 53, 0.3);
  animation: outcome-highlight 1s ease-in-out infinite alternate;
}

@keyframes outcome-highlight {
  from { box-shadow: 0 0 15px rgba(255, 107, 53, 0.3); }
  to { box-shadow: 0 0 25px rgba(255, 107, 53, 0.5); }
}

.outcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.outcome-range {
  font-size: 0.75rem;
  color: #888;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: bold;
}

.outcome-tier.active .outcome-range {
  background: #ff6b35;
  color: white;
}

.outcome-title {
  font-weight: bold;
  color: #e2e8f0;
  font-size: 0.9rem;
}

.outcome-tier.active .outcome-title {
  color: #ff6b35;
  font-size: 1rem;
}

.outcome-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.effect-line {
  background: rgba(0, 0, 0, 0.3);
  padding: 6px 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
}

.outcome-tier.active .effect-line {
  background: rgba(255, 107, 53, 0.2);
  border: 1px solid rgba(255, 107, 53, 0.4);
}

.effect-icon {
  font-size: 1rem;
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
