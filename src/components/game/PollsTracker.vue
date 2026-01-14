<template>
  <div class="polls-container">
    <!-- Header -->
    <div class="polls-header">
      <div class="header-left">
        <span class="header-icon">📊</span>
        <div class="header-text">
          <h2>Poll Tracker</h2>
          <span class="header-subtitle">@PollWatch</span>
        </div>
      </div>
      <div class="header-status" :class="overallStatus">
        {{ overallStatusText }}
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="metrics-grid">
      <div class="metric-card primary">
        <div class="metric-header">
          <span class="metric-label">Loyalty</span>
          <span class="metric-badge" :class="getLoyaltyStatus()">{{ loyaltyStatusText }}</span>
        </div>
        <div class="metric-value-row">
          <span class="metric-value" :class="getLoyaltyStatus()">{{ gameStore.stats.loyalty }}%</span>
          <span class="metric-target">/ {{ loyaltyThreshold }}%</span>
        </div>
        <div class="metric-progress">
          <div class="progress-track">
            <div class="progress-fill loyalty" :style="{ width: `${Math.min(100, (gameStore.stats.loyalty / loyaltyThreshold) * 100)}%` }"></div>
            <div class="progress-marker" :style="{ left: '100%' }"></div>
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Support</span>
          <span class="metric-value-small" :class="getSupportStatus()">{{ gameStore.stats.support }}%</span>
        </div>
        <div class="metric-progress compact">
          <div class="progress-track">
            <div class="progress-fill support" :style="{ width: `${gameStore.stats.support}%` }"></div>
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Chaos</span>
          <span class="metric-value-small" :class="getChaosStatus()">{{ gameStore.stats.chaos }}%</span>
        </div>
        <div class="metric-progress compact">
          <div class="progress-track">
            <div class="progress-fill chaos" :style="{ width: `${gameStore.stats.chaos}%` }"></div>
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">OrangeCoin</span>
          <span class="metric-value-small" :class="getCoinStatus()">{{ gameStore.stats.coinValuation }}%</span>
        </div>
        <div class="metric-progress compact">
          <div class="progress-track">
            <div class="progress-fill coin" :style="{ width: `${(gameStore.stats.coinValuation - 50)}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trend Section -->
    <div class="trend-section">
      <div class="section-header">
        <span class="section-title">Trends</span>
        <span class="section-subtitle">Last {{ recentHistory.length }} quarters</span>
      </div>
      <div class="trend-charts">
        <div class="trend-chart">
          <div class="trend-header">
            <span class="trend-label">Loyalty</span>
            <span class="trend-change" :class="loyaltyTrend.class">{{ loyaltyTrend.text }}</span>
          </div>
          <svg class="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path :d="loyaltySparkline" class="sparkline-path loyalty" />
          </svg>
        </div>
        <div class="trend-chart">
          <div class="trend-header">
            <span class="trend-label">Support</span>
            <span class="trend-change" :class="supportTrend.class">{{ supportTrend.text }}</span>
          </div>
          <svg class="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path :d="supportSparkline" class="sparkline-path support" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Pending Effects -->
    <div class="effects-section" v-if="gameStore.pendingEffects.length > 0">
      <div class="section-header">
        <span class="section-title">Upcoming Events</span>
        <span class="effects-count">{{ gameStore.pendingEffects.length }}</span>
      </div>
      <div class="effects-list">
        <div
          v-for="effect in sortedEffects.slice(0, 3)"
          :key="effect.id"
          class="effect-item"
        >
          <div class="effect-timing">{{ getTurnsAway(effect.triggerTurn) }}</div>
          <div class="effect-content">
            <span class="effect-desc">{{ effect.description }}</span>
            <div class="effect-tags">
              <span
                v-for="(value, key) in effect.effects"
                :key="key"
                class="effect-tag"
                :class="{ positive: (value ?? 0) > 0, negative: (value ?? 0) < 0 }"
              >
                {{ getStatIcon(key) }} {{ (value ?? 0) > 0 ? '+' : '' }}{{ value }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Forecast -->
    <div class="forecast-section">
      <div class="forecast-card" :class="getForecastClass()">
        <div class="forecast-content">
          <span class="forecast-icon">{{ getForecastIcon() }}</span>
          <div class="forecast-info">
            <span class="forecast-title">{{ getForecastTitle() }}</span>
            <span class="forecast-detail">Projected: {{ calculateProjectedLoyalty().toFixed(0) }}%</span>
          </div>
        </div>
        <div class="forecast-turns">
          {{ turnsRemaining }} turns left
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();

const loyaltyThreshold = computed(() => gameStore.getSecondTermLoyaltyThreshold());
const turnsRemaining = computed(() => gameStore.maxTurns - gameStore.currentTurn);

const recentHistory = computed(() => {
  return gameStore.financialHistory.slice(-12).filter(s => s.turn > 0);
});

const sortedEffects = computed(() => {
  return [...gameStore.pendingEffects].sort((a, b) => a.triggerTurn - b.triggerTurn);
});

// Overall status
const overallStatus = computed(() => {
  const loyalty = gameStore.stats.loyalty;
  const threshold = loyaltyThreshold.value;
  if (loyalty >= threshold + 10) return 'safe';
  if (loyalty >= threshold) return 'ok';
  if (loyalty >= threshold - 15) return 'warning';
  return 'danger';
});

const overallStatusText = computed(() => {
  const status = overallStatus.value;
  if (status === 'safe') return 'On Track';
  if (status === 'ok') return 'Stable';
  if (status === 'warning') return 'At Risk';
  return 'Critical';
});

const loyaltyStatusText = computed(() => {
  const loyalty = gameStore.stats.loyalty;
  const threshold = loyaltyThreshold.value;
  if (loyalty >= threshold) return 'Above';
  const diff = threshold - loyalty;
  return `-${diff}%`;
});

// Status helpers
function getLoyaltyStatus(): string {
  const loyalty = gameStore.stats.loyalty;
  const threshold = loyaltyThreshold.value;
  if (loyalty >= threshold) return 'good';
  if (loyalty >= threshold - 10) return 'warning';
  return 'danger';
}

function getSupportStatus(): string {
  const support = gameStore.stats.support;
  if (support >= 60) return 'good';
  if (support >= 40) return 'warning';
  return 'danger';
}

function getChaosStatus(): string {
  const chaos = gameStore.stats.chaos;
  if (chaos <= 30) return 'good';
  if (chaos <= 60) return 'warning';
  return 'danger';
}

function getCoinStatus(): string {
  const coin = gameStore.stats.coinValuation;
  if (coin >= 100) return 'good';
  if (coin >= 80) return 'warning';
  return 'danger';
}

// Trend calculations
function calculateTrend(data: number[]): { text: string; class: string } {
  if (data.length < 2) return { text: '--', class: 'neutral' };
  const recent = data.slice(-3);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const diff = last - first;
  if (diff > 5) return { text: `+${diff}`, class: 'up' };
  if (diff < -5) return { text: `${diff}`, class: 'down' };
  return { text: '~', class: 'neutral' };
}

const loyaltyTrend = computed(() => {
  const data = recentHistory.value.map(s => s.loyalty);
  return calculateTrend(data);
});

const supportTrend = computed(() => {
  const data = recentHistory.value.map(s => s.support);
  return calculateTrend(data);
});

// Sparkline generation
function generateSparkline(data: number[]): string {
  if (data.length === 0) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * 100;
    const y = 30 - ((val - min) / range) * 26 - 2;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
}

const loyaltySparkline = computed(() => {
  const data = recentHistory.value.map(s => s.loyalty);
  return generateSparkline(data.length > 0 ? data : [50, 50]);
});

const supportSparkline = computed(() => {
  const data = recentHistory.value.map(s => s.support);
  return generateSparkline(data.length > 0 ? data : [50, 50]);
});

// Helper functions
function getTurnsAway(turn: number): string {
  const diff = turn - gameStore.currentTurn;
  if (diff === 0) return 'Now';
  if (diff === 1) return 'Next';
  return `+${diff}`;
}

function getStatIcon(key: string): string {
  const icons: Record<string, string> = {
    health: '❤️', money: '💰', loyalty: '👥', support: '📊', luck: '🍀', chaos: '🌀', coinValuation: '🪙'
  };
  return icons[key] || '';
}

function getForecastClass(): string {
  const projected = calculateProjectedLoyalty();
  const threshold = loyaltyThreshold.value;
  if (projected >= threshold + 10) return 'safe';
  if (projected >= threshold) return 'ok';
  if (projected >= threshold - 10) return 'warning';
  return 'danger';
}

function getForecastIcon(): string {
  const cl = getForecastClass();
  if (cl === 'safe') return '✅';
  if (cl === 'ok') return '👍';
  if (cl === 'warning') return '⚠️';
  return '❌';
}

function getForecastTitle(): string {
  const cl = getForecastClass();
  if (cl === 'safe') return 'Strong Position';
  if (cl === 'ok') return 'On Track';
  if (cl === 'warning') return 'Needs Work';
  return 'Critical';
}

function calculateProjectedLoyalty(): number {
  let projected = gameStore.stats.loyalty;
  gameStore.pendingEffects.forEach(effect => {
    if (effect.effects.loyalty) projected += effect.effects.loyalty;
  });
  return Math.max(0, Math.min(100, projected));
}
</script>

<style scoped>
.polls-container {
  background: #0a0a14;
  border-radius: 16px;
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #1e293b;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Scrollbar styling */
.polls-container::-webkit-scrollbar {
  width: 4px;
}

.polls-container::-webkit-scrollbar-track {
  background: #0a0a14;
}

.polls-container::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 2px;
}

/* Header */
.polls-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #1e293b;
  background: #0a0a14;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 1.3rem;
}

.header-text h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #22c55e;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 0.7rem;
  color: #64748b;
}

.header-status {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-status.safe { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.header-status.ok { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.header-status.warning { background: rgba(234, 179, 8, 0.2); color: #eab308; }
.header-status.danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  background: #1e293b;
  margin: 12px;
  border-radius: 12px;
  overflow: hidden;
}

.metric-card {
  background: #0f172a;
  padding: 12px 14px;
}

.metric-card.primary {
  padding: 16px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.metric-label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.metric-badge.good { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.metric-badge.warning { background: rgba(234, 179, 8, 0.2); color: #eab308; }
.metric-badge.danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.metric-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
}

.metric-value.good { color: #22c55e; }
.metric-value.warning { color: #eab308; }
.metric-value.danger { color: #ef4444; }

.metric-value-small {
  font-size: 0.85rem;
  font-weight: 700;
}

.metric-value-small.good { color: #22c55e; }
.metric-value-small.warning { color: #eab308; }
.metric-value-small.danger { color: #ef4444; }

.metric-target {
  font-size: 0.85rem;
  color: #64748b;
}

.metric-progress {
  height: 6px;
}

.metric-progress.compact {
  height: 4px;
}

.progress-track {
  position: relative;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: visible;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-fill.loyalty { background: linear-gradient(90deg, #3b82f6, #22c55e); }
.progress-fill.support { background: linear-gradient(90deg, #8b5cf6, #06b6d4); }
.progress-fill.chaos { background: linear-gradient(90deg, #22c55e, #eab308, #ef4444); }
.progress-fill.coin { background: linear-gradient(90deg, #f59e0b, #22c55e); }

.progress-marker {
  position: absolute;
  top: -2px;
  width: 2px;
  height: calc(100% + 4px);
  background: #ff6b35;
  transform: translateX(-50%);
}

/* Trend Section */
.trend-section {
  padding: 0 12px 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-subtitle {
  font-size: 0.65rem;
  color: #64748b;
}

.trend-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.trend-chart {
  background: #0f172a;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #1e293b;
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.trend-label {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 500;
}

.trend-change {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
}

.trend-change.up { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.trend-change.down { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.trend-change.neutral { background: rgba(148, 163, 184, 0.2); color: #94a3b8; }

.sparkline {
  width: 100%;
  height: 24px;
}

.sparkline-path {
  fill: none;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sparkline-path.loyalty { stroke: #3b82f6; }
.sparkline-path.support { stroke: #8b5cf6; }

/* Effects Section */
.effects-section {
  padding: 0 12px 12px;
}

.effects-count {
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(255, 107, 53, 0.2);
  color: #ff6b35;
  padding: 2px 6px;
  border-radius: 8px;
}

.effects-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.effect-item {
  display: flex;
  gap: 10px;
  padding: 8px 10px;
  background: #0f172a;
  border-radius: 8px;
  border: 1px solid #1e293b;
}

.effect-timing {
  font-size: 0.65rem;
  font-weight: 700;
  color: #ff6b35;
  min-width: 32px;
  text-align: center;
  padding-top: 2px;
}

.effect-content {
  flex: 1;
  min-width: 0;
}

.effect-desc {
  font-size: 0.7rem;
  color: #cbd5e1;
  display: block;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.effect-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.effect-tag {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 1px 4px;
  border-radius: 3px;
}

.effect-tag.positive { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
.effect-tag.negative { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

/* Forecast Section */
.forecast-section {
  margin-top: auto;
  padding: 12px;
  border-top: 1px solid #1e293b;
}

.forecast-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid;
}

.forecast-card.safe {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.3);
}

.forecast-card.ok {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.3);
}

.forecast-card.warning {
  background: rgba(234, 179, 8, 0.08);
  border-color: rgba(234, 179, 8, 0.3);
}

.forecast-card.danger {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.3);
}

.forecast-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.forecast-icon {
  font-size: 1.3rem;
}

.forecast-info {
  display: flex;
  flex-direction: column;
}

.forecast-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #e2e8f0;
}

.forecast-detail {
  font-size: 0.7rem;
  color: #94a3b8;
}

.forecast-turns {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 500;
}
</style>
