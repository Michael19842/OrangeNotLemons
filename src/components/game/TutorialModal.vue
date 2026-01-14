<template>
  <div v-if="isVisible" class="tutorial-system" :class="{ 'wait-for-action': currentStep.waitForAction }">
    <!-- Dark overlay - doesn't block highlighted area -->
    <div
      class="tutorial-overlay"
      :class="{ 'allow-clicks': currentStep.waitForAction }"
      :style="overlayClipStyle"
      @click.self="handleOverlayClick"
    ></div>

    <!-- Floating instruction box -->
    <div
      class="tutorial-box"
      :class="boxPositionClass"
      :style="boxStyle"
    >
      <div class="tutorial-header">
        <div class="step-indicator">
          <span class="step-number">{{ currentStepIndex + 1 }}</span>
          <span class="step-total">/ {{ steps.length }}</span>
        </div>
        <button class="skip-btn" @click="skipTutorial">Skip ✕</button>
      </div>

      <div class="tutorial-content">
        <div class="tutorial-icon">{{ currentStep.icon }}</div>
        <h3 class="tutorial-title">{{ currentStep.title }}</h3>
        <p class="tutorial-text" v-html="currentStep.description"></p>

        <div v-if="currentStep.action" class="action-hint">
          <span class="action-icon">👆</span>
          <span class="action-text">{{ currentStep.action }}</span>
        </div>
      </div>

      <div class="tutorial-footer">
        <div class="progress-dots">
          <span
            v-for="(step, index) in steps"
            :key="index"
            class="dot"
            :class="{ active: currentStepIndex === index, completed: currentStepIndex > index }"
          ></span>
        </div>

        <div class="nav-buttons">
          <button
            v-if="currentStepIndex > 0 && !currentStep.waitForAction"
            class="nav-btn back-btn"
            @click="previousStep"
          >
            ← Back
          </button>
          <button
            v-if="!currentStep.waitForAction"
            class="nav-btn next-btn"
            @click="nextStep"
          >
            {{ currentStepIndex === steps.length - 1 ? '🍊 Start Game!' : 'Next →' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pulsing highlight ring around element -->
    <div
      v-if="highlightRect && currentStep.highlight"
      class="highlight-ring"
      :style="highlightStyle"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useAudio } from '@/composables/useAudio';

const gameStore = useGameStore();
const { playSound } = useAudio();

const isVisible = ref(false);
const currentStepIndex = ref(0);
const highlightRect = ref<DOMRect | null>(null);
const windowSize = ref({ width: window.innerWidth, height: window.innerHeight });

interface TutorialStep {
  title: string;
  icon: string;
  description: string;
  highlight?: string; // CSS selector for element to highlight
  action?: string; // Instruction for what to do
  waitForAction?: string; // Event name to wait for
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const steps: TutorialStep[] = [
  {
    title: 'Welcome to Orange Not Lemons!',
    icon: '🍊',
    description: `You are <strong>The Orange</strong> - the controversial leader of Fruitland.<br><br>Your goal? <strong>Survive</strong> without the Lemon Files getting leaked!`,
    position: 'center'
  },
  {
    title: 'Your Stats',
    icon: '📊',
    description: `These are your vital stats:<br>
      <strong>❤️ Health</strong> - At 0 you die<br>
      <strong>💰 Money</strong> - Funds for plans<br>
      <strong>👥 Loyalty</strong> - At 0 files leak!<br>
      <strong>📊 Support</strong> - Public approval`,
    highlight: '.stats-bar',
    position: 'bottom'
  },
  {
    title: 'The Timer',
    icon: '⏱️',
    description: `You have <strong>90 seconds</strong> each turn to make decisions.<br><br>When time runs out, you automatically go golfing!`,
    highlight: '.timer-container',
    position: 'bottom'
  },
  {
    title: 'The Juice Feed',
    icon: '🍊',
    description: `This is <strong>The Juice</strong> - your social media feed.<br><br>It shows news, hints, and the current <strong>situation</strong>. Read it carefully!<br><br>Look for <strong>orange situation alerts</strong> - they hint at which plan type is best!`,
    highlight: '.juice-wrapper',
    position: 'center'
  },
  {
    title: 'Cliff Street - Stock Market',
    icon: '📈',
    description: `The <strong>Cliff Street</strong> tab shows the stock market!<br><br>
      • <strong>Buy</strong> stocks you think will rise<br>
      • <strong>Short</strong> stocks you think will fall<br>
      • Your <strong>plans affect stock prices!</strong><br><br>
      Research plans to discover which stocks they impact. Big profits (or losses) await!`,
    highlight: '.tab-btn:nth-child(2)',
    position: 'bottom'
  },
  {
    title: 'Open the Plan Selector',
    icon: '🃏',
    description: `Now let's look at your plan options.<br><br>Click the <strong>Plan</strong> button below!`,
    highlight: '.plan-btn',
    action: 'Click the Plan button',
    waitForAction: 'plan-opened',
    position: 'top'
  },
  {
    title: 'Your Plan Options',
    icon: '🎯',
    description: `These are your available plans. Each has:<br>
      • A <strong>cost</strong> in money<br>
      • A <strong>category</strong> (economy, politics, etc.)<br>
      • <strong>Hidden info</strong> you can research<br><br>
      Match the plan category to the situation for bonuses!`,
    highlight: '.plans-grid',
    position: 'top'
  },
  {
    title: 'Choose a Plan!',
    icon: '💡',
    description: `<strong>Click a plan card</strong> to select it.<br><br>
      ✅ <strong>Right category</strong> = bonus effects<br>
      ❌ <strong>Wrong category</strong> = penalty effects`,
    highlight: '.plans-grid',
    action: 'Select a plan',
    waitForAction: 'plan-selected',
    position: 'top'
  },
  {
    title: 'The Slot Machine',
    icon: '🎰',
    description: `The slot machine determines your outcome!<br><br>
      • <strong>Spin</strong> up to 3 times<br>
      • <strong>Execute</strong> when satisfied<br>
      • <strong>Blind Play</strong> to skip (risky!)<br><br>
      Higher scores = better results!`,
    highlight: '.slot-machine',
    position: 'center'
  },
  {
    title: 'Finish This Turn',
    icon: '🎲',
    description: `Try spinning or just <strong>Execute</strong> the plan to continue.<br><br>You can also use <strong>Blind Play</strong> to skip the slots entirely!`,
    highlight: '.controls',
    action: 'Execute the plan',
    waitForAction: 'plan-executed',
    position: 'top'
  },
  {
    title: 'You\'re Ready!',
    icon: '🏆',
    description: `<strong>Great job!</strong> You know the basics!<br><br>
      Remember:<br>
      📱 Read The Juice for situation hints<br>
      🎯 Match plan categories to situations<br>
      ⚡ React to critical posts<br><br>
      Good luck, <strong>Mr. Orange</strong>!`,
    position: 'center'
  }
];

const currentStep = computed(() => steps[currentStepIndex.value]);

const boxPositionClass = computed(() => {
  // If highlight element not found, always use center position
  if (currentStep.value.highlight && !highlightRect.value) {
    return 'position-center';
  }
  return `position-${currentStep.value.position || 'center'}`;
});

const highlightStyle = computed(() => {
  if (!highlightRect.value) return {};

  const rect = highlightRect.value;
  const padding = 8;

  return {
    left: `${rect.left - padding}px`,
    top: `${rect.top - padding}px`,
    width: `${rect.width + padding * 2}px`,
    height: `${rect.height + padding * 2}px`
  };
});

const boxStyle = computed(() => {
  if (!highlightRect.value || currentStep.value.position === 'center') {
    return {};
  }

  const rect = highlightRect.value;
  const padding = 20;
  const boxWidth = 320;
  const boxHeight = 280;

  switch (currentStep.value.position) {
    case 'bottom':
      return {
        left: `${Math.max(10, Math.min(rect.left, windowSize.value.width - boxWidth - 10))}px`,
        top: `${rect.bottom + padding}px`
      };
    case 'top':
      return {
        left: `${Math.max(10, Math.min(rect.left, windowSize.value.width - boxWidth - 10))}px`,
        bottom: `${windowSize.value.height - rect.top + padding}px`
      };
    case 'left':
      return {
        right: `${windowSize.value.width - rect.left + padding}px`,
        top: `${Math.max(10, rect.top)}px`
      };
    case 'right':
      return {
        left: `${rect.right + padding}px`,
        top: `${Math.max(10, rect.top)}px`
      };
    default:
      return {};
  }
});

// Create a clip-path that creates a hole in the overlay for the highlighted element
const overlayClipStyle = computed(() => {
  if (!highlightRect.value) {
    return {};
  }

  const rect = highlightRect.value;
  const padding = 8;
  const { width, height } = windowSize.value;

  // Create a polygon that covers everything EXCEPT the highlighted area
  // Using inset with round corners for the hole
  const left = rect.left - padding;
  const top = rect.top - padding;
  const right = rect.right + padding;
  const bottom = rect.bottom + padding;

  // Use clip-path polygon to create a frame around the hole
  return {
    clipPath: `polygon(
      0% 0%,
      0% 100%,
      ${left}px 100%,
      ${left}px ${top}px,
      ${right}px ${top}px,
      ${right}px ${bottom}px,
      ${left}px ${bottom}px,
      ${left}px 100%,
      100% 100%,
      100% 0%
    )`
  };
});

function handleOverlayClick() {
  // Clicking the overlay (not the highlighted element) does nothing
  // This prevents accidentally advancing or closing the tutorial
}

function updateHighlight() {
  if (!currentStep.value.highlight) {
    highlightRect.value = null;
    return;
  }

  const element = document.querySelector(currentStep.value.highlight);
  if (element) {
    const rect = element.getBoundingClientRect();
    // Only use highlight if element is visible (has dimensions)
    if (rect.width > 0 && rect.height > 0) {
      highlightRect.value = rect;
    } else {
      highlightRect.value = null;
    }
  } else {
    // Element not found - continue without highlight
    highlightRect.value = null;
    console.log(`Tutorial: Element ${currentStep.value.highlight} not found`);
  }
}

function handleResize() {
  windowSize.value = { width: window.innerWidth, height: window.innerHeight };
  updateHighlight();
}

const emit = defineEmits<{
  complete: [];
  skip: [];
  'tutorial-action': [action: string];
}>();

function show() {
  isVisible.value = true;
  currentStepIndex.value = 0;
  nextTick(() => {
    updateHighlight();
  });
}

function hide() {
  isVisible.value = false;
}

function nextStep() {
  playSound('click');
  if (currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value++;
    nextTick(() => {
      updateHighlight();
    });
  } else {
    completeTutorial();
  }
}

function previousStep() {
  playSound('click');
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
    nextTick(() => {
      updateHighlight();
    });
  }
}

function completeTutorial() {
  playSound('click');
  gameStore.setTutorialCompleted();
  hide();
  emit('complete');
}

function skipTutorial() {
  playSound('click');
  gameStore.setTutorialCompleted();
  hide();
  emit('skip');
}

// Handle external events to advance tutorial
function handleTutorialEvent(event: string) {
  if (!isVisible.value) return;

  const step = currentStep.value;
  if (step.waitForAction === event) {
    // Small delay for visual feedback
    setTimeout(() => {
      nextStep();
    }, 300);
  }
}

// Expose for external triggering
defineExpose({
  show,
  hide,
  handleTutorialEvent,
  isVisible
});

// Watch for step changes to update highlight
watch(currentStepIndex, () => {
  nextTick(() => {
    updateHighlight();
  });
});

// Update highlight on scroll
let scrollTimeout: number | null = null;
function handleScroll() {
  if (scrollTimeout) clearTimeout(scrollTimeout);
  scrollTimeout = window.setTimeout(() => {
    updateHighlight();
  }, 50);
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll, true);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll, true);
  if (scrollTimeout) clearTimeout(scrollTimeout);
});
</script>

<style scoped>
.tutorial-system {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  pointer-events: none;
}

.tutorial-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  pointer-events: auto;
  transition: clip-path 0.3s ease;
}

/* Allow clicks through overlay when waiting for action */
.tutorial-overlay.allow-clicks {
  pointer-events: none;
}

.highlight-ring {
  position: absolute;
  border: 3px solid #ff6b35;
  border-radius: 12px;
  pointer-events: none;
  animation: pulse-ring 2s ease-in-out infinite;
  box-shadow:
    0 0 20px rgba(255, 107, 53, 0.6),
    inset 0 0 20px rgba(255, 107, 53, 0.3);
}

@keyframes pulse-ring {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.8;
  }
}

.tutorial-box {
  position: absolute;
  width: 320px;
  max-width: calc(100vw - 20px);
  background: linear-gradient(145deg, #2a2a3e 0%, #1a1a2e 100%);
  border: 2px solid #ff6b35;
  border-radius: 16px;
  padding: 20px;
  pointer-events: auto;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.8),
    0 0 30px rgba(255, 107, 53, 0.3);
  animation: fadeInScale 0.3s ease;
  z-index: 10000;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.tutorial-box.position-center {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.tutorial-box.position-bottom {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.tutorial-box.position-top {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.step-indicator {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.step-number {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ff6b35;
}

.step-total {
  font-size: 0.9rem;
  color: #666;
}

.skip-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.skip-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.tutorial-content {
  text-align: center;
  margin-bottom: 20px;
}

.tutorial-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.tutorial-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff6b35;
  margin: 0 0 12px 0;
}

.tutorial-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #ccc;
  margin: 0;
}

.tutorial-text :deep(strong) {
  color: #ff6b35;
}

.action-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(255, 107, 53, 0.15);
  border: 2px solid rgba(255, 107, 53, 0.4);
  border-radius: 12px;
  animation: pulse-action 2s ease-in-out infinite;
}

@keyframes pulse-action {
  0%, 100% {
    border-color: rgba(255, 107, 53, 0.4);
    background: rgba(255, 107, 53, 0.15);
  }
  50% {
    border-color: rgba(255, 107, 53, 0.8);
    background: rgba(255, 107, 53, 0.25);
  }
}

.action-icon {
  font-size: 1.5rem;
  animation: point 1s ease-in-out infinite;
}

@keyframes point {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.action-text {
  font-size: 1rem;
  font-weight: 700;
  color: #ff6b35;
}

.tutorial-footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.dot.completed {
  background: #22c55e;
}

.dot.active {
  background: #ff6b35;
  width: 24px;
  border-radius: 4px;
}

.nav-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.nav-btn {
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 140px;
}

.back-btn {
  background: rgba(100, 100, 100, 0.2);
  color: #aaa;
  border: 1px solid #555;
}

.back-btn:hover {
  background: rgba(100, 100, 100, 0.3);
  color: #fff;
}

.next-btn {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.6);
}
</style>
