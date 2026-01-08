// Game Types for Orange Not Lemons

export interface GameStats {
  health: number;        // 0-100, 0 = dead
  money: number;         // In billions, can go negative (debt with interest)
  loyalty: number;       // 0-100, 0 = Lemon Files leak
  support: number;       // 0-100, public support for plans
  luck: number;          // 0-100, affects slot machine
  chaos: number;         // 0-100, enables second term at lower loyalty but causes problems
  coinValuation: number; // 50-150, affects costs and interest (100 = normal)
  freeBots: number;      // Free rant bots, given periodically
}

// Historical data point for charts
export interface FinancialSnapshot {
  turn: number;
  money: number;
  debt: number;
  coinValuation: number;
  chaos: number;
  interestRate: number;
  loyalty: number;
  support: number;
}

export interface DelayedEffect {
  id: string;
  triggerTurn: number;   // When this effect activates
  planId: string;        // Which plan caused this
  description: string;   // Flavor text for The Juice
  effects: Partial<GameStats>;
}

export interface PlanOutcome {
  minScore: number;
  maxScore: number;
  title: string;
  description: string;
  immediateEffects: Partial<GameStats>;
  delayedEffects?: Array<{
    turnsDelay: number;
    description: string;
    effects: Partial<GameStats>;
  }>;
}

export interface PlanCard {
  id: string;
  name: string;
  emoji: string;
  category: 'economy' | 'politics' | 'media' | 'foreign' | 'personal';
  baseCost: number;
  // Hidden properties that can be revealed
  revealable: {
    risk?: string;           // e.g., "High risk of backfire"
    reward?: string;         // e.g., "Could double loyalty"
    timing?: string;         // e.g., "Best in early game"
    secret?: string;         // e.g., "Triggers IRS investigation"
  };
  revealed: string[];        // Which properties have been revealed
  outcomes: PlanOutcome[];   // Score-based outcomes (sorted by minScore)
}

export interface JuiceMessage {
  id: string;
  text: string;
  type: 'news' | 'rumor' | 'hint' | 'nonsense' | 'player' | 'critical';
  relatedPlanId?: string;
  turn: number;
  isCritical?: boolean;
  hasBeenModerated?: boolean;
  mockComments?: string[];
}

export interface SlotSymbol {
  emoji: string;
  value: number;
  name: string;
}

export interface SlotResult {
  reels: SlotSymbol[];
  score: number;
  isJackpot: boolean;
}

export interface GameState {
  // Core state
  currentTurn: number;       // 1-48 (or more in second term)
  maxTurns: number;          // 48 for first term
  term: 1 | 2;
  isGameOver: boolean;
  gameOverReason?: 'death' | 'leaked' | 'term_ended' | 'victory';

  // Stats
  stats: GameStats;

  // Debt tracking
  debt: number;
  interestRate: number;      // Increases with bad decisions

  // Current turn state
  availablePlans: PlanCard[];
  selectedPlan: PlanCard | null;
  timeRemaining: number;     // Seconds left in selection phase

  // Delayed effects queue
  pendingEffects: DelayedEffect[];

  // The Juice feed
  juiceMessages: JuiceMessage[];

  // Slot machine state
  slotSpinsRemaining: number;
  currentSlotTotal: number;

  // Health tiers for research penalty
  healthTier: 1 | 2 | 3 | 4; // 4=healthy, 1=very sick

  // High score
  highScore: number;
  currentScore: number;

  // Financial history for Cliff Street charts
  financialHistory: FinancialSnapshot[];
}

// Health tier thresholds
export const HEALTH_TIERS = {
  4: { min: 76, maxCards: 4, researchMultiplier: 1.0 },
  3: { min: 51, maxCards: 3, researchMultiplier: 1.5 },
  2: { min: 26, maxCards: 2, researchMultiplier: 2.0 },
  1: { min: 0,  maxCards: 1, researchMultiplier: 3.0 },
} as const;

// Slot machine symbols
export const SLOT_SYMBOLS: SlotSymbol[] = [
  { emoji: '🍊', value: 10, name: 'Orange' },
  { emoji: '🍋', value: 5, name: 'Lemon' },
  { emoji: '🍊', value: 10, name: 'Orange' },
  { emoji: '🥭', value: 8, name: 'Mango' },
  { emoji: '🍑', value: 7, name: 'Peach' },
  { emoji: '⛈️', value: -5, name: 'Storm' },
  { emoji: '💰', value: 15, name: 'Money' },
  { emoji: '📜', value: -10, name: 'Lemon Files' },
];

// Initial stats
export const INITIAL_STATS: GameStats = {
  health: 70,         // Old orange, not at full health
  money: 1500,        // Starting funds: 1500 billion (increased for balance)
  loyalty: 65,        // Higher starting loyalty (increased from 55)
  support: 40,        // Low public support
  luck: 50,           // Average luck
  chaos: 20,          // Low starting chaos
  coinValuation: 100, // Normal coin valuation (100%)
  freeBots: 1,        // Start with 1 free bot
};
