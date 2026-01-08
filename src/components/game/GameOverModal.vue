<template>
  <div class="game-over-overlay" v-if="isGameOver">
    <div class="game-over-modal" :class="endingClass">
      <div class="game-over-header">
        <div class="game-over-emoji">{{ gameOverEmoji }}</div>
        <div class="ending-badge">{{ endingBadge }}</div>
      </div>

      <h1 class="game-over-title">{{ gameOverTitle }}</h1>

      <div class="ending-scene">
        <p class="scene-description">{{ gameOverScene }}</p>
      </div>

      <p class="game-over-message">{{ gameOverMessage }}</p>

      <div class="final-stats">
        <div class="stat-row" v-if="isNewHighScore">
          <span class="new-high-score">🏆 NEW HIGH SCORE!</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Final Score</span>
          <span class="stat-value score">{{ currentScore }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Months Survived</span>
          <span class="stat-value">{{ monthsSurvived }} / {{ maxMonths }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Term</span>
          <span class="stat-value">{{ term }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Final Loyalty</span>
          <span class="stat-value" :class="loyaltyClass">{{ finalLoyalty }}%</span>
        </div>
      </div>

      <div class="game-over-actions">
        <button class="action-btn share" @click="share">
          📤 Share Score
        </button>
        <button class="action-btn play-again" @click="playAgain">
          🔄 Play Again
        </button>
      </div>

      <div class="share-preview" v-if="showSharePreview">
        <p>{{ shareText }}</p>
        <small>Copied to clipboard!</small>
      </div>

      <!-- Outro Message -->
      <div class="outro-message">
        <div class="outro-divider"></div>
        <p class="outro-title">🌍 A Word from Reality</p>
        <p class="outro-text">
          This game is satire. In real life, please don't gamble with the world economy, 
          democratic institutions, or people's lives. 
        </p>
        <p class="outro-text">
          Real leadership requires wisdom, empathy, and accountability—not just spinning 
          slot machines and hoping for the best.
        </p>
        <p class="outro-footer">
          🍊 Vote wisely. Think critically. Stay informed.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useAudio } from '@/composables/useAudio';

const gameStore = useGameStore();
const { playSound, playGameOverSound, stopGameOverSound, pauseMusic } = useAudio();
const showSharePreview = ref(false);

const isGameOver = computed(() => gameStore.isGameOver);
const gameOverReason = computed(() => gameStore.gameOverReason);
const currentScore = computed(() => gameStore.currentScore);
const highScore = computed(() => gameStore.highScore);
const term = computed(() => gameStore.term);
const monthsSurvived = computed(() => gameStore.currentTurn - 1);
const maxMonths = computed(() => gameStore.term === 2 ? 96 : 48);
const finalLoyalty = computed(() => gameStore.stats.loyalty);
const isNewHighScore = computed(() => currentScore.value > highScore.value);

const loyaltyClass = computed(() => {
  if (finalLoyalty.value >= 85) return 'excellent';
  if (finalLoyalty.value >= 50) return 'good';
  if (finalLoyalty.value >= 25) return 'warning';
  return 'danger';
});

const endingClass = computed(() => {
  switch (gameOverReason.value) {
    case 'victory': return 'ending-victory';
    case 'death': return 'ending-death';
    case 'leaked': return 'ending-leaked';
    case 'term_ended': return 'ending-term';
    default: return '';
  }
});

const endingBadge = computed(() => {
  switch (gameOverReason.value) {
    case 'victory': return '🏆 LEGENDARY';
    case 'death': return '💀 EXPIRED';
    case 'leaked': return '🔓 EXPOSED';
    case 'term_ended': return finalLoyalty.value >= 50 ? '📅 SURVIVED' : '📦 VOTED OUT';
    default: return '';
  }
});

const gameOverEmoji = computed(() => {
  switch (gameOverReason.value) {
    case 'victory': return '👑';
    case 'death': return '⚰️';
    case 'leaked': return '🍋';
    case 'term_ended': return finalLoyalty.value >= 50 ? '🏠' : '📦';
    default: return '🍊';
  }
});

const gameOverTitle = computed(() => {
  switch (gameOverReason.value) {
    case 'victory': return 'LEGENDARY VICTORY!';
    case 'death': return 'THE ORANGE HAS EXPIRED';
    case 'leaked': return 'THE LEMON FILES LEAKED!';
    case 'term_ended':
      if (finalLoyalty.value >= 85) return 'SO CLOSE TO GLORY!';
      if (finalLoyalty.value >= 50) return 'TERM COMPLETED';
      return 'VOTED OUT';
    default: return 'Game Over';
  }
});

const gameOverScene = computed(() => {
  switch (gameOverReason.value) {
    case 'victory':
      return '🎊 Confetti rains down as you wave from the balcony. Eight years of chaos, and the Lemon Files remain sealed forever.';
    case 'death':
      return '🏥 Too many hamberders, too much stress, too many 3AM tweets. The Orange has been... juiced.';
    case 'leaked':
      return '📰 "MANDARIN BUSINESS EXPOSED!" Your allies scatter like roaches. The documentary is already filming.';
    case 'term_ended':
      if (finalLoyalty.value >= 85) return '😤 So close! You needed 85% loyalty for a second term. You pack your bags...';
      if (finalLoyalty.value >= 50) return '🏠 You leave with dignity. The Lemon Files stay sealed. For now...';
      return '📦 Security escorts you out. Your stuff follows in boxes.';
    default:
      return '';
  }
});

const gameOverMessage = computed(() => {
  switch (gameOverReason.value) {
    case 'victory':
      return 'Against all odds, TWO TERMS completed! The Mandarin Business stays buried forever. You absolute legend!';
    case 'death':
      return 'The stress caught up. Your legacy: questionable. Your cholesterol: tremendous.';
    case 'leaked':
      return 'Your inner circle betrayed you! Everyone knows about the Mandarin Business now.';
    case 'term_ended':
      if (finalLoyalty.value >= 85) return 'You were SO close to a second term!';
      if (finalLoyalty.value >= 50) return 'You survived! But could you have done better?';
      return 'The voters have spoken. Time to start that podcast.';
    default:
      return 'Thanks for playing!';
  }
});

const shareText = computed(() => gameStore.getShareText());

// Play game over sound when game ends
watch(isGameOver, (gameOver) => {
  if (gameOver) {
    pauseMusic();

    // Play appropriate ending sound (use playGameOverSound so it can be stopped)
    switch (gameOverReason.value) {
      case 'victory':
        playGameOverSound('victory');
        break;
      case 'death':
        playGameOverSound('death');
        break;
      case 'leaked':
        playGameOverSound('leaked');
        break;
      case 'term_ended':
        playGameOverSound('termEnd');
        break;
    }
  }
});

async function share() {
  playSound('click');
  const text = shareText.value;

  if (navigator.share) {
    try {
      await navigator.share({ text });
    } catch (e) {
      fallbackShare(text);
    }
  } else {
    fallbackShare(text);
  }
}

function fallbackShare(text: string) {
  navigator.clipboard.writeText(text);
  showSharePreview.value = true;
  setTimeout(() => {
    showSharePreview.value = false;
  }, 3000);
}

function playAgain() {
  stopGameOverSound();
  playSound('click');
  gameStore.initGame();
}
</script>

<style scoped>
.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.5s ease;
  padding: 16px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.game-over-modal {
  background: linear-gradient(145deg, #2a2a3e 0%, #1a1a2e 100%);
  border-radius: 20px;
  padding: 20px;
  max-width: 340px;
  width: 100%;
  text-align: center;
  border: 3px solid #ff6b35;
  box-shadow: 0 0 50px rgba(255, 107, 53, 0.4);
  animation: slideUp 0.5s ease;
  max-height: 85vh;
  overflow-y: auto;
}

.game-over-modal.ending-victory {
  border-color: #fbbf24;
  box-shadow: 0 0 60px rgba(251, 191, 36, 0.5);
}
.game-over-modal.ending-death {
  border-color: #ef4444;
  box-shadow: 0 0 60px rgba(239, 68, 68, 0.5);
}
.game-over-modal.ending-leaked {
  border-color: #fbbf24;
  box-shadow: 0 0 60px rgba(251, 191, 36, 0.5);
}
.game-over-modal.ending-term {
  border-color: #3b82f6;
  box-shadow: 0 0 60px rgba(59, 130, 246, 0.4);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}

.game-over-header {
  margin-bottom: 8px;
}

.game-over-emoji {
  font-size: 3.5rem;
  margin-bottom: 8px;
  display: block;
}

.ending-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 1px;
  background: rgba(255, 107, 53, 0.2);
  color: #ff6b35;
  border: 1px solid #ff6b35;
}
.ending-victory .ending-badge { background: rgba(251, 191, 36, 0.2); color: #fbbf24; border-color: #fbbf24; }
.ending-death .ending-badge { background: rgba(239, 68, 68, 0.2); color: #ef4444; border-color: #ef4444; }
.ending-leaked .ending-badge { background: rgba(251, 191, 36, 0.2); color: #fbbf24; border-color: #fbbf24; }
.ending-term .ending-badge { background: rgba(59, 130, 246, 0.2); color: #3b82f6; border-color: #3b82f6; }

.game-over-title {
  font-size: 1.2rem;
  margin: 8px 0;
  color: #ff6b35;
}
.ending-victory .game-over-title { color: #fbbf24; }
.ending-death .game-over-title { color: #ef4444; }
.ending-leaked .game-over-title { color: #fbbf24; }
.ending-term .game-over-title { color: #3b82f6; }

.ending-scene {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  border-left: 3px solid #ff6b35;
}
.ending-victory .ending-scene { border-color: #fbbf24; }
.ending-death .ending-scene { border-color: #ef4444; }
.ending-leaked .ending-scene { border-color: #fbbf24; }
.ending-term .ending-scene { border-color: #3b82f6; }

.scene-description {
  font-size: 0.8rem;
  color: #fff;
  margin: 0;
  line-height: 1.4;
  font-style: italic;
}

.game-over-message {
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 12px;
  line-height: 1.3;
}

.stat-value.excellent { color: #22c55e; }
.stat-value.good { color: #3b82f6; }
.stat-value.warning { color: #f59e0b; }
.stat-value.danger { color: #ef4444; }

.final-stats {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #888;
  font-size: 0.85rem;
}

.stat-value {
  font-weight: bold;
  color: white;
  font-size: 1rem;
}

.stat-value.score {
  color: #ff6b35;
  font-size: 1.5rem;
}

.new-high-score {
  width: 100%;
  text-align: center;
  color: #fbbf24;
  font-weight: bold;
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.game-over-actions {
  display: flex;
  gap: 12px;
  flex-direction: column;
}

.action-btn {
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.share {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.action-btn.play-again {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
}

.action-btn:hover {
  transform: scale(1.02);
}

.share-preview {
  margin-top: 16px;
  padding: 12px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 8px;
  border: 1px solid #22c55e;
}

.share-preview p {
  font-size: 0.8rem;
  margin: 0 0 8px 0;
  color: white;
}

.share-preview small {
  color: #22c55e;
}

/* Outro Message */
.outro-message {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid rgba(255, 107, 53, 0.3);
}

.outro-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #ff6b35, transparent);
  margin: 0 auto 16px;
  border-radius: 2px;
}

.outro-title {
  font-size: 1rem;
  font-weight: bold;
  color: #ff6b35;
  margin: 0 0 12px 0;
  text-shadow: 0 0 10px rgba(255, 107, 53, 0.4);
}

.outro-text {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #94a3b8;
  margin: 0 0 12px 0;
  text-align: left;
  padding: 0 4px;
}

.outro-footer {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 16px 0 0 0;
  padding: 12px;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 53, 0.3);
}
</style>
