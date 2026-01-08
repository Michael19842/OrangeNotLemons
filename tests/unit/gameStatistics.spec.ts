import { describe, it, expect } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '@/stores/gameStore';

describe('Statistical Game Analysis', () => {
  describe('Win Rate Analysis', () => {
    it('should have appropriate win rates for different strategies', () => {
      const strategies = {
        optimal: { wins: 0, games: 50 },
        balanced: { wins: 0, games: 50 },
        aggressive: { wins: 0, games: 50 },
        passive: { wins: 0, games: 50 }
      };

      // Test optimal strategy
      for (let i = 0; i < strategies.optimal.games; i++) {
        setActivePinia(createPinia());
        const gameStore = useGameStore();
        gameStore.initGame();

        while (!gameStore.isGameOver && gameStore.currentTurn <= 96) {
          // Optimal: Best plan, good health management
          if (gameStore.stats.health < 40) {
            gameStore.skipTurn(); // Rest to recover
            continue;
          }

          const bestPlan = gameStore.availablePlans
            .filter(p => gameStore.stats.money >= gameStore.getAdjustedCost(p.baseCost) || gameStore.debt < 2000)
            .sort((a, b) => {
              // Prefer plans that balance reward and safety
              const aValue = a.baseCost + (a.revealed.length * 10);
              const bValue = b.baseCost + (b.revealed.length * 10);
              return bValue - aValue;
            })[0];

          if (bestPlan) {
            gameStore.selectPlan(bestPlan);
            gameStore.currentSlotTotal = 70; // Good rolls
            gameStore.executePlan();
          } else {
            gameStore.skipTurn();
          }
        }

        if (gameStore.gameOverReason === 'victory') strategies.optimal.wins++;
      }

      // Test balanced strategy
      for (let i = 0; i < strategies.balanced.games; i++) {
        setActivePinia(createPinia());
        const gameStore = useGameStore();
        gameStore.initGame();

        while (!gameStore.isGameOver && gameStore.currentTurn <= 96) {
          if (Math.random() < 0.8 && gameStore.availablePlans.length > 0) {
            const plan = gameStore.availablePlans[Math.floor(Math.random() * gameStore.availablePlans.length)];
            if (gameStore.stats.money >= gameStore.getAdjustedCost(plan.baseCost) || gameStore.debt < 3000) {
              gameStore.selectPlan(plan);
              gameStore.currentSlotTotal = 50; // Average rolls
              gameStore.executePlan();
            } else {
              gameStore.skipTurn();
            }
          } else {
            gameStore.skipTurn();
          }
        }

        if (gameStore.gameOverReason === 'victory') strategies.balanced.wins++;
      }

      // Test aggressive strategy
      for (let i = 0; i < strategies.aggressive.games; i++) {
        setActivePinia(createPinia());
        const gameStore = useGameStore();
        gameStore.initGame();

        while (!gameStore.isGameOver && gameStore.currentTurn <= 96) {
          // Always pick most expensive plan
          const expensivePlan = gameStore.availablePlans
            .sort((a, b) => b.baseCost - a.baseCost)[0];

          if (expensivePlan) {
            gameStore.selectPlan(expensivePlan);
            gameStore.currentSlotTotal = 50;
            gameStore.executePlan();
          } else {
            gameStore.skipTurn();
          }
        }

        if (gameStore.gameOverReason === 'victory') strategies.aggressive.wins++;
      }

      // Test passive strategy
      for (let i = 0; i < strategies.passive.games; i++) {
        setActivePinia(createPinia());
        const gameStore = useGameStore();
        gameStore.initGame();

        while (!gameStore.isGameOver && gameStore.currentTurn <= 96) {
          // Only pick free/cheap plans
          const cheapPlan = gameStore.availablePlans
            .filter(p => p.baseCost <= 100)
            .sort((a, b) => a.baseCost - b.baseCost)[0];

          if (cheapPlan && Math.random() < 0.6) {
            gameStore.selectPlan(cheapPlan);
            gameStore.currentSlotTotal = 50;
            gameStore.executePlan();
          } else {
            gameStore.skipTurn();
          }
        }

        if (gameStore.gameOverReason === 'victory') strategies.passive.wins++;
      }

      console.log('\n=== Strategy Win Rates ===');
      console.log(`Optimal: ${strategies.optimal.wins}/${strategies.optimal.games} (${(strategies.optimal.wins / strategies.optimal.games * 100).toFixed(1)}%)`);
      console.log(`Balanced: ${strategies.balanced.wins}/${strategies.balanced.games} (${(strategies.balanced.wins / strategies.balanced.games * 100).toFixed(1)}%)`);
      console.log(`Aggressive: ${strategies.aggressive.wins}/${strategies.aggressive.games} (${(strategies.aggressive.wins / strategies.aggressive.games * 100).toFixed(1)}%)`);
      console.log(`Passive: ${strategies.passive.wins}/${strategies.passive.games} (${(strategies.passive.wins / strategies.passive.games * 100).toFixed(1)}%)`);

      // Balance expectations
      expect(strategies.optimal.wins).toBeGreaterThan(strategies.passive.wins); // Optimal should beat passive
      expect(strategies.optimal.wins).toBeLessThan(strategies.optimal.games); // But not 100% win rate
      expect(strategies.passive.wins).toBeLessThan(strategies.optimal.games * 0.3); // Passive should struggle
    });
  });

  describe('Average Game Length Analysis', () => {
    it('should measure average survival time for different scenarios', () => {
      const scenarios = {
        normal: { totalTurns: 0, games: 30 },
        lowLoyalty: { totalTurns: 0, games: 30 },
        lowHealth: { totalTurns: 0, games: 30 },
        highDebt: { totalTurns: 0, games: 30 }
      };

      // Normal gameplay
      for (let i = 0; i < scenarios.normal.games; i++) {
        setActivePinia(createPinia());
        const gameStore = useGameStore();
        gameStore.initGame();

        while (!gameStore.isGameOver && gameStore.currentTurn <= 96) {
          if (gameStore.availablePlans.length > 0 && Math.random() < 0.7) {
            const plan = gameStore.availablePlans[0];
            if (gameStore.stats.money >= gameStore.getAdjustedCost(plan.baseCost) || gameStore.debt < 5000) {
              gameStore.selectPlan(plan);
              gameStore.currentSlotTotal = 50;
              gameStore.executePlan();
            } else {
              gameStore.skipTurn();
            }
          } else {
            gameStore.skipTurn();
          }
        }

        scenarios.normal.totalTurns += gameStore.currentTurn;
      }

      // Low loyalty start
      for (let i = 0; i < scenarios.lowLoyalty.games; i++) {
        setActivePinia(createPinia());
        const gameStore = useGameStore();
        gameStore.initGame();
        gameStore.stats.loyalty = 30; // Start with low loyalty

        while (!gameStore.isGameOver && gameStore.currentTurn <= 96) {
          if (gameStore.availablePlans.length > 0 && Math.random() < 0.7) {
            const plan = gameStore.availablePlans[0];
            gameStore.selectPlan(plan);
            gameStore.currentSlotTotal = 50;
            gameStore.executePlan();
          } else {
            gameStore.skipTurn();
          }
        }

        scenarios.lowLoyalty.totalTurns += gameStore.currentTurn;
      }

      // Low health start
      for (let i = 0; i < scenarios.lowHealth.games; i++) {
        setActivePinia(createPinia());
        const gameStore = useGameStore();
        gameStore.initGame();
        gameStore.stats.health = 30; // Start with low health

        while (!gameStore.isGameOver && gameStore.currentTurn <= 96) {
          if (gameStore.availablePlans.length > 0 && Math.random() < 0.5) {
            const plan = gameStore.availablePlans[0];
            gameStore.selectPlan(plan);
            gameStore.currentSlotTotal = 50;
            gameStore.executePlan();
          } else {
            gameStore.skipTurn();
          }
        }

        scenarios.lowHealth.totalTurns += gameStore.currentTurn;
      }

      // High debt start
      for (let i = 0; i < scenarios.highDebt.games; i++) {
        setActivePinia(createPinia());
        const gameStore = useGameStore();
        gameStore.initGame();
        gameStore.debt = 2000; // Start with debt
        gameStore.interestRate = 0.15;

        while (!gameStore.isGameOver && gameStore.currentTurn <= 96) {
          if (gameStore.availablePlans.length > 0 && Math.random() < 0.7) {
            const plan = gameStore.availablePlans[0];
            gameStore.selectPlan(plan);
            gameStore.currentSlotTotal = 50;
            gameStore.executePlan();
          } else {
            gameStore.skipTurn();
          }
        }

        scenarios.highDebt.totalTurns += gameStore.currentTurn;
      }

      const avgNormal = scenarios.normal.totalTurns / scenarios.normal.games;
      const avgLowLoyalty = scenarios.lowLoyalty.totalTurns / scenarios.lowLoyalty.games;
      const avgLowHealth = scenarios.lowHealth.totalTurns / scenarios.lowHealth.games;
      const avgHighDebt = scenarios.highDebt.totalTurns / scenarios.highDebt.games;

      console.log('\n=== Average Game Length ===');
      console.log(`Normal: ${avgNormal.toFixed(1)} turns`);
      console.log(`Low Loyalty Start: ${avgLowLoyalty.toFixed(1)} turns`);
      console.log(`Low Health Start: ${avgLowHealth.toFixed(1)} turns`);
      console.log(`High Debt Start: ${avgHighDebt.toFixed(1)} turns`);

      // Handicaps should reduce survival time
      expect(avgNormal).toBeGreaterThan(20); // Should last reasonable time
      expect(avgLowLoyalty).toBeLessThan(avgNormal); // Handicap reduces survival
      expect(avgLowHealth).toBeLessThan(avgNormal);
      expect(avgHighDebt).toBeLessThan(avgNormal);
    });
  });

  describe('Score Distribution Analysis', () => {
    it('should have reasonable score distribution', () => {
      const scores: number[] = [];

      for (let i = 0; i < 100; i++) {
        setActivePinia(createPinia());
        const gameStore = useGameStore();
        gameStore.initGame();

        while (!gameStore.isGameOver && gameStore.currentTurn <= 96) {
          if (gameStore.availablePlans.length > 0 && Math.random() < 0.75) {
            const plan = gameStore.availablePlans[Math.floor(Math.random() * gameStore.availablePlans.length)];
            if (gameStore.stats.money >= gameStore.getAdjustedCost(plan.baseCost) || gameStore.debt < 3000) {
              gameStore.selectPlan(plan);
              gameStore.currentSlotTotal = Math.floor(Math.random() * 60) + 20;
              gameStore.executePlan();
            } else {
              gameStore.skipTurn();
            }
          } else {
            gameStore.skipTurn();
          }
        }

        scores.push(gameStore.currentScore);
      }

      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);
      const sortedScores = scores.sort((a, b) => a - b);
      const medianScore = sortedScores[Math.floor(sortedScores.length / 2)];

      console.log('\n=== Score Distribution (100 games) ===');
      console.log(`Average: ${avgScore.toFixed(0)}`);
      console.log(`Median: ${medianScore.toFixed(0)}`);
      console.log(`Min: ${minScore}`);
      console.log(`Max: ${maxScore}`);
      console.log(`Range: ${maxScore - minScore}`);

      // Score should have reasonable distribution
      expect(avgScore).toBeGreaterThan(0); // Should be able to score
      expect(maxScore).toBeGreaterThan(avgScore * 2); // Skill should matter
      expect(minScore).toBeLessThan(avgScore * 0.5); // Bad play punished
    });
  });

  describe('Death Cause Analysis', () => {
    it('should have varied causes of game over', () => {
      const causes = {
        death: 0,
        leaked: 0,
        termEnded: 0,
        victory: 0,
        total: 100
      };

      for (let i = 0; i < causes.total; i++) {
        setActivePinia(createPinia());
        const gameStore = useGameStore();
        gameStore.initGame();

        while (!gameStore.isGameOver && gameStore.currentTurn <= 96) {
          if (gameStore.availablePlans.length > 0 && Math.random() < 0.7) {
            const plan = gameStore.availablePlans[Math.floor(Math.random() * gameStore.availablePlans.length)];
            if (gameStore.stats.money >= gameStore.getAdjustedCost(plan.baseCost) || gameStore.debt < 5000) {
              gameStore.selectPlan(plan);
              gameStore.currentSlotTotal = Math.floor(Math.random() * 60) + 20;
              gameStore.executePlan();
            } else {
              gameStore.skipTurn();
            }
          } else {
            gameStore.skipTurn();
          }
        }

        if (gameStore.gameOverReason === 'death') causes.death++;
        else if (gameStore.gameOverReason === 'leaked') causes.leaked++;
        else if (gameStore.gameOverReason === 'term_ended') causes.termEnded++;
        else if (gameStore.gameOverReason === 'victory') causes.victory++;
      }

      console.log('\n=== Game Over Causes (100 games) ===');
      console.log(`Death (health = 0): ${causes.death} (${causes.death}%)`);
      console.log(`Leaked (loyalty = 0): ${causes.leaked} (${causes.leaked}%)`);
      console.log(`Term Ended (low loyalty): ${causes.termEnded} (${causes.termEnded}%)`);
      console.log(`Victory: ${causes.victory} (${causes.victory}%)`);

      // Should have variety in failure modes
      expect(causes.death + causes.leaked + causes.termEnded).toBeGreaterThan(50);
      expect(causes.victory).toBeLessThan(50); // Challenging but possible
      
      // Both critical stats (health and loyalty) should matter
      expect(causes.death).toBeGreaterThan(0);
      expect(causes.leaked + causes.termEnded).toBeGreaterThan(0);
    });
  });

  describe('Rant Success Analysis', () => {
    it('should have appropriate success rates based on stats', () => {
      const scenarios = [
        { loyalty: 20, support: 20, bots: 0, expected: 'low' },
        { loyalty: 50, support: 40, bots: 0, expected: 'medium' },
        { loyalty: 80, support: 80, bots: 0, expected: 'high' },
        { loyalty: 20, support: 20, bots: 40, expected: 'medium' },
        { loyalty: 50, support: 40, bots: 60, expected: 'high' }
      ];

      scenarios.forEach(scenario => {
        const baseProbability = 50;
        const loyaltyBonus = Math.floor(scenario.loyalty * 0.3);
        const supportBonus = Math.floor(scenario.support * 0.2);
        const botBoost = Math.floor(scenario.bots * 0.5);
        const probability = Math.min(95, Math.max(5, 
          baseProbability + loyaltyBonus + supportBonus + botBoost
        ));

        console.log(`\nScenario (Loyalty: ${scenario.loyalty}, Support: ${scenario.support}, Bots: ${scenario.bots})`);
        console.log(`Success Rate: ${probability}% (expected: ${scenario.expected})`);

        if (scenario.expected === 'low') {
          expect(probability).toBeLessThan(50);
        } else if (scenario.expected === 'medium') {
          expect(probability).toBeGreaterThanOrEqual(50);
          expect(probability).toBeLessThan(75);
        } else if (scenario.expected === 'high') {
          expect(probability).toBeGreaterThanOrEqual(75);
        }
      });
    });
  });
});
