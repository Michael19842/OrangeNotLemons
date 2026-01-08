<template>
  <div class="achievements-modal-overlay" @click="$emit('close')">
    <div class="achievements-modal" @click.stop>
      <div class="modal-header">
        <h2>🏆 Achievements</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      
      <div class="achievements-stats">
        <div class="stat">
          <span class="stat-label">Unlocked:</span>
          <span class="stat-value">{{ unlockedCount }}/{{ totalCount }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>

      <div class="category-tabs">
        <button
          v-for="cat in categories"
          :key="cat"
          class="category-tab"
          :class="{ active: selectedCategory === cat }"
          @click="selectedCategory = cat"
        >
          {{ categoryNames[cat] }}
        </button>
      </div>

      <div class="achievements-grid">
        <div
          v-for="achievement in filteredAchievements"
          :key="achievement.id"
          class="achievement-card"
          :class="{ unlocked: achievement.unlocked, hidden: achievement.hidden && !achievement.unlocked }"
        >
          <div class="achievement-icon">{{ achievement.emoji }}</div>
          <div class="achievement-info">
            <div class="achievement-name">
              {{ achievement.hidden && !achievement.unlocked ? '???' : achievement.name }}
            </div>
            <div class="achievement-desc">
              {{ achievement.hidden && !achievement.unlocked ? 'Hidden achievement' : achievement.description }}
            </div>
            <div v-if="achievement.unlocked && achievement.unlockedAt" class="achievement-unlocked">
              Unlocked at turn {{ achievement.unlockedAt }}
            </div>
          </div>
          <div v-if="!achievement.unlocked" class="achievement-lock">🔒</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGameStore } from '@/stores/gameStore';

defineEmits(['close']);

const gameStore = useGameStore();
const selectedCategory = ref<string>('all');

const categories = ['all', 'survival', 'wealth', 'power', 'chaos', 'social', 'secrets', 'master'];

const categoryNames: Record<string, string> = {
  all: 'All',
  survival: '📅 Survival',
  wealth: '💰 Wealth',
  power: '👑 Power',
  chaos: '🌀 Chaos',
  social: '📢 Social',
  secrets: '🤫 Secrets',
  master: '⭐ Master'
};

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'all') {
    return gameStore.achievements;
  }
  return gameStore.achievements.filter(a => a.category === selectedCategory.value);
});

const unlockedCount = computed(() => 
  gameStore.achievements.filter(a => a.unlocked).length
);

const totalCount = computed(() => 
  gameStore.achievements.length
);

const progress = computed(() => 
  (unlockedCount.value / totalCount.value) * 100
);
</script>

<style scoped>
.achievements-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.achievements-modal {
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 2px solid rgba(255, 107, 53, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid rgba(255, 107, 53, 0.3);
  position: sticky;
  top: 0;
  background: #1a1a2e;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  color: #ff6b35;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.achievements-stats {
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.stat-label {
  color: #888;
}

.stat-value {
  color: #ff6b35;
  font-weight: 700;
}

.progress-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b35 0%, #f7931e 100%);
  transition: width 0.5s ease;
}

.category-tabs {
  display: flex;
  gap: 4px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  overflow-x: auto;
  flex-wrap: wrap;
}

.category-tab {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #888;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.category-tab.active {
  background: rgba(255, 107, 53, 0.2);
  border-color: rgba(255, 107, 53, 0.5);
  color: #ff6b35;
}

.category-tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.achievements-grid {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.achievement-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s;
  position: relative;
}

.achievement-card.unlocked {
  border-color: rgba(255, 107, 53, 0.5);
  background: rgba(255, 107, 53, 0.05);
}

.achievement-card.hidden {
  opacity: 0.5;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.achievement-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  filter: grayscale(100%);
  opacity: 0.3;
  transition: all 0.3s;
}

.achievement-card.unlocked .achievement-icon {
  filter: grayscale(0%);
  opacity: 1;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.achievement-desc {
  font-size: 0.8rem;
  color: #888;
  line-height: 1.4;
}

.achievement-unlocked {
  font-size: 0.7rem;
  color: #ff6b35;
  margin-top: 4px;
}

.achievement-lock {
  font-size: 1.5rem;
  opacity: 0.3;
}

.achievement-card.unlocked .achievement-lock {
  display: none;
}
</style>
