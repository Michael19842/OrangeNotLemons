<template>
  <div class="stock-card" :class="positionClass">
    <div class="stock-header">
      <div class="stock-info">
        <span class="emoji">{{ stock.emoji }}</span>
        <div class="details">
          <div class="name">{{ stock.name }}</div>
          <div class="sector">{{ sectorLabel }}</div>
        </div>
      </div>
      <div class="header-right">
        <div class="price-info">
          <div class="price">${{ stock.currentPrice }}</div>
          <div class="change" :class="changeClass">{{ priceChange }}</div>
        </div>
        <!-- Mini Chart (clickable) -->
        <div 
          v-if="stock.priceHistory && stock.priceHistory.length > 1" 
          class="mini-chart-preview"
          @click="showChartModal = true"
        >
          <svg viewBox="0 0 60 25" preserveAspectRatio="none">
            <path :d="chartPath" :class="chartLineClass" />
          </svg>
        </div>
      </div>
    </div>

    <div class="stock-description">{{ stock.description }}</div>

    <div v-if="position" class="position-info">
      <div class="position-label">Your Position:</div>
      <div class="position-details">
        <span :class="positionTypeClass">{{ positionText }}</span>
        <span class="position-value">≈ ${{ positionValue }}B</span>
      </div>
    </div>

    <div class="stock-actions">
      <ion-button
        size="small"
        color="success"
        @click="$emit('buy', stock.id)"
      >
        📈 Buy
      </ion-button>
      <ion-button
        v-if="position && position.shares > 0"
        size="small"
        color="medium"
        @click="$emit('sell', stock.id)"
      >
        💸 Sell
      </ion-button>
      <ion-button
        size="small"
        color="danger"
        @click="$emit('short', stock.id)"
      >
        📉 Short
      </ion-button>
      <ion-button
        v-if="position && position.shares !== 0"
        size="small"
        color="warning"
        @click="$emit('close', stock.id)"
      >
        🔒 Close
      </ion-button>
    </div>

    <!-- Chart Detail Modal -->
    <ion-modal :is-open="showChartModal" @did-dismiss="showChartModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ stock.emoji }} {{ stock.name }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showChartModal = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div class="chart-modal-content">
          <div class="chart-stats">
            <div class="stat-item">
              <span class="label">Current Price:</span>
              <span class="value">${{ stock.currentPrice }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Base Price:</span>
              <span class="value">${{ stock.basePrice }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Change:</span>
              <span class="value" :class="changeClass">{{ priceChange }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Volatility:</span>
              <span class="value">{{ (stock.volatility * 100).toFixed(0) }}%</span>
            </div>
          </div>
          
          <!-- Large Chart -->
          <div class="large-chart">
            <svg viewBox="0 0 100 60" preserveAspectRatio="none">
              <!-- Grid lines -->
              <line v-for="i in 5" :key="`h-${i}`" 
                    :x1="0" :y1="i * 12" :x2="100" :y2="i * 12" 
                    class="grid-line" />
              <line v-for="i in 10" :key="`v-${i}`" 
                    :x1="i * 10" :y1="0" :x2="i * 10" :y2="60" 
                    class="grid-line" />
              <!-- Chart line -->
              <path :d="largeChartPath" :class="chartLineClass" />
              <!-- Data points -->
              <circle v-for="(point, idx) in chartPoints" :key="idx"
                      :cx="point.x" :cy="point.y" r="1.5"
                      :class="`point-${chartLineClass}`" />
            </svg>
          </div>

          <div class="chart-info">
            <p>{{ stock.description }}</p>
            <p class="sector-info">Sector: {{ sectorLabel }}</p>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { IonButton, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent } from '@ionic/vue';
import type { Stock } from '@/data/stocks';

interface Position {
  shares: number;
  averageCost: number;
}

interface Props {
  stock: Stock;
  position?: Position;
}

const props = defineProps<Props>();
defineEmits<{
  buy: [stockId: string];
  sell: [stockId: string];
  short: [stockId: string];
  close: [stockId: string];
}>();

const showChartModal = ref(false);

const sectorLabel = computed(() => {
  const labels: Record<string, string> = {
    tech: '💻 Tech',
    energy: '⚡ Energy',
    finance: '💰 Finance',
    defense: '🛡️ Defense',
    media: '📺 Media',
    healthcare: '💊 Healthcare',
    'real-estate': '🏠 Real Estate',
    manufacturing: '🏭 Manufacturing'
  };
  return labels[props.stock.sector] || props.stock.sector;
});

const priceChange = computed(() => {
  const change = ((props.stock.currentPrice - props.stock.basePrice) / props.stock.basePrice) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
});

const changeClass = computed(() => {
  const change = props.stock.currentPrice - props.stock.basePrice;
  return change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
});

const positionClass = computed(() => {
  if (!props.position || props.position.shares === 0) return '';
  return props.position.shares > 0 ? 'has-long' : 'has-short';
});

const positionTypeClass = computed(() => {
  if (!props.position || props.position.shares === 0) return '';
  return props.position.shares > 0 ? 'long-position' : 'short-position';
});

const positionText = computed(() => {
  if (!props.position || props.position.shares === 0) return 'No position';
  const shares = Math.abs(props.position.shares);
  const type = props.position.shares > 0 ? 'Long' : 'Short';
  return `${type}: ${shares.toLocaleString()} shares @ $${props.position.averageCost.toFixed(0)}`;
});

const positionValue = computed(() => {
  if (!props.position || props.position.shares === 0) return 0;
  
  if (props.position.shares > 0) {
    // Long: current sell value (with spread)
    const sellPrice = Math.ceil(props.stock.currentPrice * 0.8);
    return Math.ceil((Math.abs(props.position.shares) * sellPrice) / 100);
  } else {
    // Short: cost to buy back
    const buyPrice = props.stock.currentPrice;
    return Math.ceil((Math.abs(props.position.shares) * buyPrice) / 100);
  }
});

const chartPath = computed(() => {
  if (!props.stock.priceHistory || props.stock.priceHistory.length < 2) return '';
  
  const prices = props.stock.priceHistory;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;
  
  const points = prices.map((price, index) => {
    const x = (index / (prices.length - 1)) * 100;
    const y = 30 - ((price - minPrice) / range) * 30;
    return `${x},${y}`;
  });
  
  return `M ${points.join(' L ')}`;
});

const chartLineClass = computed(() => {
  if (!props.stock.priceHistory || props.stock.priceHistory.length < 2) return 'chart-neutral';
  
  const firstPrice = props.stock.priceHistory[0];
  const lastPrice = props.stock.priceHistory[props.stock.priceHistory.length - 1];
  
  if (lastPrice > firstPrice) return 'chart-up';
  if (lastPrice < firstPrice) return 'chart-down';
  return 'chart-neutral';
});

const largeChartPath = computed(() => {
  if (!props.stock.priceHistory || props.stock.priceHistory.length < 2) return '';
  
  const prices = props.stock.priceHistory;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;
  
  const points = prices.map((price, index) => {
    const x = (index / (prices.length - 1)) * 100;
    const y = 60 - ((price - minPrice) / range) * 60; // Use full height
    return `${x},${y}`;
  });
  
  return `M ${points.join(' L ')}`;
});

const chartPoints = computed(() => {
  if (!props.stock.priceHistory || props.stock.priceHistory.length < 2) return [];
  
  const prices = props.stock.priceHistory;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;
  
  return prices.map((price, index) => ({
    x: (index / (prices.length - 1)) * 100,
    y: 60 - ((price - minPrice) / range) * 60
  }));
});
</script>

<style scoped>
.stock-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 12px;
  transition: all 0.2s ease;
}

.stock-card.has-long {
  border-color: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.2);
}

.stock-card.has-short {
  border-color: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.2);
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.header-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.stock-info {
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 1;
}

.emoji {
  font-size: 28px;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  font-weight: bold;
  font-size: 14px;
  color: #e2e8f0;
}

.sector {
  font-size: 11px;
  color: #94a3b8;
}

.price-info {
  text-align: right;
}

.price {
  font-size: 16px;
  font-weight: bold;
  color: #22d3ee;
}

.change {
  font-size: 12px;
  font-weight: 600;
}

.change.positive {
  color: #10b981;
}

.change.negative {
  color: #ef4444;
}

.change.neutral {
  color: #94a3b8;
}

.mini-chart-preview {
  width: 60px;
  height: 25px;
  background: #0f172a;
  border-radius: 4px;
  padding: 2px;
  border: 1px solid #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mini-chart-preview:hover {
  border-color: #22d3ee;
  box-shadow: 0 0 4px rgba(34, 211, 238, 0.3);
  transform: scale(1.05);
}

.mini-chart-preview svg {
  width: 100%;
  height: 100%;
}

.mini-chart-preview path {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.stock-description {
  font-size: 12px;
  color: #cbd5e1;
  margin-bottom: 10px;
  line-height: 1.4;
}

.position-info {
  background: #0f172a;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #1e293b;
}

.position-label {
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.position-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.long-position {
  color: #10b981;
  font-weight: 600;
}

.short-position {
  color: #ef4444;
  font-weight: 600;
}

.position-value {
  color: #22d3ee;
  font-weight: bold;
}

.stock-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.stock-actions ion-button {
  font-size: 11px;
  --padding-start: 8px;
  --padding-end: 8px;
}

/* Chart Modal Styles */
.chart-modal-content {
  padding: 16px 0;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  background: #1e293b;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #334155;
}

.stat-item .label {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.stat-item .value {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #e2e8f0;
}

.large-chart {
  height: 250px;
  background: #0f172a;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #1e293b;
  margin-bottom: 20px;
}

.large-chart svg {
  width: 100%;
  height: 100%;
}

.large-chart path {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.grid-line {
  stroke: #1e293b;
  stroke-width: 0.3;
}

.chart-info {
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.6;
}

.chart-info .sector-info {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 8px;
}
</style>

<style>
/* Unscoped styles for SVG chart lines */
.chart-up {
  stroke: #10b981 !important;
}

.chart-down {
  stroke: #ef4444 !important;
}

.chart-neutral {
  stroke: #64748b !important;
}

.point-chart-up {
  fill: #10b981 !important;
}

.point-chart-down {
  fill: #ef4444 !important;
}

.point-chart-neutral {
  fill: #64748b !important;
}
</style>
