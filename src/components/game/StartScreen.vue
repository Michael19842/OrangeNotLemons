<template>
  <div class="start-screen">
    <div class="logo-container">
      <div class="logo-emoji">🍊</div>
      <h1 class="game-title">Orange Not Lemons</h1>
      <p class="game-subtitle">A Satirical Simulation</p>
    </div>

    <div class="tagline">
      <p class="main-tagline">
        "Making Fruit Great Again,<br>one terrible decision at a time"
      </p>
    </div>

    <div class="high-score-display" v-if="highScore > 0">
      <span class="high-score-label">Your Best Score</span>
      <span class="high-score-value">{{ highScore }}</span>
    </div>

    <button class="start-btn" @click="startGame">
      🍊 Start Game
    </button>

    <p class="disclaimer">
      This is a work of satire. Any resemblance to actual fruits,
      living or deceased, is purely coincidental. 🍋
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();
const highScore = computed(() => gameStore.highScore);

const emit = defineEmits<{
  start: [];
}>();

function startGame() {
  emit('start');
}
</script>

<style scoped>
.start-screen {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding-bottom: 40px;
}

.logo-container {
  text-align: center;
  margin-bottom: 50px;
}

.logo-emoji {
  font-size: 8rem;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 0 30px rgba(255, 107, 53, 0.6));
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}

.game-title {
  font-size: 2.8rem;
  margin: 20px 0 0 0;
  color: #ff6b35;
  text-shadow: 0 0 30px rgba(255, 107, 53, 0.7);
  font-weight: 900;
  letter-spacing: 1px;
}

.game-subtitle {
  color: #888;
  margin: 8px 0 0 0;
  font-style: italic;
  letter-spacing: 3px;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.tagline {
  margin-bottom: 40px;
  text-align: center;
}

.main-tagline {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #ccc;
  font-style: italic;
  max-width: 400px;
  margin: 0;
}

.high-score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 40px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(247, 147, 30, 0.2));
  border-radius: 20px;
  margin: 20px 0;
  border: 3px solid rgba(255, 107, 53, 0.5);
  box-shadow: 0 6px 30px rgba(255, 107, 53, 0.3);
}

.high-score-label {
  font-size: 0.8rem;
  color: #ff6b35;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
}

.high-score-value {
  font-size: 2.5rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 3px 15px rgba(255, 107, 53, 0.7);
  margin-top: 8px;
}

.start-btn {
  padding: 20px 70px;
  font-size: 1.4rem;
  font-weight: 900;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 30px 0 20px 0;
  box-shadow: 0 8px 40px rgba(255, 107, 53, 0.6);
  text-transform: uppercase;
  letter-spacing: 3px;
  animation: pulse-btn 2s ease-in-out infinite;
}

@keyframes pulse-btn {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.start-btn:hover {
  transform: scale(1.08) translateY(-3px);
  box-shadow: 0 10px 50px rgba(255, 107, 53, 0.8);
  animation: none;
}

.start-btn:active {
  transform: scale(0.98);
}

.disclaimer {
  font-size: 0.75rem;
  color: #666;
  text-align: center;
  max-width: 400px;
  font-style: italic;
  line-height: 1.4;
  margin-top: 30px;
}
</style>
