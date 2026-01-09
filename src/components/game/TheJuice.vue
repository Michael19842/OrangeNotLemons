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
      <!-- New posts notification -->
      <div v-if="unreadCount > 0" class="new-posts-badge" @click="scrollToTop">
        <span class="badge-icon">↑</span>
        <span class="badge-text">{{ unreadCount }} new</span>
      </div>
    </div>
    
    <div class="juice-feed" ref="feedRef" @scroll="handleScroll">
      <transition-group name="juice-message" tag="div">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['juice-post', `post-${message.type}`, { 'post-new': isNewPost(message) }]"
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
          
          <!-- Positive post engagement options -->
          <div v-if="message.isPositive && !message.hasBeenEngaged" class="positive-actions">
            <div class="positive-prompt">
              ✨ Great press! Choose how to engage with your supporters!
            </div>
            <div class="engagement-buttons">
              <button class="engage-btn like-btn" @click="handleLike(message)">
                ❤️ Like (+1-2 📊)
              </button>
              <button class="engage-btn comment-btn-trigger" @click="toggleComments(message)">
                💬 Comment (+3-5 📊, +2-3 👥)
              </button>
            </div>
            
            <!-- Comment options (shown after clicking comment button) -->
            <div v-if="showCommentsFor === message.id" class="comment-options">
              <div class="comment-prompt">💬 Choose your reply:</div>
              <div class="comment-selector">
                <button 
                  v-for="(comment, idx) in getRandomComments(3)" 
                  :key="idx"
                  class="comment-option" 
                  @click="handleComment(message, idx)"
                >
                  <span class="comment-number">{{ idx + 1 }}.</span>
                  <span class="comment-text">{{ comment }}</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Show selected comment -->
          <div v-if="message.isPositive && message.hasBeenEngaged && message.selectedComment" class="engaged-comment">
            <div class="orange-response">
              <span class="orange-avatar">🍊</span>
              <span class="orange-name">@TheOrangeOfficial</span> replied:
            </div>
            <div class="response-text">"{{ message.selectedComment }}"</div>
          </div>
          
          <!-- Critical post moderation options -->
          <div v-if="message.isCritical && !message.hasBeenModerated" class="moderation-actions">
            <div class="critical-warning">
              ⚠️ Critical post! Respond or face consequences in {{ 8 - (gameStore.currentTurn - message.turn) }} turns
            </div>
            <div class="moderation-buttons">
              <button class="mod-btn delete-btn" @click="handleDelete(message)">
                🗑️<br>Delete<br>(50B)
              </button>
              <button class="mod-btn ban-btn" @click="handleBan(message)">
                🔨<br>Ban<br>(200B)
              </button>
              <button class="mod-btn ignore-btn" @click="handleIgnore(message)">
                😤<br>Ignore<br>(-5💪📊❤️)
              </button>
            </div>
          </div>
          
          <!-- Mock comments if not moderated in time -->
          <div v-if="message.mockComments && message.mockComments.length > 0" class="mock-comments">
            <div class="comments-header">💬 Comments:</div>
            <div v-for="(comment, idx) in message.mockComments" :key="idx" class="mock-comment">
              {{ comment }}
            </div>
          </div>
          
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
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();
const feedRef = ref<HTMLElement | null>(null);
const unreadCount = ref(0);
const lastSeenMessageId = ref<string>('');
const isAtTop = ref(true);
const showCommentsFor = ref<string | null>(null);

const messages = computed(() => {
  // Newest first (top), keep critical messages visible
  const allMessages = [...gameStore.juiceMessages].reverse();
  const criticalMessages = allMessages.filter(m => m.isCritical && !m.hasBeenModerated);
  const otherMessages = allMessages.filter(m => !m.isCritical || m.hasBeenModerated);
  
  // Always show all critical messages + up to 30 total
  const messagesToShow = [...criticalMessages];
  const remainingSlots = 30 - criticalMessages.length;
  
  if (remainingSlots > 0) {
    messagesToShow.push(...otherMessages.slice(0, remainingSlots));
  }
  
  // Sort by turn descending (newest first) to maintain order
  return messagesToShow.sort((a, b) => b.turn - a.turn);
});

// Track new messages
watch(() => gameStore.juiceMessages.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    // Always scroll to top for new messages
    nextTick(() => {
      scrollToTop();
      // Mark newest message as seen
      if (messages.value.length > 0) {
        lastSeenMessageId.value = messages.value[0].id;
      }
    });
  }
}, { immediate: false });

// Also watch the actual messages array for changes
watch(() => gameStore.juiceMessages[0]?.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    nextTick(() => {
      scrollToTop();
    });
  }
});

function handleScroll() {
  if (!feedRef.value) return;
  isAtTop.value = feedRef.value.scrollTop < 50;
  
  if (isAtTop.value) {
    unreadCount.value = 0;
    if (messages.value.length > 0) {
      lastSeenMessageId.value = messages.value[0].id;
    }
  }
}

function scrollToTop() {
  if (feedRef.value) {
    feedRef.value.scrollTo({ top: 0, behavior: 'smooth' });
    unreadCount.value = 0;
    // Update last seen
    if (messages.value.length > 0) {
      setTimeout(() => {
        lastSeenMessageId.value = messages.value[0].id;
      }, 600); // After scroll animation
    }
  }
}

function isNewPost(message: any): boolean {
  // Mark posts as new if they were added in the last 3 seconds
  const now = Date.now();
  const messageTime = parseInt(message.id.split('-')[1]) || 0;
  return now - messageTime < 3000;
}

onMounted(() => {
  if (messages.value.length > 0) {
    lastSeenMessageId.value = messages.value[0].id;
  }
  // Initial scroll
  nextTick(() => {
    if (feedRef.value) {
      feedRef.value.scrollTop = 0;
    }
  });
  
  // Check for unmoderated critical posts every turn
  checkCriticalPosts();
});

function checkCriticalPosts() {
  const criticalPosts = messages.value.filter(m => 
    m.isCritical && 
    !m.hasBeenModerated && 
    (gameStore.currentTurn - m.turn >= 8)
  );
  
  // These will have their mock comments added by the store
}

function handleDelete(message: any) {
  gameStore.deletePost(message.id);
}

function handleBan(message: any) {
  gameStore.banUser(message.id);
}

function handleIgnore(message: any) {
  // Mark as handled but do nothing - penalties will apply
  message.hasBeenModerated = true;
  gameStore.addJuiceMessage({
    text: '🤷 The Orange chose to ignore the criticism. Bold move!',
    type: 'nonsense'
  });
}

function handleLike(message: any) {
  gameStore.likePositivePost(message.id);
  showCommentsFor.value = null;
}

function handleComment(message: any, commentIndex: number) {
  gameStore.engageWithPositivePost(message.id, commentIndex);
  showCommentsFor.value = null;
}

function toggleComments(message: any) {
  if (showCommentsFor.value === message.id) {
    showCommentsFor.value = null;
  } else {
    showCommentsFor.value = message.id;
  }
}

const displayedComments = ref<string[]>([]);

function getRandomComments(count: number): string[] {
  if (displayedComments.value.length === 0) {
    const ORANGE_SUPPORTER_COMMENTS = [
      "TREMENDOUS! Nobody does it better!",
      "BEST ORANGE EVER! So smart!",
      "This is why we LOVE you!",
      "The haters are so JEALOUS!",
      "GENIUS move! 4D chess!",
      "FAKE NEWS won't report this!",
      "GREATEST leader in history!",
      "They said it couldn't be done!",
      "SO MUCH WINNING!",
      "Absolutely PERFECT!",
      "NOBODY could do this but you!",
      "The swamp is TERRIFIED!",
      "HISTORIC! Textbook material!",
      "BRILLIANT strategy!",
      "LEGENDARY! Hall of fame!",
      "You're a HERO! We love you!",
      "Most STABLE GENIUS ever!",
      "They can't handle your SUCCESS!",
      "MFGA! Make Fruitland Great!",
      "You tell 'em boss! FACTS!",
      "Haters gonna hate! Winners WIN!",
      "BEAUTIFUL! Absolutely beautiful!",
      "Best decision EVER made!",
      "This is what we NEEDED!",
      "YUGE! Absolutely YUGE!",
      "Making promises & KEEPING them!",
      "They're not sending their best!",
      "Believe me, NOBODY better!",
      "Not tired of winning yet!",
      "The BEST is yet to come!",
      "Fantastic! Simply fantastic!",
      "No collusion! Vindication!",
      "WITCH HUNT is over! You won!",
      "Very legal! Very cool!",
      "Strong and powerful! ALPHA!",
      "They WISH they could do this!",
      "EPIC! Absolutely EPIC!",
      "More winning! Keep it coming!",
      "You're doing AMAZING!",
      "GOAT status confirmed!",
      "The people DEMANDED this!",
      "Can't stop! Won't stop!",
      "Checkmate! Never saw it coming!",
      "Mainstream media BTFO!",
      "This is the timeline we deserve!",
      "Presidential! Very presidential!",
      "Lock them up! Drain swamp!",
      "Fruitland first! Always!",
      "Build that wall! Figuratively!",
      "My president! OUR president!",
    ];
    
    // Shuffle and pick random comments
    const shuffled = [...ORANGE_SUPPORTER_COMMENTS].sort(() => Math.random() - 0.5);
    displayedComments.value = shuffled.slice(0, count);
  }
  
  return displayedComments.value;
}

function getAvatar(type: string): string {
  const avatars = {
    news: '📰',
    hint: '💡',
    rumor: '👂',
    nonsense: '🤪',
    player: '🍊',
    positive: '⭐'
  };
  return avatars[type as keyof typeof avatars] || '🍊';
}

function getAuthor(type: string): string {
  const authors = {
    news: 'Fruitland News',
    hint: 'Insider Tips',
    rumor: 'The Rumor Mill',
    nonsense: 'Shitposting Central',
    player: 'The Orange',
    positive: 'OrangeFan Network'
  };
  return authors[type as keyof typeof authors] || 'The Juice';
}

function getHandle(type: string): string {
  const handles = {
    news: '@FruitlandNews',
    hint: '@InsiderTips',
    rumor: '@RumorMill',
    nonsense: '@ShitpostHQ',
    player: '@TheOrangeOfficial',
    positive: '@OrangeFanNetwork'
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
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.juice-post:hover {
  background: rgba(255, 255, 255, 0.05);
}

.juice-post.post-new {
  background: rgba(255, 107, 53, 0.2);
  border-left: 3px solid #ff6b35;
  animation: highlight-new 3s ease-out forwards, slide-in 0.5s ease-out;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes highlight-new {
  0% {
    background: rgba(255, 107, 53, 0.4);
    box-shadow: 0 0 20px rgba(255, 107, 53, 0.6);
  }
  100% {
    background: rgba(255, 107, 53, 0.05);
    box-shadow: none;
  }
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

/* Moderation Actions */
.moderation-actions {
  margin-top: 12px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  animation: pulse-critical 2s ease-in-out infinite;
}

@keyframes pulse-critical {
  0%, 100% { border-color: rgba(239, 68, 68, 0.4); }
  50% { border-color: rgba(239, 68, 68, 0.7); }
}

.critical-warning {
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 10px;
  text-align: center;
}

.moderation-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.mod-btn {
  flex: 1;
  min-width: 85px;
  padding: 8px 10px;
  font-size: 0.7rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: normal;
  line-height: 1.2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.delete-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.ban-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.ban-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.ignore-btn {
  background: rgba(107, 114, 128, 0.3);
  color: #9ca3af;
  border: 1px solid #4b5563;
}

.ignore-btn:hover {
  background: rgba(107, 114, 128, 0.4);
}

/* Mock Comments */
.mock-comments {
  margin-top: 12px;
  padding: 10px;
  background: rgba(239, 68, 68, 0.05);
  border-left: 3px solid #ef4444;
  border-radius: 4px;
}

.comments-header {
  color: #ef4444;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.mock-comment {
  color: #e2e8f0;
  font-size: 0.8rem;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.mock-comment:last-child {
  border-bottom: none;
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

.post-positive {
  border-left: 2px solid #22c55e;
  background: rgba(34, 197, 94, 0.05);
}

/* Positive Post Engagement */
.positive-actions {
  margin-top: 12px;
  padding: 12px;
  background: rgba(34, 197, 94, 0.1);
  border: 2px solid rgba(34, 197, 94, 0.4);
  border-radius: 8px;
  animation: pulse-positive 2s ease-in-out infinite;
}

@keyframes pulse-positive {
  0%, 100% { border-color: rgba(34, 197, 94, 0.4); }
  50% { border-color: rgba(34, 197, 94, 0.7); }
}

.positive-prompt {
  color: #22c55e;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 12px;
  text-align: center;
}

.engagement-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.engagement-buttons .engage-btn {
  flex: 1;
}

.comment-options {
  border-top: 1px solid rgba(34, 197, 94, 0.3);
  padding-top: 8px;
  margin-top: 8px;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.comment-prompt {
  color: #22c55e;
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.comment-selector {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comment-option {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 0.65rem;
  color: #e2e8f0;
}

.comment-option:hover {
  background: rgba(34, 197, 94, 0.2);
  border-color: #22c55e;
  transform: translateX(4px);
}

.comment-number {
  color: #22c55e;
  font-weight: bold;
  font-size: 0.7rem;
  min-width: 16px;
}

.comment-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

.comment-bonus {
  color: #888;
  font-size: 0.6rem;
  white-space: nowrap;
  margin-left: auto;
}

.engage-btn {
  flex: 1;
  padding: 8px 10px;
  font-size: 0.7rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  text-align: center;
  min-height: 36px;
}

.like-btn {
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
  border: 2px solid rgba(255, 107, 53, 0.4);
  font-weight: 700;
}

.like-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  border-color: #ff6b35;
  background: rgba(255, 107, 53, 0.2);
}

.comment-btn-trigger {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: 2px solid rgba(34, 197, 94, 0.4);
  font-weight: 700;
}

.comment-btn-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  border-color: #22c55e;
}

.comment-selector {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.engaged-comment {
  margin-top: 8px;
  padding: 10px 12px;
  background: rgba(255, 107, 53, 0.08);
  border-left: 3px solid rgba(255, 107, 53, 0.4);
  border-radius: 4px;
}

.orange-response {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 0.7rem;
  color: #9ca3af;
}

.orange-avatar {
  font-size: 0.85rem;
}

.orange-name {
  color: #ff6b35;
  font-weight: 600;
  font-size: 0.7rem;
}

.response-text {
  color: #d1d5db;
  font-size: 0.8rem;
  font-weight: 500;
  font-style: normal;
  line-height: 1.4;
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
