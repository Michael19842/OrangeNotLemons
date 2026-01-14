<template>
  <div
    class="plan-card"
    :class="[`category-${plan.category}`, { selected: isSelected, disabled: !canAfford }]"
  >
    <!-- Card Header with emoji and category -->
    <div class="card-header">
      <span class="card-emoji">{{ plan.emoji }}</span>
      <div class="header-right">
        <span class="card-category">{{ plan.category }}</span>
        <div class="card-cost" :class="{ 'cost-free': adjustedCost === 0 }">
          <template v-if="adjustedCost === 0">🎁 FREE</template>
          <template v-else>💰 {{ adjustedCost }}M</template>
          <span v-if="!canAfford && adjustedCost > 0" class="loan-badge">LOAN</span>
        </div>
      </div>
    </div>

    <!-- Plan Title -->
    <h3 class="card-title">{{ plan.name }}</h3>

    <!-- Scrollable Content Area -->
    <div class="card-body">
      <!-- Properties Section -->
      <div
        v-for="(value, key) in plan.revealable"
        :key="key"
        class="info-row"
        :class="{ 'info-revealing': isRevealing && plan.revealed.includes(key as string) }"
      >
        <div v-if="plan.revealed.includes(key as string)" class="info-revealed">
          <span class="info-label">{{ formatLabel(key as string) }}:</span>
          <span class="info-text" :class="getSentimentClass(value)">{{ value }}</span>
        </div>
        <div v-else class="info-locked">
          🔒 {{ formatLabel(key as string) }}
        </div>
      </div>

      <!-- Market Impact (compact) with quick trade -->
      <div v-if="marketImpact.length > 0" class="market-section">
        <div
          v-for="effect in marketImpact"
          :key="effect.stockId"
          class="stock-row"
          :class="{ 'stock-revealing': isRevealing && effect.researchLevel > 0 }"
        >
          <span class="stock-ticker" :title="effect.name">{{ effect.ticker }}</span>
          <span class="stock-status" :class="getHintClass(effect)">
            {{ getMarketHintShort(effect) }}
          </span>
          <div class="quick-trade">
            <button
              class="trade-btn buy"
              @click.stop="quickBuy(effect.stockId)"
              title="Buy"
            >↑</button>
            <button
              class="trade-btn short"
              @click.stop="quickShort(effect.stockId)"
              title="Short"
            >↓</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Footer Actions - Always Visible -->
    <div class="card-footer">
      <button
        v-if="hasUnrevealedInfo"
        class="research-btn"
        @click.stop="handleResearch"
        :disabled="gameStore.stats.money < researchCost"
      >
        🔍 {{ researchCost }}M
      </button>

      <button
        v-if="!isSelected"
        class="select-btn"
        :disabled="!canAfford && gameStore.debt > 500"
        @click.stop="handleSelect"
      >
        ✓ Select
      </button>
      <button
        v-else
        class="deselect-btn"
        @click.stop="handleDeselect"
      >
        ✕ Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useAudio } from '@/composables/useAudio';
import type { PlanCard } from '@/types/game';
import { PLAN_STOCK_EFFECTS } from '@/data/stocks';

const props = defineProps<{
  plan: PlanCard;
}>();

const emit = defineEmits<{
  select: [plan: PlanCard];
}>();

const gameStore = useGameStore();
const { playSound } = useAudio();
const isRevealing = ref(false);

const isSelected = computed(() => gameStore.selectedPlan?.id === props.plan.id);

const marketImpact = computed(() => {
  const effects = PLAN_STOCK_EFFECTS[props.plan.id];
  if (!effects) return [];

  return effects.map(effect => {
    const stock = gameStore.stocks.find(s => s.id === effect.stockId);
    const researchLevel = gameStore.getStockResearchLevel(props.plan.id, effect.stockId);
    return {
      stockId: effect.stockId,
      name: stock?.name || effect.stockId,
      ticker: stock?.ticker || '???',
      emoji: stock?.emoji || '📊',
      change: effect.change,
      hint: effect.hint,
      researchLevel
    };
  });
});
const adjustedCost = computed(() => gameStore.getAdjustedCost(props.plan.baseCost));
const canAfford = computed(() => gameStore.stats.money >= adjustedCost.value);
const hasUnrevealedProperties = computed(() => {
  const totalProps = Object.keys(props.plan.revealable).length;
  return props.plan.revealed.length < totalProps;
});

const hasUnresearchedStocks = computed(() => {
  return marketImpact.value.some(effect => effect.researchLevel < 3);
});

const hasUnrevealedInfo = computed(() => {
  return hasUnrevealedProperties.value || hasUnresearchedStocks.value;
});

const researchCost = computed(() => {
  // All research costs 25M
  return 25;
});

function formatLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function getSentimentClass(text: string | undefined): string {
  if (!text) return 'sentiment-neutral';
  
  const lowerText = text.toLowerCase();
  
  // Positive keywords
  const positiveWords = ['boost', 'benefit', 'success', 'win', 'gain', 'increase', 'profit', 'love', 'advantage', 'perfect', 'excellent', 'best', 'tremendous', 'great', 'good', 'positive', 'help'];
  
  // Negative keywords
  const negativeWords = ['risk', 'retaliate', 'disaster', 'problem', 'fail', 'loss', 'decrease', 'concern', 'dangerous', 'crisis', 'bad', 'negative', 'hurt', 'damage', 'investigate', 'lawsuit', 'scandal'];
  
  // Check for positive sentiment
  if (positiveWords.some(word => lowerText.includes(word))) {
    return 'sentiment-positive';
  }
  
  // Check for negative sentiment
  if (negativeWords.some(word => lowerText.includes(word))) {
    return 'sentiment-negative';
  }
  
  // Neutral/mixed
  return 'sentiment-neutral';
}

function getMarketHint(effect: { change: number; hint: string; researchLevel: number }): string {
  // Level 0: Mystery - just show that something might happen
  if (effect.researchLevel === 0) {
    return '❓ Unknown impact';
  }

  // Level 1: Show vague hint text
  if (effect.researchLevel === 1) {
    return `💭 ${effect.hint}`;
  }

  // Level 2: Show direction only
  if (effect.researchLevel === 2) {
    return effect.change > 0 ? '📈 Likely positive' : '📉 Likely negative';
  }

  // Level 3: Full info with magnitude
  if (effect.change >= 30) return '🚀 Major surge expected';
  if (effect.change >= 15) return '📈 Strong growth likely';
  if (effect.change >= 5) return '↗️ Slight uptick';
  if (effect.change > 0) return '➡️ Modest gain';
  if (effect.change > -5) return '➡️ Minor dip';
  if (effect.change > -15) return '↘️ Dropping';
  if (effect.change > -25) return '📉 Heavy decline';
  return '💥 Crash imminent';
}

// Short version for compact display
function getMarketHintShort(effect: { change: number; hint: string; researchLevel: number }): string {
  if (effect.researchLevel === 0) return '❓';
  if (effect.researchLevel === 1) return '💭 ?';
  if (effect.researchLevel === 2) return effect.change > 0 ? '📈' : '📉';

  // Level 3: Show with percentage
  const sign = effect.change > 0 ? '+' : '';
  if (effect.change >= 15) return `🚀 ${sign}${effect.change}%`;
  if (effect.change >= 5) return `📈 ${sign}${effect.change}%`;
  if (effect.change > -5) return `➡️ ${sign}${effect.change}%`;
  if (effect.change > -15) return `📉 ${effect.change}%`;
  return `💥 ${effect.change}%`;
}

function getHintClass(effect: { change: number; researchLevel: number }): string {
  // Unknown level - gray
  if (effect.researchLevel === 0) return 'hint-unknown';
  if (effect.researchLevel === 1) return 'hint-vague';

  // Direction only or full info
  if (effect.change >= 15) return 'hint-very-positive';
  if (effect.change >= 5) return 'hint-positive';
  if (effect.change > -5) return 'hint-neutral';
  if (effect.change > -15) return 'hint-negative';
  return 'hint-very-negative';
}

function handleResearch() {
  // Randomly choose between properties and stocks
  const hasProps = hasUnrevealedProperties.value;
  const hasStocks = hasUnresearchedStocks.value;
  
  if (hasProps && hasStocks) {
    // Both available - random choice
    if (Math.random() < 0.5) {
      handleRandomResearch();
    } else {
      handleResearchMarket();
    }
  } else if (hasProps) {
    // Only properties left
    handleRandomResearch();
  } else if (hasStocks) {
    // Only stocks left
    handleResearchMarket();
  }
  
  // Trigger animation
  isRevealing.value = true;
  setTimeout(() => {
    isRevealing.value = false;
  }, 600);
}

function handleResearchMarket() {
  if (gameStore.stats.money < 25) return;

  // Find all unresearched stocks and pick random one
  const unresearched = marketImpact.value.filter(effect => effect.researchLevel < 3);
  if (unresearched.length === 0) return;
  
  // Pick random stock to research
  const randomStock = unresearched[Math.floor(Math.random() * unresearched.length)];

  // Cost 25M to research
  gameStore.stats.money -= 25;
  const newLevel = gameStore.researchStock(props.plan.id, randomStock.stockId);
  playSound('research');

  // Add juice message about the research
  if (newLevel === 1) {
    gameStore.addJuiceMessage({
      text: `🔍 Insider whispers about ${randomStock.emoji}...`,
      type: 'news'
    });
  } else if (newLevel === 2) {
    gameStore.addJuiceMessage({
      text: `📊 The market will ${randomStock.change > 0 ? 'boom' : 'crash'}!`,
      type: 'news'
    });
  } else if (newLevel === 3) {
    gameStore.addJuiceMessage({
      text: `🎯 Crystal clear: ${randomStock.emoji} ${getMarketHint(randomStock)}`,
      type: 'news'
    });
  }
}

function handleSelect() {
  if (!isSelected.value) {
    playSound('click');
    emit('select', props.plan);
  }
}

function handleDeselect() {
  playSound('click');
  gameStore.selectedPlan = null;
}

function handleRandomResearch() {
  if (gameStore.stats.money < 25) return;
  playSound('research');
  gameStore.researchPlanRandom(props.plan.id);
}

// Quick trade functions
const QUICK_TRADE_SHARES = 100; // Buy/short 100 shares at a time

function quickBuy(stockId: string) {
  const stock = gameStore.stocks.find(s => s.id === stockId);
  if (!stock) return;

  const cost = Math.ceil((QUICK_TRADE_SHARES * stock.currentPrice) / 100);

  playSound('buy');
  gameStore.buyStock(stockId, QUICK_TRADE_SHARES);

  gameStore.addJuiceMessage({
    text: `⚡ Quick buy: ${QUICK_TRADE_SHARES} ${stock.ticker} shares for ${cost}M! #FastMoney`,
    type: 'news'
  });
}

function quickShort(stockId: string) {
  const stock = gameStore.stocks.find(s => s.id === stockId);
  if (!stock) return;

  playSound('sell');
  gameStore.shortStock(stockId, QUICK_TRADE_SHARES);

  gameStore.addJuiceMessage({
    text: `⚡ Quick short: ${QUICK_TRADE_SHARES} ${stock.ticker} shares! Betting on drop! #BearBet`,
    type: 'news'
  });
}
</script>

<style scoped>
/* Card Container - Compact Mobile Design */
.plan-card {
  background: linear-gradient(145deg, #2a2a3e 0%, #1a1a2e 100%);
  border-radius: 12px;
  padding: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-width: 4px;
  transition: all 0.2s ease;
  width: 155px;
  min-height: 200px;
  max-height: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.plan-card.selected {
  border-color: #ff6b35;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
}

.plan-card.disabled {
  opacity: 0.6;
}

/* Category Border Colors */
.plan-card.category-economy { border-top-color: #22c55e; }
.plan-card.category-politics { border-top-color: #3b82f6; }
.plan-card.category-media { border-top-color: #a855f7; }
.plan-card.category-foreign { border-top-color: #f59e0b; }
.plan-card.category-personal { border-top-color: #ec4899; }

/* Header - Compact */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 6px;
}

.card-emoji {
  font-size: 1.6rem;
  line-height: 1;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}

.card-category {
  font-size: 0.55rem;
  text-transform: uppercase;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
  color: #94a3b8;
}

.card-cost {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  background: rgba(34, 197, 94, 0.2);
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #22c55e;
}

.card-cost.cost-free {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.loan-badge {
  font-size: 0.5rem;
  background: #ef4444;
  color: white;
  padding: 1px 3px;
  border-radius: 3px;
  font-weight: 700;
}

/* Title - Compact */
.card-title {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #fff;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Body - Scrollable Content */
.card-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-height: 40px;
  max-height: 120px;
  margin-bottom: 6px;
}

.card-body::-webkit-scrollbar {
  width: 2px;
}

.card-body::-webkit-scrollbar-thumb {
  background: rgba(255, 107, 53, 0.4);
  border-radius: 2px;
}

/* Info Rows - Compact */
.info-row {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  padding: 4px 6px;
  transition: all 0.3s ease;
}

.info-row.info-revealing {
  animation: reveal-flash 0.5s ease;
}

@keyframes reveal-flash {
  0%, 100% { background: rgba(0, 0, 0, 0.3); }
  50% { background: rgba(34, 197, 94, 0.4); }
}

.info-revealed {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 4px;
  align-items: baseline;
}

.info-label {
  font-size: 0.55rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.info-text {
  font-size: 0.6rem;
  font-weight: 500;
  color: #e2e8f0;
  line-height: 1.2;
}

.info-text.sentiment-positive { color: #4ade80; }
.info-text.sentiment-negative { color: #f87171; }
.info-text.sentiment-neutral { color: #fbbf24; }

.info-locked {
  font-size: 0.6rem;
  font-weight: 600;
  color: #64748b;
  text-align: center;
}

/* Market Section - Horizontal Compact */
.market-section {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 5px;
  padding: 4px;
}

.stock-row {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.stock-row.stock-revealing {
  animation: stock-reveal 0.5s ease;
}

@keyframes stock-reveal {
  0%, 100% { background: rgba(0, 0, 0, 0.2); }
  50% { background: rgba(59, 130, 246, 0.4); }
}

.stock-ticker {
  font-size: 0.55rem;
  font-weight: 700;
  color: #60a5fa;
  font-family: monospace;
  background: rgba(59, 130, 246, 0.15);
  padding: 1px 3px;
  border-radius: 2px;
  letter-spacing: 0.5px;
}

.stock-status {
  font-size: 0.55rem;
  font-weight: 600;
  flex: 1;
}

.quick-trade {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.trade-btn {
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.trade-btn.buy {
  background: rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.trade-btn.buy:active {
  background: rgba(34, 197, 94, 0.6);
  transform: scale(0.95);
}

.trade-btn.short {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.trade-btn.short:active {
  background: rgba(239, 68, 68, 0.6);
  transform: scale(0.95);
}

/* Stock Status Colors */
.hint-very-positive { color: #22c55e; }
.hint-positive { color: #86efac; }
.hint-neutral { color: #94a3b8; }
.hint-negative { color: #fca5a5; }
.hint-very-negative { color: #ef4444; }
.hint-unknown { color: #64748b; }
.hint-vague { color: #fbbf24; }

/* Footer - Always Visible */
.card-footer {
  display: flex;
  gap: 4px;
  margin-top: auto;
  flex-shrink: 0;
}

.research-btn {
  flex: 1;
  padding: 8px 4px;
  border: 1px solid rgba(59, 130, 246, 0.6);
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.research-btn:active:not(:disabled) {
  background: rgba(59, 130, 246, 0.4);
  transform: scale(0.98);
}

.research-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.select-btn {
  flex: 1.5;
  padding: 8px 6px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  font-weight: 700;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.select-btn:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(255, 107, 53, 0.3);
}

.select-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.deselect-btn {
  flex: 1.5;
  padding: 8px 6px;
  border: 1px solid #ef4444;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  font-weight: 700;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.deselect-btn:active {
  background: rgba(239, 68, 68, 0.4);
  transform: scale(0.98);
}
</style>
