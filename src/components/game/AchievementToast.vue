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
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.95) 0%, rgba(255, 80, 20, 0.95) 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 
    0 12px 40px rgba(255, 107, 53, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  cursor: pointer;
  max-width: 360px;
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}

.achievement-toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ffd700, #ffed4e, #ffd700);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.toast-icon {
  font-size: 3.5rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(-5deg); }
  75% { transform: translateY(-8px) rotate(5deg); }
}

.toast-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toast-title {
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.toast-achievement {
  color: white;
  font-size: 1.25rem;
  font-weight: 900;
  line-height: 1.2;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.toast-desc {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Transition */
.achievement-toast-enter-active {
  animation: slideInBounce 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.achievement-toast-leave-active {
  animation: slideOutUp 0.4s ease-in;
}

@keyframes slideInBounce {
  0% {
    transform: translateX(500px) scale(0.8) rotate(10deg);
    opacity: 0;
  }
  60% {
    transform: translateX(-20px) scale(1.05) rotate(-2deg);
    opacity: 1;
  }
  100% {
    transform: translateX(0) scale(1) rotate(0);
    opacity: 1;
  }
}

@keyframes slideOutUp {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-120px) scale(0.8);
    opacity: 0;
  }
}

/* Mobile responsive */
@media (max-width: 480px) {
  .achievement-toast {
    right: 12px;
    left: 12px;
    max-width: calc(100vw - 24px);
  }
}
</style>
