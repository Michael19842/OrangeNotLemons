<template>
  <transition name="achievement-toast">
    <div v-if="achievement" class="achievement-toast" @click="$emit('dismiss')">
      <div class="toast-icon">{{ achievement.emoji }}</div>
      <div class="toast-content">
        <div class="toast-title">Achievement Unlocked!</div>
        <div class="toast-achievement">{{ achievement.name }}</div>
        <div class="toast-desc">{{ achievement.description }}</div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { Achievement } from '@/types/achievements';

defineProps<{
  achievement: Achievement | null;
}>();

defineEmits(['dismiss']);
</script>

<style scoped>
.achievement-toast {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 2000;
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
  border: 2px solid rgba(255, 107, 53, 0.5);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 107, 53, 0.3);
  cursor: pointer;
  animation: shake 0.5s ease;
  max-width: 350px;
}

@keyframes shake {
  0%, 100% { transform: translateX(0) scale(1); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) scale(1.02); }
  20%, 40%, 60%, 80% { transform: translateX(5px) scale(1.02); }
}

.toast-icon {
  font-size: 3rem;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.toast-content {
  flex: 1;
}

.toast-title {
  color: #ff6b35;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.toast-achievement {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.toast-desc {
  color: #888;
  font-size: 0.85rem;
  line-height: 1.3;
}

/* Transition */
.achievement-toast-enter-active,
.achievement-toast-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.achievement-toast-enter-from {
  transform: translateX(400px) rotate(20deg);
  opacity: 0;
}

.achievement-toast-leave-to {
  transform: translateY(-100px);
  opacity: 0;
}
</style>
