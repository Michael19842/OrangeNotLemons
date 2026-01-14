export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'survival' | 'wealth' | 'power' | 'chaos' | 'social' | 'master' | 'secrets';
  unlocked: boolean;
  unlockedAt?: number; // turn number
  hidden?: boolean; // Don't show until unlocked
  condition: (gameState: any) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Survival Achievements (now based on quarters - 4 per year, 16 per term)
  {
    id: 'first_blood',
    name: 'First Year',
    emoji: '🩸',
    description: 'Survive your first year (4 quarters)',
    category: 'survival',
    unlocked: false,
    condition: (state) => state.currentTurn > 4
  },
  {
    id: 'quarter_term',
    name: 'Still Standing',
    emoji: '📅',
    description: 'Survive 2 years (8 quarters)',
    category: 'survival',
    unlocked: false,
    condition: (state) => state.currentTurn >= 8
  },
  {
    id: 'half_term',
    name: 'Halfway There',
    emoji: '⏱️',
    description: 'Survive 3 years (12 quarters)',
    category: 'survival',
    unlocked: false,
    condition: (state) => state.currentTurn >= 12
  },
  {
    id: 'full_term',
    name: 'Term Survivor',
    emoji: '🎖️',
    description: 'Complete a full 4-year term (16 quarters)',
    category: 'survival',
    unlocked: false,
    condition: (state) => state.currentTurn >= 16
  },
  {
    id: 'second_term',
    name: 'Four More Years!',
    emoji: '🏆',
    description: 'Win a second term',
    category: 'survival',
    unlocked: false,
    condition: (state) => state.term === 2
  },
  {
    id: 'immortal',
    name: 'The Eternal Orange',
    emoji: '👑',
    description: 'Complete both terms (32 quarters / 8 years)',
    category: 'master',
    unlocked: false,
    condition: (state) => state.currentTurn >= 32
  },

  // Wealth Achievements
  {
    id: 'first_billion',
    name: 'Billionaire Status',
    emoji: '💰',
    description: 'Accumulate 1000M in wealth',
    category: 'wealth',
    unlocked: false,
    condition: (state) => state.stats.money >= 1000
  },
  {
    id: 'trillionaire',
    name: 'Trillionaire',
    emoji: '💎',
    description: 'Accumulate 10,000M+ in wealth',
    category: 'wealth',
    unlocked: false,
    condition: (state) => state.stats.money >= 10000
  },
  {
    id: 'broke_af',
    name: 'Bankrupt Orange',
    emoji: '💸',
    description: 'Accumulate 1000M+ in debt',
    category: 'wealth',
    unlocked: false,
    condition: (state) => state.debt >= 1000
  },
  {
    id: 'crypto_king',
    name: 'OrangeCoin Mogul',
    emoji: '🪙',
    description: 'Reach 150% coin valuation',
    category: 'wealth',
    unlocked: false,
    condition: (state) => state.stats.coinValuation >= 150
  },
  {
    id: 'crypto_crash',
    name: 'Rug Pull Master',
    emoji: '📉',
    description: 'Drop coin valuation to 50%',
    category: 'wealth',
    unlocked: false,
    condition: (state) => state.stats.coinValuation <= 50
  },

  // Power Achievements
  {
    id: 'cult_leader',
    name: 'Cult of Personality',
    emoji: '🙏',
    description: 'Reach 100% loyalty',
    category: 'power',
    unlocked: false,
    condition: (state) => state.stats.loyalty >= 100
  },
  {
    id: 'popular',
    name: 'People\'s Orange',
    emoji: '⭐',
    description: 'Reach 90%+ support',
    category: 'power',
    unlocked: false,
    condition: (state) => state.stats.support >= 90
  },
  {
    id: 'dictator',
    name: 'Orange Dictator',
    emoji: '👮',
    description: 'Have 90%+ loyalty with 30%- support',
    category: 'power',
    unlocked: false,
    condition: (state) => state.stats.loyalty >= 90 && state.stats.support <= 30
  },
  {
    id: 'cancelled',
    name: 'Cancelled',
    emoji: '🚫',
    description: 'Drop support below 10%',
    category: 'power',
    unlocked: false,
    condition: (state) => state.stats.support < 10
  },

  // Chaos Achievements
  {
    id: 'agent_chaos',
    name: 'Agent of Chaos',
    emoji: '🌀',
    description: 'Reach 100% chaos',
    category: 'chaos',
    unlocked: false,
    condition: (state) => state.stats.chaos >= 100
  },
  {
    id: 'stable_genius',
    name: 'Stable Genius',
    emoji: '🧠',
    description: 'Keep chaos below 20% for 8 quarters (2 years)',
    category: 'chaos',
    unlocked: false,
    hidden: true,
    condition: (state) => {
      return state.lowChaosStreak >= 8;
    }
  },
  {
    id: 'lucky_orange',
    name: 'Lady Luck',
    emoji: '🍀',
    description: 'Reach 100% luck',
    category: 'chaos',
    unlocked: false,
    condition: (state) => state.stats.luck >= 100
  },
  {
    id: 'unlucky',
    name: 'Murphy\'s Orange',
    emoji: '💀',
    description: 'Survive with 0% luck for 4 quarters (1 year)',
    category: 'chaos',
    unlocked: false,
    hidden: true,
    condition: (state) => state.zeroLuckStreak >= 4
  },

  // Social Media Achievements
  {
    id: 'rant_master',
    name: 'Rant King',
    emoji: '📢',
    description: 'Post 25 rants',
    category: 'social',
    unlocked: false,
    condition: (state) => state.rantsPosted >= 25
  },
  {
    id: 'viral_sensation',
    name: 'Viral Sensation',
    emoji: '🔥',
    description: 'Have 5 rants go viral',
    category: 'social',
    unlocked: false,
    hidden: true,
    condition: (state) => state.viralRants >= 5
  },
  {
    id: 'censor',
    name: 'The Censor',
    emoji: '🗑️',
    description: 'Delete 10 critical posts',
    category: 'social',
    unlocked: false,
    condition: (state) => state.postsDeleted >= 10
  },
  {
    id: 'ban_hammer',
    name: 'Ban Hammer',
    emoji: '🔨',
    description: 'Ban 5 users',
    category: 'social',
    unlocked: false,
    condition: (state) => state.usersBanned >= 5
  },
  {
    id: 'thin_skinned',
    name: 'Thin Skinned',
    emoji: '🤡',
    description: 'Let 10 critical posts go unmoderated',
    category: 'social',
    unlocked: false,
    condition: (state) => state.criticalPostsIgnored >= 10
  },

  // Secrets & Special
  {
    id: 'slot_jackpot',
    name: 'Jackpot!',
    emoji: '🎰',
    description: 'Hit 3 slot machine jackpots',
    category: 'secrets',
    unlocked: false,
    condition: (state) => state.jackpotsHit >= 3
  },
  {
    id: 'blind_faith',
    name: 'Blind Faith',
    emoji: '👁️‍🗨️',
    description: 'Win using blind play 10 times',
    category: 'secrets',
    unlocked: false,
    condition: (state) => state.blindPlaysWon >= 10
  },
  {
    id: 'hoarder',
    name: 'Plan Hoarder',
    emoji: '🃏',
    description: 'Fully investigate 15 different plans',
    category: 'secrets',
    unlocked: false,
    hidden: true,
    condition: (state) => state.plansFullyInvestigated >= 15
  },
  {
    id: 'skip_master',
    name: 'Professional Skipper',
    emoji: '⏭️',
    description: 'Skip 8 quarters (go golfing)',
    category: 'secrets',
    unlocked: false,
    condition: (state) => state.turnsSkipped >= 8
  },

  // Master Achievements
  {
    id: 'perfect_health',
    name: 'Peak Performance',
    emoji: '💪',
    description: 'Complete first term with 100% health',
    category: 'master',
    unlocked: false,
    condition: (state) => state.currentTurn >= 16 && state.stats.health >= 100
  },
  {
    id: 'no_debt',
    name: 'Debt Free',
    emoji: '🏦',
    description: 'Complete first term with positive money',
    category: 'master',
    unlocked: false,
    condition: (state) => state.currentTurn >= 16 && state.stats.money > 0
  },
  {
    id: 'high_score',
    name: 'Score Legend',
    emoji: '🌟',
    description: 'Achieve 5,000+ points',
    category: 'master',
    unlocked: false,
    condition: (state) => state.currentScore >= 5000
  },
  {
    id: 'speedrunner',
    name: 'Speedrun Victory',
    emoji: '⚡',
    description: 'Win second term with 95%+ loyalty',
    category: 'master',
    unlocked: false,
    hidden: true,
    condition: (state) => state.term === 2 && state.stats.loyalty >= 95
  }
];
