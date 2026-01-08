<template>
  <div class="juice-container">
    <div class="juice-header">
      <div class="juice-branding">
        <span class="juice-logo">🍊</span>
        <div class="juice-info">
          <span class="juice-title">The Juice</span>
          <span class="juice-handle">@TheRealJuice</span>
        </div>
      </div>
    </div>
    
    <div class="juice-feed" ref="feedRef">
      <transition-group name="juice-message" tag="div">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['juice-post', `post-${message.type}`]"
        >
          <div class="post-header">
            <div class="post-avatar">
              {{ getAvatar(message.type) }}
            </div>
            <div class="post-meta">
              <span class="post-author">{{ getAuthor(message.type) }}</span>
              <span class="post-handle">{{ getHandle(message.type) }}</span>
              <span class="post-time">· {{ formatTime(message.turn) }}</span>
            </div>
          </div>
          <div class="post-content" v-html="formatMessage(message.text)"></div>
          <div class="post-stats">
            <span class="stat-item">💬 {{ getCommentCount(message) }}</span>
            <span class="stat-item">🔁 {{ getRetweetCount(message) }}</span>
            <span class="stat-item">❤️ {{ getLikeCount(message) }}</span>
          </div>
          <!-- Replies for player posts -->
          <div v-if="message.type === 'player' && getComments(message).length > 0" class="replies-section">
            <div v-for="comment in getComments(message)" :key="comment.id" class="reply">
              <div class="reply-line"></div>
              <div class="reply-content">
                <div class="reply-header">
                  <span class="reply-avatar">{{ comment.avatar }}</span>
                  <span class="reply-author">{{ comment.author }}</span>
                  <span class="reply-meta">replying to <span class="mention">@TheOrangeOfficial</span></span>
                </div>
                <div class="reply-text">{{ comment.text }}</div>
              </div>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();
const feedRef = ref<HTMLElement | null>(null);

const messages = computed(() => {
  // Reverse to show newest first (top) so enter animations work
  return gameStore.juiceMessages.slice(0, 20).reverse();
});

function getAvatar(type: string): string {
  const avatars = {
    news: '📰',
    hint: '💡',
    rumor: '👂',
    nonsense: '🤪',
    player: '🍊'
  };
  return avatars[type as keyof typeof avatars] || '🍊';
}

function getAuthor(type: string): string {
  const authors = {
    news: 'Fruitland News',
    hint: 'Insider Tips',
    rumor: 'The Rumor Mill',
    nonsense: 'Shitposting Central',
    player: 'The Orange'
  };
  return authors[type as keyof typeof authors] || 'The Juice';
}

function getHandle(type: string): string {
  const handles = {
    news: '@FruitlandNews',
    hint: '@InsiderTips',
    rumor: '@RumorMill',
    nonsense: '@ShitpostHQ',
    player: '@TheOrangeOfficial'
  };
  return handles[type as keyof typeof handles] || '@TheJuice';
}

function formatMessage(text: string): string {
  // Add hashtags and mentions styling
  return text
    .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>')
    .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
    // Auto-detect potential hashtags from keywords
    .replace(/\b(BREAKING|TREMENDOUS|LEAKED|SCANDAL|ALERT)\b/gi, '<span class="hashtag">#$1</span>')
    .replace(/\b(Orange|Lemon|Files|Mandarin)\b/g, '<span class="highlight">$1</span>');
}

function formatTime(turn: number): string {
  const monthsAgo = gameStore.currentTurn - turn;
  if (monthsAgo === 0) return 'now';
  if (monthsAgo === 1) return '1m';
  if (monthsAgo < 60) return `${monthsAgo}m`;
  return `${Math.floor(monthsAgo / 60)}h`;
}

// Generate deterministic hash from string
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Engagement scales with time elapsed and support stat
function getEngagement(message: { id: string; turn: number; type: string }) {
  const turnsElapsed = Math.max(0, gameStore.currentTurn - message.turn);
  const support = gameStore.stats.support;
  const isPlayer = message.type === 'player';

  // Base multiplier from support (0.5x at 0 support, 2x at 100 support)
  const supportMultiplier = 0.5 + (support / 100) * 1.5;

  // Time multiplier - engagement grows over time (starts small, grows)
  // New posts start with low engagement
  const timeMultiplier = Math.min(turnsElapsed + 0.1, 10) / 10;

  // Hash for randomness but deterministic
  const hash = hashCode(message.id);

  return { turnsElapsed, supportMultiplier, timeMultiplier, hash, isPlayer };
}

function getCommentCount(message: { id: string; turn: number; type: string }): string {
  const { turnsElapsed, supportMultiplier, timeMultiplier, hash, isPlayer } = getEngagement(message);

  // Player posts get more comments
  const baseComments = isPlayer ? 5 + (hash % 20) : 1 + (hash % 10);
  const count = Math.floor(baseComments * timeMultiplier * supportMultiplier);

  if (count === 0) return '0';
  return count > 999 ? `${(count / 1000).toFixed(1)}K` : String(count);
}

function getRetweetCount(message: { id: string; turn: number; type: string }): string {
  const { turnsElapsed, supportMultiplier, timeMultiplier, hash, isPlayer } = getEngagement(message);

  const baseRetweets = isPlayer ? 10 + (hash % 50) : 2 + (hash % 20);
  const count = Math.floor(baseRetweets * timeMultiplier * supportMultiplier);

  if (count === 0) return '0';
  return count > 999 ? `${(count / 1000).toFixed(1)}K` : String(count);
}

function getLikeCount(message: { id: string; turn: number; type: string }): string {
  const { turnsElapsed, supportMultiplier, timeMultiplier, hash, isPlayer } = getEngagement(message);

  const baseLikes = isPlayer ? 20 + (hash % 100) : 5 + (hash % 30);
  const count = Math.floor(baseLikes * timeMultiplier * supportMultiplier);

  if (count === 0) return '0';
  return count > 999 ? `${(count / 1000).toFixed(1)}K` : String(count);
}

// Possible comments on player posts
const SUPPORTER_COMMENTS = [
  { avatar: '🍊', author: 'OrangeFan2024', text: 'TREMENDOUS! Best Orange ever!' },
  { avatar: '🦅', author: 'PatriotFruit', text: 'This is why we love you!' },
  { avatar: '🎯', author: 'TruthSpeaker', text: 'Finally someone tells it like it is!' },
  { avatar: '💪', author: 'StrongOrange', text: 'Keep fighting! We support you!' },
  { avatar: '🏆', author: 'WinnerMentality', text: 'The GOAT has spoken!' },
  { avatar: '⭐', author: 'FiveStarFan', text: 'Nobody does it better!' },
  { avatar: '🔥', author: 'FireOrange', text: 'BASED and orange-pilled!' },
  { avatar: '👏', author: 'ClapBack', text: 'Tell em boss!' },
];

const CRITIC_COMMENTS = [
  { avatar: '🍋', author: 'LemonLover', text: 'The files don\'t lie...' },
  { avatar: '🤡', author: 'FactChecker', text: 'This is easily disproven.' },
  { avatar: '📰', author: 'NewsWatcher', text: 'Source: trust me bro' },
  { avatar: '🙄', author: 'SkepticalSam', text: 'Here we go again...' },
  { avatar: '🧠', author: 'CriticalThinker', text: 'This makes no sense.' },
  { avatar: '😂', author: 'LaughingAtYou', text: 'You can\'t be serious' },
  { avatar: '🤦', author: 'FacePalm', text: 'Every day we stray further...' },
  { avatar: '📉', author: 'DataDriven', text: 'The numbers say otherwise.' },
];

interface Comment {
  id: string;
  avatar: string;
  author: string;
  text: string;
}

function getComments(message: { id: string; turn: number; type: string }): Comment[] {
  if (message.type !== 'player') return [];

  const turnsElapsed = gameStore.currentTurn - message.turn;
  const support = gameStore.stats.support;
  const hash = hashCode(message.id);

  // Comments only appear after 1+ turns have passed
  if (turnsElapsed < 1) return [];

  // Number of comments based on time (1-3 comments, starting after 1 turn)
  const numComments = Math.min(turnsElapsed, 3);

  const comments: Comment[] = [];
  for (let i = 0; i < numComments; i++) {
    const commentHash = hashCode(message.id + 'comment' + i);
    // More supporters if high support, more critics if low support
    const isSupportive = (commentHash % 100) < support;
    const pool = isSupportive ? SUPPORTER_COMMENTS : CRITIC_COMMENTS;
    const comment = pool[commentHash % pool.length];
    comments.push({
      id: `${message.id}-comment-${i}`,
      ...comment
    });
  }

  return comments;
}
</script>

<style scoped>
.juice-container {
  background: #000;
  border-radius: 16px;
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #2f3336;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.juice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #2f3336;
  background: #000;
}

.juice-branding {
  display: flex;
  align-items: center;
  gap: 8px;
}

.juice-logo {
  font-size: 1.2rem;
  filter: drop-shadow(0 0 6px rgba(255, 107, 53, 0.6));
}

.juice-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.juice-title {
  font-weight: 800;
  color: #fff;
  font-size: 0.8rem;
  line-height: 1;
}

.juice-handle {
  font-size: 0.65rem;
  color: #71767b;
  line-height: 1;
}

.rant-btn {
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 700;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rant-btn:hover {
  background: #f7931e;
  transform: scale(1.05);
}

.juice-feed {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #000;
  padding-bottom: 160px;
}

.juice-post {
  padding: 8px 12px;
  border-bottom: 1px solid #2f3336;
  transition: background 0.2s ease;
  cursor: pointer;
}

.juice-post:hover {
  background: rgba(255, 255, 255, 0.03);
}

.post-header {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.post-avatar {
  font-size: 1rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #16181c;
  border-radius: 50%;
  flex-shrink: 0;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
}

.post-author {
  font-weight: 700;
  color: #e7e9ea;
  font-size: 0.7rem;
}

.post-handle {
  color: #71767b;
  font-size: 0.65rem;
}

.post-time {
  color: #71767b;
  font-size: 0.65rem;
}

.post-content {
  font-size: 0.7rem;
  line-height: 1.3;
  color: #e7e9ea;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.post-content :deep(.hashtag) {
  color: #1d9bf0;
  font-weight: 500;
}

.post-content :deep(.mention) {
  color: #1d9bf0;
  font-weight: 500;
}

.post-content :deep(.highlight) {
  color: #ff6b35;
  font-weight: 600;
}

.post-stats {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 0.65rem;
  color: #71767b;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

.replies-section {
  margin-top: 8px;
  margin-left: 12px;
  padding-left: 12px;
  border-left: 2px solid #2f3336;
}

.reply {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  position: relative;
}

.reply:not(:last-child) {
  border-bottom: 1px solid rgba(47, 51, 54, 0.5);
}

.reply-line {
  position: absolute;
  left: -13px;
  top: 14px;
  width: 10px;
  height: 2px;
  background: #2f3336;
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
  flex-wrap: wrap;
}

.reply-avatar {
  font-size: 0.75rem;
}

.reply-author {
  font-size: 0.6rem;
  font-weight: 700;
  color: #e7e9ea;
}

.reply-meta {
  font-size: 0.55rem;
  color: #71767b;
}

.reply-meta .mention {
  color: #1d9bf0;
}

.reply-text {
  font-size: 0.6rem;
  color: #e7e9ea;
  line-height: 1.3;
}

.post-news {
  border-left: 2px solid #1d9bf0;
}

.post-hint {
  border-left: 2px solid #00ba7c;
}

.post-rumor {
  border-left: 2px solid #f91880;
}

.post-nonsense {
  border-left: 2px solid #ffd400;
}

.post-player {
  border-left: 2px solid #ff6b35;
  background: rgba(255, 107, 53, 0.05);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #16181c;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  border: 1px solid #2f3336;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #2f3336;
}

.modal-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.1rem;
}

.close-btn {
  background: none;
  border: none;
  color: #71767b;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.rant-input {
  width: 100%;
  min-height: 120px;
  padding: 16px;
  background: #000;
  border: none;
  color: #fff;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
}

.rant-input:focus {
  outline: none;
}

.rant-input::placeholder {
  color: #71767b;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #2f3336;
}

.char-count {
  font-size: 0.85rem;
  color: #71767b;
}

.char-count.over-limit {
  color: #f91880;
  font-weight: 700;
}

.post-btn {
  padding: 8px 20px;
  font-size: 0.9rem;
  font-weight: 700;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-btn:hover:not(:disabled) {
  background: #f7931e;
}

.post-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar styling (Twitter-like) */
.juice-feed::-webkit-scrollbar {
  width: 4px;
}

.juice-feed::-webkit-scrollbar-track {
  background: #000;
}

.juice-feed::-webkit-scrollbar-thumb {
  background: #2f3336;
  border-radius: 2px;
}

.juice-feed::-webkit-scrollbar-thumb:hover {
  background: #3e4245;
}

/* Message animations */
.juice-message-enter-active {
  animation: slideInFromTop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.juice-message-leave-active {
  position: absolute;
  animation: fadeOut 0.3s ease-out;
}

.juice-message-move {
  transition: transform 0.5s ease;
}

@keyframes slideInFromTop {
  0% {
    transform: translateY(-50px) scale(0.95);
    opacity: 0;
  }
  60% {
    transform: translateY(5px) scale(1.02);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
    max-height: 500px;
  }
  100% {
    opacity: 0;
    max-height: 0;
    transform: scale(0.95);
  }
}
</style>
