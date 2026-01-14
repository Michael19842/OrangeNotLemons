<template>
  <Teleport to="body">
    <div class="stat-notifications">
      <transition-group name="notification">
        <div 
          v-for="change in changes" 
          :key="change.id"
          class="stat-notification"
          :class="{ positive: change.value > 0, negative: change.value < 0 }"
        >
          <div class="notification-icon">{{ change.icon }}</div>
          <div class="notification-content">
            <span class="notification-label">{{ getStatLabel(change.icon) }}</span>
            <span class="notification-value">{{ change.value > 0 ? '+' : '' }}{{ change.value }}</span>
          </div>
          <div class="notification-indicator" :class="{ up: change.value > 0, down: change.value < 0 }">
            {{ change.value > 0 ? '▲' : '▼' }}
          </div>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();
const changes = computed(() => gameStore.statChangeNotifications);

// Debug: log when changes update
watch(changes, (newChanges) => {
  console.log('📊 StatChangePopover - changes updated:', newChanges);
}, { deep: true });

function getStatLabel(icon: string): string {
  const labels: Record<string, string> = {
    '❤️': 'Health',
    '💰': 'Money',
    '👥': 'Loyalty',
    '📊': 'Support',
    '🍀': 'Luck',
    '🌀': 'Chaos',
    '🪙': 'Coin Value'
  };
  return labels[icon] || 'Stat';
}
</script>

<style scoped>
.stat-notifications {
  position: fixed;
  top: 80px;
  right: 16px;
  z-index: 5000;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
  max-width: 320px;
}

.stat-notification {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 200px;
  position: relative;
  overflow: hidden;
}

.stat-notification::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: currentColor;
}

.stat-notification.positive {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%);
  color: white;
}

.stat-notification.negative {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%);
  color: white;
}

.notification-icon {
  font-size: 28px;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notification-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
  font-weight: 700;
}

.notification-value {
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.notification-indicator {
  font-size: 16px;
  font-weight: 900;
  opacity: 0.8;
}

.notification-indicator.up {
  animation: bounce-up 0.6s ease-out;
}

.notification-indicator.down {
  animation: bounce-down 0.6s ease-out;
}

/* Animations */
.notification-enter-active {
  animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.notification-leave-active {
  animation: slideOutRight 0.3s ease-in;
}

@keyframes slideInRight {
  0% {
    transform: translateX(120%) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateX(120%) scale(0.8);
    opacity: 0;
  }
}

@keyframes bounce-up {
  0%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
  60% { transform: translateY(-2px); }
}

@keyframes bounce-down {
  0%, 100% { transform: translateY(0); }
  30% { transform: translateY(4px); }
  60% { transform: translateY(2px); }
}

/* Mobile responsive */
@media (max-width: 480px) {
  .stat-notifications {
    right: 12px;
    max-width: calc(100vw - 24px);
  }
  
  .stat-notification {
    min-width: 180px;
  }
}
</style>
