<template>
  <ion-page>
    <ion-content :fullscreen="true" class="intro-content">
      <div class="intro-container">
        <!-- Progress Dots -->
        <div class="progress-dots">
          <span 
            v-for="(slide, index) in slides" 
            :key="index"
            class="dot"
            :class="{ active: currentSlide === index }"
            @click="currentSlide = index"
          ></span>
        </div>

        <!-- Slides Container -->
        <div class="slides-wrapper">
          <transition :name="slideDirection" mode="out-in">
            <div :key="currentSlide" class="slide">
              <div class="story-icon">{{ slides[currentSlide].icon }}</div>
              <h2>{{ slides[currentSlide].title }}</h2>
              <component :is="slides[currentSlide].content" />
            </div>
          </transition>
        </div>

        <!-- Navigation -->
        <div class="slide-navigation">
          <button 
            class="nav-btn prev-btn" 
            @click="prevSlide"
            v-if="currentSlide > 0"
          >
            ← Previous
          </button>
          <button 
            class="nav-btn next-btn" 
            @click="nextSlide"
            v-if="currentSlide < slides.length - 1"
          >
            Next →
          </button>
          <button 
            class="continue-btn" 
            @click="continueToGame"
            v-if="currentSlide === slides.length - 1"
          >
            🍊 Let's Begin
          </button>
        </div>

        <p class="skip-intro" @click="continueToGame">Skip Intro →</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, defineComponent, h, onMounted } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { useAudio } from '@/composables/useAudio';

const router = useRouter();
const gameStore = useGameStore();
const { playMusic, unlockAudio } = useAudio();
const currentSlide = ref(0);
const slideDirection = ref('slide-left');

// Start music when intro loads
onMounted(() => {
  // Unlock and play music on first interaction
  const startMusic = () => {
    unlockAudio();
    playMusic();
    document.removeEventListener('click', startMusic);
    document.removeEventListener('touchstart', startMusic);
  };
  document.addEventListener('click', startMusic, { once: true });
  document.addEventListener('touchstart', startMusic, { once: true });
});

const slides = [
  {
    icon: '🍊',
    title: 'The Orange Rises',
    content: defineComponent({
      render: () => h('p', { class: 'slide-text' }, [
        'Against all odds, ',
        h('strong', 'The Orange'),
        ' has reached the highest office in Fruitland. But power comes with secrets...'
      ])
    })
  },
  {
    icon: '📜',
    title: 'The Lemon Files',
    content: defineComponent({
      render: () => h('p', { class: 'slide-text' }, [
        'Buried deep in the archives lie the ',
        h('strong', 'Lemon Files'),
        ' - documents detailing questionable dealings with the ',
        h('em', 'Mandarin Business'),
        '. If these files leak, it\'s game over.'
      ])
    })
  },
  {
    icon: '🎭',
    title: 'The Art of Distraction',
    content: defineComponent({
      render: () => h('p', { class: 'slide-text' }, 
        'Your mission: Create chaos, generate headlines, and keep everyone distracted while protecting your inner circle\'s loyalty. Manage your health, wealth, and public support carefully - you\'re not getting any younger.'
      )
    })
  },
  {
    icon: '🎰',
    title: 'How It Works',
    content: defineComponent({
      render: () => h('div', { class: 'gameplay-grid' }, [
        h('div', { class: 'gameplay-item' }, [
          h('span', { class: 'gp-icon' }, '📅'),
          h('span', { class: 'gp-text' }, [h('strong', '48 Months'), ' to survive your term'])
        ]),
        h('div', { class: 'gameplay-item' }, [
          h('span', { class: 'gp-icon' }, '🃏'),
          h('span', { class: 'gp-text' }, ['Choose ', h('strong', 'plan cards'), ' each turn'])
        ]),
        h('div', { class: 'gameplay-item' }, [
          h('span', { class: 'gp-icon' }, '⏱️'),
          h('span', { class: 'gp-text' }, [h('strong', '30 seconds'), ' to decide'])
        ]),
        h('div', { class: 'gameplay-item' }, [
          h('span', { class: 'gp-icon' }, '🔍'),
          h('span', { class: 'gp-text' }, ['Investigate cards with ', h('strong', '💰 or ❤️')])
        ]),
        h('div', { class: 'gameplay-item' }, [
          h('span', { class: 'gp-icon' }, '🎰'),
          h('span', { class: 'gp-text' }, ['Spin the ', h('strong', 'fruit machine')])
        ]),
        h('div', { class: 'gameplay-item' }, [
          h('span', { class: 'gp-icon' }, '⚠️'),
          h('span', { class: 'gp-text' }, ['Face ', h('strong', 'delayed consequences')])
        ])
      ])
    })
  },
  {
    icon: '⚡',
    title: 'Win or Lose',
    content: defineComponent({
      render: () => h('div', { class: 'stakes-container' }, [
        h('div', { class: 'stakes-intro' }, [
          h('p', { class: 'stakes-text' }, 'Keep your stats balanced to survive!')
        ]),
        h('div', { class: 'stakes-grid' }, [
          h('div', { class: 'stake-item win' }, [
            h('span', { class: 'stake-icon' }, '👑'),
            h('div', { class: 'stake-content' }, [
              h('strong', 'Victory'),
              h('p', 'Loyalty ≥ 85% after 48 months'),
              h('p', { class: 'bonus' }, '+ Second term = 2x score!')
            ])
          ]),
          h('div', { class: 'stake-item lose' }, [
            h('span', { class: 'stake-icon' }, '💀'),
            h('div', { class: 'stake-content' }, [
              h('strong', 'Game Over'),
              h('p', 'Health = 0 or Loyalty = 0')
            ])
          ])
        ])
      ])
    })
  }
];

function nextSlide() {
  if (currentSlide.value < slides.length - 1) {
    slideDirection.value = 'slide-left';
    currentSlide.value++;
  }
}

function prevSlide() {
  if (currentSlide.value > 0) {
    slideDirection.value = 'slide-right';
    currentSlide.value--;
  }
}

function continueToGame() {
  gameStore.initGame();
  router.push('/game');
}
</script>

<style scoped>
.intro-content {
  --background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
}

.intro-container {
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
}

/* Progress Dots */
.progress-dots {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px 0;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot:hover {
  background: rgba(255, 107, 53, 0.5);
  transform: scale(1.2);
}

.dot.active {
  background: #ff6b35;
  width: 24px;
  border-radius: 5px;
}

/* Slides Container */
.slides-wrapper {
  flex: 1;
  width: 100%;
  max-width: 600px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide {
  position: absolute;
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 107, 53, 0.2);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.slide::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #ff6b35, transparent);
  opacity: 0.5;
}

/* Slide Transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Slide Content */
.story-icon {
  font-size: 3.5rem;
  margin-bottom: 16px;
  display: inline-block;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.slide h2 {
  font-size: 1.6rem;
  color: #ff6b35;
  margin: 0 0 16px 0;
  font-weight: 700;
}

.slide p,
.slide-text {
  font-size: 1rem;
  line-height: 1.7;
  color: #ccc;
  margin: 0 0 12px 0;
}

.slide-text strong {
  color: #ff6b35;
  font-weight: 700;
}

.slide-text em {
  color: #f7931e;
  font-style: italic;
}

.gameplay-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

.gameplay-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.gameplay-item:hover {
  background: rgba(255, 107, 53, 0.1);
  transform: translateY(-2px);
}

.gp-icon {
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.gp-text {
  font-size: 0.8rem;
  color: #aaa;
  line-height: 1.3;
}

.story-section.stakes {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.05), rgba(239, 68, 68, 0.05));
  border-color: rgba(255, 107, 53, 0.3);
}

.stakes-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stakes-intro {
  text-align: center;
  padding: 12px;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.stakes-text {
  font-size: 0.95rem;
  color: #e2e8f0;
  margin: 0;
  font-weight: 600;
}

.stakes-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stake-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.stake-item:hover {
  transform: translateX(5px);
}

.stake-item.win {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.05);
}

.stake-item.lose {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.stake-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.stake-content {
  flex: 1;
}

.stake-content strong {
  display: block;
  color: #ff6b35;
  font-size: 0.95rem;
  margin-bottom: 6px;
  font-weight: 700;
}

.stake-content p {
  font-size: 0.8rem;
  color: #aaa;
  margin: 2px 0;
  line-height: 1.3;
}

.stake-content .bonus {
  color: #22c55e;
  font-weight: 600;
  margin-top: 6px;
  font-size: 0.75rem;
}

/* Navigation Buttons */
.slide-navigation {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 20px 0;
  width: 100%;
  max-width: 600px;
}

.nav-btn {
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 700;
  border: 2px solid rgba(255, 107, 53, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #ff6b35;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  max-width: 200px;
}

.nav-btn:hover {
  background: rgba(255, 107, 53, 0.1);
  border-color: rgba(255, 107, 53, 0.5);
  transform: translateY(-2px);
}

.nav-btn:active {
  transform: scale(0.98);
}

.nav-btn.prev-btn {
  background: rgba(100, 100, 100, 0.1);
  border-color: rgba(150, 150, 150, 0.3);
  color: #aaa;
}

.nav-btn.prev-btn:hover {
  background: rgba(100, 100, 100, 0.2);
  border-color: rgba(150, 150, 150, 0.5);
  color: #ddd;
}

.nav-btn.next-btn {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.1) 100%);
  border-color: rgba(255, 107, 53, 0.4);
}

.nav-btn.next-btn:hover {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(247, 147, 30, 0.2) 100%);
  border-color: rgba(255, 107, 53, 0.6);
}

.continue-btn {
  padding: 18px 60px;
  font-size: 1.3rem;
  font-weight: 900;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 30px rgba(255, 107, 53, 0.5);
  text-transform: uppercase;
  letter-spacing: 2px;
  flex: 1;
  max-width: 400px;
}

.continue-btn:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 8px 40px rgba(255, 107, 53, 0.7);
}

.continue-btn:active {
  transform: scale(0.98);
}

/* Skip Link (always visible at top) */
.skip-intro {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
  z-index: 10;
}

.skip-intro:hover {
  color: #ff6b35;
}
</style>
