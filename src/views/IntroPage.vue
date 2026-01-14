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

import { useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();
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
        'Against ',
        h('em', 'tremendous'),
        ' odds, ',
        h('strong', 'The Orange'),
        ' - the oldest, most spray-tanned fruit in Fruitland - somehow won! Now the real challenge begins: staying in power without anyone discovering the truth...'
      ])
    })
  },
  {
    icon: '📜',
    title: 'The Lemon Files',
    content: defineComponent({
      render: () => h('p', { class: 'slide-text' }, [
        'Deep in the basement vault lie the ',
        h('strong', { style: 'color: #ffc107' }, '🍋 Lemon Files'),
        ' - explosive documents about shady deals with the ',
        h('em', 'Mandarin Empire'),
        ', tax returns that mysteriously vanish, and loans from the ',
        h('em', 'Banana Republic Bank'),
        '. Your inner circle knows ',
        h('strong', 'everything'),
        '. Keep them loyal, or the leaks destroy you!'
      ])
    })
  },
  {
    icon: '🎭',
    title: 'Your Mission',
    content: defineComponent({
      render: () => h('div', { class: 'mission-container' }, [
        h('p', { class: 'slide-text mission-intro' }, [
          'You\'re in the big chair now! Survive ',
          h('strong', '48 crazy months'),
          ' by juggling four critical stats:'
        ]),
        h('div', { class: 'resource-list' }, [
          h('div', { class: 'resource-item' }, [
            h('div', { class: 'resource-icon' }, '❤️'),
            h('div', { class: 'resource-name' }, 'Health'),
            h('div', { class: 'resource-desc' }, 'You\'re 78. Hamburgers are risky.')
          ]),
          h('div', { class: 'resource-item' }, [
            h('div', { class: 'resource-icon' }, '💰'),
            h('div', { class: 'resource-name' }, 'Money'),
            h('div', { class: 'resource-desc' }, 'Bribes cost cash. Lots of it.')
          ]),
          h('div', { class: 'resource-item' }, [
            h('div', { class: 'resource-icon' }, '👥'),
            h('div', { class: 'resource-name' }, 'Loyalty'),
            h('div', { class: 'resource-desc' }, 'They know too much. Keep \'em happy!')
          ]),
          h('div', { class: 'resource-item' }, [
            h('div', { class: 'resource-icon' }, '📊'),
            h('div', { class: 'resource-name' }, 'Support'),
            h('div', { class: 'resource-desc' }, 'Ratings = power. Don\'t tank!')
          ])
        ])
      ])
    })
  },
  {
    icon: '🎰',
    title: 'How To Play',
    content: defineComponent({
      render: () => h('div', { class: 'howto-container' }, [
        h('div', { class: 'howto-step' }, [
          h('span', { class: 'step-num' }, '1'),
          h('span', { class: 'step-text' }, [
            h('strong', 'Pick a wild plan'),
            ' - Tariffs? Hamburger summit? You decide!'
          ])
        ]),
        h('div', { class: 'howto-step' }, [
          h('span', { class: 'step-num' }, '2'),
          h('span', { class: 'step-text' }, [
            h('strong', 'Dig for dirt'),
            ' - Spend 💰 or ❤️ to uncover what could go wrong'
          ])
        ]),
        h('div', { class: 'howto-step' }, [
          h('span', { class: 'step-num' }, '3'),
          h('span', { class: 'step-text' }, [
            h('strong', 'Spin the slots'),
            ' - Lady Luck decides if you\'re a genius or a disaster'
          ])
        ]),
        h('div', { class: 'howto-note' }, [
          h('span', { class: 'note-icon' }, '⏱️'),
          h('span', 'You get 30 seconds per turn. Tick tock! Skip = penalties.')
        ])
      ])
    })
  },
  {
    icon: '⚡',
    title: 'Win or Lose',
    content: defineComponent({
      render: () => h('div', { class: 'stakes-container' }, [
        h('div', { class: 'stakes-grid' }, [
          h('div', { class: 'stake-item win' }, [
            h('span', { class: 'stake-icon' }, '👑'),
            h('div', { class: 'stake-content' }, [
              h('strong', '🏆 Victory Conditions'),
              h('p', 'Survive 48 months with Loyalty high & Support above 40%'),
              h('p', { class: 'bonus' }, '✨ High loyalty = Second term! Can you last 96 months?')
            ])
          ]),
          h('div', { class: 'stake-item lose' }, [
            h('span', { class: 'stake-icon' }, '💀'),
            h('div', { class: 'stake-content' }, [
              h('strong', '☠️ You\'re Done If...'),
              h('p', '❤️ Health = 0: Too many hamburgers. Flatline!'),
              h('p', '👥 Loyalty = 0: LEAKS! The Lemon Files go public!'),
              h('p', 'Term ends with terrible ratings = You\'re fired!')
            ])
          ])
        ]),
        h('div', { class: 'stakes-tip' }, [
          h('span', { class: 'tip-icon' }, '🔥'),
          h('span', 'PRO TIP: Chaos is your friend! More scandals = lower loyalty needed to survive!')
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
  // Pass tutorial flag if it was set
  if (route.query.tutorial === 'true') {
    router.push('/game?tutorial=true');
  } else {
    router.push('/game');
  }
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
  padding: 40px 28px;
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
  margin-bottom: 24px;
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
  margin: 0 0 24px 0;
  font-weight: 700;
}

.slide p,
.slide-text {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #ccc;
  margin: 0 0 16px 0;
}

.slide-text strong {
  color: #ff6b35;
  font-weight: 700;
}

.slide-text em {
  color: #f7931e;
  font-style: italic;
}

/* Mission slide - Resource list */
.mission-container {
  text-align: center;
}

.mission-intro {
  margin-bottom: 28px !important;
  font-size: 1.1rem !important;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 0 auto;
  max-width: 480px;
}

.resource-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  text-align: center;
}

.resource-item:hover {
  background: rgba(255, 107, 53, 0.08);
  border-color: rgba(255, 107, 53, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.15);
}

.resource-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  display: block;
}

.resource-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ff6b35;
  margin-bottom: 12px;
  display: block;
  letter-spacing: 0.5px;
}

.resource-desc {
  font-size: 0.9rem;
  color: #bbb;
  line-height: 1.6;
  display: block;
  max-width: 100%;
}

/* How to play slide */
.howto-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.howto-step {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 3px solid #ff6b35;
}

.step-num {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
  flex-shrink: 0;
}

.step-text {
  font-size: 0.95rem;
  color: #ccc;
  text-align: left;
  line-height: 1.6;
}

.step-text strong {
  color: #ff6b35;
}

.howto-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 16px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  color: #ffc107;
  margin-top: 6px;
  line-height: 1.5;
}

.note-icon {
  font-size: 1.2rem;
}

.stakes-container {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.stakes-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stake-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 16px;
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
  font-size: 1rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.stake-content p {
  font-size: 0.85rem;
  color: #aaa;
  margin: 4px 0;
  line-height: 1.5;
}

.stake-content .bonus {
  color: #22c55e;
  font-weight: 600;
  margin-top: 8px;
  font-size: 0.8rem;
}

.stakes-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 16px;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  color: #a78bfa;
  line-height: 1.5;
}

.tip-icon {
  font-size: 1.1rem;
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
