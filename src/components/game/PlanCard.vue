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

const props = defineProps<{
  plan: PlanCard;
}>();

const emit = defineEmits<{
  select: [plan: PlanCard];
}>();

const gameStore = useGameStore();
const { playSound } = useAudio();

const isSelected = computed(() => gameStore.selectedPlan?.id === props.plan.id);
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
</style>
