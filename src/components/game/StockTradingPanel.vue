<template>
  <div class="stock-trading-panel" ref="panelRef">
    <!-- Trade Result Overlay -->
    <div v-if="showTradeResult" class="trade-result-overlay" :class="tradeResultClass">
      <div class="result-content">
        <div class="result-icon">{{ tradeResultIcon }}</div>
        <div class="result-amount">{{ tradeResultText }}</div>
        <div v-if="tradeResultProfit !== null" class="result-profit" :class="{ profit: tradeResultProfit >= 0, loss: tradeResultProfit < 0 }">
          {{ tradeResultProfit >= 0 ? '+' : '' }}${{ tradeResultProfit }}M {{ tradeResultProfit >= 0 ? 'PROFIT' : 'LOSS' }}
        </div>
      </div>
    </div>

    <div class="trading-header">
      <div class="header-top">
        <h3>📊 Stock Market</h3>
        <div class="market-rumors" v-if="hasMarketRumors">
          <span class="rumor-icon">🔮</span>
          <span class="rumor-text">{{ currentRumor }}</span>
        </div>
      </div>
      <div class="portfolio-summary">
        <div class="summary-item">
          <span class="label">Cash</span>
          <span class="value" :class="{ negative: gameStore.stats.money < 0 }">
            ${{ formatMoney(gameStore.stats.money) }}M
          </span>
        </div>
        <div class="summary-item">
          <span class="label">Portfolio</span>
          <span class="value" :class="portfolioClass">
            ${{ formatMoney(gameStore.portfolioValue) }}M
          </span>
        </div>
        <div class="summary-item" :class="{ profit: gameStore.portfolioProfit > 0, loss: gameStore.portfolioProfit < 0 }">
          <span class="label">P/L</span>
          <span class="value">
            {{ gameStore.portfolioProfit >= 0 ? '+' : '' }}${{ formatMoney(gameStore.portfolioProfit) }}M
          </span>
        </div>
        <div class="summary-item total">
          <span class="label">Net Worth</span>
          <span class="value" :class="{ negative: totalValue < 0 }">
            ${{ formatMoney(totalValue) }}M
          </span>
        </div>
      </div>
    </div>

    <!-- Sector Filter -->
    <div class="sector-filter">
      <ion-segment :value="selectedSector" @ion-change="onSectorChange">
        <ion-segment-button value="all">
          <ion-label>All</ion-label>
        </ion-segment-button>
        <ion-segment-button value="portfolio">
          <ion-label>My Stocks</ion-label>
        </ion-segment-button>
      </ion-segment>
    </div>

    <!-- Stock Grid -->
    <div class="stocks-grid">
      <StockCard
        v-for="stock in filteredStocks"
        :key="stock.id"
        :stock="stock"
        :position="gameStore.portfolio[stock.id]"
        @buy="openBuyModal"
        @buyMax="executeBuyMax"
        @sell="openSellModal"
        @sellAll="executeSellAll"
        @short="openShortModal"
        @close="openCloseModal"
      />
    </div>

    <!-- Trading Tips -->
    <div class="trading-tips">
      <div class="tip">
        <span class="tip-icon">💡</span>
        <span>Your decisions affect stock prices!</span>
      </div>
      <div class="tip">
        <span class="tip-icon">📉</span>
        <span>20% spread on all trades</span>
      </div>
      <div class="tip warning">
        <span class="tip-icon">⚠️</span>
        <span>Margin & shorting enabled</span>
      </div>
    </div>

    <!-- Buy Modal - Enhanced -->
    <ion-modal :is-open="showBuyModal" @did-dismiss="showBuyModal = false" class="trading-modal">
      <ion-header>
        <ion-toolbar color="success">
          <ion-title class="modal-title">
            {{ selectedStock?.emoji }} Buy {{ selectedStock?.name }}
          </ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showBuyModal = false">
              <ion-icon name="close" />
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding modal-content-bg">
        <div class="modal-content" v-if="selectedStock">
          <!-- Stock Info Card -->
          <div class="stock-info-card">
            <div class="stock-header-modal">
              <span class="stock-emoji-large">{{ selectedStock.emoji }}</span>
              <div class="stock-details">
                <div class="stock-name">{{ selectedStock.name }}</div>
                <div class="stock-sector">{{ getSectorLabel(selectedStock.sector) }}</div>
              </div>
            </div>
            <div class="price-display">
              <span class="price-label">Current Price</span>
              <span class="price-value">${{ selectedStock.currentPrice }}</span>
              <span class="price-per">per 100 shares</span>
            </div>
          </div>

          <!-- Trading Controls -->
          <div class="trading-controls">
            <div class="amount-label">Shares to Buy</div>
            <div class="amount-selector-fancy">
              <ion-button fill="outline" @click="adjustBuyAmount(-1000)" size="small" color="medium">
                -1K
              </ion-button>
              <ion-button fill="outline" @click="adjustBuyAmount(-100)" size="small" color="medium">
                -100
              </ion-button>
              <div class="amount-display">
                <span class="amount-number">{{ buyAmount.toLocaleString() }}</span>
                <span class="amount-label-small">shares</span>
              </div>
              <ion-button fill="outline" @click="adjustBuyAmount(100)" size="small" color="success">
                +100
              </ion-button>
              <ion-button fill="outline" @click="adjustBuyAmount(1000)" size="small" color="success">
                +1K
              </ion-button>
            </div>

            <!-- Quick Amount Buttons -->
            <div class="quick-amounts">
              <ion-button fill="clear" size="small" @click="setBuyAmount(100)">100</ion-button>
              <ion-button fill="clear" size="small" @click="setBuyAmount(500)">500</ion-button>
              <ion-button fill="clear" size="small" @click="setBuyAmount(1000)">1K</ion-button>
              <ion-button fill="clear" size="small" @click="setBuyAmount(5000)">5K</ion-button>
            </div>
          </div>

          <!-- Cost Summary -->
          <div class="cost-summary">
            <div class="cost-row">
              <span>Your Cash</span>
              <span :class="{ negative: gameStore.stats.money < 0 }">${{ formatMoney(gameStore.stats.money) }}M</span>
            </div>
            <div class="cost-row total">
              <span>Total Cost</span>
              <span class="cost-value">${{ totalBuyCost }}M</span>
            </div>
            <div v-if="totalBuyCost > gameStore.stats.money" class="margin-warning">
              <span class="warning-icon">⚠️</span>
              <span>Trading on margin! +${{ Math.abs(gameStore.stats.money - totalBuyCost) }}M debt</span>
            </div>
          </div>

          <!-- Confirm Button -->
          <ion-button
            expand="block"
            color="success"
            class="confirm-btn"
            @click="executeBuy"
          >
            <span class="btn-icon">📈</span>
            <span class="btn-text">Confirm Purchase</span>
            <span class="btn-amount">${{ totalBuyCost }}M</span>
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Sell Modal - Enhanced -->
    <ion-modal :is-open="showSellModal" @did-dismiss="showSellModal = false" class="trading-modal">
      <ion-header>
        <ion-toolbar color="medium">
          <ion-title class="modal-title">
            {{ selectedStock?.emoji }} Sell {{ selectedStock?.name }}
          </ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showSellModal = false">
              <ion-icon name="close" />
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding modal-content-bg">
        <div class="modal-content" v-if="selectedStock && selectedPosition">
          <!-- Stock Info Card -->
          <div class="stock-info-card sell">
            <div class="stock-header-modal">
              <span class="stock-emoji-large">{{ selectedStock.emoji }}</span>
              <div class="stock-details">
                <div class="stock-name">{{ selectedStock.name }}</div>
                <div class="position-info-small">
                  Holding: {{ selectedPosition.shares.toLocaleString() }} shares
                </div>
              </div>
            </div>
            <div class="price-display">
              <span class="price-label">Sell Price (80%)</span>
              <span class="price-value">${{ sellPrice }}</span>
              <span class="price-per">per 100 shares</span>
            </div>
          </div>

          <!-- Trading Controls -->
          <div class="trading-controls">
            <div class="amount-label">Shares to Sell</div>
            <div class="amount-selector-fancy">
              <ion-button fill="outline" @click="adjustSellAmount(-1000)" size="small" color="medium">
                -1K
              </ion-button>
              <ion-button fill="outline" @click="adjustSellAmount(-100)" size="small" color="medium">
                -100
              </ion-button>
              <div class="amount-display">
                <span class="amount-number">{{ sellAmount.toLocaleString() }}</span>
                <span class="amount-label-small">shares</span>
              </div>
              <ion-button fill="outline" @click="adjustSellAmount(100)" size="small" color="warning">
                +100
              </ion-button>
              <ion-button fill="outline" @click="adjustSellAmount(1000)" size="small" color="warning">
                +1K
              </ion-button>
            </div>

            <!-- Sell All Button -->
            <div class="quick-amounts">
              <ion-button fill="clear" size="small" @click="setSellAmount(100)">100</ion-button>
              <ion-button fill="clear" size="small" @click="setSellAmount(Math.floor(selectedPosition.shares / 2))">50%</ion-button>
              <ion-button fill="clear" size="small" @click="setSellAmount(selectedPosition.shares)">ALL</ion-button>
            </div>
          </div>

          <!-- Revenue Summary -->
          <div class="cost-summary">
            <div class="cost-row">
              <span>Avg Cost</span>
              <span>${{ selectedPosition.averageCost.toFixed(0) }} per 100</span>
            </div>
            <div class="cost-row total">
              <span>Revenue</span>
              <span class="revenue-value">${{ totalSellRevenue }}M</span>
            </div>
            <div class="cost-row" :class="{ profit: estimatedProfit >= 0, loss: estimatedProfit < 0 }">
              <span>Est. P/L</span>
              <span>{{ estimatedProfit >= 0 ? '+' : '' }}${{ estimatedProfit }}M</span>
            </div>
          </div>

          <!-- Confirm Button -->
          <ion-button
            expand="block"
            color="warning"
            class="confirm-btn"
            @click="executeSell"
            :disabled="sellAmount > selectedPosition.shares"
          >
            <span class="btn-icon">💸</span>
            <span class="btn-text">Confirm Sale</span>
            <span class="btn-amount">+${{ totalSellRevenue }}M</span>
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Short Modal - Enhanced -->
    <ion-modal :is-open="showShortModal" @did-dismiss="showShortModal = false" class="trading-modal">
      <ion-header>
        <ion-toolbar color="danger">
          <ion-title class="modal-title">
            {{ selectedStock?.emoji }} Short {{ selectedStock?.name }}
          </ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showShortModal = false">
              <ion-icon name="close" />
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding modal-content-bg">
        <div class="modal-content" v-if="selectedStock">
          <!-- Warning Banner -->
          <div class="warning-banner">
            <span class="warning-icon">⚠️</span>
            <div class="warning-text">
              <strong>Short Selling</strong>
              <span>Profit when price falls, unlimited risk if price rises!</span>
            </div>
          </div>

          <!-- Stock Info Card -->
          <div class="stock-info-card short">
            <div class="stock-header-modal">
              <span class="stock-emoji-large">{{ selectedStock.emoji }}</span>
              <div class="stock-details">
                <div class="stock-name">{{ selectedStock.name }}</div>
                <div class="stock-sector">{{ getSectorLabel(selectedStock.sector) }}</div>
              </div>
            </div>
            <div class="price-display">
              <span class="price-label">Short Price (80%)</span>
              <span class="price-value">${{ sellPrice }}</span>
              <span class="price-per">credit per 100 shares</span>
            </div>
          </div>

          <!-- Trading Controls -->
          <div class="trading-controls">
            <div class="amount-label">Shares to Short</div>
            <div class="amount-selector-fancy">
              <ion-button fill="outline" @click="adjustShortAmount(-1000)" size="small" color="medium">
                -1K
              </ion-button>
              <ion-button fill="outline" @click="adjustShortAmount(-100)" size="small" color="medium">
                -100
              </ion-button>
              <div class="amount-display short">
                <span class="amount-number">{{ shortAmount.toLocaleString() }}</span>
                <span class="amount-label-small">shares</span>
              </div>
              <ion-button fill="outline" @click="adjustShortAmount(100)" size="small" color="danger">
                +100
              </ion-button>
              <ion-button fill="outline" @click="adjustShortAmount(1000)" size="small" color="danger">
                +1K
              </ion-button>
            </div>

            <div class="quick-amounts">
              <ion-button fill="clear" size="small" @click="setShortAmount(100)">100</ion-button>
              <ion-button fill="clear" size="small" @click="setShortAmount(500)">500</ion-button>
              <ion-button fill="clear" size="small" @click="setShortAmount(1000)">1K</ion-button>
            </div>
          </div>

          <!-- Credit Summary -->
          <div class="cost-summary">
            <div class="cost-row total">
              <span>Credit Received</span>
              <span class="revenue-value">${{ totalShortRevenue }}M</span>
            </div>
            <div class="cost-row warning-text-small">
              <span>Must buy back later to close position</span>
            </div>
          </div>

          <!-- Confirm Button -->
          <ion-button
            expand="block"
            color="danger"
            class="confirm-btn"
            @click="executeShort"
          >
            <span class="btn-icon">📉</span>
            <span class="btn-text">Confirm Short</span>
            <span class="btn-amount">+${{ totalShortRevenue }}M</span>
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Close Position Modal - Enhanced -->
    <ion-modal :is-open="showCloseModal" @did-dismiss="showCloseModal = false" class="trading-modal">
      <ion-header>
        <ion-toolbar :color="selectedPosition && selectedPosition.shares > 0 ? 'medium' : 'warning'">
          <ion-title class="modal-title">
            {{ selectedStock?.emoji }} Close Position
          </ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showCloseModal = false">
              <ion-icon name="close" />
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding modal-content-bg">
        <div class="modal-content" v-if="selectedStock && selectedPosition">
          <!-- Position Summary -->
          <div class="stock-info-card" :class="{ long: selectedPosition.shares > 0, short: selectedPosition.shares < 0 }">
            <div class="stock-header-modal">
              <span class="stock-emoji-large">{{ selectedStock.emoji }}</span>
              <div class="stock-details">
                <div class="stock-name">{{ selectedStock.name }}</div>
                <div class="position-type" :class="{ long: selectedPosition.shares > 0, short: selectedPosition.shares < 0 }">
                  {{ selectedPosition.shares > 0 ? '📈 LONG' : '📉 SHORT' }} Position
                </div>
              </div>
            </div>
          </div>

          <!-- Position Details -->
          <div class="position-details-card">
            <div class="detail-row">
              <span>Position Size</span>
              <span>{{ Math.abs(selectedPosition.shares).toLocaleString() }} shares</span>
            </div>
            <div class="detail-row">
              <span>Entry Price</span>
              <span>${{ selectedPosition.averageCost.toFixed(0) }}</span>
            </div>
            <div class="detail-row">
              <span>Current Price</span>
              <span>${{ selectedStock.currentPrice }}</span>
            </div>
            <div class="detail-row total" :class="{ profit: closeProceeds > 0 || (selectedPosition.shares < 0 && closeProceeds < 0 && Math.abs(closeProceeds) < selectedPosition.averageCost * 0.8 * Math.abs(selectedPosition.shares) / 100), loss: closeProceeds < 0 && selectedPosition.shares > 0 }">
              <span>{{ selectedPosition.shares > 0 ? 'Proceeds' : 'Cost to Close' }}</span>
              <span>{{ closeProceeds >= 0 ? '+' : '' }}${{ Math.abs(closeProceeds) }}M</span>
            </div>
          </div>

          <!-- Confirm Button -->
          <ion-button
            expand="block"
            :color="selectedPosition.shares > 0 ? 'medium' : 'warning'"
            class="confirm-btn"
            @click="executeClose"
          >
            <span class="btn-icon">{{ selectedPosition.shares > 0 ? '💸' : '🔒' }}</span>
            <span class="btn-text">{{ selectedPosition.shares > 0 ? 'Close Long' : 'Cover Short' }}</span>
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { IonButton, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonSegment, IonSegmentButton, IonLabel, IonIcon } from '@ionic/vue';
import StockCard from './StockCard.vue';
import type { Stock } from '@/data/stocks';
import { generateMarketRumor } from '@/data/stocks';
import {
  playProfitSound,
  playLossSound,
  playTradeSound,
  triggerConfetti,
  triggerShake,
  triggerRedFlash,
  triggerGreenPulse,
  triggerMoneyFly
} from '@/utils/tradingEffects';

const gameStore = useGameStore();
const panelRef = ref<HTMLElement | null>(null);

// UI State
const selectedSector = ref<string>('all');
const showBuyModal = ref(false);
const showSellModal = ref(false);
const showShortModal = ref(false);
const showCloseModal = ref(false);
const selectedStockId = ref<string | null>(null);
const buyAmount = ref(100);
const sellAmount = ref(100);
const shortAmount = ref(100);

// Trade result animation
const showTradeResult = ref(false);
const tradeResultIcon = ref('');
const tradeResultText = ref('');
const tradeResultProfit = ref<number | null>(null);
const tradeResultClass = ref('');

// Market rumors
const currentRumor = ref('');
const hasMarketRumors = computed(() => {
  // Show rumor if there are available plans with stock effects
  return gameStore.availablePlans.length > 0 && currentRumor.value;
});

// Update rumors when plans change
watch(() => gameStore.availablePlans, (plans) => {
  if (plans.length > 0) {
    const planWithEffects = plans.find(p => generateMarketRumor(p.id, gameStore.stocks));
    if (planWithEffects) {
      currentRumor.value = generateMarketRumor(planWithEffects.id, gameStore.stocks);
    }
  }
}, { immediate: true });

// Watch for trade results to trigger animations
watch(() => gameStore.lastTradeResult, (result) => {
  if (result && panelRef.value) {
    showTradeAnimation(result);
  }
}, { deep: true });

function showTradeAnimation(result: any) {
  const stock = gameStore.stocks.find(s => s.id === result.stockId);
  const hasProfit = result.profitLoss !== undefined && result.profitLoss > 0;
  const hasLoss = result.profitLoss !== undefined && result.profitLoss < 0;

  // Set result display
  if (result.type === 'buy') {
    tradeResultIcon.value = '📈';
    tradeResultText.value = `Bought ${result.shares.toLocaleString()} ${stock?.emoji || ''} shares`;
    tradeResultClass.value = 'buy';
    playTradeSound('buy');
    if (panelRef.value) triggerMoneyFly(panelRef.value, 'out', Math.abs(result.amount));
  } else if (result.type === 'sell' || result.type === 'close') {
    tradeResultIcon.value = hasProfit ? '💰' : hasLoss ? '📉' : '💸';
    tradeResultText.value = result.type === 'close'
      ? `Closed position for $${Math.abs(result.amount)}B`
      : `Sold ${result.shares.toLocaleString()} shares`;
    tradeResultProfit.value = result.profitLoss ?? null;
    tradeResultClass.value = hasProfit ? 'profit' : hasLoss ? 'loss' : 'neutral';

    if (hasProfit) {
      const intensity = result.profitLoss > 100 ? 'big' : result.profitLoss > 30 ? 'medium' : 'small';
      playProfitSound(intensity);
      if (panelRef.value) {
        triggerConfetti(panelRef.value, result.profitLoss > 100 ? 'rainbow' : 'gold');
        triggerGreenPulse(panelRef.value);
        triggerMoneyFly(panelRef.value, 'in', result.profitLoss);
      }
    } else if (hasLoss) {
      const intensity = Math.abs(result.profitLoss) > 100 ? 'big' : Math.abs(result.profitLoss) > 30 ? 'medium' : 'small';
      playLossSound(intensity);
      if (panelRef.value) {
        triggerShake(panelRef.value, intensity);
        triggerRedFlash(panelRef.value);
      }
    } else {
      playTradeSound('sell');
      if (panelRef.value && result.amount > 0) triggerMoneyFly(panelRef.value, 'in', result.amount);
    }
  } else if (result.type === 'short') {
    tradeResultIcon.value = '📉';
    tradeResultText.value = `Shorted ${result.shares.toLocaleString()} ${stock?.emoji || ''} shares`;
    tradeResultClass.value = 'short';
    playTradeSound('sell');
    if (panelRef.value) triggerMoneyFly(panelRef.value, 'in', result.amount);
  }

  showTradeResult.value = true;

  // Hide after animation
  setTimeout(() => {
    showTradeResult.value = false;
    tradeResultProfit.value = null;
    gameStore.clearTradeResult();
  }, 2000);
}

// Computed
const totalValue = computed(() => gameStore.stats.money + gameStore.portfolioValue);

const portfolioClass = computed(() => {
  const val = gameStore.portfolioValue;
  return val > 0 ? 'positive' : val < 0 ? 'negative' : '';
});

const filteredStocks = computed(() => {
  if (selectedSector.value === 'all') {
    return gameStore.stocks;
  }
  if (selectedSector.value === 'portfolio') {
    return gameStore.stocks.filter((s: Stock) => {
      const position = gameStore.portfolio[s.id];
      return position && position.shares !== 0;
    });
  }
  return gameStore.stocks.filter((s: Stock) => s.sector === selectedSector.value);
});

const selectedStock = computed(() => {
  if (!selectedStockId.value) return null;
  return gameStore.stocks.find((s: Stock) => s.id === selectedStockId.value);
});

const selectedPosition = computed(() => {
  if (!selectedStockId.value) return null;
  return gameStore.portfolio[selectedStockId.value];
});

const buyCost = computed(() => {
  if (!selectedStock.value) return 0;
  return Math.ceil(selectedStock.value.currentPrice);
});

const totalBuyCost = computed(() => {
  return Math.ceil((buyAmount.value / 100) * buyCost.value);
});

const sellPrice = computed(() => {
  if (!selectedStock.value) return 0;
  return Math.ceil(selectedStock.value.currentPrice * 0.8);
});

const sellRevenuePer100 = computed(() => {
  return Math.ceil(sellPrice.value);
});

const totalSellRevenue = computed(() => {
  return Math.ceil((sellAmount.value / 100) * sellRevenuePer100.value);
});

const totalShortRevenue = computed(() => {
  return Math.ceil((shortAmount.value / 100) * sellRevenuePer100.value);
});

const estimatedProfit = computed(() => {
  if (!selectedPosition.value) return 0;
  const costBasis = Math.ceil((sellAmount.value * selectedPosition.value.averageCost) / 100);
  return totalSellRevenue.value - costBasis;
});

const closeProceeds = computed(() => {
  if (!selectedStock.value || !selectedPosition.value) return 0;

  const shares = Math.abs(selectedPosition.value.shares);
  if (selectedPosition.value.shares > 0) {
    // Closing long
    return Math.ceil((shares / 100) * sellPrice.value);
  } else {
    // Closing short (negative = cost)
    return -Math.ceil((shares / 100) * selectedStock.value.currentPrice);
  }
});

// Methods
function getSectorLabel(sector: string): string {
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
  return labels[sector] || sector;
}

function onSectorChange(event: any) {
  selectedSector.value = event.detail.value;
}

function openBuyModal(stockId: string) {
  selectedStockId.value = stockId;
  buyAmount.value = 100;
  showBuyModal.value = true;
}

function openSellModal(stockId: string) {
  selectedStockId.value = stockId;
  const position = gameStore.portfolio[stockId];
  if (position) {
    sellAmount.value = Math.min(100, position.shares);
  }
  showSellModal.value = true;
}

function openShortModal(stockId: string) {
  selectedStockId.value = stockId;
  shortAmount.value = 100;
  showShortModal.value = true;
}

function openCloseModal(stockId: string) {
  selectedStockId.value = stockId;
  showCloseModal.value = true;
}

function adjustBuyAmount(delta: number) {
  buyAmount.value = Math.max(100, buyAmount.value + delta);
}

function setBuyAmount(amount: number) {
  buyAmount.value = Math.max(100, amount);
}

function adjustSellAmount(delta: number) {
  const maxShares = selectedPosition.value?.shares || 0;
  sellAmount.value = Math.max(100, Math.min(sellAmount.value + delta, maxShares));
}

function setSellAmount(amount: number) {
  const maxShares = selectedPosition.value?.shares || 0;
  sellAmount.value = Math.max(100, Math.min(amount, maxShares));
}

function adjustShortAmount(delta: number) {
  shortAmount.value = Math.max(100, shortAmount.value + delta);
}

function setShortAmount(amount: number) {
  shortAmount.value = Math.max(100, amount);
}

function executeBuy() {
  if (selectedStockId.value) {
    gameStore.buyStock(selectedStockId.value, buyAmount.value);
    showBuyModal.value = false;
  }
}

function executeBuyMax(stockId: string) {
  const stock = gameStore.stocks.find((s: Stock) => s.id === stockId);
  if (!stock) return;

  // Calculate max shares we can buy with current money (or go into margin)
  const pricePerShare = stock.currentPrice / 100;
  const availableMoney = Math.max(gameStore.stats.money, 0) + 500; // Allow up to 500M margin
  const maxShares = Math.floor(availableMoney / pricePerShare);
  const sharesToBuy = Math.max(100, Math.floor(maxShares / 100) * 100); // Round to nearest 100

  if (sharesToBuy >= 100) {
    gameStore.buyStock(stockId, sharesToBuy);
  }
}

function executeSell() {
  if (selectedStockId.value) {
    gameStore.sellStock(selectedStockId.value, sellAmount.value);
    showSellModal.value = false;
  }
}

function executeSellAll(stockId: string) {
  const position = gameStore.portfolio[stockId];
  if (position && position.shares > 0) {
    gameStore.sellStock(stockId, position.shares);
  }
}

function executeShort() {
  if (selectedStockId.value) {
    gameStore.shortStock(selectedStockId.value, shortAmount.value);
    showShortModal.value = false;
  }
}

function executeClose() {
  if (selectedStockId.value) {
    gameStore.closeStockPosition(selectedStockId.value);
    showCloseModal.value = false;
  }
}

function formatMoney(num: number): string {
  return num.toFixed(0);
}
</script>

<style scoped>
.stock-trading-panel {
  background: linear-gradient(180deg, #0a0a14 0%, #0f172a 100%);
  border-radius: 20px;
  padding: 16px;
  margin: 12px 0;
  border: 1px solid #1e293b;
  position: relative;
  overflow: hidden;
}

/* Trade Result Overlay */
.trade-result-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
  animation: fadeInOut 2s ease-out forwards;
}

.trade-result-overlay.profit {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
}

.trade-result-overlay.loss {
  background: radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%);
}

.trade-result-overlay.buy,
.trade-result-overlay.short,
.trade-result-overlay.neutral {
  background: radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%);
}

.result-content {
  text-align: center;
  animation: popIn 0.3s ease-out;
}

.result-icon {
  font-size: 64px;
  margin-bottom: 12px;
}

.result-amount {
  font-size: 20px;
  font-weight: bold;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.result-profit {
  font-size: 28px;
  font-weight: 900;
  padding: 8px 24px;
  border-radius: 12px;
}

.result-profit.profit {
  color: #10b981;
  background: rgba(16, 185, 129, 0.2);
  text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
}

.result-profit.loss {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
  text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

/* Header */
.trading-header {
  margin-bottom: 16px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.trading-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #22d3ee;
}

.market-rumors {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(251, 191, 36, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid rgba(251, 191, 36, 0.3);
  animation: pulse 2s infinite;
}

.rumor-icon {
  font-size: 14px;
}

.rumor-text {
  font-size: 11px;
  color: #fbbf24;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.portfolio-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.summary-item {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 12px;
  padding: 10px 8px;
  text-align: center;
  border: 1px solid #334155;
  transition: all 0.2s ease;
}

.summary-item.profit {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.summary-item.loss {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.summary-item.total {
  border-color: #22d3ee;
  background: rgba(34, 211, 238, 0.1);
}

.summary-item .label {
  display: block;
  font-size: 10px;
  color: #94a3b8;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-item .value {
  display: block;
  font-size: 15px;
  font-weight: bold;
  color: #e2e8f0;
}

.summary-item .value.positive,
.summary-item.profit .value {
  color: #10b981;
}

.summary-item .value.negative,
.summary-item.loss .value {
  color: #ef4444;
}

/* Sector Filter */
.sector-filter {
  margin-bottom: 16px;
}

/* Stocks Grid */
.stocks-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}

.stocks-grid::-webkit-scrollbar {
  width: 4px;
}

.stocks-grid::-webkit-scrollbar-track {
  background: #1e293b;
  border-radius: 2px;
}

.stocks-grid::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 2px;
}

/* Trading Tips */
.trading-tips {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #334155;
}

.tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #cbd5e1;
  margin-bottom: 6px;
}

.tip:last-child {
  margin-bottom: 0;
}

.tip.warning {
  color: #fbbf24;
}

.tip-icon {
  font-size: 14px;
}

/* Modal Styles */
.modal-content-bg {
  --background: #0f172a;
}

.modal-content {
  padding: 16px;
}

.modal-title {
  font-size: 16px;
}

/* Stock Info Card */
.stock-info-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  border: 2px solid #334155;
}

.stock-info-card.sell {
  border-color: #f59e0b;
}

.stock-info-card.short {
  border-color: #ef4444;
}

.stock-info-card.long {
  border-color: #10b981;
}

.stock-header-modal {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.stock-emoji-large {
  font-size: 48px;
}

.stock-details {
  flex: 1;
}

.stock-name {
  font-size: 18px;
  font-weight: bold;
  color: #e2e8f0;
}

.stock-sector {
  font-size: 12px;
  color: #94a3b8;
}

.position-info-small {
  font-size: 12px;
  color: #10b981;
}

.position-type {
  font-size: 14px;
  font-weight: bold;
}

.position-type.long {
  color: #10b981;
}

.position-type.short {
  color: #ef4444;
}

.price-display {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.price-label {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.price-value {
  display: block;
  font-size: 32px;
  font-weight: 900;
  color: #22d3ee;
}

.price-per {
  display: block;
  font-size: 10px;
  color: #64748b;
}

/* Warning Banner */
.warning-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}

.warning-banner .warning-icon {
  font-size: 24px;
}

.warning-banner .warning-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.warning-banner .warning-text strong {
  color: #ef4444;
  font-size: 14px;
}

.warning-banner .warning-text span {
  color: #fca5a5;
  font-size: 12px;
}

/* Trading Controls */
.trading-controls {
  margin-bottom: 16px;
}

.amount-label {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
  margin-bottom: 8px;
}

.amount-selector-fancy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.amount-display {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 12px;
  padding: 12px 20px;
  text-align: center;
  min-width: 100px;
  border: 2px solid #22d3ee;
}

.amount-display.short {
  border-color: #ef4444;
}

.amount-number {
  display: block;
  font-size: 24px;
  font-weight: 900;
  color: #e2e8f0;
}

.amount-label-small {
  display: block;
  font-size: 10px;
  color: #94a3b8;
}

.quick-amounts {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.quick-amounts ion-button {
  --padding-start: 12px;
  --padding-end: 12px;
  font-size: 12px;
}

/* Cost Summary */
.cost-summary {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #334155;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: #cbd5e1;
  border-bottom: 1px solid #1e293b;
}

.cost-row:last-child {
  border-bottom: none;
}

.cost-row.total {
  font-weight: bold;
  font-size: 16px;
  color: #e2e8f0;
}

.cost-row.profit {
  color: #10b981;
}

.cost-row.loss {
  color: #ef4444;
}

.cost-value {
  color: #ef4444;
}

.revenue-value {
  color: #10b981;
}

.margin-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 8px;
  padding: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: #fca5a5;
}

.warning-text-small {
  font-size: 11px;
  color: #94a3b8;
  font-style: italic;
}

/* Position Details Card */
.position-details-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #334155;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: #cbd5e1;
  border-bottom: 1px solid #1e293b;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.total {
  font-weight: bold;
  font-size: 18px;
}

.detail-row.profit {
  color: #10b981;
}

.detail-row.loss {
  color: #ef4444;
}

/* Confirm Button */
.confirm-btn {
  --border-radius: 16px;
  height: 56px;
  font-size: 16px;
  font-weight: bold;
  margin-top: 8px;
}

.confirm-btn .btn-icon {
  font-size: 20px;
  margin-right: 8px;
}

.confirm-btn .btn-text {
  flex: 1;
}

.confirm-btn .btn-amount {
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 14px;
}

/* Value colors */
.negative {
  color: #ef4444 !important;
}

.positive {
  color: #10b981 !important;
}
</style>

