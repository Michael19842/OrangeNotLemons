<template>
  <div class="polls-tracker-container">
    <div class="polls-header">
      <h2>📊 Poll Tracker</h2>
      <p class="subtitle">Current standings & future projections</p>
    </div>

    <div class="current-polls">
      <h3>Current Position</h3>
      <div class="poll-stat-grid">
        <div class="poll-stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-label">Inner Circle Loyalty</div>
            <div class="stat-bar-container">
              <div class="stat-bar-fill loyalty" :style="{ width: `${gameStore.stats.loyalty}%` }"></div>
              <div class="stat-bar-value" :class="getLoyaltyClass()">
                {{ gameStore.stats.loyalty }}%
              </div>
            </div>
            <div class="stat-threshold">
              Threshold: {{ loyaltyThreshold }}%
            </div>
          </div>
        </div>

        <div class="poll-stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-label">Public Support</div>
            <div class="stat-bar-container">
              <div class="stat-bar-fill support" :style="{ width: `${gameStore.stats.support}%` }"></div>
              <div class="stat-bar-value" :class="getSupportClass()">
                {{ gameStore.stats.support }}%
              </div>
            </div>
            <div class="stat-desc">Affects plan success</div>
          </div>
        </div>

        <div class="poll-stat-card">
          <div class="stat-icon">🌀</div>
          <div class="stat-info">
            <div class="stat-label">Chaos Level</div>
            <div class="stat-bar-container">
              <div class="stat-bar-fill chaos" :style="{ width: `${gameStore.stats.chaos}%` }"></div>
              <div class="stat-bar-value" :class="getChaosClass()">
                {{ gameStore.stats.chaos }}%
              </div>
            </div>
            <div class="stat-desc">{{ getChaosDescription() }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="history-section">
      <h3>📊 Historical Trends</h3>
      <div class="history-charts">
        <div class="history-chart">
          <div class="history-header">
            <span class="history-label">👥 Loyalty</span>
            <span class="history-current">{{ gameStore.stats.loyalty }}%</span>
          </div>
          <div class="history-bars">
            <div 
              v-for="(snapshot, index) in recentHistory" 
              :key="index"
              class="history-bar-wrapper"
            >
              <div 
                class="history-bar loyalty-bar"
                :style="{ height: `${snapshot.loyalty}%` }"
                :class="getHistoryBarClass(snapshot.loyalty)"
              ></div>
            </div>
          </div>
        </div>

        <div class="history-chart">
          <div class="history-header">
            <span class="history-label">📊 Support</span>
            <span class="history-current">{{ gameStore.stats.support }}%</span>
          </div>
          <div class="history-bars">
            <div 
              v-for="(snapshot, index) in recentHistory" 
              :key="index"
              class="history-bar-wrapper"
            >
              <div 
                class="history-bar support-bar"
                :style="{ height: `${snapshot.support}%` }"
                :class="getHistoryBarClass(snapshot.support)"
              ></div>
            </div>
          </div>
        </div>

        <div class="history-chart">
          <div class="history-header">
            <span class="history-label">🌀 Chaos</span>
            <span class="history-current">{{ gameStore.stats.chaos }}%</span>
          </div>
          <div class="history-bars">
            <div 
              v-for="(snapshot, index) in recentHistory" 
              :key="index"
              class="history-bar-wrapper"
            >
              <div 
                class="history-bar chaos-bar"
                :style="{ height: `${snapshot.chaos}%` }"
                :class="getHistoryBarClass(snapshot.chaos)"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="projections-section">
      <h3>📈 Projections</h3>
      <div class="projection-info">
        Based on {{ gameStore.pendingEffects.length }} pending delayed effects
      </div>

      <div v-if="gameStore.pendingEffects.length === 0" class="no-effects">
        <span class="icon">✨</span>
        <p>No pending effects. The future is unwritten!</p>
      </div>

      <div v-else class="effects-timeline">
        <div
          v-for="effect in sortedEffects"
          :key="effect.id"
          class="effect-card"
        >
          <div class="effect-header">
            <span class="effect-turn">Turn {{ effect.triggerTurn }}</span>
            <span class="turns-away">{{ getTurnsAway(effect.triggerTurn) }}</span>
          </div>
          <div class="effect-description">{{ effect.description }}</div>
          <div class="effect-impacts">
            <span
              v-for="(value, key) in effect.effects"
              :key="key"
              class="impact-badge"
              :class="{ positive: (value ?? 0) > 0, negative: (value ?? 0) < 0 }"
            >
              {{ getStatIcon(key) }} {{ (value ?? 0) > 0 ? '+' : '' }}{{ value ?? 0 }}
            </span>
          </div>
        </div>
      </div>

      <div class="projection-chart">
        <h4>📈 Loyalty Projection Chart</h4>
        <p class="projection-subtitle">Based on pending delayed effects</p>
        <div class="chart-container">
          <canvas ref="chartCanvas"></canvas>
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-dot current"></span>
            <span>Current Position</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot projected"></span>
            <span>Projected Path</span>
          </div>
          <div class="legend-item">
            <span class="legend-line threshold"></span>
            <span>{{ loyaltyThreshold }}% Threshold</span>
          </div>
        </div>
      </div>
    </div>

    <div class="reelection-forecast">
      <h3>🗳️ Re-election Forecast</h3>
      <div class="forecast-card" :class="getForecastClass()">
        <div class="forecast-icon">{{ getForecastIcon() }}</div>
        <div class="forecast-text">
          <div class="forecast-title">{{ getForecastTitle() }}</div>
          <div class="forecast-details">{{ getForecastDetails() }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import type { DelayedEffect } from '@/types/game';

const gameStore = useGameStore();
const chartCanvas = ref<HTMLCanvasElement | null>(null);

const loyaltyThreshold = computed(() => gameStore.getSecondTermLoyaltyThreshold());

const recentHistory = computed(() => {
  // Get last 20 snapshots for history charts
  return gameStore.financialHistory.slice(-20).map(snapshot => ({
    loyalty: snapshot.loyalty,
    support: snapshot.support,
    chaos: snapshot.chaos
  }));
});

const sortedEffects = computed(() => {
  return [...gameStore.pendingEffects].sort((a, b) => a.triggerTurn - b.triggerTurn);
});

function getTurnsAway(turn: number): string {
  const diff = turn - gameStore.currentTurn;
  if (diff === 0) return 'This turn!';
  if (diff === 1) return 'Next turn';
  return `In ${diff} turns`;
}

function getHistoryBarClass(value: number): string {
  if (value >= 70) return 'excellent';
  if (value >= 50) return 'good';
  if (value >= 30) return 'warning';
  return 'danger';
}

function getStatIcon(statKey: string): string {
  const icons: Record<string, string> = {
    health: '❤️',
    money: '💰',
    loyalty: '👥',
    support: '📊',
    luck: '🍀',
    chaos: '🌀',
    coinValuation: '🪙'
  };
  return icons[statKey] || '?';
}

function getLoyaltyClass(): string {
  if (gameStore.stats.loyalty >= loyaltyThreshold.value) return 'excellent';
  if (gameStore.stats.loyalty >= loyaltyThreshold.value - 10) return 'good';
  if (gameStore.stats.loyalty >= loyaltyThreshold.value - 20) return 'warning';
  return 'danger';
}

function getSupportClass(): string {
  if (gameStore.stats.support >= 70) return 'excellent';
  if (gameStore.stats.support >= 50) return 'good';
  if (gameStore.stats.support >= 30) return 'warning';
  return 'danger';
}

function getChaosClass(): string {
  if (gameStore.stats.chaos >= 70) return 'danger';
  if (gameStore.stats.chaos >= 50) return 'warning';
  if (gameStore.stats.chaos >= 30) return 'good';
  return 'excellent';
}

function getChaosDescription(): string {
  const chaos = gameStore.stats.chaos;
  if (chaos >= 70) return 'Helps re-election, hurts support';
  if (chaos >= 50) return 'Lowers loyalty threshold';
  if (chaos >= 30) return 'Moderate instability';
  return 'Stable but harder to win';
}

function getForecastClass(): string {
  const turnsLeft = gameStore.maxTurns - gameStore.currentTurn;
  const projectedLoyalty = calculateProjectedLoyalty();
  
  if (projectedLoyalty >= loyaltyThreshold.value + 10) return 'forecast-safe';
  if (projectedLoyalty >= loyaltyThreshold.value) return 'forecast-likely';
  if (projectedLoyalty >= loyaltyThreshold.value - 10) return 'forecast-uncertain';
  return 'forecast-unlikely';
}

function getForecastIcon(): string {
  const projectedLoyalty = calculateProjectedLoyalty();
  if (projectedLoyalty >= loyaltyThreshold.value + 10) return '🎉';
  if (projectedLoyalty >= loyaltyThreshold.value) return '✅';
  if (projectedLoyalty >= loyaltyThreshold.value - 10) return '⚠️';
  return '❌';
}

function getForecastTitle(): string {
  const projectedLoyalty = calculateProjectedLoyalty();
  if (projectedLoyalty >= loyaltyThreshold.value + 10) return 'Very Likely to Win';
  if (projectedLoyalty >= loyaltyThreshold.value) return 'Likely to Win';
  if (projectedLoyalty >= loyaltyThreshold.value - 10) return 'Uncertain';
  return 'Unlikely to Win';
}

function getForecastDetails(): string {
  const turnsLeft = gameStore.maxTurns - gameStore.currentTurn;
  const projectedLoyalty = calculateProjectedLoyalty();
  const needed = loyaltyThreshold.value - projectedLoyalty;
  
  if (needed <= 0) {
    return `Projected loyalty: ${projectedLoyalty.toFixed(0)}% (${Math.abs(needed).toFixed(0)}% above threshold)`;
  } else {
    return `Projected loyalty: ${projectedLoyalty.toFixed(0)}% (need ${needed.toFixed(0)}% more)`;
  }
}

function calculateProjectedLoyalty(): number {
  let projected = gameStore.stats.loyalty;
  
  // Apply all pending loyalty effects
  gameStore.pendingEffects.forEach(effect => {
    if (effect.effects.loyalty) {
      projected += effect.effects.loyalty;
    }
  });
  
  return Math.max(0, Math.min(100, projected));
}

function drawChart() {
  if (!chartCanvas.value) return;
  
  const canvas = chartCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Set canvas size
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  const width = rect.width;
  const height = rect.height;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Build data points
  const points: { turn: number; loyalty: number }[] = [
    { turn: gameStore.currentTurn, loyalty: gameStore.stats.loyalty }
  ];
  
  let currentLoyalty = gameStore.stats.loyalty;
  sortedEffects.value.forEach(effect => {
    if (effect.effects.loyalty) {
      currentLoyalty = Math.max(0, Math.min(100, currentLoyalty + effect.effects.loyalty));
      points.push({ turn: effect.triggerTurn, loyalty: currentLoyalty });
    }
  });
  
  // Add final point at maxTurns if not already there
  if (points[points.length - 1].turn < gameStore.maxTurns) {
    points.push({ turn: gameStore.maxTurns, loyalty: currentLoyalty });
  }
  
  // Draw axes
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  
  // Draw threshold line
  const thresholdY = height - padding - (loyaltyThreshold.value / 100) * chartHeight;
  ctx.strokeStyle = '#ff6b35';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(padding, thresholdY);
  ctx.lineTo(width - padding, thresholdY);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Draw threshold label
  ctx.fillStyle = '#ff6b35';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Threshold: ${loyaltyThreshold.value}%`, width - padding - 5, thresholdY - 5);
  
  // Draw projection line
  if (points.length > 1) {
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    points.forEach((point, index) => {
      const x = padding + ((point.turn - gameStore.currentTurn) / (gameStore.maxTurns - gameStore.currentTurn)) * chartWidth;
      const y = height - padding - (point.loyalty / 100) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw points
    points.forEach(point => {
      const x = padding + ((point.turn - gameStore.currentTurn) / (gameStore.maxTurns - gameStore.currentTurn)) * chartWidth;
      const y = height - padding - (point.loyalty / 100) * chartHeight;
      
      ctx.fillStyle = point.turn === gameStore.currentTurn ? '#3b82f6' : '#4ade80';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  // Draw current point
  const currentX = padding;
  const currentY = height - padding - (gameStore.stats.loyalty / 100) * chartHeight;
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Labels
  ctx.fillStyle = '#888';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Turn ${gameStore.currentTurn}`, padding + 5, height - 10);
  ctx.textAlign = 'right';
  ctx.fillText(`Turn ${gameStore.maxTurns}`, width - padding - 5, height - 10);
}

onMounted(() => {
  drawChart();
});

watch(
  () => [gameStore.pendingEffects, gameStore.stats.loyalty, gameStore.currentTurn],
  () => {
    drawChart();
  },
  { deep: true }
);
</script>

<style scoped>
.polls-tracker-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
  border-radius: 12px;
  height: 100%;
  overflow-y: auto;
}

.polls-header {
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(255, 107, 53, 0.3);
}

.polls-header h2 {
  margin: 0 0 8px 0;
  color: #ff6b35;
  font-size: 1.5rem;
}

.subtitle {
  margin: 0;
  color: #888;
  font-size: 0.9rem;
}

.current-polls h3,
.history-section h3,
.projections-section h3,
.reelection-forecast h3 {
  color: #ff6b35;
  font-size: 1.1rem;
  margin: 0 0 12px 0;
}

.poll-stat-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.poll-stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-label {
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.stat-bar-container {
  position: relative;
  height: 40px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  transition: width 0.8s ease;
  opacity: 0.7;
  transform-origin: left;
}

.stat-bar-fill.loyalty {
  background: linear-gradient(90deg, #f59e0b, #3b82f6, #4ade80);
}

.stat-bar-fill.support {
  background: linear-gradient(90deg, #8b5cf6, #06b6d4, #4ade80);
}

.stat-bar-fill.chaos {
  background: linear-gradient(90deg, #4ade80, #fbbf24, #ef4444);
}

.stat-bar-value {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.4rem;
  font-weight: 700;
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.stat-bar-value.excellent {
  color: #4ade80;
}

.stat-bar-value.good {
  color: #3b82f6;
}

.stat-bar-value.warning {
  color: #fbbf24;
}

.stat-bar-value.danger {
  color: #ef4444;
  animation: pulse-value 1.5s ease-in-out infinite;
}

@keyframes pulse-value {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-value.excellent {
  color: #4ade80;
}

.stat-value.good {
  color: #3b82f6;
}

.stat-value.warning {
  color: #fbbf24;
}

.stat-value.danger {
  color: #ef4444;
}

.stat-threshold,
.stat-desc {
  color: #666;
  font-size: 0.75rem;
}

/* History Section */
.history-section {
  margin-top: 20px;
}

.history-charts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-chart {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ccc;
}

.history-current {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff6b35;
}

.history-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 120px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
}

.history-bar-wrapper {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
  min-width: 8px;
}

.history-bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
  position: relative;
}

.history-bar.loyalty-bar {
  background: linear-gradient(to top, #3b82f6, #4ade80);
}

.history-bar.support-bar {
  background: linear-gradient(to top, #8b5cf6, #06b6d4);
}

.history-bar.chaos-bar {
  background: linear-gradient(to top, #4ade80, #fbbf24, #ef4444);
}

.history-bar.excellent {
  opacity: 1;
}

.history-bar.good {
  opacity: 0.9;
}

.history-bar.warning {
  opacity: 0.8;
}

.history-bar.danger {
  opacity: 0.7;
  animation: pulse-bar 2s ease-in-out infinite;
}

@keyframes pulse-bar {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 0.5; }
}

.projection-info {
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 12px;
  text-align: center;
}

.no-effects {
  text-align: center;
  padding: 32px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  color: #888;
}

.no-effects .icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 8px;
}

.no-effects p {
  margin: 0;
}

.effects-timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.effect-card {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #ff6b35;
  border-radius: 8px;
}

.effect-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.effect-turn {
  color: #ff6b35;
  font-weight: 700;
  font-size: 0.9rem;
}

.turns-away {
  color: #888;
  font-size: 0.75rem;
}

.effect-description {
  color: #ccc;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.effect-impacts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.impact-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.impact-badge.positive {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.impact-badge.negative {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.projection-chart {
  margin-top: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.projection-chart h4 {
  color: #ff6b35;
  font-size: 1rem;
  margin: 0 0 4px 0;
  font-weight: 700;
}

.projection-subtitle {
  color: #888;
  font-size: 0.8rem;
  margin: 0 0 12px 0;
  font-style: italic;
}

.chart-container {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  padding: 16px;
  height: 220px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chart-container canvas {
  width: 100%;
  height: 100%;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #aaa;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.current {
  background: #3b82f6;
}

.legend-dot.projected {
  background: #4ade80;
}

.legend-line {
  width: 20px;
  height: 2px;
  display: inline-block;
}

.legend-line.threshold {
  background: #ff6b35;
  border-top: 2px dashed #ff6b35;
}

.forecast-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid;
}

.forecast-card.forecast-safe {
  background: rgba(74, 222, 128, 0.1);
  border-color: rgba(74, 222, 128, 0.5);
}

.forecast-card.forecast-likely {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.5);
}

.forecast-card.forecast-uncertain {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.5);
}

.forecast-card.forecast-unlikely {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.5);
}

.forecast-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.forecast-text {
  flex: 1;
}

.forecast-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: #fff;
}

.forecast-details {
  color: #ccc;
  font-size: 0.9rem;
}
</style>
