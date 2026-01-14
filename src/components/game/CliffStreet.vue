<template>
  <div class="cliff-street-container">
    <div class="cliff-header">
      <div class="cliff-branding">
        <span class="cliff-logo">📈</span>
        <div class="cliff-info">
          <span class="cliff-title">Cliff Street</span>
          <span class="cliff-handle">@MarketWatch</span>
        </div>
      </div>
      <div class="market-status" :class="marketTrend">
        {{ marketTrend === 'up' ? '🟢 BULL' : marketTrend === 'down' ? '🔴 BEAR' : '🟡 FLAT' }}
      </div>
    </div>

    <!-- Financial Summary (moved to top, full width) -->
    <div class="summary-card full-width">
      <h4 class="summary-title">💼 Financial Report</h4>
      <div class="summary-stats">
        <div class="summary-item">
          <span class="summary-label">Net Worth</span>
          <span class="summary-value" :class="{ positive: netWorth > 0, negative: netWorth < 0 }">
            {{ netWorth }}M
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Interest Rate</span>
          <span class="summary-value warning">{{ baseInterestRate }}%</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Effective Rate</span>
          <span class="summary-value danger">{{ effectiveRate }}%</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Cost Modifier</span>
          <span class="summary-value" :class="costModifierClass">{{ costModifier }}x</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">2nd Term Threshold</span>
          <span class="summary-value">{{ loyaltyThreshold }}% loyalty</span>
        </div>
      </div>
    </div>

    <!-- Financial Forecast (moved under summary, full width) -->
    <div class="forecast-card full-width">
      <h4 class="forecast-title">📊 Financial Forecast</h4>
      <div class="forecast-content">
        <div class="forecast-item" :class="debtForecastClass">
          <span class="forecast-icon">{{ debtForecastIcon }}</span>
          <div class="forecast-details">
            <div class="forecast-label">Debt Trajectory</div>
            <div class="forecast-value">{{ debtForecastText }}</div>
          </div>
        </div>
        <div class="forecast-item" :class="worthForecastClass">
          <span class="forecast-icon">{{ worthForecastIcon }}</span>
          <div class="forecast-details">
            <div class="forecast-label">Net Worth Outlook</div>
            <div class="forecast-value">{{ worthForecastText }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="charts-container">
      <!-- Money Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">💰 Treasury</span>
          <span class="chart-value" :class="{ positive: latestMoney > 0, negative: latestMoney < 0 }">
            {{ latestMoney }}M
          </span>
        </div>
        <svg class="chart" viewBox="0 0 200 60" preserveAspectRatio="none">
          <!-- Pre-game era marker -->
          <line v-if="playerStartX > 0" :x1="playerStartX" y1="0" :x2="playerStartX" y2="60" 
                class="era-divider" stroke-dasharray="2,2" />
          <path :d="moneyPath" class="chart-line money-line" />
          <path :d="moneyAreaPath" class="chart-area money-area" />
        </svg>
        <div v-if="showEraLabels" class="era-labels">
          <span class="era-label before">Pre-Orange Era</span>
          <span class="era-label after">Orange Era</span>
        </div>
      </div>

      <!-- Debt Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">🏦 Debt</span>
          <span class="chart-value negative">{{ latestDebt }}M</span>
        </div>
        <svg class="chart" viewBox="0 0 200 60" preserveAspectRatio="none">
          <path :d="debtPath" class="chart-line debt-line" />
          <path :d="debtAreaPath" class="chart-area debt-area" />
        </svg>
      </div>

      <!-- Coin Valuation Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">🪙 Coin Value</span>
          <span class="chart-value" :class="coinValueClass">{{ latestCoinValuation }}%</span>
        </div>
        <svg class="chart" viewBox="0 0 200 60" preserveAspectRatio="none">
          <!-- Reference line at 100% -->
          <line x1="0" y1="30" x2="200" y2="30" class="reference-line" />
          <path :d="coinPath" class="chart-line coin-line" />
        </svg>
      </div>

      <!-- Interest Rate Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">📊 Interest Rate</span>
          <span class="chart-value danger">{{ (latestInterest * 100).toFixed(1) }}%</span>
        </div>
        <svg class="chart" viewBox="0 0 200 60" preserveAspectRatio="none">
          <path :d="interestPath" class="chart-line interest-line" />
        </svg>
      </div>

      <!-- Chaos Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">🌀 Chaos</span>
          <span class="chart-value warning">{{ latestChaos }}%</span>
        </div>
        <svg class="chart" viewBox="0 0 200 60" preserveAspectRatio="none">
          <path :d="chaosPath" class="chart-line chaos-line" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();

const history = computed(() => gameStore.financialHistory);

// Calculate where player era starts in the chart
const playerStartX = computed(() => {
  if (history.value.length === 0) return 0;
  const firstPlayerTurn = history.value.findIndex(h => h.turn >= 1);
  if (firstPlayerTurn === -1) return 0;
  return (firstPlayerTurn / Math.max(history.value.length - 1, 1)) * 200;
});

const showEraLabels = computed(() => {
  return history.value.length > 0 && history.value[0].turn < 0;
});

// Latest values
const latestMoney = computed(() => gameStore.stats.money);
const latestDebt = computed(() => gameStore.debt);
const latestCoinValuation = computed(() => gameStore.stats.coinValuation);
const latestChaos = computed(() => gameStore.stats.chaos);
const latestInterest = computed(() => gameStore.interestRate);

// Calculated values
const netWorth = computed(() => gameStore.stats.money - gameStore.debt);
const baseInterestRate = computed(() => (gameStore.interestRate * 100).toFixed(1));
const effectiveRate = computed(() => {
  const chaos = gameStore.stats.chaos;
  const coinVal = gameStore.stats.coinValuation;
  const chaosBonus = (chaos / 100) * 5;
  const valuationBonus = ((100 - coinVal) / 100) * 3;
  return ((gameStore.interestRate + chaosBonus / 100 + valuationBonus / 100) * 100).toFixed(1);
});
const costModifier = computed(() => (100 / gameStore.stats.coinValuation).toFixed(2));
const loyaltyThreshold = computed(() => gameStore.getSecondTermLoyaltyThreshold());

// Classes
const coinValueClass = computed(() => {
  const val = latestCoinValuation.value;
  if (val < 70) return 'negative';
  if (val < 85) return 'warning';
  if (val > 115) return 'positive';
  return '';
});

const costModifierClass = computed(() => {
  const mod = parseFloat(costModifier.value);
  if (mod > 1.3) return 'negative';
  if (mod > 1.1) return 'warning';
  if (mod < 0.9) return 'positive';
  return '';
});

const marketTrend = computed(() => {
  if (history.value.length < 2) return 'flat';
  const recent = history.value.slice(-3);
  const avgChange = recent.reduce((acc, h, i) => {
    if (i === 0) return 0;
    return acc + (h.coinValuation - recent[i - 1].coinValuation);
  }, 0) / (recent.length - 1);
  if (avgChange > 1) return 'up';
  if (avgChange < -1) return 'down';
  return 'flat';
});

// Chart path generators
function generatePath(data: number[], minVal: number, maxVal: number): string {
  if (data.length === 0) return '';
  const range = maxVal - minVal || 1;
  const points = data.map((val, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * 200;
    const y = 60 - ((val - minVal) / range) * 55 - 2.5;
    return `${x},${y}`;
  });
  return `M ${points.join(' L ')}`;
}

function generateAreaPath(data: number[], minVal: number, maxVal: number): string {
  if (data.length === 0) return '';
  const range = maxVal - minVal || 1;
  const points = data.map((val, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * 200;
    const y = 60 - ((val - minVal) / range) * 55 - 2.5;
    return `${x},${y}`;
  });
  return `M 0,60 L ${points.join(' L ')} L 200,60 Z`;
}

// Chart paths
const moneyPath = computed(() => {
  const data = history.value.map(h => h.money);
  if (data.length === 0) return '';
  const min = Math.min(...data, 0);
  const max = Math.max(...data, 10);
  return generatePath(data, min, max);
});

const moneyAreaPath = computed(() => {
  const data = history.value.map(h => h.money);
  if (data.length === 0) return '';
  const min = Math.min(...data, 0);
  const max = Math.max(...data, 10);
  return generateAreaPath(data, min, max);
});

const debtPath = computed(() => {
  const data = history.value.map(h => h.debt);
  if (data.length === 0) return '';
  const max = Math.max(...data, 1);
  return generatePath(data, 0, max);
});

const debtAreaPath = computed(() => {
  const data = history.value.map(h => h.debt);
  if (data.length === 0) return '';
  const max = Math.max(...data, 1);
  return generateAreaPath(data, 0, max);
});

const coinPath = computed(() => {
  const data = history.value.map(h => h.coinValuation);
  if (data.length === 0) return '';
  return generatePath(data, 50, 150);
});

const chaosPath = computed(() => {
  const data = history.value.map(h => h.chaos);
  if (data.length === 0) return '';
  return generatePath(data, 0, 100);
});

const interestPath = computed(() => {
  const data = history.value.map(h => h.interestRate * 100);
  if (data.length === 0) return '';
  return generatePath(data, 0, 30);
});

// Forecast calculations
const debtTrend = computed(() => {
  if (history.value.length < 3) return 0;
  const recent = history.value.slice(-3);
  return recent[recent.length - 1].debt - recent[0].debt;
});

const debtForecastClass = computed(() => {
  if (latestDebt.value === 0) return 'forecast-safe';
  if (debtTrend.value > 50) return 'forecast-danger';
  if (debtTrend.value > 20) return 'forecast-warning';
  if (debtTrend.value < -20) return 'forecast-safe';
  return 'forecast-neutral';
});

const debtForecastIcon = computed(() => {
  if (latestDebt.value === 0) return '✅';
  if (debtTrend.value > 50) return '🚨';
  if (debtTrend.value > 20) return '⚠️';
  if (debtTrend.value < -20) return '📉';
  return '➡️';
});

const debtForecastText = computed(() => {
  if (latestDebt.value === 0) return 'Debt-free! Keep it up!';
  if (debtTrend.value > 50) return 'Rapidly increasing - crisis risk';
  if (debtTrend.value > 20) return 'Rising steadily - monitor closely';
  if (debtTrend.value < -20) return 'Decreasing - on track to recovery';
  return 'Stable debt levels';
});

const worthForecastClass = computed(() => {
  if (netWorth.value > 200) return 'forecast-safe';
  if (netWorth.value > 50) return 'forecast-neutral';
  if (netWorth.value > -50) return 'forecast-warning';
  return 'forecast-danger';
});

const worthForecastIcon = computed(() => {
  if (netWorth.value > 200) return '💎';
  if (netWorth.value > 50) return '📈';
  if (netWorth.value > -50) return '⚖️';
  return '💸';
});

const worthForecastText = computed(() => {
  if (netWorth.value > 200) return 'Strong financial position';
  if (netWorth.value > 50) return 'Healthy reserves';
  if (netWorth.value > -50) return 'Tight margins - be careful';
  return 'Deep in debt - risky position';
});
</script>

<style scoped>
.cliff-street-container {
  background: #0a0a14;
  border-radius: 16px;
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #1e293b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.cliff-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #1e293b;
  background: #0a0a14;
}

.cliff-branding {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cliff-logo {
  font-size: 1.2rem;
}

.cliff-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.cliff-title {
  font-weight: 800;
  color: #22c55e;
  font-size: 0.8rem;
  line-height: 1;
}

.cliff-handle {
  font-size: 0.65rem;
  color: #64748b;
  line-height: 1;
}

.market-status {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
}

.market-status.up { color: #22c55e; }
.market-status.down { color: #ef4444; }
.market-status.flat { color: #eab308; }

.charts-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.chart-card {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 8px;
  padding: 8px;
  border: 1px solid #334155;
}

.chart-card.wide {
  grid-column: span 2;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.chart-title {
  font-size: 0.65rem;
  color: #94a3b8;
  font-weight: 600;
}

.chart-value {
  font-size: 0.75rem;
  font-weight: 700;
  color: #e2e8f0;
}

.chart-value.positive { color: #22c55e; }
.chart-value.negative { color: #ef4444; }
.chart-value.warning { color: #eab308; }

.legend {
  display: flex;
  gap: 8px;
}

.legend-item {
  font-size: 0.6rem;
  font-weight: 600;
}

.legend-item.chaos { color: #a855f7; }
.legend-item.interest { color: #3b82f6; }

.chart {
  width: 100%;
  height: 40px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.era-divider {
  stroke: rgba(255, 107, 53, 0.5);
  stroke-width: 1;
}

.era-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 0.6rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.era-label.before {
  color: #10b981;
}

.era-label.after {
  color: #ff6b35;
}

.chart-line {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-area {
  opacity: 0.2;
}

.money-line { stroke: #22c55e; }
.money-area { fill: #22c55e; }

.debt-line { stroke: #ef4444; }
.debt-area { fill: #ef4444; }

.coin-line { stroke: #fbbf24; }

.chaos-line { stroke: #a855f7; }
.interest-line { stroke: #3b82f6; }

.reference-line {
  stroke: #475569;
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.summary-card {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
  border-radius: 12px;
  padding: 16px;
  border: 2px solid rgba(34, 197, 94, 0.3);
  margin-bottom: 12px;
}

.summary-card.full-width {
  grid-column: 1 / -1;
  width: 100%;
}

.summary-title {
  font-size: 0.9rem;
  color: #22c55e;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 8px;
}

.summary-label {
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 1rem;
  font-weight: 700;
  color: #e2e8f0;
}

.summary-value.positive { color: #22c55e; }
.summary-value.negative { color: #ef4444; }
.summary-value.warning { color: #eab308; }
.summary-value.danger { color: #ef4444; font-weight: 700; }

/* Forecast Card */
.forecast-card {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-radius: 12px;
  padding: 16px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  margin-bottom: 12px;
}

.forecast-card.full-width {
  grid-column: 1 / -1;
  width: 100%;
}

.forecast-title {
  font-size: 0.9rem;
  color: #3b82f6;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.forecast-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.forecast-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 4px solid #64748b;
}

.forecast-item.forecast-safe {
  border-left-color: #22c55e;
}

.forecast-item.forecast-neutral {
  border-left-color: #3b82f6;
}

.forecast-item.forecast-warning {
  border-left-color: #eab308;
}

.forecast-item.forecast-danger {
  border-left-color: #ef4444;
}

.forecast-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.forecast-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.forecast-label {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.forecast-value {
  font-size: 0.85rem;
  color: #e2e8f0;
  font-weight: 600;
}

/* Scrollbar */
.charts-container::-webkit-scrollbar {
  width: 4px;
}

.charts-container::-webkit-scrollbar-track {
  background: #0a0a14;
}

.charts-container::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 2px;
}
</style>

<style>
/* Unscoped styles for SVG chart lines to ensure colors work properly */
.chart-line {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.money-line { 
  stroke: #22c55e !important; 
}

.money-area { 
  fill: #22c55e !important; 
  opacity: 0.2;
}

.debt-line { 
  stroke: #ef4444 !important; 
}

.debt-area { 
  fill: #ef4444 !important; 
  opacity: 0.2;
}

.coin-line { 
  stroke: #fbbf24 !important; 
}

.chaos-line { 
  stroke: #a855f7 !important; 
}

.interest-line { 
  stroke: #3b82f6 !important; 
}

.reference-line {
  stroke: #475569 !important;
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.era-divider {
  stroke: #64748b !important;
  stroke-width: 1;
  opacity: 0.5;
}
</style>
