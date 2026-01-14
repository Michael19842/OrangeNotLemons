<template>
  <div v-if="showReport" class="annual-report-overlay">
    <div class="annual-report-modal">
      <div class="report-header">
        <div class="report-icon">📊</div>
        <h2 class="report-title">Year {{ reportYear }} Review</h2>
        <p class="report-subtitle">{{ getYearTitle() }}</p>
      </div>

      <div class="report-content">
        <!-- Stats Comparison -->
        <div class="stats-section">
          <h3>📈 Performance Overview</h3>
          <div class="stats-grid">
            <div 
              v-for="stat in statComparison" 
              :key="stat.key"
              class="stat-comparison"
            >
              <div class="stat-header">
                <span class="stat-icon">{{ stat.icon }}</span>
                <span class="stat-name">{{ stat.name }}</span>
              </div>
              <div class="stat-values">
                <div class="stat-row">
                  <span class="label">Start</span>
                  <span class="value">{{ stat.start }}{{ stat.suffix }}</span>
                </div>
                <div class="stat-arrow" :class="stat.trend">
                  {{ stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→' }}
                </div>
                <div class="stat-row">
                  <span class="label">Now</span>
                  <span class="value" :class="stat.trendClass">{{ stat.current }}{{ stat.suffix }}</span>
                </div>
                <div class="stat-change" :class="stat.trendClass">
                  {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}{{ stat.suffix }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Key Events -->
        <div class="events-section">
          <h3>🗓️ Key Events This Year</h3>
          <div v-if="yearEvents.length === 0" class="no-events">
            <span>✨</span>
            <p>A quiet year... suspiciously quiet.</p>
          </div>
          <div v-else class="events-list">
            <div 
              v-for="(event, index) in yearEvents.slice(0, 5)" 
              :key="index"
              class="event-item"
            >
              <span class="event-icon">{{ event.icon }}</span>
              <span class="event-text">{{ event.description }}</span>
            </div>
          </div>
        </div>

        <!-- Financial Summary -->
        <div class="financial-section">
          <h3>💰 Financial Summary</h3>
          <div class="financial-grid">
            <div class="financial-item">
              <span class="fin-label">Net Worth Change</span>
              <span class="fin-value" :class="{ positive: netWorthChange > 0, negative: netWorthChange < 0 }">
                {{ netWorthChange > 0 ? '+' : '' }}{{ netWorthChange }}B
              </span>
            </div>
            <div class="financial-item">
              <span class="fin-label">Plans Executed</span>
              <span class="fin-value">{{ plansExecuted }}</span>
            </div>
            <div class="financial-item">
              <span class="fin-label">Delayed Effects</span>
              <span class="fin-value warning">{{ pendingEffects }}</span>
            </div>
          </div>
        </div>

        <!-- Outlook -->
        <div class="outlook-section">
          <h3>🔮 Outlook</h3>
          <p class="outlook-text">{{ getOutlookMessage() }}</p>
        </div>
      </div>

      <div class="report-footer">
        <button class="continue-btn" @click="closeReport">
          Continue to Year {{ reportYear + 1 }} →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();

const reportYear = ref(1);
const yearStartStats = ref({
  health: 100,
  money: 100,
  loyalty: 70,
  support: 50
});

// Track events throughout the year
const yearEvents = ref<Array<{ icon: string; description: string }>>([]);

// Use the gameStore's showAnnualReport flag
const showReport = computed(() => gameStore.showAnnualReport);

// Update reportYear when report is shown
watch(showReport, (isShowing) => {
  if (isShowing) {
    // 4 quarters per year, so divide by 4
    reportYear.value = Math.floor(gameStore.currentTurn / 4);
  }
});

function closeReport() {
  yearEvents.value = [];

  // Store current stats for next year comparison
  yearStartStats.value = {
    health: gameStore.stats.health,
    money: gameStore.stats.money,
    loyalty: gameStore.stats.loyalty,
    support: gameStore.stats.support
  };

  // Close report and start the timer via gameStore
  gameStore.closeAnnualReport();
}

const statComparison = computed(() => {
  const current = gameStore.stats;
  const start = yearStartStats.value;
  
  return [
    {
      key: 'health',
      icon: '❤️',
      name: 'Health',
      start: start.health,
      current: current.health,
      change: current.health - start.health,
      suffix: '%',
      trend: current.health > start.health ? 'up' : current.health < start.health ? 'down' : 'neutral',
      trendClass: current.health > start.health ? 'positive' : current.health < start.health ? 'negative' : ''
    },
    {
      key: 'money',
      icon: '💰',
      name: 'Money',
      start: start.money,
      current: current.money,
      change: current.money - start.money,
      suffix: 'B',
      trend: current.money > start.money ? 'up' : current.money < start.money ? 'down' : 'neutral',
      trendClass: current.money > start.money ? 'positive' : current.money < start.money ? 'negative' : ''
    },
    {
      key: 'loyalty',
      icon: '👥',
      name: 'Loyalty',
      start: start.loyalty,
      current: current.loyalty,
      change: current.loyalty - start.loyalty,
      suffix: '%',
      trend: current.loyalty > start.loyalty ? 'up' : current.loyalty < start.loyalty ? 'down' : 'neutral',
      trendClass: current.loyalty > start.loyalty ? 'positive' : current.loyalty < start.loyalty ? 'negative' : ''
    },
    {
      key: 'support',
      icon: '📊',
      name: 'Support',
      start: start.support,
      current: current.support,
      change: current.support - start.support,
      suffix: '%',
      trend: current.support > start.support ? 'up' : current.support < start.support ? 'down' : 'neutral',
      trendClass: current.support > start.support ? 'positive' : current.support < start.support ? 'negative' : ''
    }
  ];
});

const netWorthChange = computed(() => {
  const currentNetWorth = gameStore.stats.money - gameStore.debt;
  const startNetWorth = yearStartStats.value.money;
  return currentNetWorth - startNetWorth;
});

const plansExecuted = computed(() => {
  // 4 quarters per year, so approximately 3-4 plans per year
  return Math.floor(Math.random() * 2) + 3; // 3-4 plans per year
});

const pendingEffects = computed(() => {
  return gameStore.pendingEffects.length;
});

function getYearTitle(): string {
  const titles = [
    "The Year of Chaos",
    "The Year of The Juice",
    "The Year of Tariffs", 
    "The Year of Deals",
    "The Year of Drama",
    "The Year of Ratings",
    "The Year of Winning",
    "The Year of Distraction"
  ];
  // Use reportYear directly (1-4), no need to subtract 1
  return titles[reportYear.value % titles.length];
}

function getOutlookMessage(): string {
  const loyalty = gameStore.stats.loyalty;
  const health = gameStore.stats.health;
  const support = gameStore.stats.support;
  const turnsLeft = gameStore.maxTurns - gameStore.currentTurn;
  const yearsLeft = Math.ceil(turnsLeft / 4); // 4 quarters per year
  
  if (loyalty >= 85) {
    return `🎉 Excellent position! Your inner circle is rock solid. Keep this up for ${yearsLeft} more year${yearsLeft !== 1 ? 's' : ''} to secure re-election.`;
  } else if (loyalty >= 70) {
    return `✅ Strong loyalty levels. You're on track, but don't get complacent. ${yearsLeft} year${yearsLeft !== 1 ? 's' : ''} to go.`;
  } else if (loyalty >= 50) {
    return `⚠️ Loyalty is slipping. Focus on keeping your inner circle happy. Time is running out - ${yearsLeft} year${yearsLeft !== 1 ? 's' : ''} left.`;
  } else if (health < 30) {
    return `💀 Your health is critical! All the power in the world means nothing if you don't survive...`;
  } else if (support < 30) {
    return `📉 Public support is tanking. While loyalty matters most, this makes everything harder.`;
  } else {
    return `🚨 Loyalty is dangerously low! The Lemon Files could leak any moment. Take drastic action!`;
  }
}

// Track events (can be called from gameStore when significant things happen)
function addYearEvent(icon: string, description: string) {
  yearEvents.value.push({ icon, description });
}

// Expose for parent components
defineExpose({
  addYearEvent
});
</script>

<style scoped>
.annual-report-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
  padding: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.annual-report-modal {
  background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 3px solid #ff6b35;
  box-shadow: 0 0 50px rgba(255, 107, 53, 0.5);
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.report-header {
  text-align: center;
  padding: 24px 20px 20px;
  border-bottom: 2px solid rgba(255, 107, 53, 0.3);
  background: linear-gradient(180deg, rgba(255, 107, 53, 0.1) 0%, transparent 100%);
}

.report-icon {
  font-size: 3rem;
  margin-bottom: 8px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.report-title {
  font-size: 1.8rem;
  color: #ff6b35;
  margin: 0 0 8px 0;
  font-weight: 900;
  text-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
}

.report-subtitle {
  font-size: 1rem;
  color: #888;
  font-style: italic;
  margin: 0;
}

.report-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-section h3,
.events-section h3,
.financial-section h3,
.outlook-section h3 {
  font-size: 1.1rem;
  color: #ff6b35;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-comparison {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-name {
  font-size: 0.85rem;
  color: #ccc;
  font-weight: 600;
}

.stat-values {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.stat-row .label {
  font-size: 0.65rem;
  color: #666;
  text-transform: uppercase;
}

.stat-row .value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #e2e8f0;
}

.stat-arrow {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-arrow.up { color: #22c55e; }
.stat-arrow.down { color: #ef4444; }
.stat-arrow.neutral { color: #888; }

.stat-change {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.stat-change.positive {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.stat-change.negative {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.value.positive { color: #22c55e; }
.value.negative { color: #ef4444; }

.events-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.no-events {
  text-align: center;
  padding: 20px;
  color: #666;
}

.no-events span {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border-left: 3px solid #ff6b35;
}

.event-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.event-text {
  font-size: 0.85rem;
  color: #ccc;
  line-height: 1.3;
}

.financial-section {
  background: rgba(255, 107, 53, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.financial-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.financial-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.fin-label {
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fin-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: #e2e8f0;
}

.fin-value.positive { color: #22c55e; }
.fin-value.negative { color: #ef4444; }
.fin-value.warning { color: #eab308; }

.outlook-section {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.1) 100%);
  border-radius: 12px;
  padding: 16px;
  border: 2px solid rgba(255, 107, 53, 0.3);
}

.outlook-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #e2e8f0;
  margin: 0;
  text-align: center;
}

.report-footer {
  padding: 20px;
  border-top: 2px solid rgba(255, 107, 53, 0.3);
  display: flex;
  justify-content: center;
}

.continue-btn {
  padding: 16px 48px;
  font-size: 1.1rem;
  font-weight: 900;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 30px rgba(255, 107, 53, 0.5);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.continue-btn:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 8px 40px rgba(255, 107, 53, 0.7);
}

.continue-btn:active {
  transform: scale(0.98);
}

/* Scrollbar */
.annual-report-modal::-webkit-scrollbar {
  width: 6px;
}

.annual-report-modal::-webkit-scrollbar-track {
  background: #0f0f1a;
}

.annual-report-modal::-webkit-scrollbar-thumb {
  background: #ff6b35;
  border-radius: 3px;
}
</style>
