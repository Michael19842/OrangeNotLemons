import type { PlanCard } from '@/types/game';
import { ECONOMY_PLANS } from './economy';
import { POLITICS_PLANS } from './politics';
import { FOREIGN_PLANS } from './foreign';
import { MEDIA_PLANS } from './media';
import { PERSONAL_PLANS } from './personal';

export const ALL_PLANS: PlanCard[] = [
  ...ECONOMY_PLANS,
  ...POLITICS_PLANS,
  ...FOREIGN_PLANS,
  ...MEDIA_PLANS,
  ...PERSONAL_PLANS,
];

export function getRandomPlans(count: number): PlanCard[] {
  const shuffled = [...ALL_PLANS]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  // Reset revealed properties for fresh cards
  return shuffled.map(plan => ({
    ...plan,
    revealed: []
  }));
}

// Re-export individual category arrays for convenience
export { ECONOMY_PLANS, POLITICS_PLANS, FOREIGN_PLANS, MEDIA_PLANS, PERSONAL_PLANS };
