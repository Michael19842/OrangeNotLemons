<template>
  <div class="stock-card" :class="positionClass">
    <div class="stock-header">
      <div class="stock-info">
        <span class="emoji">{{ stock.emoji }}</span>
        <div class="details">
          <div class="name-row">
            <span class="ticker">{{ stock.ticker }}</span>
            <span class="name">{{ stock.name }}</span>
          </div>
          <div class="sector">{{ sectorLabel }}</div>
        </div>
      </div>
      <div class="header-right">
        <div class="price-info">
          <div class="price">${{ stock.currentPrice }}</div>
          <div class="change" :class="changeClass">{{ priceChange }}</div>
        </div>
        <!-- Hamburger Menu -->
        <button class="hamburger-btn" @click="toggleMenu">
          <span class="hamburger-icon">⋮</span>
        </button>
      </div>
    </div>

    <div class="stock-description">{{ stock.description }}</div>

    <div v-if="position" class="position-info">
      <div class="position-row">
        <span class="position-label">Position:</span>
        <span :class="positionTypeClass">{{ positionText }}</span>
      </div>
      <div class="position-row">
        <span class="position-label">Value:</span>
        <span class="position-value">≈ ${{ positionValue }}M</span>
      </div>
      <div class="position-row profit-loss">
        <span class="position-label">P/L:</span>
        <span :class="profitLossClass">{{ profitLossText }}</span>
      </div>
    </div>

    <!-- Dropdown Menu -->
    <div v-if="showMenu" class="stock-menu-overlay" @click="showMenu = false">
      <div class="stock-menu" @click.stop>
        <div class="menu-header">
          <span>{{ stock.emoji }} {{ stock.ticker }}</span>
          <button class="menu-close" @click="showMenu = false">✕</button>
        </div>
        <div class="menu-items">
          <button class="menu-item buy" @click="handleAction('buy')">
            📈 Buy
          </button>
          <button class="menu-item buy-max" @click="handleAction('buyMax')">
            💰 Buy Max
          </button>
          <button 
            v-if="position && position.shares > 0"
            class="menu-item sell" 
            @click="handleAction('sell')"
          >
            💸 Sell
          </button>
          <button 
            v-if="position && position.shares > 0"
            class="menu-item sell-all" 
            @click="handleAction('sellAll')"
          >
            📤 Sell All
          </button>
          <button class="menu-item short" @click="handleAction('short')">
            📉 Short
          </button>
          <button 
            v-if="position && position.shares !== 0"
            class="menu-item close" 
            @click="handleAction('close')"
          >
            🔒 Close Position
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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
const emit = defineEmits<{
  buy: [stockId: string];
  buyMax: [stockId: string];
  sell: [stockId: string];
  sellAll: [stockId: string];
  short: [stockId: string];
  close: [stockId: string];
}>();

const showMenu = ref(false);

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function handleAction(action: string) {
  showMenu.value = false;
  switch (action) {
    case 'buy':
      emit('buy', props.stock.id);
      break;
    case 'buyMax':
      emit('buyMax', props.stock.id);
      break;
    case 'sell':
      emit('sell', props.stock.id);
      break;
    case 'sellAll':
      emit('sellAll', props.stock.id);
      break;
    case 'short':
      emit('short', props.stock.id);
      break;
    case 'close':
      emit('close', props.stock.id);
      break;
  }
}

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

const profitLoss = computed(() => {
  if (!props.position || props.position.shares === 0) return 0;
  
  const costBasis = Math.ceil((Math.abs(props.position.shares) * props.position.averageCost) / 100);
  
  if (props.position.shares > 0) {
    // Long: current value - cost basis
    return positionValue.value - costBasis;
  } else {
    // Short: credit received - cost to close
    return costBasis - positionValue.value;
  }
});

const profitLossPercent = computed(() => {
  if (!props.position || props.position.shares === 0) return 0;
  const costBasis = Math.ceil((Math.abs(props.position.shares) * props.position.averageCost) / 100);
  if (costBasis === 0) return 0;
  return ((profitLoss.value / costBasis) * 100);
});

const profitLossText = computed(() => {
  const sign = profitLoss.value >= 0 ? '+' : '';
  return `${sign}$${profitLoss.value}M (${sign}${profitLossPercent.value.toFixed(1)}%)`;
});

const profitLossClass = computed(() => {
  return profitLoss.value > 0 ? 'profit' : profitLoss.value < 0 ? 'loss' : 'neutral';
});
</script>

<style scoped>
.stock-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 10px;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
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
  margin-bottom: 6px;
  gap: 8px;
}

.header-right {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

/* Hamburger Button */
.hamburger-btn {
  background: rgba(100, 116, 139, 0.2);
  border: 1px solid #475569;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hamburger-btn:hover {
  background: rgba(100, 116, 139, 0.3);
  border-color: #64748b;
}

.hamburger-icon {
  font-size: 20px;
  font-weight: bold;
  color: #cbd5e1;
  line-height: 1;
}

/* Stock Menu Overlay */
.stock-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 16px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.stock-menu {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 2px solid #334155;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  min-width: 200px;
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

@keyframes slideInRight {
  from {
    transform: translateX(100px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(100, 116, 139, 0.2);
  border-bottom: 1px solid #334155;
  font-size: 14px;
  font-weight: 700;
  color: #e2e8f0;
}

.menu-close {
  background: transparent;
  border: none;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.menu-close:hover {
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.menu-items {
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 4px;
}

.menu-item {
  background: transparent;
  border: none;
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #cbd5e1;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-item:hover {
  background: rgba(100, 116, 139, 0.3);
}

.menu-item.buy {
  color: #10b981;
}

.menu-item.buy:hover {
  background: rgba(16, 185, 129, 0.15);
}

.menu-item.buy-max {
  color: #22c55e;
}

.menu-item.buy-max:hover {
  background: rgba(34, 197, 94, 0.15);
}

.menu-item.sell {
  color: #f59e0b;
}

.menu-item.sell:hover {
  background: rgba(245, 158, 11, 0.15);
}

.menu-item.sell-all {
  color: #fb923c;
}

.menu-item.sell-all:hover {
  background: rgba(251, 146, 60, 0.15);
}

.menu-item.short {
  color: #ef4444;
}

.menu-item.short:hover {
  background: rgba(239, 68, 68, 0.15);
}

.menu-item.close {
  color: #eab308;
}

.menu-item.close:hover {
  background: rgba(234, 179, 8, 0.15);
}

.stock-info {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.emoji {
  font-size: 24px;
  flex-shrink: 0;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.ticker {
  font-size: 11px;
  font-weight: 700;
  color: #60a5fa;
  font-family: monospace;
  background: rgba(59, 130, 246, 0.2);
  padding: 1px 4px;
  border-radius: 3px;
  flex-shrink: 0;
}

.name {
  font-weight: 600;
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sector {
  font-size: 9px;
  color: #64748b;
}

.price-info {
  text-align: right;
  flex-shrink: 0;
}

.price {
  font-size: 14px;
  font-weight: bold;
  color: #22d3ee;
}

.change {
  font-size: 11px;
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

.stock-description {
  font-size: 11px;
  color: #cbd5e1;
  margin-bottom: 8px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.position-info {
  background: #0f172a;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.position-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.position-row.profit-loss {
  padding-top: 4px;
  border-top: 1px solid #1e293b;
  font-weight: 700;
}

.position-label {
  color: #94a3b8;
}

.profit {
  color: #10b981 !important;
  font-weight: 700;
}

.loss {
  color: #ef4444 !important;
  font-weight: 700;
}

.neutral {
  color: #94a3b8 !important;
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
</style>
