<template>
  <div class="stats-bar">
    <!-- Main Stats (Always visible) -->
    <div class="stats-row main-stats">
      <div class="stat-item" :class="{ danger: stats.health < 30, warning: stats.health < 50 }">
        <span class="stat-icon">❤️</span>
        <div class="stat-bar-container">
          <div class="stat-bar-fill health" :style="{ width: `${stats.health}%` }"></div>
        </div>
        <span class="stat-value">{{ stats.health }}</span>
      </div>

      <div class="stat-item money" :class="{ danger: debt > 0 }">
        <span class="stat-icon">💰</span>
        <span class="stat-value money-value">
          {{ formatBillions(stats.money) }}B
          <span v-if="debt > 0" class="debt-indicator">(-{{ debt }}B)</span>
        </span>
      </div>

      <div class="stat-item" :class="{ danger: stats.loyalty < 30, warning: stats.loyalty < 50 }">
        <span class="stat-icon">👥</span>
        <div class="stat-bar-container">
          <div class="stat-bar-fill loyalty" :style="{ width: `${stats.loyalty}%` }"></div>
        </div>
        <span class="stat-value">{{ stats.loyalty }}</span>
      </div>

      <div class="stat-item" :class="{ warning: stats.support < 30 }">
        <span class="stat-icon">📊</span>
        <div class="stat-bar-container">
          <div class="stat-bar-fill support" :style="{ width: `${stats.support}%` }"></div>
        </div>
        <span class="stat-value">{{ stats.support }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();

const stats = computed(() => gameStore.stats);
const debt = computed(() => gameStore.debt);

function formatBillions(value: number): string {
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'T'; // Trillions if over 1000B
  }
  return value.toString();
}
</script>

<style scoped>
.stats-bar {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.stats-row.main-stats {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  min-width: 70px;
  flex: 1;
  transition: all 0.3s ease;
}

.stat-item.danger {
  background: rgba(239, 68, 68, 0.2);
  animation: pulse-danger 1s infinite;
}

.stat-item.warning {
  background: rgba(245, 158, 11, 0.2);
}

.stat-item.boost {
  background: rgba(34, 197, 94, 0.2);
}

@keyframes pulse-danger {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0); }
}

.stat-icon {
  font-size: 0.9rem;
}

.stat-bar-container {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
  min-width: 30px;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.stat-bar-fill.health {
  background: #22c55e;
}

.stat-item.warning .stat-bar-fill.health {
  background: #f59e0b;
}

.stat-item.danger .stat-bar-fill.health {
  background: #ef4444;
}

.stat-bar-fill.loyalty {
  background: #3b82f6;
}

.stat-item.warning .stat-bar-fill.loyalty {
  background: #f59e0b;
}

.stat-item.danger .stat-bar-fill.loyalty {
  background: #ef4444;
}

.stat-bar-fill.support {
  background: #06b6d4;
}

.stat-item.warning .stat-bar-fill.support {
  background: #8b5cf6;
}

.stat-bar-fill.luck {
  background: linear-gradient(90deg, #f97316, #eab308);
}

.stat-bar-fill.chaos {
  background: linear-gradient(90deg, #22c55e, #eab308, #ef4444);
}

.stat-value {
  font-size: 0.7rem;
  font-weight: bold;
  min-width: 22px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-item.money {
  flex: 1.2;
  min-width: 90px;
}

.money-value {
  flex: 1;
  text-align: center;
  font-size: 0.8rem;
  color: #22c55e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-item.money.danger .money-value {
  color: #ef4444;
}

.debt-indicator {
  color: #ef4444;
  font-size: 0.65rem;
}

.stat-item.coin-value {
  min-width: 60px;
}

.coin-value-text {
  font-size: 0.75rem;
  color: #fbbf24;
}

.stat-item.coin-value.danger .coin-value-text {
  color: #ef4444;
}

.stat-item.coin-value.warning .coin-value-text {
  color: #f59e0b;
}

.stat-item.coin-value.boost .coin-value-text {
  color: #22c55e;
}
</style>
