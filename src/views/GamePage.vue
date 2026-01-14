<template>
  <ion-page>
    <ion-content :fullscreen="true" class="game-content">
      <!-- Main Game -->
      <div class="game-container">
        <div class="header-sticky">
          <GameHeader />
          <StatsBar />
          
          <!-- Tab Navigation (always visible) -->
          <div class="tab-navigation">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'juice' }"
              @click="setActiveTab('juice')"
            >
              <span class="tab-icon">🍊</span>
              <span class="tab-label">
                The Juice
                <span v-if="unreadCriticalJuiceCount > 0" class="notification-badge">
                  {{ unreadCriticalJuiceCount }}
                </span>
              </span>
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
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <div v-show="activeTab === 'juice'" class="juice-wrapper">
            <TheJuice />
          </div>
          <div v-show="activeTab === 'cliff'" class="cliff-wrapper">
            <CliffStreet />
            <StockTradingPanel />
          </div>
          <div v-show="activeTab === 'polls'" class="polls-wrapper">
            <PollsTracker />
          </div>
        </div>

        <!-- Stat Change Popover -->
        <StatChangePopover />

        <!-- Annual Report Modal -->
        <AnnualReport />

        <!-- Game Over Modal -->
        <GameOverModal />
        
        <!-- Achievement Toast -->
        <AchievementToast
          :achievement="currentAchievementToast"
          @dismiss="dismissToast"
        />

        <!-- Interactive Tutorial -->
        <TutorialModal
          ref="tutorialRef"
          @complete="onTutorialComplete"
          @skip="onTutorialComplete"
        />

        <!-- Exit Confirmation Modal -->
        <div v-if="showExitConfirm" class="modal-overlay exit-modal-overlay" @click="showExitConfirm = false">
          <div class="modal-content exit-modal" @click.stop>
            <div class="exit-icon">🚪</div>
            <h3>Leave Game?</h3>
            <p>Your progress will be lost if you leave now.</p>
            <div class="exit-actions">
              <button class="exit-btn stay-btn" @click="showExitConfirm = false">
                🎮 Keep Playing
              </button>
              <button class="exit-btn leave-btn" @click="confirmExit">
                🚶 Leave Game
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Fixed Navigation Bar -->
      <div class="nav-bar-fixed">
        <button
          class="nav-btn"
          @click="openPlanSelector"
          :class="{ 'nav-urgent': shouldHighlightPlan }"
        >
          <span class="nav-icon">🃏</span>
          <span class="nav-label">Plan</span>
          <span v-if="shouldHighlightPlan" class="nav-badge">!</span>
        </button>
        <button
          class="nav-btn"
          @click="openRantModal"
          :class="{ 'nav-urgent': shouldPromptRant, 'nav-free': hasFreeBots }"
        >
          <span class="nav-icon">📢</span>
          <span class="nav-label">Rant</span>
          <span v-if="hasFreeBots" class="nav-badge free">FREE</span>
          <span v-else-if="shouldPromptRant" class="nav-badge">!</span>
        </button>
        <button class="nav-btn" @click="openSkipConfirmation" :disabled="selectedPlan !== null">
          <span class="nav-icon">⛳</span>
          <span class="nav-label">Golf</span>
        </button>
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
              <span class="bot-cost" v-if="!hasFreeBots">25M per 10K bots</span>
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
            <div class="sheet-title-row">
              <span class="sheet-icon">🃏</span>
              <span class="sheet-title">Plans</span>
              <span class="sheet-hint">Swipe → Research 🔍 or Select ✓</span>
            </div>
            <button class="close-sheet-btn" @click="showPlanSelector = false">✕</button>
          </div>
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
      <div v-if="selectedPlan && showSlotConfirmation" class="bottom-sheet-overlay">
        <div class="bottom-sheet confirmation-sheet" @click.stop>
          <div class="sheet-handle"></div>
          <div class="confirmation-content">
            <div class="confirmation-icon">🎰</div>
            <h3 class="confirmation-title">Execute Plan?</h3>
            <div class="selected-plan-summary">
              <div class="plan-emoji-large">{{ selectedPlan.emoji }}</div>
              <div class="plan-name-large">{{ selectedPlan.name }}</div>
              <div class="plan-cost-large">
                💰 {{ gameStore.getAdjustedCost(selectedPlan.baseCost) }}B
              </div>
            </div>
            <p class="confirmation-warning">
              ⚠️ This will spin the slot machine and apply the plan's effects!
            </p>
            <div class="confirmation-actions">
              <button class="cancel-plan-btn" @click="cancelPlan">
                ✕ Cancel
              </button>
              <button class="execute-plan-btn" @click="executePlan">
                🎰 Let's Go!
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Slot Machine (after confirmation) -->
      <div v-if="selectedPlan && !showSlotConfirmation" class="bottom-sheet-overlay slot-overlay">
        <div class="bottom-sheet slot-sheet" @click.stop>
          <div class="sheet-handle"></div>
          <div class="slot-container">
            <SlotMachine />
          </div>
        </div>
      </div>

      <!-- Skip Turn Confirmation -->
      <div v-if="showSkipConfirmation" class="bottom-sheet-overlay">
        <div class="bottom-sheet confirmation-sheet" @click.stop>
          <div class="sheet-handle"></div>
          <div class="confirmation-content">
            <div class="confirmation-icon">⛳</div>
            <h3 class="confirmation-title">Go Golfing?</h3>
            <div class="skip-summary">
              <div class="skip-effect positive">
                <span class="effect-icon">❤️</span>
                <span class="effect-text">+15 Health</span>
              </div>
              <div class="skip-effect negative">
                <span class="effect-icon">👥</span>
                <span class="effect-text">-2 Loyalty</span>
              </div>
              <div class="skip-effect negative">
                <span class="effect-icon">📊</span>
                <span class="effect-text">-2 Support</span>
              </div>
            </div>
            <p class="confirmation-warning">
              ⚠️ You'll skip this turn and go relax on the golf course!
            </p>
            <div class="confirmation-actions">
              <button class="cancel-plan-btn" @click="showSkipConfirmation = false">
                ✕ Stay
              </button>
              <button class="execute-plan-btn" @click="confirmSkipTurn">
                ⛳ Go Golf!
              </button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { IonPage, IonContent, useBackButton } from '@ionic/vue';
import { useGameStore } from '@/stores/gameStore';
import { useAudio } from '@/composables/useAudio';
import type { PlanCard as PlanCardType } from '@/types/game';

import GameHeader from '@/components/game/GameHeader.vue';
import StatsBar from '@/components/game/StatsBar.vue';
import TheJuice from '@/components/game/TheJuice.vue';
import CliffStreet from '@/components/game/CliffStreet.vue';
import PollsTracker from '@/components/game/PollsTracker.vue';
import StockTradingPanel from '@/components/game/StockTradingPanel.vue';
import PlanCard from '@/components/game/PlanCard.vue';
import SlotMachine from '@/components/game/SlotMachine.vue';
import GameOverModal from '@/components/game/GameOverModal.vue';
import StatChangePopover from '@/components/game/StatChangePopover.vue';
import AnnualReport from '@/components/game/AnnualReport.vue';
import AchievementToast from '@/components/game/AchievementToast.vue';
import TutorialModal from '@/components/game/TutorialModal.vue';

const gameStore = useGameStore();
const { playSound, playMusic, stopMusic, preloadAudio, unlockAudio } = useAudio();

const showPlanSelector = ref(false);
const showRantModal = ref(false);
const rantText = ref('');
const botCount = ref(0);
const activeTab = ref<'juice' | 'cliff' | 'polls'>('juice');
const lastFreeBotTurn = ref(0);
const currentAchievementToast = ref<any>(null);
const lastReadJuiceCount = ref(0);
const tutorialRef = ref<InstanceType<typeof TutorialModal> | null>(null);
const isTutorialMode = ref(false);
const showExitConfirm = ref(false);
const showSlotConfirmation = ref(false);
const showSkipConfirmation = ref(false);

import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();

// Preload audio and initialize on mount
onMounted(() => {
  // Initialize critical juice count
  const criticalMessages = gameStore.juiceMessages.filter(m => m.type === 'critical');
  lastReadJuiceCount.value = criticalMessages.length;

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

  // Check if we should start tutorial
  if (route.query.tutorial === 'true') {
    setTimeout(() => {
      startTutorial();
    }, 500);
  }
});

function startTutorial() {
  isTutorialMode.value = true;
  gameStore.stopTimer(); // Pause timer during tutorial
  tutorialRef.value?.show();
}

function onTutorialComplete() {
  isTutorialMode.value = false;
  gameStore.startTimer(); // Resume timer after tutorial
}

// Handle back button - show confirmation instead of leaving
useBackButton(10, () => {
  if (showExitConfirm.value) {
    showExitConfirm.value = false;
  } else if (showPlanSelector.value) {
    showPlanSelector.value = false;
  } else if (showRantModal.value) {
    showRantModal.value = false;
  } else if (!gameStore.isGameOver) {
    showExitConfirm.value = true;
  }
});

function confirmExit() {
  showExitConfirm.value = false;
  gameStore.stopTimer();
  router.push('/home');
}

// Critical juice count - messages that need moderation action
const unreadCriticalJuiceCount = computed(() => {
  const currentMessages = gameStore.juiceMessages;
  
  // Only count messages that are truly critical and need action
  const criticalMessages = currentMessages.filter(m => 
    m.isCritical === true && m.hasBeenModerated !== true
  );
  const currentCount = criticalMessages.length;
  
  console.log('🔴 Critical messages debug:', {
    total: currentMessages.length,
    needAction: currentCount,
    activeTab: activeTab.value
  });
  
  console.log('🔴 Badge count:', currentCount);
  return currentCount;
});

// Mark juice as read when switching to juice tab (optional - not used anymore)
watch(activeTab, (newTab) => {
  if (newTab === 'juice') {
    const criticalMessages = gameStore.juiceMessages.filter(m => m.type === 'critical');
    lastReadJuiceCount.value = criticalMessages.length;
  }
});

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

// Watch for plan execution (selectedPlan goes from something to null)
watch(() => gameStore.selectedPlan, (newVal, oldVal) => {
  if (oldVal && !newVal && isTutorialMode.value) {
    // Plan was executed
    tutorialRef.value?.handleTutorialEvent('plan-executed');
  }
});

// Watch for annual report - ensure slot machine is closed
watch(() => gameStore.showAnnualReport, (isShowing) => {
  if (isShowing) {
    // Force close any open modals when annual report shows
    showPlanSelector.value = false;
    showRantModal.value = false;
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

// Highlight plan button when time is running low
const shouldHighlightPlan = computed(() => {
  return gameStore.timeRemaining <= 10 && gameStore.timeRemaining > 0 && !gameStore.selectedPlan;
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
  showSlotConfirmation.value = true;

  // Notify tutorial
  if (isTutorialMode.value) {
    tutorialRef.value?.handleTutorialEvent('plan-selected');
  }
}

function cancelPlan() {
  playSound('click');
  gameStore.selectedPlan = null;
  showSlotConfirmation.value = false;
  showPlanSelector.value = true;
}

function executePlan() {
  playSound('spin');
  showSlotConfirmation.value = false;
  // Slot machine will now show
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

function openSkipConfirmation() {
  playSound('click');
  showSkipConfirmation.value = true;
}

function confirmSkipTurn() {
  playSound('click');
  showSkipConfirmation.value = false;
  gameStore.stopTimer();
  gameStore.skipTurn();
}

function openPlanSelector() {
  playSound('click');
  showPlanSelector.value = true;

  // Notify tutorial
  if (isTutorialMode.value) {
    setTimeout(() => {
      tutorialRef.value?.handleTutorialEvent('plan-opened');
    }, 300);
  }
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
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tab-navigation {
  display: flex;
  gap: 2px;
  padding: 0;
  background: transparent;
  border-bottom: 2px solid rgba(255, 107, 53, 0.3);
  margin-top: 8px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 107, 53, 0.2);
  border-bottom: none;
  border-radius: 12px 12px 0 0;
  color: #71767b;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  margin-bottom: -2px;
}

.tab-btn:hover {
  background: rgba(255, 107, 53, 0.1);
  color: #aaa;
  transform: translateY(-2px);
}

.tab-btn.active {
  background: linear-gradient(180deg, rgba(255, 107, 53, 0.25) 0%, rgba(255, 107, 53, 0.15) 100%);
  border-color: rgba(255, 107, 53, 0.6);
  border-bottom: 2px solid #1a1a2e;
  color: #ff6b35;
  transform: translateY(-2px);
  z-index: 10;
  box-shadow: 
    0 -2px 10px rgba(255, 107, 53, 0.3),
    inset 0 1px 0 rgba(255, 107, 53, 0.4);
}

.tab-icon {
  font-size: 1rem;
}

.tab-label {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
}

.notification-badge {
  position: relative;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 8px;
  min-width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.6);
  animation: badge-pulse 2s ease-in-out infinite;
  z-index: 20;
  margin-left: 2px;
}

@keyframes badge-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.6);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.8);
  }
}

.tab-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding-bottom: 80px; /* Space for bottom navigation bar */
  overflow-y: auto;
}

.juice-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.juice-wrapper :deep(.juice-container) {
  flex-shrink: 0;
}

.cliff-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.cliff-wrapper :deep(.cliff-street-container) {
  flex-shrink: 0;
}

.polls-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.polls-wrapper :deep(.polls-tracker-container) {
  flex-shrink: 0;
}

/* Navigation Bar */
.nav-bar-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  background: rgba(15, 15, 26, 0.98);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 0;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 20px));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 100;
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: #71767b;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.nav-btn:active {
  transform: scale(0.95);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-icon {
  font-size: 1.4rem;
  line-height: 1;
}

.nav-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Active/hover states */
.nav-btn:not(:disabled):hover {
  color: #ff6b35;
}

.nav-btn:not(:disabled):hover .nav-icon {
  transform: translateY(-2px);
}

/* Urgent state */
.nav-btn.nav-urgent {
  color: #fbbf24;
  animation: nav-pulse 1.5s ease-in-out infinite;
}

.nav-btn.nav-urgent .nav-icon {
  animation: nav-bounce 0.6s ease-in-out infinite;
}

@keyframes nav-pulse {
  0%, 100% { color: #fbbf24; }
  50% { color: #ff6b35; }
}

@keyframes nav-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* Free rant state */
.nav-btn.nav-free {
  color: #22c55e;
}

/* Badge */
.nav-badge {
  position: absolute;
  top: 2px;
  right: 50%;
  transform: translateX(calc(50% + 12px));
  background: #ef4444;
  color: white;
  font-size: 0.55rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 8px;
  min-width: 14px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.5);
}

.nav-badge.free {
  background: #22c55e;
  box-shadow: 0 2px 6px rgba(34, 197, 94, 0.5);
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
  max-height: 60vh;
  background: #1a1a2e;
  border-radius: 16px 16px 0 0;
  padding: 12px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 32px));
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  width: 32px;
  height: 3px;
  background: #555;
  border-radius: 2px;
  margin: 0 auto 6px;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sheet-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.sheet-icon {
  font-size: 1.1rem;
}

.sheet-title {
  font-size: 0.95rem;
  color: #ff6b35;
  font-weight: 700;
  white-space: nowrap;
}

.sheet-hint {
  font-size: 0.6rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.close-sheet-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #888;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.close-sheet-btn:active {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.plans-grid-wrapper {
  position: relative;
  margin: 0 -12px;
  padding: 0 12px;
  flex: 1;
  min-height: 0;
}

.plans-grid-wrapper::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 30px;
  background: linear-gradient(to left, #1a1a2e 0%, transparent 100%);
  pointer-events: none;
  z-index: 1;
}

.plans-grid {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px;
  padding-right: 30px;
  flex-wrap: nowrap;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  scroll-padding: 4px;
  height: 100%;
  align-items: stretch;
}

.plans-grid > * {
  scroll-snap-align: start;
}

.plans-grid::-webkit-scrollbar {
  height: 3px;
}

.plans-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
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
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 24px));
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
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 12px;
}

.bot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.bot-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ff6b35;
}

.bot-cost {
  font-size: 0.75rem;
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
  gap: 16px;
  margin-bottom: 10px;
}

.bot-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #ff6b35;
  background: rgba(255, 107, 53, 0.2);
  color: #ff6b35;
  font-size: 1.3rem;
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
  min-width: 80px;
}

.bot-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b35;
}

.bot-sublabel {
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bot-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  padding: 4px 0;
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
  padding: 6px 10px !important;
  border-radius: 6px;
  border: 1px solid rgba(251, 191, 36, 0.3);
  margin: 2px 0;
}

.debt-value {
  color: #eab308 !important;
  font-weight: 700 !important;
}

.boost {
  border-top: 1px solid rgba(255, 107, 53, 0.3);
  padding-top: 8px !important;
  margin-top: 2px;
}

.boost-value {
  color: #4ade80 !important;
  font-size: 0.95rem !important;
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

/* Exit Confirmation Modal */
.exit-modal-overlay {
  z-index: 3000;
}

.exit-modal {
  text-align: center;
  max-width: 400px;
}

.exit-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.exit-modal h3 {
  color: #ff6b35;
  font-size: 1.5rem;
  margin: 0 0 12px 0;
}

.exit-modal p {
  color: #aaa;
  font-size: 1rem;
  margin: 0 0 24px 0;
}

.exit-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exit-btn {
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stay-btn {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
}

.stay-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.6);
}

.leave-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 2px solid rgba(239, 68, 68, 0.4);
}

.leave-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.6);
}

/* Confirmation Sheet */
.confirmation-sheet {
  max-height: 70vh;
}

.confirmation-content {
  text-align: center;
  padding: 12px;
}

.confirmation-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  animation: spin-once 0.6s ease-out;
}

@keyframes spin-once {
  from { transform: rotate(0deg) scale(0.5); opacity: 0; }
  to { transform: rotate(360deg) scale(1); opacity: 1; }
}

.confirmation-title {
  color: #ff6b35;
  font-size: 1.5rem;
  margin: 0 0 16px 0;
  font-weight: 700;
}

.selected-plan-summary {
  background: rgba(255, 107, 53, 0.15);
  border: 2px solid rgba(255, 107, 53, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.plan-emoji-large {
  font-size: 3rem;
  margin-bottom: 8px;
}

.plan-name-large {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
}

.plan-cost-large {
  font-size: 1rem;
  color: #22c55e;
  font-weight: 600;
}

.skip-summary {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skip-effect {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
}

.skip-effect.positive {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.skip-effect.negative {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.skip-effect .effect-icon {
  font-size: 1.5rem;
}

.skip-effect .effect-text {
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

.confirmation-warning {
  color: #fbbf24;
  font-size: 0.9rem;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.confirmation-actions {
  display: flex;
  gap: 12px;
}

.cancel-plan-btn,
.execute-plan-btn {
  flex: 1;
  padding: 14px;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-plan-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 2px solid rgba(239, 68, 68, 0.4);
}

.cancel-plan-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.6);
  transform: translateY(-2px);
}

.execute-plan-btn {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
}

.execute-plan-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.6);
}
</style>
