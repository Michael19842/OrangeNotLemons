import type { Ref } from 'vue';
import type { GameStats, JuiceMessage } from '@/types/game';
import { CRITICAL_MESSAGES, POSITIVE_MESSAGES, ORANGE_COMMENTS } from './messages';

export interface JuiceContext {
  juiceMessages: Ref<JuiceMessage[]>;
  stats: Ref<GameStats>;
  currentTurn: Ref<number>;
  interestRate: Ref<number>;
  achievementTracking: Ref<any>;
  addJuiceMessage: (msg: Omit<JuiceMessage, 'id' | 'turn'>) => void;
  showStatChange: (icon: string, value: number) => void;
  checkAchievements: () => void;
}

export function createJuiceMessage(
  msg: Omit<JuiceMessage, 'id' | 'turn'>,
  currentTurn: number
): JuiceMessage {
  const message: JuiceMessage = {
    ...msg,
    id: `juice-${Date.now()}-${Math.random()}`,
    turn: currentTurn
  };
  
  // 10% chance for critical post (only news/rumor)
  if ((msg.type === 'news' || msg.type === 'rumor') && Math.random() < 0.1) {
    message.text = CRITICAL_MESSAGES[Math.floor(Math.random() * CRITICAL_MESSAGES.length)];
    message.isCritical = true;
    message.hasBeenModerated = false;
    message.type = 'news';
  }
  
  // 8% chance for positive post that can be engaged with
  if ((msg.type === 'news' || msg.type === 'nonsense') && Math.random() < 0.08) {
    message.text = POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];
    message.isPositive = true;
    message.hasBeenEngaged = false;
    message.type = 'positive';
  }
  
  return message;
}

export function deletePost(messageId: string, context: JuiceContext): boolean {
  const DELETE_COST = 50;
  const hadMoney = context.stats.value.money >= 0;
  
  context.stats.value.money -= DELETE_COST;
  context.showStatChange('💰', -DELETE_COST);
  
  if (context.stats.value.money < 0) {
    context.interestRate.value = Math.min(0.25, context.interestRate.value + 0.02);
    if (hadMoney) {
      context.addJuiceMessage({
        text: `💸 Went into debt to delete post! Interest rate increased to ${(context.interestRate.value * 100).toFixed(1)}%! #Borrowing #Debt`,
        type: 'news'
      });
    } else {
      context.addJuiceMessage({
        text: `💸 Borrowed more to delete post! Interest rate now ${(context.interestRate.value * 100).toFixed(1)}%! #DebtSpiral`,
        type: 'news'
      });
    }
  }
  
  context.stats.value.loyalty = Math.max(0, context.stats.value.loyalty - 3);
  context.showStatChange('👥', -3);
  context.achievementTracking.value.postsDeleted++;
  
  const index = context.juiceMessages.value.findIndex(m => m.id === messageId);
  if (index !== -1) {
    context.juiceMessages.value[index].hasBeenModerated = true;
    context.juiceMessages.value.splice(index, 1);
  }
  
  context.addJuiceMessage({
    text: '🚫 [This post has been deleted by The Orange]',
    type: 'nonsense'
  });
  
  context.checkAchievements();
  return true;
}

export function banUser(messageId: string, context: JuiceContext): boolean {
  const BAN_COST = 200;
  const hadMoney = context.stats.value.money >= 0;
  
  context.stats.value.money -= BAN_COST;
  context.showStatChange('💰', -BAN_COST);
  
  if (context.stats.value.money < 0) {
    context.interestRate.value = Math.min(0.25, context.interestRate.value + 0.02);
    if (hadMoney) {
      context.addJuiceMessage({
        text: `💸 Borrowed money to ban user! Interest rate now ${(context.interestRate.value * 100).toFixed(1)}%! #DeepDebt #Desperate`,
        type: 'news'
      });
    } else {
      context.addJuiceMessage({
        text: `💸 Borrowed even MORE to ban! Interest rate ${(context.interestRate.value * 100).toFixed(1)}%! #DebtMounting`,
        type: 'news'
      });
    }
  }
  
  context.stats.value.loyalty = Math.max(0, context.stats.value.loyalty - 5);
  context.stats.value.chaos = Math.min(100, context.stats.value.chaos + 10);
  context.showStatChange('👥', -5);
  context.showStatChange('🌀', 10);
  context.achievementTracking.value.usersBanned++;
  
  const index = context.juiceMessages.value.findIndex(m => m.id === messageId);
  if (index !== -1) {
    context.juiceMessages.value[index].hasBeenModerated = true;
    context.juiceMessages.value.splice(index, 1);
  }
  
  context.addJuiceMessage({
    text: '🔨 [User has been permanently banned by The Orange]',
    type: 'nonsense'
  });
  
  context.checkAchievements();
  return true;
}

export function addMockCommentsToPost(messageId: string, context: JuiceContext): void {
  const message = context.juiceMessages.value.find(m => m.id === messageId);
  if (!message || message.hasBeenModerated) return;
  
  context.achievementTracking.value.criticalPostsIgnored++;
  
  const mockComments = [
    '😂 LMAOOO he can\'t handle the truth!',
    '🤡 Thin-skinned much? Pathetic.',
    '📉 Watching this trainwreck in real time',
    '🍋 Leak the files already! #LemonFiles',
    '💀 This is literally embarrassing',
    '🔥 The cope is STRONG with this one',
    '🎪 What a complete clown show',
    '👎 Worst leader ever, no cap',
    '🚨 Impeach this fraud NOW',
    '💩 Everything he touches turns to garbage',
    '🤦 How did we let this happen?',
    '⚰️ Career suicide in real time',
    '🗑️ Belongs in the trash',
    '🤮 Makes me sick watching this',
    '🌋 This is a DISASTER',
    '😬 Cringe level: MAXIMUM',
    '🎭 The lies are unbelievable',
    '💸 Corruption at its finest',
    '🐍 Snake oil salesman vibes',
    '🔊 THE TRUTH HURTS DOESN\'T IT?',
    '📰 History will NOT be kind',
    '⚡ Watching the meltdown live',
    '🎯 Called it. Total fraud.',
    '🌊 Blue wave incoming!',
    '👊 Time to fight back!',
    '🗳️ VOTE HIM OUT',
    '📣 Share this everywhere!',
    '💪 We won\'t be silenced!',
    '🔔 Wake up people!',
    '🧠 Zero brain cells detected'
  ];
  
  const commentCount = 3 + Math.floor(Math.random() * 3);
  message.mockComments = [];
  
  for (let i = 0; i < commentCount; i++) {
    const delay = 500 + Math.random() * 1000;
    
    setTimeout(() => {
      if (message.hasBeenModerated) return;
      
      const availableComments = mockComments.filter(c => !message.mockComments?.includes(c));
      if (availableComments.length > 0) {
        const randomComment = availableComments[Math.floor(Math.random() * availableComments.length)];
        if (!message.mockComments) message.mockComments = [];
        message.mockComments.push(randomComment);
      }
    }, delay * (i + 1));
  }

  setTimeout(() => {
    if (message.hasBeenModerated || (context.currentTurn.value - message.turn < 8)) return;
    
    context.stats.value.loyalty = Math.max(0, context.stats.value.loyalty - 5);
    context.stats.value.support = Math.max(0, context.stats.value.support - 5);
    context.stats.value.health = Math.max(0, context.stats.value.health - 5);
    
    context.showStatChange('👥', -5);
    context.showStatChange('📊', -5);
    context.showStatChange('❤️', -5);
    
    context.addJuiceMessage({
      text: `💥 @TheOrangeOfficial ignored critical scandal! Loyalty, support, AND health all tanking! #Consequences`,
      type: 'news'
    });
  }, 100);
}

export function engageWithPositivePost(
  messageId: string,
  commentIndex: number,
  context: JuiceContext
): boolean {
  const message = context.juiceMessages.value.find(m => m.id === messageId);
  if (!message || message.hasBeenEngaged || !message.isPositive) return false;
  
  const comment = ORANGE_COMMENTS[commentIndex];
  message.hasBeenEngaged = true;
  message.selectedComment = comment;
  
  const supportGain = 3 + Math.floor(Math.random() * 3);
  const loyaltyGain = 2 + Math.floor(Math.random() * 2);
  
  context.stats.value.support = Math.min(100, context.stats.value.support + supportGain);
  context.stats.value.loyalty = Math.min(100, context.stats.value.loyalty + loyaltyGain);
  
  context.showStatChange('📊', supportGain);
  context.showStatChange('👥', loyaltyGain);
  
  context.addJuiceMessage({
    text: `🎉 @TheOrangeOfficial ENGAGES with supporters! "${comment}" Fanbase ENERGIZED! #WinningBigly`,
    type: 'nonsense'
  });
  
  context.checkAchievements();
  return true;
}

export function likePositivePost(messageId: string, context: JuiceContext): boolean {
  const message = context.juiceMessages.value.find(m => m.id === messageId);
  if (!message || message.hasBeenEngaged || !message.isPositive) return false;
  
  message.hasBeenEngaged = true;
  
  const supportGain = 1 + Math.floor(Math.random() * 2);
  context.stats.value.support = Math.min(100, context.stats.value.support + supportGain);
  context.showStatChange('📊', supportGain);
  
  context.addJuiceMessage({
    text: `❤️ @TheOrangeOfficial likes a post praising him! Fans go WILD! #SelfLove`,
    type: 'nonsense'
  });
  
  context.checkAchievements();
  return true;
}
