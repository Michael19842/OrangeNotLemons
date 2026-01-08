<template>
  <ion-page>
    <ion-content :fullscreen="true" class="game-content">
      <!-- Main Game -->
      <div class="game-container">
        <div class="header-sticky">
          <GameHeader />
          <StatsBar />
        </div>
        
        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'juice' }"
            @click="setActiveTab('juice')"
          >
            <span class="tab-icon">🍊</span>
            <span class="tab-label">The Juice</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'cliff' }"
            @click="setActiveTab('cliff')"
          >
            <span class="tab-icon">📈</span>
            <span class="tab-label">Cliff Street</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'polls' }"
            @click="setActiveTab('polls')"
          >
            <span class="tab-icon">📊</span>
            <span class="tab-label">Polls</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <div v-show="activeTab === 'juice'" class="juice-wrapper">
            <TheJuice />
          </div>
          <div v-show="activeTab === 'cliff'" class="cliff-wrapper">
            <CliffStreet />
          </div>
          <div v-show="activeTab === 'polls'" class="polls-wrapper">
            <PollsTracker />
          </div>
        </div>

        <!-- Stat Change Popover -->
        <StatChangePopover />

        <!-- Annual Report Modal -->
        <AnnualReport />

        <!-- Spacer for fixed button -->
        <div class="action-spacer"></div>

        <!-- Game Over Modal -->
        <GameOverModal />
        
        <!-- Achievement Toast -->
        <AchievementToast 
          :achievement="currentAchievementToast" 
          @dismiss="dismissToast"
        />
      </div>

      <!-- Fixed Action Buttons -->
      <div class="action-section-fixed">
        <div class="action-buttons-wrapper">
          <button class="action-btn plan-btn" @click="openPlanSelector">
            🃏 Plan
          </button>
          <button 
            class="action-btn rant-btn" 
            @click="openRantModal"
            :class="{ 'rant-urgent': shouldPromptRant, 'rant-free': hasFreeBots }"
          >
            📢 Rant
            <span v-if="hasFreeBots" class="rant-badge">FREE</span>
            <span v-else-if="shouldPromptRant" class="rant-badge urgent">!</span>
          </button>
          <button class="action-btn skip-btn" @click="skipTurn" :disabled="selectedPlan !== null">
            ⏭️ Skip
          </button>
        </div>
      </div>

      <!-- Rant Modal -->
      <div v-if="showRantModal" class="modal-overlay" @click="showRantModal = false">
        <div class="modal-content rant-modal-expanded" @click.stop>
          <div class="modal-header">
            <h3>🍊 Post on The Juice</h3>
            <button class="close-btn" @click="showRantModal = false">✕</button>
          </div>
          
          <textarea
            v-model="rantText"
            placeholder="What's happening?!"
            maxlength="280"
            class="rant-input"
          ></textarea>
          
          <!-- Success Probability Display -->
          <div class="success-probability">
            <div class="prob-header">
              <span class="prob-label">Success Chance</span>
              <span class="prob-value" :class="getProbabilityClass()">
                {{ successProbability }}%
              </span>
            </div>
            <div class="prob-reward">
              <span class="reward-label">Potential Rewards:</span>
              <span class="reward-item">+5 Loyalty</span>
              <span class="reward-item">+3 Luck</span>
            </div>
            <div class="prob-bar">
              <div 
                class="prob-fill" 
                :class="getProbabilityClass()"
                :style="{ width: successProbability + '%' }"
              ></div>
            </div>
            <div class="prob-factors">
              <div class="factor">👥 Loyalty: {{ gameStore.stats.loyalty }}%</div>
              <div class="factor">📊 Support: {{ gameStore.stats.support }}%</div>
              <div class="factor">🤖 Bots: {{ botCount }}K</div>
            </div>
          </div>

          <!-- Bot Purchase Section -->
          <div class="bot-section">
            <div class="bot-header">
              <span class="bot-title">🤖 Boost Engagement</span>
              <span class="bot-cost" v-if="!hasFreeBots">25B per 10K bots</span>
              <span class="bot-cost free" v-else>FREE TODAY!</span>
            </div>
            
            <div class="bot-controls">
              <button 
                class="bot-btn decrease" 
                @click="adjustBots(-10)"
                :disabled="botCount <= 0"
              >
                −
              </button>
              <div class="bot-display">
                <span class="bot-count">{{ botCount }}K</span>
                <span class="bot-sublabel">bots</span>
              </div>
              <button 
                class="bot-btn increase" 
                @click="adjustBots(10)"
              >
                +
              </button>
            </div>
            
            <div class="bot-info">
              <div class="info-row">
                <span>Total Cost:</span>
                <span class="cost-value">{{ botCost }}B coins</span>
              </div>
              <div class="info-row">
                <span>Your Money:</span>
                <span :class="{ 'negative': gameStore.stats.money < 0 }">
                  {{ gameStore.stats.money }}B
                </span>
              </div>
              <div v-if="gameStore.stats.money < botCost" class="info-row warning">
                <span>📈 Will borrow:</span>
                <span class="debt-value">{{ botCost - gameStore.stats.money }}B</span>
              </div>
              <div class="info-row boost">
                <span>Success Boost:</span>
                <span class="boost-value">+{{ botBoost }}%</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <span class="char-count" :class="{ 'over-limit': rantText.length > 280 }">
              {{ rantText.length }}/280
            </span>
            <button 
              class="post-btn" 
              @click="postRant"
              :disabled="!canPostRant"
            >
              Post 📢
            </button>
          </div>
        </div>
      </div>

      <!-- Plan Selector Bottom Sheet -->
      <div v-if="showPlanSelector" class="bottom-sheet-overlay" @click="showPlanSelector = false">
        <div class="bottom-sheet" @click.stop>
          <div class="sheet-handle"></div>
          <div class="sheet-header">
            <h3 class="sheet-title">Choose Your Plan</h3>
            <button class="close-sheet-btn" @click="showPlanSelector = false">✕</button>
          </div>
          <p class="sheet-hint">
            Tap ❤️ or 💰 to research hidden properties. Swipe to see more cards →
          </p>
          <div class="plans-grid-wrapper">
            <div class="plans-grid">
              <PlanCard
                v-for="plan in availablePlans"
                :key="plan.id"
                :plan="plan"
                @select="selectPlanAndClose"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Slot Machine Bottom Sheet -->
      <div v-if="selectedPlan" class="bottom-sheet-overlay slot-overlay">
        <div class="bottom-sheet slot-sheet" @click.stop>
          <div class="sheet-handle"></div>
          <div class="slot-container">
            <SlotMachine />
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { useGameStore } from '@/stores/gameStore';
import { useAudio } from '@/composables/useAudio';
import type { PlanCard as PlanCardType } from '@/types/game';

import GameHeader from '@/components/game/GameHeader.vue';
import StatsBar from '@/components/game/StatsBar.vue';
import TheJuice from '@/components/game/TheJuice.vue';
import CliffStreet from '@/components/game/CliffStreet.vue';
import PollsTracker from '@/components/game/PollsTracker.vue';
import PlanCard from '@/components/game/PlanCard.vue';
import SlotMachine from '@/components/game/SlotMachine.vue';
import GameOverModal from '@/components/game/GameOverModal.vue';
import StatChangePopover from '@/components/game/StatChangePopover.vue';
import AnnualReport from '@/components/game/AnnualReport.vue';

const gameStore = useGameStore();
const { playSound, playMusic, stopMusic, preloadAudio, unlockAudio } = useAudio();

// Preload audio on mount
onMounted(() => {
  preloadAudio();
  // Unlock audio on first click anywhere
  const unlockOnClick = () => {
    unlockAudio();
    playMusic();
    document.removeEventListener('click', unlockOnClick);
    document.removeEventListener('touchstart', unlockOnClick);
  };
  document.addEventListener('click', unlockOnClick, { once: true });
  document.addEventListener('touchstart', unlockOnClick, { once: true });
});

const showPlanSelector = ref(false);
const showRantModal = ref(false);
const rantText = ref('');
const botCount = ref(0);
const activeTab = ref<'juice' | 'cliff' | 'polls'>('juice');
const lastFreeBotTurn = ref(0);
const currentAchievementToast = ref<any>(null);

// Watch for new achievements
watch(() => gameStore.newlyUnlockedAchievements.length, (newCount, oldCount) => {
  if (newCount > oldCount && newCount > 0) {
    // Show toast for newest achievement
    currentAchievementToast.value = gameStore.newlyUnlockedAchievements[newCount - 1];
    playSound('achievement');
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      currentAchievementToast.value = null;
    }, 5000);
  }
});

function dismissToast() {
  currentAchievementToast.value = null;
}

const hasFreeBots = computed(() => {
  // Free bots every 5 turns
  return gameStore.currentTurn - lastFreeBotTurn.value >= 5;
});

const shouldPromptRant = computed(() => {
  // Prompt rant if stats are low
  return gameStore.stats.support < 40 || gameStore.stats.loyalty < 50;
});

function setActiveTab(tab: 'juice' | 'cliff' | 'polls') {
  playSound('click');
  activeTab.value = tab;
}

// Calculate success probability for rant
const successProbability = computed(() => {
  const baseProbability = 50;
  const loyaltyBonus = Math.floor(gameStore.stats.loyalty * 0.3); // Up to +30
  const supportBonus = Math.floor(gameStore.stats.support * 0.2); // Up to +20
  const botBoost = Math.floor(botCount.value * 0.5); // 0.5% per 1K bots
  
  return Math.min(95, Math.max(5, baseProbability + loyaltyBonus + supportBonus + botBoost));
});

const botBoost = computed(() => Math.floor(botCount.value * 0.5));
const botCost = computed(() => {
  if (hasFreeBots.value) return 0;
  return Math.floor(botCount.value / 10) * 25;
});

const canPostRant = computed(() => {
  return rantText.value.trim() && 
         rantText.value.length <= 280;
  // Removed money check - can now go into debt
});

function adjustBots(amount: number) {
  playSound('click');
  const newCount = Math.max(0, botCount.value + amount);
  botCount.value = newCount;
}

function getProbabilityClass(): string {
  const prob = successProbability.value;
  if (prob >= 80) return 'excellent';
  if (prob >= 60) return 'good';
  if (prob >= 40) return 'medium';
  return 'poor';
}

// Auto-generated rants
const AUTO_RANTS = [
  "Just had the BEST meeting with some very smart people! Everyone agrees - I'm doing a TREMENDOUS job! #MFGA 🍊",
  "The FAKE NEWS won't report this, but our economy is BOOMING! Best numbers ever seen! 🚀💰",
  "Lemon Files? TOTAL HOAX! Witch hunt by the Failing Lemon Times! SAD! 🍋❌",
  "Nobody knows fruit better than me - NOBODY! I've been saying this for years! 🍊🧠",
  "Just signed the BIGGEST deal in fruit history! They said it couldn't be done! 📝✨",
  "My approval ratings are through the ROOF! Highest ever recorded! (Don't believe the polls!) 📊",
  "Had a PERFECT phone call with a very important world leader today! PERFECT! ☎️👌",
  "The opposition is WEAK and PATHETIC! They can't handle all this WINNING! 🏆",
  "Some people are saying I'm the GREATEST leader in fruit history! I don't say it... but many people are! 👑",
  "FAKE NEWS media trying to make me look bad! But the people know the TRUTH! 📰🚫",
];

// Watch showRantModal to auto-fill rant and reset bots
watch(showRantModal, (isOpen) => {
  if (isOpen) {
    if (!rantText.value) {
      const randomRant = AUTO_RANTS[Math.floor(Math.random() * AUTO_RANTS.length)];
      rantText.value = randomRant;
    }
    botCount.value = 0; // Reset bots when opening modal
  }
});

const availablePlans = computed(() => gameStore.availablePlans);
const selectedPlan = computed(() => gameStore.selectedPlan);

function selectPlanAndClose(plan: PlanCardType) {
  playSound('click');
  gameStore.selectPlan(plan);
  showPlanSelector.value = false;
}

function postRant() {
  if (!canPostRant.value) return;

  playSound('notification');
  
  // Deduct bot cost (might be free!)
  if (botCost.value > 0) {
    gameStore.stats.money -= botCost.value;
    gameStore.showStatChange('💰', -botCost.value);
  } else if (hasFreeBots.value) {
    lastFreeBotTurn.value = gameStore.currentTurn;
  }
  
  // Add rant to juice feed with bot boost
  const supportChange = gameStore.addPlayerRant(rantText.value, successProbability.value, botCount.value);
  
  // Reward successful rants
  if (supportChange > 0) {
    gameStore.stats.loyalty = Math.min(100, gameStore.stats.loyalty + 5);
    gameStore.stats.luck = Math.min(100, gameStore.stats.luck + 3);
    gameStore.showStatChange('👥', 5);
    gameStore.showStatChange('🍀', 3);
    
    // Show success message
    setTimeout(() => {
      gameStore.addJuiceMessage({
        text: `🔥 Your rant is TRENDING! +${supportChange} support, +5 loyalty, +3 luck!`,
        type: 'news'
      });
    }, 1000);
  }
  
  // Play sound based on reaction
  setTimeout(() => {
    if (supportChange > 0) {
      playSound('win');
    } else {
      playSound('lose');
    }
  }, 500);

  rantText.value = '';
  botCount.value = 0;
  showRantModal.value = false;
}

function skipTurn() {
  playSound('click');
  gameStore.stopTimer();
  gameStore.skipTurn();
}

function openPlanSelector() {
  playSound('click');
  showPlanSelector.value = true;
}

function openRantModal() {
  playSound('click');
  showRantModal.value = true;
}

// Clean up on unmount
onUnmounted(() => {
  gameStore.stopTimer();
  stopMusic();
});
</script>

<style scoped>
.game-content {
  --background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
}

.game-container {
  min-height: 100%;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-sticky {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(180deg, #1a1a2e 0%, rgba(26, 26, 46, 0.95) 100%);
  margin: -8px -8px 0 -8px;
  padding: 8px 8px 12px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tab-navigation {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #71767b;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  background: rgba(255, 107, 53, 0.2);
  color: #ff6b35;
}

.tab-icon {
  font-size: 1rem;
}

.tab-label {
  font-size: 0.75rem;
}

.tab-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.juice-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.juice-wrapper :deep(.juice-container) {
  height: 100%;
  max-height: none;
}

.cliff-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.cliff-wrapper :deep(.cliff-street-container) {
  height: 100%;
  max-height: none;
}

.polls-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.polls-wrapper :deep(.polls-tracker-container) {
  height: 100%;
  max-height: none;
}

.action-spacer {
  height: 100px;
  flex-shrink: 0;
}

.action-section-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, 
    transparent 0%, 
    rgba(26, 26, 46, 0.7) 15%,
    rgba(26, 26, 46, 0.95) 30%,
    #1a1a2e 50%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 100;
  pointer-events: none;
}

.action-buttons-wrapper {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
  border: 2px solid rgba(255, 107, 53, 0.3);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 107, 53, 0.2);
  pointer-events: all;
}

.action-buttons-wrapper .action-btn {
  flex: 1;
  padding: 14px 8px;
  font-size: 0.9rem;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn {
  width: 100%;
  padding: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.plan-btn {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
}

.plan-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(255, 107, 53, 0.6);
}

.rant-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  position: relative;
}

.rant-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(59, 130, 246, 0.6);
}

.rant-btn.rant-urgent {
  animation: pulse-urgent 2s ease-in-out infinite;
}

.rant-btn.rant-free {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
}

@keyframes pulse-urgent {
  0%, 100% { box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 4px 30px rgba(239, 68, 68, 0.8); }
}

.rant-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #22c55e;
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.rant-badge.urgent {
  background: #ef4444;
  animation: pulse-badge-urgent 1.5s ease-in-out infinite;
}

@keyframes pulse-badge-urgent {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.skip-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid rgba(239, 68, 68, 0.5);
  color: #ef4444;
}

.skip-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.slot-phase {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selected-plan-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 12px;
}

.plan-emoji {
  font-size: 1.5rem;
}

.plan-name {
  font-size: 1rem;
  font-weight: bold;
  color: #ff6b35;
}

/* Bottom Sheet Overlay */
.bottom-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.bottom-sheet {
  width: 100%;
  max-height: 70vh;
  background: #1a1a2e;
  border-radius: 20px 20px 0 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: slideUp 0.3s ease;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: #666;
  border-radius: 2px;
  margin: 0 auto 8px;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.sheet-title {
  font-size: 1.2rem;
  color: #ff6b35;
  margin: 0;
  font-weight: 700;
}

.close-sheet-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-sheet-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.sheet-hint {
  font-size: 0.75rem;
  color: #888;
  text-align: center;
  margin: 0;
}

.plans-grid-wrapper {
  position: relative;
  margin: 0 -16px;
  padding: 0 16px;
}

.plans-grid-wrapper::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background: linear-gradient(to left, #1a1a2e 0%, transparent 100%);
  pointer-events: none;
  z-index: 1;
}

.plans-grid {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 4px;
  flex-wrap: nowrap;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  scroll-padding: 8px;
}

.plans-grid > * {
  scroll-snap-align: start;
}

.plans-grid::-webkit-scrollbar {
  height: 4px;
}

.plans-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.plans-grid::-webkit-scrollbar-thumb {
  background: #ff6b35;
  border-radius: 2px;
}

/* Slot Machine Overlay */
.slot-overlay {
  background: rgba(0, 0, 0, 0.8);
}

.slot-sheet {
  max-height: calc(100vh - 60px);
  height: calc(100vh - 60px);
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.slot-container {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 12px;
  overflow: hidden;
  min-height: 0;
}

.slot-container :deep(.slot-machine) {
  width: 100%;
  max-width: 400px;
}

/* Rant Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: #1a1a2e;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  border: 2px solid rgba(255, 107, 53, 0.3);
}

.rant-modal-expanded {
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  color: #ff6b35;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #fff;
}

.rant-input {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  background: #0f0f1a;
  border: 2px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 16px;
}

.rant-input:focus {
  outline: none;
  border-color: #ff6b35;
}

/* Success Probability Display */
.success-probability {
  background: rgba(0, 0, 0, 0.3);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.prob-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.prob-reward {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.reward-label {
  font-size: 0.85rem;
  color: #888;
  font-weight: 600;
}

.reward-item {
  font-size: 0.8rem;
  color: #22c55e;
  font-weight: 600;
  background: rgba(34, 197, 94, 0.2);
  padding: 4px 8px;
  border-radius: 6px;
}

.prob-label {
  color: #888;
  font-size: 0.9rem;
  font-weight: 600;
}

.prob-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.prob-value.excellent {
  color: #4ade80;
}

.prob-value.good {
  color: #3b82f6;
}

.prob-value.medium {
  color: #fbbf24;
}

.prob-value.poor {
  color: #ef4444;
}

.prob-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.prob-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.prob-fill.excellent {
  background: linear-gradient(90deg, #4ade80, #22c55e);
}

.prob-fill.good {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.prob-fill.medium {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
}

.prob-fill.poor {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.prob-factors {
  display: flex;
  gap: 12px;
  font-size: 0.75rem;
  color: #888;
}

.factor {
  flex: 1;
  text-align: center;
  padding: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

/* Bot Section */
.bot-section {
  background: rgba(255, 107, 53, 0.1);
  border: 2px solid rgba(255, 107, 53, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.bot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.bot-title {
  font-size: 1rem;
  font-weight: 700;
  color: #ff6b35;
}

.bot-cost {
  font-size: 0.85rem;
  color: #888;
}

.bot-cost.free {
  color: #22c55e;
  font-weight: 700;
  animation: pulse-free 2s ease-in-out infinite;
}

@keyframes pulse-free {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.bot-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 16px;
}

.bot-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #ff6b35;
  background: rgba(255, 107, 53, 0.2);
  color: #ff6b35;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bot-btn:hover:not(:disabled) {
  background: rgba(255, 107, 53, 0.3);
  transform: scale(1.1);
}

.bot-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.bot-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.bot-count {
  font-size: 2rem;
  font-weight: 700;
  color: #ff6b35;
}

.bot-sublabel {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.bot-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  padding: 6px 0;
}

.info-row span:first-child {
  color: #888;
}

.info-row span:last-child {
  color: #fff;
  font-weight: 600;
}

.cost-value {
  color: #fbbf24 !important;
}

.negative {
  color: #ef4444 !important;
}

.info-row.warning {
  background: rgba(251, 191, 36, 0.1);
  padding: 8px 12px !important;
  border-radius: 6px;
  border: 1px solid rgba(251, 191, 36, 0.3);
  margin: 4px 0;
}

.debt-value {
  color: #eab308 !important;
  font-weight: 700 !important;
}

.boost {
  border-top: 1px solid rgba(255, 107, 53, 0.3);
  padding-top: 12px !important;
  margin-top: 4px;
}

.boost-value {
  color: #4ade80 !important;
  font-size: 1.1rem !important;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  color: #888;
  font-size: 0.9rem;
}

.char-count.over-limit {
  color: #ff4444;
}

.post-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.post-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.post-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
