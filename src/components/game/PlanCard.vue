<template>
  <div
    class="plan-card"
    :class="[`category-${plan.category}`, { selected: isSelected, disabled: !canAfford }]"
    @click="handleSelect"
  >
    <div class="card-header">
      <span class="card-emoji">{{ plan.emoji }}</span>
      <span class="card-category">{{ plan.category }}</span>
    </div>

    <h3 class="card-title">{{ plan.name }}</h3>

    <div class="card-cost">
      <span class="cost-icon">💰</span>
      <span class="cost-value">{{ adjustedCost }}B</span>
      <span v-if="adjustedCost !== plan.baseCost" class="cost-adjusted">
        ({{ adjustedCost > plan.baseCost ? '+' : '' }}{{ Math.round((adjustedCost - plan.baseCost) / plan.baseCost * 100) }}%)
      </span>
      <span v-if="!canAfford" class="cost-warning">(Loan!)</span>
    </div>

    <!-- Random research button -->
    <button
      v-if="hasUnrevealedProperties"
      class="random-research-btn"
      @click.stop="handleRandomResearch"
      :disabled="gameStore.stats.money < 50"
    >
      🎲 Info 50B
    </button>

    <div class="card-properties">
      <div
        v-for="(value, key) in plan.revealable"
        :key="key"
        class="property"
        :class="{ revealed: plan.revealed.includes(key as string) }"
      >
        <div v-if="plan.revealed.includes(key as string)" class="property-content">
          <span class="property-label">{{ formatLabel(key as string) }}:</span>
          <span class="property-value" :class="getSentimentClass(value)">{{ value }}</span>
        </div>
        <div v-else class="property-hidden">
          <span class="hidden-icon">🔒</span>
          <span class="hidden-text">{{ formatLabel(key as string) }}</span>
        </div>
      </div>
      
      <!-- Market Impact (always shown if exists) -->
      <div v-if="marketImpact.length > 0" class="property revealed market-impact">
        <div class="property-content">
          <span class="property-label">📊 Market Buzz:</span>
          <div class="market-effects">
            <div v-for="effect in marketImpact" :key="effect.stockId" class="market-effect">
              <span class="stock-emoji">{{ effect.emoji }}</span>
              <span class="stock-name">{{ effect.name }}</span>
              <span class="stock-hint" :class="getHintClass(effect)">
                {{ getMarketHint(effect) }}
              </span>
              <button
                v-if="effect.researchLevel < 3"
                class="research-stock-btn"
                @click="handleResearchStock(plan.id, effect.stockId, $event)"
                :disabled="gameStore.stats.money < 25"
                :title="`Research (25B) - Level ${effect.researchLevel + 1}/3`"
              >
                🔍
              </button>
              <span v-else class="research-complete">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button
      v-if="!isSelected"
      class="select-btn"
      :disabled="!canAfford && gameStore.debt > 500"
      @click.stop="handleSelect"
    >
      Select Plan
    </button>
    <div v-else class="selected-badge">✓ Selected</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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

function handleResearchStock(planId: string, stockId: string, event: Event) {
  event.stopPropagation();
  if (gameStore.stats.money < 25) return;

  // Cost 25B to research a stock hint
  gameStore.stats.money -= 25;
  const newLevel = gameStore.researchStock(planId, stockId);
  playSound('research');

  // Add juice message about the research
  if (newLevel === 1) {
    gameStore.addJuiceMessage({
      text: `🔍 Market analysts provide a vague hint about potential sector impacts...`,
      type: 'news'
    });
  } else if (newLevel === 2) {
    gameStore.addJuiceMessage({
      text: `📊 Deeper analysis reveals the likely direction of market movement...`,
      type: 'news'
    });
  } else if (newLevel === 3) {
    gameStore.addJuiceMessage({
      text: `🎯 Full market intelligence acquired! Expected magnitude now known.`,
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

function handleRandomResearch() {
  if (gameStore.stats.money < 50) return;
  playSound('research');
  gameStore.researchPlanRandom(props.plan.id);
}
</script>

<style scoped>
.plan-card {
  background: linear-gradient(145deg, #2a2a3e 0%, #1a1a2e 100%);
  border-radius: 12px;
  padding: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  min-width: 140px;
  max-width: 160px;
  flex-shrink: 0;
}

.plan-card:hover:not(.disabled) {
  border-color: rgba(255, 107, 53, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.plan-card.selected {
  border-color: #ff6b35;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
}

.plan-card.disabled {
  opacity: 0.7;
}

/* Category colors */
.plan-card.category-economy { border-top: 3px solid #22c55e; }
.plan-card.category-politics { border-top: 3px solid #3b82f6; }
.plan-card.category-media { border-top: 3px solid #a855f7; }
.plan-card.category-foreign { border-top: 3px solid #f59e0b; }
.plan-card.category-personal { border-top: 3px solid #ec4899; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-emoji {
  font-size: 1.5rem;
}

.card-category {
  font-size: 0.6rem;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #888;
}

.card-title {
  font-size: 0.9rem;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: white;
  line-height: 1.2;
}

.card-cost {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 0.8rem;
}

.cost-value {
  color: #22c55e;
  font-weight: bold;
}

.cost-warning {
  color: #ef4444;
  font-size: 0.65rem;
}

.cost-adjusted {
  color: #f59e0b;
  font-size: 0.6rem;
}

.random-research-btn {
  width: 100%;
  padding: 6px;
  margin-bottom: 8px;
  border: 2px dashed rgba(255, 107, 53, 0.5);
  border-radius: 6px;
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.random-research-btn:hover:not(:disabled) {
  background: rgba(255, 107, 53, 0.2);
  border-color: rgba(255, 107, 53, 0.8);
  transform: translateY(-1px);
}

.random-research-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.card-properties {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.property {
  font-size: 0.7rem;
  padding: 4px 6px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
}

.property.revealed {
  background: rgba(34, 197, 94, 0.15);
}

.property-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.property-label {
  color: #888;
  font-size: 0.6rem;
  text-transform: uppercase;
}

.property-value {
  color: white;
  font-weight: 500;
}

.property-value.sentiment-positive {
  color: #22c55e;
}

.property-value.sentiment-negative {
  color: #ef4444;
}

.property-value.sentiment-neutral {
  color: #f59e0b;
}

.property-hidden {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 24px;
  overflow: hidden;
}

.hidden-icon {
  opacity: 0.5;
  flex-shrink: 0;
}

.hidden-text {
  color: #666;
  flex: 1;
  font-size: 0.6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-btn {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.select-btn:hover:not(:disabled) {
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
}

.select-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.selected-badge {
  text-align: center;
  padding: 8px;
  background: rgba(255, 107, 53, 0.2);
  border-radius: 8px;
  color: #ff6b35;
  font-weight: bold;
  font-size: 0.8rem;
}

.market-impact {
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
}

.market-effects {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}

.market-effect {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  padding: 4px 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.stock-emoji {
  font-size: 0.9rem;
}

.stock-name {
  flex: 1;
  color: #cbd5e1;
  font-size: 0.7rem;
}

.stock-hint {
  font-weight: 600;
  font-size: 0.7rem;
  font-style: italic;
}

.hint-very-positive {
  color: #22c55e;
}

.hint-positive {
  color: #86efac;
}

.hint-neutral {
  color: #94a3b8;
}

.hint-negative {
  color: #fca5a5;
}

.hint-very-negative {
  color: #ef4444;
}

.hint-unknown {
  color: #64748b;
  opacity: 0.8;
}

.hint-vague {
  color: #fbbf24;
  opacity: 0.9;
}

.research-stock-btn {
  padding: 2px 6px;
  border: 1px solid rgba(255, 107, 53, 0.5);
  border-radius: 4px;
  background: rgba(255, 107, 53, 0.15);
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.research-stock-btn:hover:not(:disabled) {
  background: rgba(255, 107, 53, 0.3);
  border-color: rgba(255, 107, 53, 0.8);
  transform: scale(1.1);
}

.research-stock-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.research-complete {
  color: #22c55e;
  font-size: 0.8rem;
  flex-shrink: 0;
}
</style>
