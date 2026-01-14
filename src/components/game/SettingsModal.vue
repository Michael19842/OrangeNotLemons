<template>
  <div class="settings-modal-overlay" @click="$emit('close')">
    <div class="settings-modal" @click.stop>
      <div class="modal-header">
        <h2>⚙️ Settings</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      
      <div class="settings-content">
        <!-- Audio Settings -->
        <div class="setting-section">
          <h3 class="section-title">🔊 Audio</h3>
          
          <div class="setting-item">
            <label class="setting-label">
              <span class="label-text">Background Music</span>
              <span class="label-value">{{ Math.round(bgmVolume * 100) }}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              :value="bgmVolume * 100"
              @input="handleBgmChange"
              class="volume-slider"
            />
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <span class="label-text">Sound Effects</span>
              <span class="label-value">{{ Math.round(sfxVolume * 100) }}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              :value="sfxVolume * 100"
              @input="handleSfxChange"
              class="volume-slider"
            />
          </div>
          
          <div class="setting-item">
            <button class="test-btn" @click="testSound">
              🔔 Test Sound
            </button>
          </div>
        </div>
        
        <!-- Game Settings -->
        <div class="setting-section">
          <h3 class="section-title">🎮 Gameplay</h3>

          <div class="setting-item">
            <label class="setting-label">
              <span class="label-text">Turn Timer</span>
              <span class="label-value">{{ turnDurationDisplay }}</span>
            </label>
            <input
              type="range"
              min="0"
              max="180"
              step="15"
              :value="turnDuration"
              @input="handleTimerChange"
              class="volume-slider"
            />
            <div class="timer-presets">
              <button
                class="preset-btn"
                :class="{ active: turnDuration === 0 }"
                @click="setTurnDuration(0)"
              >
                ∞
              </button>
              <button
                class="preset-btn"
                :class="{ active: turnDuration === 60 }"
                @click="setTurnDuration(60)"
              >
                60s
              </button>
              <button
                class="preset-btn"
                :class="{ active: turnDuration === 90 }"
                @click="setTurnDuration(90)"
              >
                90s
              </button>
              <button
                class="preset-btn"
                :class="{ active: turnDuration === 120 }"
                @click="setTurnDuration(120)"
              >
                120s
              </button>
            </div>
          </div>
        </div>
        
        <!-- About -->
        <div class="setting-section about-section">
          <h3 class="section-title">ℹ️ About</h3>
          <p class="about-text">
            <strong>Orange Not Lemons</strong><br>
            A satirical simulation game<br>
            Version 1.0.0<br><br>
            Made with 🍊 and Vue 3
          </p>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="reset-btn" @click="resetSettings">
          🔄 Reset to Defaults
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

defineEmits(['close']);

const bgmVolume = ref(0.5);
const sfxVolume = ref(0.7);
const turnDuration = ref(90); // Default 90 seconds

// Display text for turn duration
const turnDurationDisplay = computed(() => {
  if (turnDuration.value === 0) return 'Unlimited';
  return `${turnDuration.value}s`;
});

onMounted(() => {
  loadSettings();
});

function loadSettings() {
  const saved = localStorage.getItem('gameSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    bgmVolume.value = settings.bgmVolume ?? 0.5;
    sfxVolume.value = settings.sfxVolume ?? 0.7;
    turnDuration.value = settings.turnDuration ?? 90;
  }
}

function setTurnDuration(duration: number) {
  turnDuration.value = duration;
  saveSettings();
}

function saveSettings() {
  const settings = {
    bgmVolume: bgmVolume.value,
    sfxVolume: sfxVolume.value,
    turnDuration: turnDuration.value
  };
  localStorage.setItem('gameSettings', JSON.stringify(settings));
  
  // Dispatch event for game to pick up changes
  window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
}

function handleBgmChange(e: Event) {
  const target = e.target as HTMLInputElement;
  bgmVolume.value = parseInt(target.value) / 100;
  saveSettings();
}

function handleSfxChange(e: Event) {
  const target = e.target as HTMLInputElement;
  sfxVolume.value = parseInt(target.value) / 100;
  saveSettings();
}

function handleTimerChange(e: Event) {
  const target = e.target as HTMLInputElement;
  turnDuration.value = parseInt(target.value);
  saveSettings();
}

function testSound() {
  // Play a test notification sound
  const audio = new Audio('/audio/notification.mp3');
  audio.volume = sfxVolume.value;
  audio.play().catch(() => {
    console.log('Could not play test sound');
  });
}

function resetSettings() {
  bgmVolume.value = 0.5;
  sfxVolume.value = 0.7;
  turnDuration.value = 90;
  saveSettings();
}
</script>

<style scoped>
.settings-modal-overlay {
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

.settings-modal {
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
  border-radius: 16px;
  max-width: 500px;
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

.settings-content {
  padding: 20px;
  flex: 1;
}

.setting-section {
  margin-bottom: 30px;
}

.section-title {
  color: #ff6b35;
  font-size: 1.1rem;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 107, 53, 0.3);
}

.setting-item {
  margin-bottom: 20px;
}

.setting-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: white;
}

.label-text {
  font-size: 0.95rem;
  font-weight: 600;
}

.label-value {
  color: #ff6b35;
  font-weight: 700;
  font-size: 0.9rem;
}

.volume-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  -webkit-appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.5);
  transition: all 0.2s;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.7);
}

.volume-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.5);
  transition: all 0.2s;
}

.volume-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.7);
}

.test-btn {
  width: 100%;
  padding: 12px;
  background: rgba(59, 130, 246, 0.2);
  border: 2px solid rgba(59, 130, 246, 0.4);
  border-radius: 8px;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.test-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.6);
  transform: translateY(-2px);
}

.about-section {
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 8px;
}

.about-text {
  color: #888;
  font-size: 0.85rem;
  line-height: 1.6;
  margin: 0;
  text-align: center;
}

.about-text strong {
  color: #ff6b35;
  font-size: 1rem;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.reset-btn {
  width: 100%;
  padding: 12px;
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  color: #ef4444;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.6);
  transform: translateY(-2px);
}

/* Timer presets */
.timer-presets {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.preset-btn {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #888;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  background: rgba(255, 107, 53, 0.1);
  border-color: rgba(255, 107, 53, 0.4);
  color: #ff6b35;
}

.preset-btn.active {
  background: rgba(255, 107, 53, 0.2);
  border-color: #ff6b35;
  color: #ff6b35;
}
</style>
