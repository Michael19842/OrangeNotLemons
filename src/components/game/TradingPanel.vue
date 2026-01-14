<template>
  <div class="trading-panel">
    <div class="trading-header">
      <h3>📈 Stock Trading</h3>
      <div class="valuation">
        <span class="label">Market Index:</span>
        <span class="value" :class="valuationClass">{{ gameStore.stats.coinValuation }}%</span>
        <span class="trend">{{ valuationTrend }}</span>
      </div>
    </div>

    <div class="trading-content">
      <!-- Holdings -->
      <div class="holdings-section">
        <div class="section-title">Your Portfolio</div>
        <div class="holdings-info">
          <div class="holding-item">
            <span class="label">Position:</span>
            <span class="value" :class="positionClass">{{ formatPosition(coinHoldings) }}</span>
          </div>
          <div class="holding-item">
            <span class="label">Value:</span>
            <span class="value">{{ formatMoney(coinValue) }}B</span>
          </div>
        </div>
      </div>

      <!-- Trading Actions -->
      <div class="trading-actions">
        <div class="action-group">
          <ion-button
            expand="block"
            color="success"
            @click="openBuyModal"
          >
            📈 Long (Buy)
          </ion-button>
          <div class="info-text-small">
            Profit when market rises
          </div>
        </div>

        <div class="action-group">
          <ion-button
            expand="block"
            color="danger"
            @click="openShortModal"
          >
            📉 Short (Sell)
          </ion-button>
          <div class="info-text-small">
            Profit when market falls
          </div>
        </div>
      </div>

      <!-- Close Position (if holding) -->
      <div v-if="coinHoldings !== 0" class="close-section">
        <ion-button
          expand="block"
          :color="coinHoldings > 0 ? 'medium' : 'warning'"
          @click="openCloseModal"
        >
          {{ coinHoldings > 0 ? '💸 Close Long' : '🔒 Close Short' }}
        </ion-button>
      </div>

      <!-- Market Info -->
      <div class="market-info">
        <div class="info-item">
          <span class="emoji">📈</span>
          <span class="text">Long @ {{ buyPrice }}B per 100 shares</span>
        </div>
        <div class="info-item">
          <span class="emoji">📉</span>
          <span class="text">Short @ {{ sellPrice }}B per 100 shares</span>
        </div>
        <div class="info-item manipulation">
          <span class="emoji">💡</span>
          <span class="text">Your plans affect the market!</span>
        </div>
        <div class="info-item warning">
          <span class="emoji">⚠️</span>
          <span class="text">Short selling & margin trading enabled</span>
        </div>
      </div>
    </div>

    <!-- Buy/Long Modal -->
    <ion-modal :is-open="showBuyModal" @did-dismiss="showBuyModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Buy Market Shares</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showBuyModal = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div class="modal-content">
          <div class="trade-info">
            <p>Current Price: <strong>{{ buyPrice }}B per 100 shares</strong></p>
            <p>Your Money: <strong>{{ formatMoney(gameStore.stats.money) }}B</strong></p>
            <p v-if="gameStore.stats.money < 0" class="debt-warning">
              ⚠️ You're trading with borrowed money! Interest applies.
            </p>
          </div>

          <div class="amount-selector">
            <ion-button @click="adjustBuyAmount(-1000)" size="small">-1000</ion-button>
            <ion-button @click="adjustBuyAmount(-100)" size="small">-100</ion-button>
            <ion-input
              v-model="buyAmountStr"
              type="number"
              min="100"
              step="100"
              class="amount-input"
              @ion-input="updateBuyAmount"
            ></ion-input>
            <ion-button @click="adjustBuyAmount(100)" size="small">+100</ion-button>
            <ion-button @click="adjustBuyAmount(1000)" size="small">+1000</ion-button>
          </div>

          <div class="trade-summary">
            <p>Buying: <strong>{{ buyAmount }} shares</strong></p>
            <p>Cost: <strong>{{ formatMoney(buyCost) }}B</strong></p>
            <p v-if="buyCost > gameStore.stats.money">New Debt: <strong>{{ formatMoney(Math.abs(gameStore.stats.money - buyCost)) }}B</strong></p>
          </div>

          <ion-button
            expand="block"
            color="success"
            @click="executeBuy"
          >
            Confirm Purchase
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Sell Modal -->
    <ion-modal :is-open="showSellModal" @did-dismiss="showSellModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Sell Market Shares</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showSellModal = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div class="modal-content">
          <div class="trade-info">
            <p>Current Price: <strong>{{ sellPrice }}B per 100 shares</strong></p>
            <p>Your Holdings: <strong>{{ formatNumber(coinHoldings) }} shares</strong></p>
          </div>

          <div class="amount-selector">
            <ion-button @click="adjustSellAmount(-1000)" size="small">-1000</ion-button>
            <ion-button @click="adjustSellAmount(-100)" size="small">-100</ion-button>
            <ion-input
              v-model="sellAmountStr"
              type="number"
              min="100"
              :max="coinHoldings"
              step="100"
              class="amount-input"
              @ion-input="updateSellAmount"
            ></ion-input>
            <ion-button @click="adjustSellAmount(100)" size="small">+100</ion-button>
            <ion-button @click="adjustSellAmount(1000)" size="small">+1000</ion-button>
          </div>

          <div class="trade-summary">
            <p>Selling: <strong>{{ sellAmount }} shares</strong></p>
            <p>Revenue: <strong>{{ formatMoney(sellRevenue) }}B</strong></p>
          </div>

          <ion-button
            expand="block"
            color="danger"
            @click="executeSell"
            :disabled="sellAmount > coinHoldings"
          >
            Confirm Sale
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Short Modal -->
    <ion-modal :is-open="showShortModal" @did-dismiss="showShortModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Short Market (Sell Short)</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showShortModal = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div class="modal-content">
          <div class="trade-info">
            <p><strong>Short Selling:</strong> Profit when market falls!</p>
            <p>Short Price: <strong>{{ sellPrice }}B per 100 shares</strong></p>
            <p>Current Position: <strong>{{ formatPosition(coinHoldings) }}</strong></p>
            <p class="short-warning">
              ⚠️ Unlimited risk if market rises!
            </p>
          </div>

          <div class="amount-selector">
            <ion-button @click="adjustShortAmount(-1000)" size="small">-1000</ion-button>
            <ion-button @click="adjustShortAmount(-100)" size="small">-100</ion-button>
            <ion-input
              v-model="shortAmountStr"
              type="number"
              min="100"
              step="100"
              class="amount-input"
              @ion-input="updateShortAmount"
            ></ion-input>
            <ion-button @click="adjustShortAmount(100)" size="small">+100</ion-button>
            <ion-button @click="adjustShortAmount(1000)" size="small">+1000</ion-button>
          </div>

          <div class="trade-summary">
            <p>Shorting: <strong>{{ shortAmount }} shares</strong></p>
            <p>Credit Received: <strong>{{ formatMoney(shortRevenue) }}B</strong></p>
            <p class="info-text">Must buy back later to close position</p>
          </div>

          <ion-button
            expand="block"
            color="danger"
            @click="executeShort"
          >
            Confirm Short Sale
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Close Position Modal -->
    <ion-modal :is-open="showCloseModal" @did-dismiss="showCloseModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ coinHoldings > 0 ? 'Close Long Position' : 'Close Short Position' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showCloseModal = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div class="modal-content">
          <div class="trade-info">
            <p>Current Position: <strong>{{ formatPosition(coinHoldings) }}</strong></p>
            <p v-if="coinHoldings > 0">
              Close Price: <strong>{{ sellPrice }}B per 100 shares</strong>
            </p>
            <p v-else>
              Buyback Price: <strong>{{ buyPrice }}B per 100 shares</strong>
            </p>
            <p>Position Value: <strong>{{ formatMoney(Math.abs(coinValue)) }}B</strong></p>
          </div>

          <div class="trade-summary">
            <p v-if="coinHoldings > 0">
              Selling all {{ Math.abs(coinHoldings) }} shares
            </p>
            <p v-else>
              Buying back {{ Math.abs(coinHoldings) }} shares to close short
            </p>
            <p><strong>Proceeds: {{ formatMoney(closeProceeds) }}B</strong></p>
          </div>

          <ion-button
            expand="block"
            :color="coinHoldings > 0 ? 'medium' : 'warning'"
            @click="executeClose"
          >
            {{ coinHoldings > 0 ? 'Close Long Position' : 'Close Short Position' }}
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { IonButton, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonInput } from '@ionic/vue';

const gameStore = useGameStore();

// Trading state
const showBuyModal = ref(false);
const showSellModal = ref(false);
const showShortModal = ref(false);
const showCloseModal = ref(false);
const buyAmount = ref(100);
const sellAmount = ref(100);
const shortAmount = ref(100);
const buyAmountStr = ref('100');
const sellAmountStr = ref('100');
const shortAmountStr = ref('100');

// Computed values
const coinHoldings = computed(() => gameStore.coinHoldings || 0);

const buyPrice = computed(() => {
  // Base price of 100B per 100 coins, adjusted by valuation
  return Math.ceil(100 * (gameStore.stats.coinValuation / 100));
});

const sellPrice = computed(() => {
  // Sell price is 80% of buy price (market spread)
  return Math.ceil(buyPrice.value * 0.8);
});

const buyCost = computed(() => {
  return Math.ceil((buyAmount.value / 100) * buyPrice.value);
});

const sellRevenue = computed(() => {
  return Math.ceil((sellAmount.value / 100) * sellPrice.value);
});

const shortRevenue = computed(() => {
  return Math.ceil((shortAmount.value / 100) * sellPrice.value);
});

const coinValue = computed(() => {
  if (coinHoldings.value > 0) {
    // Long position: value if we sell at current price
    return Math.ceil((coinHoldings.value / 100) * sellPrice.value);
  } else if (coinHoldings.value < 0) {
    // Short position: cost to buy back at current price (negative)
    return Math.ceil((coinHoldings.value / 100) * buyPrice.value);
  }
  return 0;
});

const closeProceeds = computed(() => {
  if (coinHoldings.value > 0) {
    // Closing long: sell at current price
    return Math.ceil((coinHoldings.value / 100) * sellPrice.value);
  } else if (coinHoldings.value < 0) {
    // Closing short: buy back at current price (cost, so negative)
    return Math.ceil((coinHoldings.value / 100) * buyPrice.value);
  }
  return 0;
});

// Allow margin trading - no max limit on buying
const maxBuyAmount = computed(() => {
  return 100000; // Very high limit for margin trading
});

const canSell = computed(() => coinHoldings.value >= 100);

const positionClass = computed(() => {
  if (coinHoldings.value > 0) return 'long-position';
  if (coinHoldings.value < 0) return 'short-position';
  return '';
});

const valuationClass = computed(() => {
  const val = gameStore.stats.coinValuation;
  if (val >= 120) return 'high';
  if (val <= 80) return 'low';
  return 'normal';
});

const valuationTrend = computed(() => {
  const val = gameStore.stats.coinValuation;
  if (val >= 120) return '🚀';
  if (val >= 110) return '📈';
  if (val <= 70) return '📉';
  if (val <= 60) return '💥';
  return '➡️';
});

// Watchers to reset amounts when modals open
watch(showBuyModal, (isOpen) => {
  if (isOpen) {
    buyAmount.value = Math.min(1000, maxBuyAmount.value);
    buyAmountStr.value = buyAmount.value.toString();
  }
});

watch(showSellModal, (isOpen) => {
  if (isOpen) {
    sellAmount.value = Math.min(1000, coinHoldings.value);
    sellAmountStr.value = sellAmount.value.toString();
  }
});

watch(showShortModal, (isOpen) => {
  if (isOpen) {
    shortAmount.value = 1000;
    shortAmountStr.value = shortAmount.value.toString();
  }
});

// Sync string to number
watch(buyAmount, (newVal) => {
  buyAmountStr.value = newVal.toString();
});

watch(sellAmount, (newVal) => {
  sellAmountStr.value = newVal.toString();
});

watch(shortAmount, (newVal) => {
  shortAmountStr.value = newVal.toString();
});

// Methods
function updateBuyAmount(event: any) {
  const val = parseInt(event.target.value || '100');
  buyAmount.value = Math.max(100, Math.min(val, maxBuyAmount.value));
}

function updateSellAmount(event: any) {
  const val = parseInt(event.target.value || '100');
  sellAmount.value = Math.max(100, Math.min(val, coinHoldings.value));
}

function updateShortAmount(event: any) {
  const val = parseInt(event.target.value || '100');
  shortAmount.value = Math.max(100, val);
}

function openBuyModal() {
  buyAmount.value = Math.min(1000, maxBuyAmount.value);
  buyAmountStr.value = buyAmount.value.toString();
  showBuyModal.value = true;
}

function openSellModal() {
  sellAmount.value = Math.min(1000, coinHoldings.value);
  sellAmountStr.value = sellAmount.value.toString();
  showSellModal.value = true;
}

function openShortModal() {
  shortAmount.value = 1000;
  shortAmountStr.value = shortAmount.value.toString();
  showShortModal.value = true;
}

function openCloseModal() {
  showCloseModal.value = true;
}

function adjustBuyAmount(delta: number) {
  const newAmount = buyAmount.value + delta;
  buyAmount.value = Math.max(100, Math.min(newAmount, maxBuyAmount.value));
}

function adjustSellAmount(delta: number) {
  const newAmount = sellAmount.value + delta;
  sellAmount.value = Math.max(100, Math.min(newAmount, coinHoldings.value));
}

function adjustShortAmount(delta: number) {
  const newAmount = shortAmount.value + delta;
  shortAmount.value = Math.max(100, newAmount);
}

function executeBuy() {
  // Allow buying even with debt (margin trading)
  gameStore.buyCoinTokens(buyAmount.value, buyCost.value);
  showBuyModal.value = false;
}

function executeSell() {
  if (sellAmount.value <= coinHoldings.value) {
    gameStore.sellCoinTokens(sellAmount.value, sellRevenue.value);
    showSellModal.value = false;
  }
}

function executeShort() {
  // Short selling: receive money now, go negative on shares
  gameStore.shortCoinTokens(shortAmount.value, shortRevenue.value);
  showShortModal.value = false;
}

function executeClose() {
  // Close position (long or short)
  gameStore.closePosition(coinHoldings.value, closeProceeds.value);
  showCloseModal.value = false;
}

function formatNumber(num: number): string {
  return Math.abs(num).toLocaleString();
}

function formatPosition(num: number): string {
  if (num > 0) return `+${num.toLocaleString()} (Long)`;
  if (num < 0) return `${num.toLocaleString()} (Short)`;
  return '0 (No Position)';
}

function formatMoney(num: number): string {
  return num.toFixed(0);
}
</script>

<style scoped>
.trading-panel {
  background: #0a0a14;
  border-radius: 16px;
  padding: 16px;
  margin: 12px 0;
  border: 1px solid #1e293b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.trading-header {
  margin-bottom: 16px;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 12px;
}

.trading-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: bold;
  color: #22d3ee;
}

.valuation {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.valuation .label {
  color: #94a3b8;
}

.valuation .value {
  font-weight: bold;
  font-size: 16px;
}

.valuation .value.high {
  color: #10b981;
}

.valuation .value.low {
  color: #ef4444;
}

.valuation .value.normal {
  color: #22d3ee;
}

.valuation .trend {
  font-size: 18px;
}

.holdings-section {
  background: #1e293b;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #334155;
}

.section-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #e2e8f0;
}

.holdings-info {
  display: flex;
  gap: 16px;
}

.holding-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.holding-item .label {
  font-size: 12px;
  color: #94a3b8;
}

.holding-item .value {
  font-size: 16px;
  font-weight: bold;
  color: #e2e8f0;
}

.holding-item .value.long-position {
  color: #10b981;
}

.holding-item .value.short-position {
  color: #ef4444;
}

.trading-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.disabled-text {
  font-size: 11px;
  color: #64748b;
  text-align: center;
}

.info-text {
  font-size: 11px;
  color: #fbbf24;
  text-align: center;
  font-weight: 500;
}

.info-text-small {
  font-size: 10px;
  color: #94a3b8;
  text-align: center;
  margin-top: 4px;
}

.close-section {
  margin-bottom: 12px;
}

.market-info {
  background: #1e293b;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #334155;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #cbd5e1;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .emoji {
  font-size: 16px;
}

.info-item.warning {
  color: #fbbf24;
  font-weight: 500;
}

.info-item.manipulation {
  color: #10b981;
  font-weight: 500;
}

.modal-content {
  padding: 16px;
}

.trade-info {
  background: #1e293b;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #334155;
}

.trade-info p {
  margin: 8px 0;
  color: #cbd5e1;
}

.debt-warning {
  color: #ef4444;
  font-weight: bold;
  margin-top: 8px;
}

.short-warning {
  color: #ef4444;
  font-weight: bold;
  margin-top: 8px;
  font-size: 13px;
}

.amount-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.amount-input {
  max-width: 120px;
  text-align: center;
  font-weight: bold;
}

.trade-summary {
  background: #1e293b;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #334155;
}

.trade-summary p {
  margin: 8px 0;
  font-size: 14px;
  color: #cbd5e1;
}
</style>
