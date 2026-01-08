<template>
  <Teleport to="body">
    <div class="stat-changes">
      <transition-group name="stat-pop">
        <div 
          v-for="change in changes" 
          :key="change.id"
          class="stat-change"
          :class="{ positive: change.value > 0, negative: change.value < 0 }"
        >
          <span class="change-icon">{{ change.icon }}</span>
          <span class="change-value">{{ change.value > 0 ? '+' : '' }}{{ change.value }}</span>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();
const changes = computed(() => gameStore.statChangeNotifications);
</script>

<style scoped>
.stat-changes {
  position: fixed;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
}

.stat-change.positive {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.stat-change.negative {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.change-icon {
  font-size: 1.2rem;
}

.change-value {
  font-size: 1rem;
}

/* Animations */
.stat-pop-enter-active {
  animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.stat-pop-leave-active {
  animation: popOut 0.3s ease-out;
}

@keyframes popIn {
  0% {
    transform: translateY(-20px) scale(0.5);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes popOut {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-20px) scale(0.8);
    opacity: 0;
  }
}
</style>
