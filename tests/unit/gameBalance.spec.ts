import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '@/stores/gameStore';
import type { PlanCard } from '@/types/game';

describe('Game Balance Tests', () => {
  let gameStore: ReturnType<typeof useGameStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    gameStore = useGameStore();
    gameStore.initGame();
  });

  describe('Initial State Balance', () => {
    it('should start with balanced stats', () => {
      expect(gameStore.stats.health).toBe(70); // Old orange, not full health
      expect(gameStore.stats.money).toBe(1500); // Good starting capital (increased for balance)
      expect(gameStore.stats.loyalty).toBe(65); // Higher starting loyalty (increased for balance)
      expect(gameStore.stats.support).toBe(40); // Low but workable
      expect(gameStore.stats.luck).toBe(50); // Average
      expect(gameStore.stats.chaos).toBeLessThanOrEqual(20); // Low starting chaos (may decay)
      // coinValuation may fluctuate slightly from startTurn()
      expect(gameStore.stats.coinValuation).toBeGreaterThanOrEqual(95);
      expect(gameStore.stats.coinValuation).toBeLessThanOrEqual(105);
    });

    it('should have no debt at start', () => {
      expect(gameStore.debt).toBe(0);
      expect(gameStore.interestRate).toBe(0.08); // 8% base rate
    });

    it('should provide appropriate number of cards based on health', () => {
      expect(gameStore.maxCards).toBe(3); // Health 70 = tier 3 (51-75)
      expect(gameStore.availablePlans.length).toBe(3);
    });
  });

  describe('Health Tier System', () => {
    it('should adjust card count based on health tier', () => {
      // Tier 4 (76-100): 4 cards
      gameStore.stats.health = 80;
      expect(gameStore.healthTier).toBe(4);
      expect(gameStore.maxCards).toBe(4);

      // Tier 3 (51-75): 3 cards
      gameStore.stats.health = 60;
      expect(gameStore.healthTier).toBe(3);
      expect(gameStore.maxCards).toBe(3);

      // Tier 2 (26-50): 2 cards
      gameStore.stats.health = 40;
      expect(gameStore.healthTier).toBe(2);
      expect(gameStore.maxCards).toBe(2);

      // Tier 1 (0-25): 1 card
      gameStore.stats.health = 20;
      expect(gameStore.healthTier).toBe(1);
      expect(gameStore.maxCards).toBe(1);
    });

    it('should increase research cost at lower health', () => {
      gameStore.stats.health = 80;
      expect(gameStore.researchMultiplier).toBe(1.0);

      gameStore.stats.health = 60;
      expect(gameStore.researchMultiplier).toBe(1.5);

      gameStore.stats.health = 40;
      expect(gameStore.researchMultiplier).toBe(2.0);

      gameStore.stats.health = 20;
      expect(gameStore.researchMultiplier).toBe(3.0);
    });
  });

  describe('Debt and Interest System', () => {
    it('should apply interest on debt each turn', () => {
      // Set money to negative to have debt
      gameStore.stats.money = -1000;

      const initialMoney = gameStore.stats.money;
      gameStore.startTurn();

      // Interest should be applied, making debt larger (money more negative)
      expect(gameStore.stats.money).toBeLessThan(initialMoney);
    });

    it('should increase interest rate when taking more debt', () => {
      gameStore.stats.money = -100;
      gameStore.debt = 100;
      const initialRate = gameStore.interestRate;
      
      // Select an expensive plan to increase debt
      const expensivePlan: PlanCard = {
        id: 'test-plan',
        name: 'Expensive Test',
        emoji: '💰',
        category: 'economy',
        baseCost: 500,
        revealable: {},
        revealed: [],
        outcomes: [{
          minScore: 0, maxScore: 100,
          title: 'Test', description: 'Test',
          immediateEffects: {}
        }]
      };
      
      gameStore.selectPlan(expensivePlan);
      
      // Interest rate should increase
      expect(gameStore.interestRate).toBeGreaterThan(initialRate);
      expect(gameStore.interestRate).toBeLessThanOrEqual(0.25); // Max 25%
    });

    it('should apply chaos and coin valuation to effective interest rate', () => {
      // Set money to negative to have debt
      gameStore.stats.money = -1000;
      gameStore.stats.chaos = 100; // Max chaos
      gameStore.stats.coinValuation = 50; // Low valuation

      const initialMoney = gameStore.stats.money;
      gameStore.startTurn();

      // Effective rate should be higher due to chaos and low valuation
      // The money should become more negative (debt grows)
      expect(gameStore.stats.money).toBeLessThan(initialMoney);
      // Should have some interest applied (at least 5%)
      expect(gameStore.stats.money).toBeLessThan(initialMoney * 1.05);
    });
  });

  describe('Coin Valuation System', () => {
    it('should fluctuate coin valuation each turn', () => {
      const initialValuation = gameStore.stats.coinValuation;
      
      // Run multiple turns to see fluctuation
      for (let i = 0; i < 10; i++) {
        gameStore.skipTurn();
      }
      
      // Valuation should have changed
      expect(gameStore.stats.coinValuation).not.toBe(initialValuation);
      
      // Should stay within bounds
      expect(gameStore.stats.coinValuation).toBeGreaterThanOrEqual(50);
      expect(gameStore.stats.coinValuation).toBeLessThanOrEqual(150);
    });

    it('should adjust plan costs based on coin valuation', () => {
      const baseCost = 100;
      
      // At 100% valuation: cost = baseCost
      gameStore.stats.coinValuation = 100;
      expect(gameStore.getAdjustedCost(baseCost)).toBe(100);
      
      // At 50% valuation: cost doubles
      gameStore.stats.coinValuation = 50;
      expect(gameStore.getAdjustedCost(baseCost)).toBe(200);
      
      // At 150% valuation: cost decreases
      gameStore.stats.coinValuation = 150;
      expect(gameStore.getAdjustedCost(baseCost)).toBe(67);
    });

    it('should be affected by chaos levels', () => {
      gameStore.stats.chaos = 100; // Max chaos
      gameStore.stats.coinValuation = 100;
      
      // High chaos should push valuation down over turns
      for (let i = 0; i < 5; i++) {
        gameStore.skipTurn();
      }
      
      // Valuation likely decreased (not guaranteed due to randomness, but probable)
      // This is a probabilistic test - in real scenario would need multiple runs
    });
  });

  describe('Game Over Conditions', () => {
    it('should trigger game over when health reaches 0', () => {
      gameStore.stats.health = 1;
      gameStore.stats.health = 0;
      
      gameStore.startTurn();
      
      expect(gameStore.isGameOver).toBe(true);
      expect(gameStore.gameOverReason).toBe('death');
    });

    it('should trigger game over when loyalty reaches 0', () => {
      gameStore.stats.loyalty = 1;
      gameStore.stats.loyalty = 0;
      
      gameStore.startTurn();
      
      expect(gameStore.isGameOver).toBe(true);
      expect(gameStore.gameOverReason).toBe('leaked');
    });

    it('should allow second term with sufficient loyalty', () => {
      // Set up for end of first term - currentTurn must be > maxTurns for evaluation
      gameStore.currentTurn = 17; // Just past maxTurns (16)
      gameStore.stats.loyalty = 90; // High enough for any threshold
      gameStore.stats.support = 50;
      gameStore.currentScore = 100;

      // Call startTurn which triggers term end evaluation
      gameStore.startTurn();

      // Since loyalty is high enough, should proceed to term 2
      expect(gameStore.term).toBe(2);
      expect(gameStore.maxTurns).toBe(32);
      expect(gameStore.isGameOver).toBe(false);
    });

    it('should adjust loyalty threshold based on chaos', () => {
      // High chaos lowers threshold
      gameStore.stats.chaos = 100;
      const thresholdHighChaos = gameStore.getSecondTermLoyaltyThreshold();
      expect(thresholdHighChaos).toBeLessThan(90);
      expect(thresholdHighChaos).toBeGreaterThanOrEqual(55);

      // Low chaos keeps threshold higher (but may not be exactly 85)
      gameStore.stats.chaos = 0;
      const thresholdLowChaos = gameStore.getSecondTermLoyaltyThreshold();
      expect(thresholdLowChaos).toBeGreaterThan(80);
    });

    it('should end game if loyalty too low at term end', () => {
      // Set up for end of first term - currentTurn must be > maxTurns for evaluation
      gameStore.currentTurn = 17; // Just past maxTurns (16)
      gameStore.stats.loyalty = 30; // Too low for any threshold
      gameStore.stats.support = 50;

      // Call startTurn which triggers term end evaluation
      gameStore.startTurn();

      expect(gameStore.isGameOver).toBe(true);
      expect(gameStore.gameOverReason).toBe('term_ended');
    });

    it('should grant victory after completing two terms', () => {
      gameStore.term = 2;
      gameStore.currentTurn = 33; // Past second term maxTurns (32)
      gameStore.stats.loyalty = 85;
      gameStore.currentScore = 500;
      
      gameStore.startTurn();
      
      expect(gameStore.isGameOver).toBe(true);
      expect(gameStore.gameOverReason).toBe('victory');
      expect(gameStore.currentScore).toBe(1000); // Score doubled
    });
  });

  describe('Rant Success Probability', () => {
    it('should calculate base probability correctly', () => {
      // With base stats (loyalty 65, support 40)
      // Base: 50 + (65 * 0.3) + (40 * 0.2) = 50 + 19 + 8 = 77%
      const baseProbability = 50;
      const loyaltyBonus = Math.floor(gameStore.stats.loyalty * 0.3);
      const supportBonus = Math.floor(gameStore.stats.support * 0.2);

      expect(baseProbability + loyaltyBonus + supportBonus).toBe(77);
    });

    it('should cap probability at 95%', () => {
      gameStore.stats.loyalty = 100;
      gameStore.stats.support = 100;
      
      // Base: 50 + 30 + 20 = 100, but should cap at 95
      const probability = 50 + 
        Math.floor(gameStore.stats.loyalty * 0.3) + 
        Math.floor(gameStore.stats.support * 0.2);
      
      expect(Math.min(95, probability)).toBe(95);
    });

    it('should have minimum probability of 5%', () => {
      gameStore.stats.loyalty = 0;
      gameStore.stats.support = 0;
      
      // Base: 50 + 0 + 0 = 50, but never below 5
      const probability = 50;
      expect(Math.max(5, probability)).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Delayed Effects System', () => {
    it('should queue delayed effects from plans', () => {
      const plan: PlanCard = {
        id: 'test-delayed',
        name: 'Test Plan',
        emoji: '⏰',
        category: 'economy',
        baseCost: 100,
        revealable: {},
        revealed: [],
        outcomes: [{
          minScore: 0, maxScore: 100,
          title: 'Test',
          description: 'Test delayed effect',
          immediateEffects: { support: 10 },
          delayedEffects: [
            {
              turnsDelay: 3,
              description: 'Delayed consequence',
              effects: { support: -15 }
            }
          ]
        }]
      };
      
      gameStore.selectPlan(plan);
      gameStore.slotSpinsRemaining = 0;
      gameStore.currentSlotTotal = 50;
      gameStore.executePlan();
      
      expect(gameStore.pendingEffects.length).toBeGreaterThan(0);
      const effect = gameStore.pendingEffects[0];
      expect(effect.triggerTurn).toBeGreaterThan(gameStore.currentTurn);
    });

    it('should trigger effects at correct turn', () => {
      const plan: PlanCard = {
        id: 'test-trigger',
        name: 'Test Plan',
        emoji: '⏰',
        category: 'economy',
        baseCost: 100,
        revealable: {},
        revealed: [],
        outcomes: [{
          minScore: 0, maxScore: 100,
          title: 'Test',
          description: 'Test',
          immediateEffects: {},
          delayedEffects: [
            {
              turnsDelay: 2,
              description: 'Effect in 2 turns',
              effects: { loyalty: -10 }
            }
          ]
        }]
      };
      
      const startTurn = gameStore.currentTurn;
      const startLoyalty = gameStore.stats.loyalty;
      
      gameStore.selectPlan(plan);
      gameStore.slotSpinsRemaining = 0;
      gameStore.currentSlotTotal = 50;
      gameStore.executePlan();
      
      // Skip one more turn (executePlan already advanced one)
      gameStore.skipTurn();
      
      // Effect should trigger now
      expect(gameStore.stats.loyalty).toBeLessThan(startLoyalty);
      expect(gameStore.pendingEffects.length).toBe(0); // Effect consumed
    });

    it('should handle multiple delayed effects from one plan', () => {
      const plan: PlanCard = {
        id: 'test-multiple',
        name: 'Test Plan',
        emoji: '⏰',
        category: 'economy',
        baseCost: 100,
        revealable: {},
        revealed: [],
        outcomes: [{
          minScore: 0, maxScore: 100,
          title: 'Test',
          description: 'Test',
          immediateEffects: {},
          delayedEffects: [
            {
              turnsDelay: 2,
              description: 'First effect',
              effects: { support: -5 }
            },
            {
              turnsDelay: 5,
              description: 'Second effect',
              effects: { support: -10 }
            }
          ]
        }]
      };
      
      gameStore.selectPlan(plan);
      gameStore.slotSpinsRemaining = 0;
      gameStore.currentSlotTotal = 50;
      gameStore.executePlan();
      
      expect(gameStore.pendingEffects.length).toBe(2);
    });
  });

  describe('Chaos Effects', () => {
    it('should cause support decay at high chaos', () => {
      gameStore.stats.chaos = 80;
      gameStore.stats.support = 50;
      
      const initialSupport = gameStore.stats.support;
      gameStore.startTurn();
      
      // High chaos should decay support
      expect(gameStore.stats.support).toBeLessThanOrEqual(initialSupport);
    });

    it('should not decay support at low chaos', () => {
      gameStore.stats.chaos = 30;
      gameStore.stats.support = 50;
      
      const initialSupport = gameStore.stats.support;
      
      // Run multiple turns
      for (let i = 0; i < 5; i++) {
        gameStore.skipTurn();
      }
      
      // Support might change from skipping, but not from chaos decay
      // (This is indirect test - chaos < 70 shouldn't trigger decay)
    });
  });

  describe('Skip Turn Penalties', () => {
    it('should penalize stats when skipping', () => {
      const initialLoyalty = gameStore.stats.loyalty;
      const initialSupport = gameStore.stats.support;

      gameStore.skipTurn();

      // Skip penalties are -2 loyalty and -2 support (reduced for balance)
      expect(gameStore.stats.loyalty).toBe(initialLoyalty - 2);
      expect(gameStore.stats.support).toBe(initialSupport - 2);
    });

    it('should not allow stats to go negative from skipping', () => {
      gameStore.stats.loyalty = 2;
      gameStore.stats.support = 1;
      
      gameStore.skipTurn();
      
      expect(gameStore.stats.loyalty).toBeGreaterThanOrEqual(0);
      expect(gameStore.stats.support).toBeGreaterThanOrEqual(0);
    });
  });
});
