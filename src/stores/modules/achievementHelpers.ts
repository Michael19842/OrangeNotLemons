import type { Ref } from 'vue';
import type { Achievement } from '@/types/achievements';
import type { JuiceMessage } from '@/types/game';

export interface AchievementContext {
  currentTurn: Ref<number>;
  term: Ref<1 | 2>;
  stats: Ref<any>;
  debt: Ref<number>;
  currentScore: Ref<number>;
  juiceMessages: Ref<JuiceMessage[]>;
  achievements: Ref<Achievement[]>;
  newlyUnlockedAchievements: Ref<Achievement[]>;
  achievementTracking: Ref<any>;
  addJuiceMessage: (msg: Omit<JuiceMessage, 'id' | 'turn'>) => void;
}

export function checkAchievements(context: AchievementContext): void {
  const gameState = {
    currentTurn: context.currentTurn.value,
    term: context.term.value,
    stats: context.stats.value,
    debt: context.debt.value,
    currentScore: context.currentScore.value,
    juiceMessages: context.juiceMessages.value,
    ...context.achievementTracking.value
  };

  context.achievements.value.forEach(achievement => {
    if (!achievement.unlocked && achievement.condition(gameState)) {
      achievement.unlocked = true;
      achievement.unlockedAt = context.currentTurn.value;
      context.newlyUnlockedAchievements.value.push({ ...achievement });
      
      context.addJuiceMessage({
        text: `🏆 Achievement Unlocked: ${achievement.emoji} ${achievement.name}! ${achievement.description}`,
        type: 'news'
      });
    }
  });
}

export function dismissAchievement(achievementId: string, context: AchievementContext): void {
  const index = context.newlyUnlockedAchievements.value.findIndex(a => a.id === achievementId);
  if (index !== -1) {
    context.newlyUnlockedAchievements.value.splice(index, 1);
  }
}
