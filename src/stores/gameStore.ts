import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  GameState,
  GameStats,
  PlanCard,
  DelayedEffect,
  JuiceMessage,
  SlotResult,
  FinancialSnapshot,
  Situation
} from '@/types/game';
import { INITIAL_STATS, HEALTH_TIERS, SLOT_SYMBOLS } from '@/types/game';
import { getRandomPlans, ALL_PLANS } from '@/data/plans';
import { getRandomSituation } from '@/data/situations';
import { generateJuiceMessage } from '@/data/juice';
import { ACHIEVEMENTS, type Achievement } from '@/types/achievements';
import { CRITICAL_MESSAGES, POSITIVE_MESSAGES, ORANGE_COMMENTS } from './modules/messages';
import { STOCKS, PLAN_STOCK_EFFECTS, type Stock, type StockEffect } from '@/data/stocks';

export const useGameStore = defineStore('game', () => {
  // Core state
  const currentTurn = ref(1);
  const maxTurns = ref(16); // 4 years × 4 quarters
  const term = ref<1 | 2>(1);
  const isGameOver = ref(false);
  const gameOverReason = ref<'death' | 'leaked' | 'term_ended' | 'victory' | null>(null);

  // Stats
  const stats = ref<GameStats>({ ...INITIAL_STATS });

  // Debt
  const debt = ref(0);
  const interestRate = ref(0.08); // 8% base interest (increased from 5%)
  
  // Trading - portfolio of stocks
  interface Position {
    shares: number;
    averageCost: number;
  }
  const portfolio = ref<Record<string, Position>>({}); // stockId -> Position
  
  // Initialize stocks with some price history for charts
  const initializeStockHistory = (stock: Stock): Stock => {
    const history: number[] = [];
    let price = stock.basePrice;
    
    // Generate 8 historical prices with small random variations
    for (let i = 0; i < 8; i++) {
      const variation = (Math.random() - 0.5) * stock.volatility * 10; // Use stock's volatility
      price = Math.max(10, Math.round(price + variation));
      history.push(price);
    }
    
    // Last two prices should end at current basePrice
    history.push(Math.round((price + stock.basePrice) / 2));
    history.push(stock.basePrice);
    
    return { ...stock, priceHistory: history };
  };
  
  const stocks = ref<Stock[]>(STOCKS.map(initializeStockHistory));
  const coinHoldings = ref(0); // Legacy coin holdings (keep for backward compatibility)

  // Stock research - tracks how much the player knows about each stock's plan effects
  // Key: `${planId}-${stockId}`, Value: research level (0-3)
  const stockResearch = ref<Record<string, number>>({});

  // Trade history for profit/loss tracking with animations
  interface TradeResult {
    stockId: string;
    type: 'buy' | 'sell' | 'short' | 'close';
    shares: number;
    amount: number;
    profitLoss?: number;
    timestamp: number;
  }
  const lastTradeResult = ref<TradeResult | null>(null);

  // Loyalty recovery tracking
  const lastLoyaltyRecoveryTurn = ref(0);

  // Turn state
  const availablePlans = ref<PlanCard[]>([]);
  const selectedPlan = ref<PlanCard | null>(null);
  const timeRemaining = ref(90); // 1.5 minutes per turn
  const timerInterval = ref<number | null>(null);

  // Effects queue
  const pendingEffects = ref<DelayedEffect[]>([]);

  // The Juice
  const juiceMessages = ref<JuiceMessage[]>([]);

  // Financial history for Cliff Street charts
  const financialHistory = ref<FinancialSnapshot[]>([]);
  
  // Achievements
  const achievements = ref<Achievement[]>(ACHIEVEMENTS.map(a => ({ ...a })));
  const newlyUnlockedAchievements = ref<Achievement[]>([]);
  
  // Tracking stats for complex achievements
  const achievementTracking = ref({
    rantsPosted: 0,
    postsDeleted: 0,
    usersBanned: 0,
    criticalPostsIgnored: 0,
    blindPlaysWon: 0,
    jackpotsHit: 0,
    turnsSkipped: 0,
    plansFullyInvestigated: 0,
    lowChaosStreak: 0,
    zeroLuckStreak: 0,
    viralRants: 0
  });

  // Stat change notifications
  interface StatChangeNotification {
    id: string;
    icon: string;
    value: number;
  }
  const statChangeNotifications = ref<StatChangeNotification[]>([]);

  // Slot machine
  const slotSpinsRemaining = ref(0);
  const currentSlotTotal = ref(0);
  const slotResults = ref<SlotResult[]>([]);

  // Scores
  const highScore = ref(parseInt(localStorage.getItem('orangeHighScore') || '0'));
  const currentScore = ref(0);

  // Annual report flag - set when it's time to show the report
  const showAnnualReport = ref(false);
  
  // Tutorial state
  const tutorialCompleted = ref(localStorage.getItem('orangeTutorialCompleted') === 'true');

  // Current situation - determines which plan type is ideal
  const currentSituation = ref<Situation | null>(null);
  const lastPlanChoice = ref<'ideal' | 'worst' | 'neutral' | null>(null);

  // Computed
  const healthTier = computed(() => {
    const h = stats.value.health;
    if (h >= 76) return 4;
    if (h >= 51) return 3;
    if (h >= 26) return 2;
    return 1;
  });

  const maxCards = computed(() => HEALTH_TIERS[healthTier.value].maxCards);
  const researchMultiplier = computed(() => HEALTH_TIERS[healthTier.value].researchMultiplier);

  const quarterName = computed(() => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    return quarters[(currentTurn.value - 1) % 4];
  });

  // Keep monthName as alias for backwards compatibility
  const monthName = quarterName;

  const year = computed(() => {
    return Math.floor((currentTurn.value - 1) / 4) + 1;
  });

  // Helper: Clamp stats to valid ranges
  function clampStat(value: number, min: number = 0, max: number = 100): number {
    return Math.max(min, Math.min(max, value));
  }

  // Actions
  function initGame() {
    currentTurn.value = 1;
    maxTurns.value = 16; // 4 years × 4 quarters
    term.value = 1;
    isGameOver.value = false;
    gameOverReason.value = null;
    stats.value = { ...INITIAL_STATS };
    debt.value = 0;
    interestRate.value = 0.08; // Match new base rate
    coinHoldings.value = 0; // Reset coin holdings
    portfolio.value = {}; // Reset stock portfolio
    stocks.value = STOCKS.map(initializeStockHistory); // Reset stock prices with history
    stockResearch.value = {}; // Reset stock research
    lastTradeResult.value = null; // Reset trade result
    lastLoyaltyRecoveryTurn.value = 0; // Reset loyalty recovery tracker
    availablePlans.value = [];
    selectedPlan.value = null;
    pendingEffects.value = [];
    juiceMessages.value = [];
    financialHistory.value = [];
    slotSpinsRemaining.value = 0;
    currentSlotTotal.value = 0;
    slotResults.value = [];
    currentScore.value = 0;
    showAnnualReport.value = false;
    currentSituation.value = null;
    lastPlanChoice.value = null;

    // Reset achievements
    achievements.value = ACHIEVEMENTS.map(a => ({ ...a, unlocked: false }));
    newlyUnlockedAchievements.value = [];
    achievementTracking.value = {
      rantsPosted: 0,
      postsDeleted: 0,
      usersBanned: 0,
      criticalPostsIgnored: 0,
      blindPlaysWon: 0,
      jackpotsHit: 0,
      turnsSkipped: 0,
      plansFullyInvestigated: 0,
      lowChaosStreak: 0,
      zeroLuckStreak: 0,
      viralRants: 0
    };

    // Generate historical data showing healthy growth before player took over
    generatePreGameHistory();

    // Record initial financial snapshot (player's first turn)
    recordFinancialSnapshot();

    // Add welcome message to The Juice
    addJuiceMessage({
      text: "🍊 THE ORANGE has entered the building! Time to make fruit great again!",
      type: 'news'
    });

    startTurn();
  }

  // Record a snapshot of financial data for Cliff Street charts
  function recordFinancialSnapshot() {
    // Update debt value (debt = absolute value of negative money)
    debt.value = stats.value.money < 0 ? Math.abs(stats.value.money) : 0;
    
    financialHistory.value.push({
      turn: currentTurn.value,
      money: stats.value.money,
      debt: debt.value,
      coinValuation: stats.value.coinValuation,
      chaos: stats.value.chaos,
      interestRate: interestRate.value,
      loyalty: stats.value.loyalty,
      support: stats.value.support
    });
  }

  // Generate pre-game history showing healthy growth before player took over
  function generatePreGameHistory() {
    // Create 12 months of historical data showing steady, healthy growth
    const historicalMonths = 12;
    
    // Starting values (12 months ago)
    let histMoney = 400; // Started with less money
    let histDebt = 0;
    let histValuation = 80; // Coin was worth less
    let histChaos = 10; // Low chaos
    let histInterest = 0.05;
    
    for (let i = -historicalMonths; i < 0; i++) {
      // Simulate healthy growth trend
      const progress = (historicalMonths + i) / historicalMonths; // 0 to 1
      
      // Money grows steadily with some variance
      histMoney += 15 + Math.random() * 10; // +15-25 per month
      
      // Coin valuation improves
      histValuation += (100 - histValuation) * 0.08; // Grows toward 100
      
      // Chaos remains low
      histChaos = Math.max(5, histChaos + (Math.random() - 0.6) * 3); // Slowly decreases
      
      // Add slight variance
      const variance = (Math.random() - 0.5) * 0.1;
      
      financialHistory.value.push({
        turn: i, // Negative turns = pre-game history
        money: Math.floor(histMoney * (1 + variance)),
        debt: histDebt,
        coinValuation: Math.floor(Math.min(100, histValuation)),
        chaos: Math.floor(Math.max(5, histChaos)),
        interestRate: histInterest,
        loyalty: 85 + Math.floor(Math.random() * 5), // High loyalty before
        support: 75 + Math.floor(Math.random() * 10) // Good support before
      });
    }
    
    // Last pre-game snapshot shows peak performance
    financialHistory.value.push({
      turn: 0, // Turn 0 = handover moment
      money: 600, // Our starting money
      debt: 0,
      coinValuation: 100, // Peak valuation
      chaos: 15, // Nice and low
      interestRate: 0.05,
      loyalty: 90, // Peak loyalty at handover
      support: 85 // Peak support at handover
    });
  }

  function startTurn() {
    // Process pending effects
    processPendingEffects();

    // Apply chaos effects each turn
    applyChaosEffects();
    
    // Loyalty recovery mechanic
    applyLoyaltyRecovery();
    
    // Give free bot every 5 turns
    if (currentTurn.value % 5 === 0) {
      stats.value.freeBots = (stats.value.freeBots || 0) + 1;
      addJuiceMessage({
        text: '🤖 Free rant bot received! Use it wisely (or not). #DailyGift',
        type: 'news'
      });
    }

    // Apply interest on debt (negative money = debt)
    if (stats.value.money < 0) {
      // Higher chaos increases effective interest rate
      // Lower coinValuation also increases effective interest rate
      const chaosInterestBonus = (stats.value.chaos / 100) * 0.05; // Up to +5% at max chaos
      const valuationInterestBonus = ((100 - stats.value.coinValuation) / 100) * 0.03; // Up to +3% at low valuation
      const effectiveRate = (interestRate.value / 100) + chaosInterestBonus + valuationInterestBonus;

      const debtAmount = Math.abs(stats.value.money);
      const interest = Math.floor(debtAmount * effectiveRate);
      stats.value.money -= interest; // Increases debt (more negative)
      
      addJuiceMessage({
        text: `💸 Interest payment: ${interest}B. Total debt: ${Math.abs(stats.value.money)}B. Rate: ${(effectiveRate * 100).toFixed(1)}%`,
        type: 'news'
      });

      // Loyalty penalty for being in debt
      // Small penalty starts at 100B debt, increasing with debt size
      if (debtAmount >= 100) {
        const loyaltyPenalty = Math.min(5, Math.floor(debtAmount / 200)); // 1 point per 200B debt, max 5
        stats.value.loyalty = Math.max(0, stats.value.loyalty - loyaltyPenalty);
        
        if (loyaltyPenalty > 0) {
          addJuiceMessage({
            text: `👥 Inner circle worried about debt! Loyalty -${loyaltyPenalty}. "Can't we just print more money?" #DebtCrisis`,
            type: 'critical'
          });
        }
      }
    }

    // Fluctuate coin valuation based on chaos
    updateCoinValuation();

    // Record financial snapshot for Cliff Street
    recordFinancialSnapshot();

    // Check game over conditions
    if (checkGameOver()) return;

    // Get new plans based on health tier
    availablePlans.value = getRandomPlans(maxCards.value);

    // Pick a situation for this turn and generate hints
    currentSituation.value = getRandomSituation();
    lastPlanChoice.value = null;
    generateSituationHints();

    // Reset selection state FIRST - this closes the slot machine overlay
    selectedPlan.value = null;
    slotSpinsRemaining.value = 0;
    currentSlotTotal.value = 0;
    slotResults.value = [];

    // Check if it's time for annual report (every 4 turns = 1 year)
    // Do this BEFORE starting timer, but AFTER closing slots
    if (currentTurn.value > 0 && currentTurn.value % 4 === 0) {
      showAnnualReport.value = true;
      timeRemaining.value = 90; // Set time but don't start timer
      // Generate juice messages for the upcoming turn
      generateTurnJuice();
      // Don't start timer - will be started when report is closed
      return;
    }

    // Reset time and start timer
    timeRemaining.value = 90; // 1.5 minutes per turn

    // Generate some juice messages
    generateTurnJuice();

    // Start timer
    startTimer();
  }

  // Apply chaos effects each turn
  function applyChaosEffects() {
    const chaos = stats.value.chaos;

    // Chaos effects - significantly softened for better balance
    if (chaos > 85) {
      // Very high chaos: -2 support, -1 loyalty (50% chance), -1 health per turn
      stats.value.support = Math.max(0, stats.value.support - 2);
      if (Math.random() < 0.5) {
        stats.value.loyalty = Math.max(0, stats.value.loyalty - 1);
      }
      stats.value.health = Math.max(0, stats.value.health - 1);
      if (Math.random() < 0.4) {
        addJuiceMessage({
          text: `🌪️ EXTREME CHAOS! -2 Support, -1 Health`,
          type: 'news'
        });
      }
    } else if (chaos > 70) {
      // High chaos: -1 support, -1 loyalty (30% chance) per turn
      stats.value.support = Math.max(0, stats.value.support - 1);
      if (Math.random() < 0.3) {
        stats.value.loyalty = Math.max(0, stats.value.loyalty - 1);
      }
      if (Math.random() < 0.3) {
        addJuiceMessage({
          text: `📉 High chaos causing instability! -1 Support`,
          type: 'news'
        });
      }
    } else if (chaos > 50) {
      // Medium chaos: -1 support every other turn (30% chance)
      if (Math.random() < 0.3) {
        stats.value.support = Math.max(0, stats.value.support - 1);
      }
    }
    
    // Chaos naturally decays over time - stronger decay at all levels
    // This represents situations stabilizing without active intervention
    if (chaos > 10) {
      // Base decay: 50% chance of -1 chaos per turn
      if (Math.random() < 0.5) {
        stats.value.chaos = Math.max(0, stats.value.chaos - 1);
      }
      // Additional decay when support is good: another 30% chance of -1
      if (stats.value.support > 50 && Math.random() < 0.3) {
        stats.value.chaos = Math.max(0, stats.value.chaos - 1);
      }
      // Bonus decay when both support and loyalty are high: yet another 20% chance
      if (stats.value.support > 70 && stats.value.loyalty > 70 && Math.random() < 0.2) {
        stats.value.chaos = Math.max(0, stats.value.chaos - 1);
      }
    }

    // Low support penalties - only at critical levels
    if (stats.value.support < 15) {
      // Critically low support increases chaos
      const chaosPenalty = 2;
      stats.value.chaos = Math.min(100, stats.value.chaos + chaosPenalty);
      
      if (stats.value.support < 10) {
        // Extreme crisis damages loyalty
        stats.value.loyalty = Math.max(0, stats.value.loyalty - 2);
        if (Math.random() < 0.3) {
          addJuiceMessage({
            text: `⚠️ Critical support crisis! Inner circle panic! -2 Loyalty`,
            type: 'news'
          });
        }
      }
    }

    // Loyalty decay only at extreme levels
    if (stats.value.loyalty > 95) {
      if (Math.random() < 0.5) { // 50% chance only
        stats.value.loyalty = Math.max(0, stats.value.loyalty - 1);
      }
    }
  }

  // Loyalty recovery when conditions are good
  function applyLoyaltyRecovery() {
    const support = stats.value.support;
    const chaos = stats.value.chaos;
    const turnsSinceRecovery = currentTurn.value - lastLoyaltyRecoveryTurn.value;
    
    // Recovery when support is high and chaos is low
    // Max once per 3 turns to prevent exploitation
    if (support > 60 && chaos < 30 && turnsSinceRecovery >= 3) {
      stats.value.loyalty = Math.min(100, stats.value.loyalty + 1);
      lastLoyaltyRecoveryTurn.value = currentTurn.value;
      
      if (Math.random() < 0.3) {
        addJuiceMessage({
          text: `🤝 High support and stability strengthening inner circle bonds! +1 Loyalty`,
          type: 'news'
        });
      }
    }
    
    // Small recovery chance when support is very high, even with medium chaos
    if (support > 75 && chaos < 50 && turnsSinceRecovery >= 4) {
      if (Math.random() < 0.5) { // 50% chance
        stats.value.loyalty = Math.min(100, stats.value.loyalty + 1);
        lastLoyaltyRecoveryTurn.value = currentTurn.value;
      }
    }
    
    // Stress mechanic: High chaos drains health
    if (chaos > 75) {
      const healthDrain = Math.floor((chaos - 75) / 20); // 1 health per turn only at very high chaos
      if (healthDrain > 0) {
        stats.value.health = Math.max(0, stats.value.health - healthDrain);
        if (Math.random() < 0.25) {
          addJuiceMessage({
            text: `😰 Extreme stress taking toll on health! -${healthDrain} Health`,
            type: 'news'
          });
        }
      }
    }
  }

  // Update coin valuation based on chaos and random market forces
  function updateCoinValuation() {
    const chaos = stats.value.chaos;

    // Random market fluctuation (-3 to +3)
    const randomFluctuation = Math.floor(Math.random() * 7) - 3;

    // Chaos pushes valuation down (high chaos = downward pressure)
    const chaosPressure = chaos > 50 ? -Math.floor((chaos - 50) / 25) : 0;

    // Low chaos and high loyalty push valuation up
    const stabilityBonus = (chaos < 30 && stats.value.loyalty > 60) ? 1 : 0;

    const change = randomFluctuation + chaosPressure + stabilityBonus;
    stats.value.coinValuation = Math.max(50, Math.min(150, stats.value.coinValuation + change));

    // Notify on significant changes
    if (Math.abs(change) >= 3) {
      const emoji = change > 0 ? '📈' : '📉';
      addJuiceMessage({
        text: `${emoji} Coin valuation ${change > 0 ? 'up' : 'down'} ${Math.abs(change)}%! Now at ${stats.value.coinValuation}%`,
        type: 'news'
      });
    }
  }

  function startTimer() {
    if (timerInterval.value) clearInterval(timerInterval.value);

    timerInterval.value = window.setInterval(() => {
      timeRemaining.value--;
      if (timeRemaining.value <= 0) {
        stopTimer();
        skipTurn();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  }

  function closeAnnualReport() {
    showAnnualReport.value = false;
    // Now start the timer for this turn
    startTimer();
  }

  // Calculate actual cost based on coin valuation and support
  function getAdjustedCost(baseCost: number): number {
    // Lower valuation = higher costs (inverse relationship)
    // At 100% valuation: cost = baseCost
    // At 50% valuation: cost = baseCost * 2
    // At 150% valuation: cost = baseCost * 0.67
    let valuationMultiplier = 100 / stats.value.coinValuation;
    
    // Low support penalty: costs increase when support is low
    if (stats.value.support < 30) {
      valuationMultiplier *= 1.5; // 50% more expensive at low support
    }
    
    return Math.ceil(baseCost * valuationMultiplier);
  }

  function selectPlan(plan: PlanCard) {
    const adjustedCost = getAdjustedCost(plan.baseCost);

    if (stats.value.money < adjustedCost) {
      // Need to take on debt or increase existing debt
      const needed = adjustedCost - Math.max(0, stats.value.money);
      
      // Track old money to handle negative properly
      const hadMoney = stats.value.money >= 0;
      
      // Deduct what we can from money
      stats.value.money -= adjustedCost;
      
      // Money is now negative, increase interest rate
      if (stats.value.money < 0) {
        interestRate.value = Math.min(0.35, interestRate.value + 0.03); // Interest increases 3% (max 35%)
        addJuiceMessage({
          text: `📈 ${hadMoney ? 'Went into' : 'More'} debt! Interest rate now ${(interestRate.value * 100).toFixed(0)}%. Totally sustainable!`,
          type: 'news'
        });
      }
    } else {
      stats.value.money -= adjustedCost;
    }

    // Show cost adjustment if significant
    if (adjustedCost !== plan.baseCost) {
      const diff = adjustedCost - plan.baseCost;
      const emoji = diff > 0 ? '📈' : '📉';
      addJuiceMessage({
        text: `${emoji} Cost adjusted due to coin valuation: ${plan.baseCost}B → ${adjustedCost}B`,
        type: 'hint'
      });
    }

    selectedPlan.value = plan;
    stopTimer();
    slotSpinsRemaining.value = 3;
    currentSlotTotal.value = 0;
    slotResults.value = [];
  }

  function researchPlan(planId: string, property: string, useHealth: boolean) {
    const plan = availablePlans.value.find(p => p.id === planId);
    if (!plan || plan.revealed.includes(property)) return;

    const cost = useHealth ? 5 * researchMultiplier.value : 50;

    if (useHealth) {
      stats.value.health = Math.max(0, stats.value.health - cost);
      addJuiceMessage({
        text: "🧠 *squints at documents* This research is exhausting...",
        type: 'nonsense'
      });
    } else {
      if (stats.value.money >= cost) {
        stats.value.money -= cost;
      } else {
        debt.value += cost;
        addJuiceMessage({
          text: `💼 Hired consultants for $${cost}. They seem trustworthy.`,
          type: 'news'
        });
      }
    }

    plan.revealed.push(property);
  }

  function researchPlanRandom(planId: string) {
    const plan = availablePlans.value.find(p => p.id === planId);
    if (!plan) return;

    const unrevealed = Object.keys(plan.revealable).filter(
      key => !plan.revealed.includes(key)
    );
    
    if (unrevealed.length === 0) return;

    const cost = 50;
    if (stats.value.money >= cost) {
      stats.value.money -= cost;
    } else {
      debt.value += cost;
    }

    // Pick random unrevealed property
    const randomProp = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    plan.revealed.push(randomProp);

    addJuiceMessage({
      text: `🎲 Paid for random intel. Got: ${randomProp}. Worth it? Maybe.`,
      type: 'nonsense'
    });
  }

  function spinSlot(): SlotResult {
    if (slotSpinsRemaining.value <= 0) {
      return { reels: [], score: 0, isJackpot: false };
    }

    slotSpinsRemaining.value--;

    // Generate 3 random symbols
    const reels = Array.from({ length: 3 }, () => {
      const luckBonus = stats.value.luck / 100;
      // Better luck = slightly better odds for good symbols
      const index = Math.floor(Math.random() * SLOT_SYMBOLS.length);
      // Luck can reroll bad results
      if (SLOT_SYMBOLS[index].value < 0 && Math.random() < luckBonus * 0.3) {
        return SLOT_SYMBOLS[Math.floor(Math.random() * 5)]; // Reroll to first 5 (good) symbols
      }
      return SLOT_SYMBOLS[index];
    });

    // Calculate score
    let score = reels.reduce((sum, s) => sum + s.value, 0);

    // Jackpot: all same symbols
    const isJackpot = reels.every(s => s.emoji === reels[0].emoji);
    if (isJackpot) {
      score *= 3;
      addJuiceMessage({
        text: `🎰 JACKPOT! ${reels[0].emoji}${reels[0].emoji}${reels[0].emoji}! The Orange is on fire!`,
        type: 'news'
      });
    }

    currentSlotTotal.value += score;
    const result = { reels, score, isJackpot };
    slotResults.value.push(result);

    return result;
  }

  function executePlan() {
    if (!selectedPlan.value) return;

    const plan = selectedPlan.value;
    const score = currentSlotTotal.value;

    // Evaluate if this was the right plan for the situation
    const planChoice = evaluatePlanChoice(plan);
    lastPlanChoice.value = planChoice;

    // Find matching outcome - if score is above max, use best outcome
    let outcome = plan.outcomes.find(o => score >= o.minScore && score <= o.maxScore);

    if (!outcome) {
      // If no match, check if score is above all ranges (too good!)
      const highestMaxScore = Math.max(...plan.outcomes.map(o => o.maxScore));
      if (score > highestMaxScore) {
        // Score is excellent! Use best outcome (first one)
        outcome = plan.outcomes[0];
      } else {
        // Score is below all ranges, use worst outcome
        outcome = plan.outcomes[plan.outcomes.length - 1];
      }
    }

    // Apply immediate effects WITH situation modifier
    applyEffectsWithSituation(outcome.immediateEffects, planChoice);

    // Update stock prices based on plan effects
    updateStockPrices(plan.id);

    // Add to score (bonus for ideal choice, penalty for worst)
    let scoreModifier = 1.0;
    if (planChoice === 'ideal') scoreModifier = 1.5;
    if (planChoice === 'worst') scoreModifier = 0.5;
    currentScore.value += Math.max(0, Math.floor(score * scoreModifier));

    // Queue delayed effects if any (also modified by situation)
    if (outcome.delayedEffects && outcome.delayedEffects.length > 0) {
      outcome.delayedEffects.forEach(delayedEffect => {
        // Modify delayed effects based on plan choice
        let modifiedEffects = { ...delayedEffect.effects };
        if (planChoice === 'ideal') {
          // Reduce negative delayed effects for good choices
          Object.keys(modifiedEffects).forEach(key => {
            const value = modifiedEffects[key as keyof GameStats];
            if (value !== undefined && value < 0) {
              modifiedEffects[key as keyof GameStats] = Math.floor(value * 0.7);
            }
          });
        } else if (planChoice === 'worst') {
          // Increase negative delayed effects for bad choices
          Object.keys(modifiedEffects).forEach(key => {
            const value = modifiedEffects[key as keyof GameStats];
            if (value !== undefined && value < 0) {
              modifiedEffects[key as keyof GameStats] = Math.floor(value * 1.5);
            }
          });
        }

        const effect: DelayedEffect = {
          id: `${plan.id}-${currentTurn.value}-${delayedEffect.turnsDelay}`,
          triggerTurn: currentTurn.value + delayedEffect.turnsDelay,
          planId: plan.id,
          description: delayedEffect.description,
          effects: modifiedEffects
        };
        pendingEffects.value.push(effect);
      });
    }

    // Juice message about outcome
    addJuiceMessage({
      text: `📢 ${outcome.title}: ${outcome.description}`,
      type: 'news'
    });

    // Generate reaction messages based on plan choice quality
    generatePlanChoiceReactions(plan, planChoice);

    // Next turn
    currentTurn.value++;
    checkAchievements();
    startTurn();
  }

  function calculateBlindScore(): number {
    // Calculate blind score based on stats + randomness - laziness penalty
    const chaosBonus = Math.floor(stats.value.chaos * 0.3); // 0-30 points from chaos
    const supportBonus = Math.floor(stats.value.support * 0.2); // 0-20 points from support
    const loyaltyBonus = Math.floor(stats.value.loyalty * 0.2); // 0-20 points from loyalty
    const randomFactor = Math.floor(Math.random() * 31) - 15; // -15 to +15 random
    const lazinessPenalty = -5;

    return Math.max(0, Math.min(100, chaosBonus + supportBonus + loyaltyBonus + randomFactor + lazinessPenalty));
  }

  function executeBlindPlay() {
    if (!selectedPlan.value) return;

    const plan = selectedPlan.value;

    // Evaluate if this was the right plan for the situation
    const planChoice = evaluatePlanChoice(plan);
    lastPlanChoice.value = planChoice;

    // Calculate blind score with breakdown for display
    const chaosBonus = Math.floor(stats.value.chaos * 0.3); // 0-30 points from chaos
    const supportBonus = Math.floor(stats.value.support * 0.2); // 0-20 points from support
    const loyaltyBonus = Math.floor(stats.value.loyalty * 0.2); // 0-20 points from loyalty
    const randomFactor = Math.floor(Math.random() * 31) - 15; // -15 to +15 random
    const lazinessPenalty = -5;
    const blindScore = Math.max(0, Math.min(100, chaosBonus + supportBonus + loyaltyBonus + randomFactor + lazinessPenalty));

    // Set the score directly
    currentSlotTotal.value = blindScore;

    // Find matching outcome - if score is above max, use best outcome
    let outcome = plan.outcomes.find(o => blindScore >= o.minScore && blindScore <= o.maxScore);

    if (!outcome) {
      // If no match, check if score is above all ranges (too good!)
      const highestMaxScore = Math.max(...plan.outcomes.map(o => o.maxScore));
      if (blindScore > highestMaxScore) {
        // Score is excellent! Use best outcome (first one)
        outcome = plan.outcomes[0];
      } else {
        // Score is below all ranges, use worst outcome
        outcome = plan.outcomes[plan.outcomes.length - 1];
      }
    }

    // Apply immediate effects WITH situation modifier
    applyEffectsWithSituation(outcome.immediateEffects, planChoice);

    // Update stock prices based on plan effects
    updateStockPrices(plan.id);

    // Add to score (bonus for ideal choice, penalty for worst)
    let scoreModifier = 1.0;
    if (planChoice === 'ideal') scoreModifier = 1.5;
    if (planChoice === 'worst') scoreModifier = 0.5;
    currentScore.value += Math.max(0, Math.floor(blindScore * scoreModifier));

    // Queue delayed effects if any (also modified by situation)
    if (outcome.delayedEffects && outcome.delayedEffects.length > 0) {
      outcome.delayedEffects.forEach(delayedEffect => {
        // Modify delayed effects based on plan choice
        let modifiedEffects = { ...delayedEffect.effects };
        if (planChoice === 'ideal') {
          Object.keys(modifiedEffects).forEach(key => {
            const value = modifiedEffects[key as keyof GameStats];
            if (value !== undefined && value < 0) {
              modifiedEffects[key as keyof GameStats] = Math.floor(value * 0.7);
            }
          });
        } else if (planChoice === 'worst') {
          Object.keys(modifiedEffects).forEach(key => {
            const value = modifiedEffects[key as keyof GameStats];
            if (value !== undefined && value < 0) {
              modifiedEffects[key as keyof GameStats] = Math.floor(value * 1.5);
            }
          });
        }

        const effect: DelayedEffect = {
          id: `${plan.id}-${currentTurn.value}-${delayedEffect.turnsDelay}`,
          triggerTurn: currentTurn.value + delayedEffect.turnsDelay,
          planId: plan.id,
          description: delayedEffect.description,
          effects: modifiedEffects
        };
        pendingEffects.value.push(effect);
      });
    }

    // Juice messages
    addJuiceMessage({
      text: `👁️‍🗨️ The Orange went in BLIND! Score: ${blindScore} (Chaos +${chaosBonus}, Support +${supportBonus}, Loyalty +${loyaltyBonus}, Luck ${randomFactor}, Laziness ${lazinessPenalty})`,
      type: 'news'
    });

    addJuiceMessage({
      text: `📢 ${outcome.title}: ${outcome.description}`,
      type: 'news'
    });

    // Generate reaction messages based on plan choice quality
    generatePlanChoiceReactions(plan, planChoice);

    // Next turn
    currentTurn.value++;
    checkAchievements();
    startTurn();
  }

  function skipTurn() {
    // Going golfing restores health but costs loyalty and support
    const healthGain = Math.min(15, 100 - stats.value.health); // +15 health (max 100)
    stats.value.health = Math.min(100, stats.value.health + healthGain);
    stats.value.loyalty = Math.max(0, stats.value.loyalty - 2);
    stats.value.support = Math.max(0, stats.value.support - 2);
    
    if (healthGain > 0) {
      showStatChange('❤️', healthGain);
    }
    showStatChange('👥', -2);
    showStatChange('📊', -2);
    
    // Track for achievement
    achievementTracking.value.turnsSkipped++;

    addJuiceMessage({
      text: "⛳ The Orange went golfing again. Advisors left waiting. Followers not happy... #ExecutiveTime",
      type: 'news'
    });

    currentTurn.value++;
    checkAchievements();
    startTurn();
  }

  function applyEffects(effects: Partial<GameStats>) {
    Object.entries(effects).forEach(([key, value]) => {
      const statKey = key as keyof GameStats;
      if (statKey === 'money') {
        if (value! < 0 && stats.value.money + value! < 0) {
          debt.value += Math.abs(stats.value.money + value!);
          stats.value.money = 0;
          showStatChange('💰', value!);
        } else {
          stats.value[statKey] += value!;
          showStatChange('💰', value!);
        }
      } else if (statKey === 'coinValuation') {
        // CoinValuation has different bounds (50-150)
        const oldValue = stats.value.coinValuation;
        stats.value.coinValuation = Math.max(50, Math.min(150, stats.value.coinValuation + value!));
        const actualChange = stats.value.coinValuation - oldValue;
        if (actualChange !== 0) {
          showStatChange('🪙', actualChange);
        }
      } else {
        const oldValue = stats.value[statKey];
        stats.value[statKey] = Math.max(0, Math.min(100, stats.value[statKey] + value!));
        const actualChange = stats.value[statKey] - oldValue;

        // Show appropriate icon for each stat
        const icons: Record<string, string> = {
          health: '❤️',
          loyalty: '👥',
          support: '📊',
          luck: '🍀',
          chaos: '🌀'
        };

        if (actualChange !== 0 && icons[statKey]) {
          showStatChange(icons[statKey], actualChange);
        }
      }
    });
  }

  function processPendingEffects() {
    const triggered = pendingEffects.value.filter(e => e.triggerTurn === currentTurn.value);

    triggered.forEach(effect => {
      addJuiceMessage({
        text: `⚡ Delayed consequence: ${effect.description}`,
        type: 'news'
      });
      applyEffects(effect.effects);
    });

    pendingEffects.value = pendingEffects.value.filter(e => e.triggerTurn !== currentTurn.value);
  }

  // Calculate the required loyalty for second term based on chaos
  // High chaos lowers the threshold (chaos helps you get reelected with less loyalty)
  // But low chaos AND low loyalty requires higher score
  function getSecondTermLoyaltyThreshold(): number {
    const chaos = stats.value.chaos;
    // Base threshold 87 (balanced between old 85 and new 90)
    // High chaos (>50) reduces threshold (max 22 reduction)
    const chaosReduction = Math.floor((chaos / 100) * 22); // 0-22 reduction
    return Math.max(65, 87 - chaosReduction); // Min 65, base 87
  }

  // Calculate minimum score required based on chaos and loyalty situation
  function getMinimumScoreThreshold(): number {
    const chaos = stats.value.chaos;
    const loyalty = stats.value.loyalty;

    // If chaos is low (<30) and loyalty is low (<50), need higher score to compensate
    // This represents needing actual achievements when you can't rely on chaos or loyalty
    if (chaos < 30 && loyalty < 50) {
      const difficultyBonus = Math.floor((30 - chaos) + (50 - loyalty)) * 5;
      return difficultyBonus; // Extra score needed
    }
    return 0;
  }

  function checkGameOver(): boolean {
    if (stats.value.health <= 0) {
      isGameOver.value = true;
      gameOverReason.value = 'death';
      addJuiceMessage({
        text: "💀 The Orange has... expired. The juice has been squeezed.",
        type: 'news'
      });
      saveHighScore();
      return true;
    }

    if (stats.value.loyalty <= 0) {
      isGameOver.value = true;
      gameOverReason.value = 'leaked';
      addJuiceMessage({
        text: "🍋 THE LEMON FILES HAVE BEEN LEAKED! The truth about the Mandarin Business is out!",
        type: 'news'
      });
      saveHighScore();
      return true;
    }

    if (currentTurn.value > maxTurns.value) {
      const loyaltyThreshold = getSecondTermLoyaltyThreshold();
      const minimumScore = getMinimumScoreThreshold();
      const meetsLoyalty = stats.value.loyalty >= loyaltyThreshold;
      const meetsScore = currentScore.value >= minimumScore;

      if (meetsLoyalty && meetsScore && stats.value.support >= 40 && term.value === 1) {
        // Second term! (now requires minimum support too)
        term.value = 2;
        maxTurns.value = 32; // Keep at 32 instead of 96 (8 years total × 4 quarters)
        stats.value.health = Math.min(100, stats.value.health + 20);
        stats.value.loyalty = Math.max(50, stats.value.loyalty - 20);
        // Increase chaos slightly in second term
        stats.value.chaos = Math.min(100, stats.value.chaos + 10);
        addJuiceMessage({
          text: `🎉 SECOND TERM! The Orange persists! (Loyalty threshold was ${loyaltyThreshold}% thanks to ${stats.value.chaos > 40 ? 'chaos' : 'stability'})`,
          type: 'news'
        });
        return false;
      } else if (term.value === 2 && meetsLoyalty && meetsScore) {
        isGameOver.value = true;
        gameOverReason.value = 'victory';
        addJuiceMessage({
          text: "👑 IMPOSSIBLE! The Orange completed TWO TERMS! You absolute legend!",
          type: 'news'
        });
        currentScore.value *= 2; // Double score for victory
        saveHighScore();
        return true;
      } else {
        isGameOver.value = true;
        gameOverReason.value = 'term_ended';
        let reason = '';
        if (!meetsLoyalty) {
          reason = `Loyalty ${stats.value.loyalty}% below threshold ${loyaltyThreshold}%.`;
        } else if (!meetsScore) {
          reason = `Score ${currentScore.value} below required ${minimumScore} (low chaos + low loyalty penalty).`;
        } else if (stats.value.support < 40) {
          reason = `Support ${stats.value.support}% below required 40%.`;
        }
        addJuiceMessage({
          text: `📅 Term ended. ${reason} The Orange returns to private life... for now.`,
          type: 'news'
        });
        saveHighScore();
        return true;
      }
    }

    return false;
  }

  function saveHighScore() {
    if (currentScore.value > highScore.value) {
      highScore.value = currentScore.value;
      localStorage.setItem('orangeHighScore', highScore.value.toString());
    }
  }

  function addJuiceMessage(msg: Omit<JuiceMessage, 'id' | 'turn'>) {
    const message: JuiceMessage = {
      ...msg,
      id: `juice-${Date.now()}-${Math.random()}`,
      turn: currentTurn.value
    };
    
    // 10% chance for critical post (only news/rumor)
    if ((msg.type === 'news' || msg.type === 'rumor') && Math.random() < 0.1) {
      message.text = CRITICAL_MESSAGES[Math.floor(Math.random() * CRITICAL_MESSAGES.length)];
      message.isCritical = true;
      message.hasBeenModerated = false;
      message.type = 'news'; // Critical posts are always news
    }
    
    // 8% chance for positive post that can be engaged with
    if ((msg.type === 'news' || msg.type === 'nonsense') && Math.random() < 0.08) {
      message.text = POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];
      message.isPositive = true;
      message.hasBeenEngaged = false;
      message.type = 'positive';
    }
    
    juiceMessages.value.unshift(message);

    // Keep only last 50 messages
    if (juiceMessages.value.length > 50) {
      juiceMessages.value = juiceMessages.value.slice(0, 50);
    }
    
    // Schedule mock comments for critical posts after 8 turns if not moderated
    if (message.isCritical) {
      setTimeout(() => {
        const msg = juiceMessages.value.find(m => m.id === message.id);
        if (msg && !msg.hasBeenModerated) {
          addMockCommentsToPost(message.id);
        }
      }, 100); // Check immediately in next tick
    }
  }

  function deletePost(messageId: string) {
    const DELETE_COST = 50;
    const hadMoney = stats.value.money >= 0; // If not already in debt
    
    // Deduct cost (can go negative = debt)
    stats.value.money -= DELETE_COST;
    showStatChange('💰', -DELETE_COST);
    
    // If now in debt OR already in debt (borrowing more), increase interest
    if (stats.value.money < 0) {
      interestRate.value = Math.min(0.25, interestRate.value + 0.02); // +2% (0.02 as decimal)
      if (hadMoney) {
        addJuiceMessage({
          text: `💸 Went into debt to delete post! Interest rate increased to ${(interestRate.value * 100).toFixed(1)}%! #Borrowing #Debt`,
          type: 'news'
        });
      } else {
        addJuiceMessage({
          text: `💸 Borrowed more to delete post! Interest rate now ${(interestRate.value * 100).toFixed(1)}%! #DebtSpiral`,
          type: 'news'
        });
      }
    }
    
    // Small loyalty hit for censorship
    stats.value.loyalty = Math.max(0, stats.value.loyalty - 3);
    showStatChange('👥', -3);
    
    // Track for achievement
    achievementTracking.value.postsDeleted++;
    
    // Mark as moderated and remove from feed
    const index = juiceMessages.value.findIndex(m => m.id === messageId);
    if (index !== -1) {
      juiceMessages.value[index].hasBeenModerated = true;
      juiceMessages.value.splice(index, 1);
    }
    
    addJuiceMessage({
      text: '🚫 [This post has been deleted by The Orange]',
      type: 'nonsense'
    });
    
    checkAchievements();
    return true;
  }

  function banUser(messageId: string) {
    const BAN_COST = 200;
    const hadMoney = stats.value.money >= 0; // If not already in debt
    
    // Deduct cost (can go negative = debt)
    stats.value.money -= BAN_COST;
    showStatChange('💰', -BAN_COST);
    
    // If now in debt OR already in debt (borrowing more), increase interest
    if (stats.value.money < 0) {
      interestRate.value = Math.min(0.25, interestRate.value + 0.02); // +2% (0.02 as decimal)
      if (hadMoney) {
        addJuiceMessage({
          text: `💸 Borrowed money to ban user! Interest rate now ${(interestRate.value * 100).toFixed(1)}%! #DeepDebt #Desperate`,
          type: 'news'
        });
      } else {
        addJuiceMessage({
          text: `💸 Borrowed even MORE to ban! Interest rate ${(interestRate.value * 100).toFixed(1)}%! #DebtMounting`,
          type: 'news'
        });
      }
    }
    
    // Bigger loyalty hit + chaos increase
    stats.value.loyalty = Math.max(0, stats.value.loyalty - 5);
    stats.value.chaos = Math.min(100, stats.value.chaos + 10);
    showStatChange('👥', -5);
    showStatChange('🌀', 10);
    
    // Track for achievement
    achievementTracking.value.usersBanned++;
    
    // Mark as moderated and remove post
    const index = juiceMessages.value.findIndex(m => m.id === messageId);
    if (index !== -1) {
      juiceMessages.value[index].hasBeenModerated = true;
      juiceMessages.value.splice(index, 1);
    }
    
    addJuiceMessage({
      text: '🔨 [User has been permanently banned by The Orange]',
      type: 'nonsense'
    });
    
    checkAchievements();
    return true;
  }

  function addMockCommentsToPost(messageId: string) {
    const message = juiceMessages.value.find(m => m.id === messageId);
    if (!message || message.hasBeenModerated) return;
    
    // Track for achievement
    achievementTracking.value.criticalPostsIgnored++;
    
    // Salty mock comments
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
    
    // Add 3-5 random comments with delays
    const commentCount = 3 + Math.floor(Math.random() * 3); // 3-5 comments
    message.mockComments = [];
    
    for (let i = 0; i < commentCount; i++) {
      const delay = 500 + Math.random() * 1000; // 0.5-1.5 seconds
      
      setTimeout(() => {
        if (message.hasBeenModerated) return; // Stop if moderated in the meantime
        
        const availableComments = mockComments.filter(c => !message.mockComments?.includes(c));
        if (availableComments.length > 0) {
          const randomComment = availableComments[Math.floor(Math.random() * availableComments.length)];
          if (!message.mockComments) message.mockComments = [];
          message.mockComments.push(randomComment);
        }
      }, delay * (i + 1)); // Stagger the delays
    }

    // Apply penalties after 8 turns
    setTimeout(() => {
      if (message.hasBeenModerated || (currentTurn.value - message.turn < 8)) return;
      
      // Harsh penalties for ignoring critical posts
      stats.value.loyalty = Math.max(0, stats.value.loyalty - 5);
      stats.value.support = Math.max(0, stats.value.support - 5);
      stats.value.health = Math.max(0, stats.value.health - 5);
      
      showStatChange('👥', -5);
      showStatChange('📊', -5);
      showStatChange('❤️', -5);
      
      addJuiceMessage({
        text: `💥 @TheOrangeOfficial ignored critical scandal! Loyalty, support, AND health all tanking! #Consequences`,
        type: 'news'
      });
    }, 100);
  }

  function engageWithPositivePost(messageId: string, commentIndex: number) {
    const message = juiceMessages.value.find(m => m.id === messageId);
    if (!message || message.hasBeenEngaged || !message.isPositive) return;
    
    const comment = ORANGE_COMMENTS[commentIndex];
    message.hasBeenEngaged = true;
    message.selectedComment = comment;
    
    // Rewards for engaging with positive content
    const supportGain = 3 + Math.floor(Math.random() * 3); // 3-5 support
    const loyaltyGain = 2 + Math.floor(Math.random() * 2); // 2-3 loyalty
    
    stats.value.support = Math.min(100, stats.value.support + supportGain);
    stats.value.loyalty = Math.min(100, stats.value.loyalty + loyaltyGain);
    
    showStatChange('📊', supportGain);
    showStatChange('👥', loyaltyGain);
    
    addJuiceMessage({
      text: `🎉 @TheOrangeOfficial ENGAGES with supporters! "${comment}" Fanbase ENERGIZED! #WinningBigly`,
      type: 'nonsense'
    });
    
    checkAchievements();
    return true;
  }

  function likePositivePost(messageId: string) {
    const message = juiceMessages.value.find(m => m.id === messageId);
    if (!message || message.hasBeenEngaged || !message.isPositive) return;
    
    message.hasBeenEngaged = true;
    
    // Small rewards for just liking
    const supportGain = 1 + Math.floor(Math.random() * 2); // 1-2 support
    
    stats.value.support = Math.min(100, stats.value.support + supportGain);
    
    showStatChange('📊', supportGain);
    
    addJuiceMessage({
      text: `❤️ @TheOrangeOfficial likes a post praising him! Fans go WILD! #SelfLove`,
      type: 'nonsense'
    });
    
    checkAchievements();
    return true;
  }

  function generateTurnJuice() {
    // Generate 1-2 random messages per turn (reduced since we have situation hints)
    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const msg = generateJuiceMessage(availablePlans.value, stats.value, currentTurn.value);
      addJuiceMessage(msg);
    }
  }

  function generateSituationHints() {
    if (!currentSituation.value) return;

    // Add 2-3 hints about the current situation
    const hints = currentSituation.value.hints;
    const hintCount = 2 + Math.floor(Math.random() * 2); // 2-3 hints
    const selectedHints = [...hints].sort(() => Math.random() - 0.5).slice(0, hintCount);

    selectedHints.forEach((hint, index) => {
      // Stagger the hints slightly
      setTimeout(() => {
        addJuiceMessage({
          text: hint,
          type: 'situation'
        });
      }, index * 200);
    });
  }

  // Check if chosen plan matches the situation
  function evaluatePlanChoice(plan: PlanCard): 'ideal' | 'worst' | 'neutral' {
    if (!currentSituation.value) return 'neutral';

    if (currentSituation.value.idealCategories.includes(plan.category)) {
      return 'ideal';
    }
    if (currentSituation.value.worstCategories.includes(plan.category)) {
      return 'worst';
    }
    return 'neutral';
  }

  // Apply situation multiplier to effects
  function applyEffectsWithSituation(effects: Partial<GameStats>, choice: 'ideal' | 'worst' | 'neutral') {
    if (!currentSituation.value || choice === 'neutral') {
      applyEffects(effects);
      return;
    }

    const modifiedEffects: Partial<GameStats> = {};

    Object.entries(effects).forEach(([key, value]) => {
      if (value === undefined) return;
      const statKey = key as keyof GameStats;

      if (choice === 'ideal') {
        // Ideal choice: boost positive effects, reduce negative effects
        if (value > 0) {
          modifiedEffects[statKey] = Math.floor(value * currentSituation.value!.bonusMultiplier);
        } else {
          modifiedEffects[statKey] = Math.floor(value * 0.7); // Reduce penalties by 30%
        }
      } else if (choice === 'worst') {
        // Worst choice: reduce positive effects, boost negative effects
        if (value > 0) {
          modifiedEffects[statKey] = Math.floor(value * 0.5); // Halve rewards
        } else {
          modifiedEffects[statKey] = Math.floor(value * currentSituation.value!.penaltyMultiplier);
        }
      }
    });

    applyEffects(modifiedEffects);
  }

  // Generate reaction messages based on plan choice
  function generatePlanChoiceReactions(plan: PlanCard, choice: 'ideal' | 'worst' | 'neutral') {
    const idealReactions = [
      `🎯 PERFECT MOVE! ${plan.name} is exactly what the situation called for! #BigBrainOrange`,
      `✅ Advisors are THRILLED! "${plan.name}" was the right call! #WinningStrategy`,
      `🌟 Brilliant timing! The Orange reads the room PERFECTLY! #StableGenius`,
      `👏 Inner circle applauds! This is why they follow The Orange! #Leadership`,
      `📈 Smart choice! ${plan.name} addresses the crisis head-on! #StrategicGenius`
    ];

    const worstReactions = [
      `❌ DISASTER! ${plan.name} is the WORST possible move right now! #OrangeBlunder`,
      `😱 Advisors in SHOCK! "Why ${plan.name} NOW?!" they ask! #BadTiming`,
      `🔥 Critics pounce! "Completely tone-deaf!" says opposition! #OutOfTouch`,
      `📉 Wrong move at the wrong time! The situation demanded something else! #Fail`,
      `💀 Political analysts can't believe it! "${plan.name}" ignores the obvious crisis! #Clueless`,
      `🤦 Staff members reportedly "face-palming" after ${plan.name} announcement! #Yikes`
    ];

    const neutralReactions = [
      `🤷 ${plan.name} is... a choice. Not great, not terrible. #MidMove`,
      `📊 Mixed reactions to ${plan.name}. Could've been more strategic. #Meh`,
      `😐 Advisors shrug at ${plan.name}. "It's fine, I guess?" #Whatever`
    ];

    let reactions: string[];
    let reactionCount: number;

    if (choice === 'ideal') {
      reactions = idealReactions;
      reactionCount = 2 + Math.floor(Math.random() * 2); // 2-3 positive reactions
    } else if (choice === 'worst') {
      reactions = worstReactions;
      reactionCount = 3 + Math.floor(Math.random() * 2); // 3-4 negative reactions
    } else {
      reactions = neutralReactions;
      reactionCount = 1; // 1 neutral reaction
    }

    const selectedReactions = [...reactions].sort(() => Math.random() - 0.5).slice(0, reactionCount);

    selectedReactions.forEach((reaction, index) => {
      setTimeout(() => {
        addJuiceMessage({
          text: reaction,
          type: choice === 'ideal' ? 'positive' : (choice === 'worst' ? 'news' : 'nonsense')
        });
      }, 500 + index * 300);
    });
  }

  function getShareText(): string {
    const emoji = gameOverReason.value === 'victory' ? '👑' :
                  gameOverReason.value === 'death' ? '💀' :
                  gameOverReason.value === 'leaked' ? '🍋' : '📅';

    return `${emoji} I scored ${currentScore.value} points in Orange Not Lemons! ` +
           `Survived ${currentTurn.value - 1} months. ` +
           `Can you beat my score? 🍊 #OrangeNotLemons`;
  }

  function addPlayerRant(text: string, successProbability: number, botCount: number): number {
    const rantMessage: JuiceMessage = {
      id: `player-${Date.now()}`,
      text,
      type: 'player',
      turn: currentTurn.value
    };
    juiceMessages.value.unshift(rantMessage);

    // Use success probability to determine outcome
    const roll = Math.random() * 100;
    const isPositive = roll < successProbability;
    
    // Calculate change based on success/failure
    let change: number;
    if (isPositive) {
      // Success: +5 to +15 support
      change = Math.floor(Math.random() * 11) + 5;
    } else {
      // Failure: -10 to -20 support
      change = -(Math.floor(Math.random() * 11) + 10);
    }
    
    stats.value.support = Math.max(0, Math.min(100, stats.value.support + change));

    // Show stat change popover
    showStatChange('📊', change);

    // Add reaction message with bot info
    let reactionMessage: string;
    if (isPositive) {
      const likes = Math.abs(change * 12) + (botCount * 2);
      reactionMessage = `📈 Your rant got ${likes}K likes! Support +${change}! #Trending`;
      if (botCount > 0) {
        reactionMessage += ` 🤖 (${botCount}K bots helped!)`;
      }
    } else {
      const unlikes = Math.abs(change * 8);
      reactionMessage = `📉 Your rant backfired! ${unlikes}K people unfollowed! Support ${change}! #Yikes`;
      if (botCount > 0) {
        reactionMessage += ` 🤖 (Even bots couldn't save this one!)`;
      }
    }
    
    setTimeout(() => {
      juiceMessages.value.unshift({
        id: `reaction-${Date.now()}`,
        text: reactionMessage,
        type: 'news',
        turn: currentTurn.value
      });
    }, 500);

    return change;
  }

  function rant(botCount: number) {
    // Simple rant function for tests
    // Calculate success probability
    const baseProbability = 30; // Lower base from 50 to 30
    const loyaltyBonus = Math.floor(stats.value.loyalty * 0.25); // Reduced from 0.3
    const supportBonus = Math.floor(stats.value.support * 0.15); // Reduced from 0.2
    const successProbability = Math.min(90, Math.max(5, baseProbability + loyaltyBonus + supportBonus));
    
    // Generate generic rant text
    const rantTexts = [
      "FAKE NEWS! They're all lying about me! #TruthMatters",
      "Nobody does it better than me! NOBODY! #Winner",
      "The haters are just jealous of my success! SAD!",
      "Making Fruit Great Again, one decision at a time! 🍊",
      "My opponents are weak! I am STRONG! #Leadership"
    ];
    const text = rantTexts[Math.floor(Math.random() * rantTexts.length)];
    
    // Track achievement
    achievementTracking.value.rantsPosted++;
    
    // Use existing addPlayerRant
    return addPlayerRant(text, successProbability, botCount);
  }

  function showStatChange(icon: string, value: number) {
    const notification: StatChangeNotification = {
      id: `${Date.now()}-${Math.random()}`,
      icon,
      value
    };
    statChangeNotifications.value.push(notification);
    
    // Auto-remove after 2 seconds
    setTimeout(() => {
      const index = statChangeNotifications.value.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        statChangeNotifications.value.splice(index, 1);
      }
    }, 2000);
  }

  function checkAchievements() {
    const gameState = {
      currentTurn: currentTurn.value,
      term: term.value,
      stats: stats.value,
      debt: debt.value,
      currentScore: currentScore.value,
      juiceMessages: juiceMessages.value,
      ...achievementTracking.value
    };

    achievements.value.forEach(achievement => {
      if (!achievement.unlocked && achievement.condition(gameState)) {
        achievement.unlocked = true;
        achievement.unlockedAt = currentTurn.value;
        newlyUnlockedAchievements.value.push({ ...achievement });
        
        // Show notification
        addJuiceMessage({
          text: `🏆 Achievement Unlocked: ${achievement.emoji} ${achievement.name}! ${achievement.description}`,
          type: 'news'
        });
      }
    });
  }
  
  function dismissAchievement(achievementId: string) {
    const index = newlyUnlockedAchievements.value.findIndex(a => a.id === achievementId);
    if (index !== -1) {
      newlyUnlockedAchievements.value.splice(index, 1);
    }
  }
  
  function setTutorialCompleted() {
    tutorialCompleted.value = true;
    localStorage.setItem('orangeTutorialCompleted', 'true');
  }

  // Trading functions
  function buyCoinTokens(amount: number, cost: number) {
    stats.value.money -= cost;
    coinHoldings.value += amount;
    
    showStatChange('💰', -cost);
    
    const isMarginTrading = stats.value.money < 0;
    
    addJuiceMessage({
      text: isMarginTrading 
        ? `📈 @TheOrangeOfficial buys ${amount.toLocaleString()} market shares ON MARGIN! Risky! #MarketManipulation #BigBrain`
        : `📈 @TheOrangeOfficial acquires ${amount.toLocaleString()} market shares! Strategic move! #Investing #StockMarket`,
      type: 'news'
    });
    
    // No loyalty change - market manipulation is neutral
  }

  function sellCoinTokens(amount: number, revenue: number) {
    if (coinHoldings.value >= amount) {
      coinHoldings.value -= amount;
      stats.value.money += revenue;
      
      showStatChange('💰', revenue);
      
      addJuiceMessage({
        text: `💸 @TheOrangeOfficial dumps ${amount.toLocaleString()} shares for ${revenue}B! Taking profits! #SellHigh #Markets`,
        type: 'news'
      });
      
      // No loyalty change - it's just business
    }
  }

  function shortCoinTokens(amount: number, revenue: number) {
    // Short selling: receive money, but go negative on shares
    stats.value.money += revenue;
    coinHoldings.value -= amount; // Go negative
    
    showStatChange('💰', revenue);
    
    addJuiceMessage({
      text: `📉 @TheOrangeOfficial shorts ${amount.toLocaleString()} shares! Betting on market crash! #ShortSelling #BearMarket`,
      type: 'news'
    });
  }

  function closePosition(currentPosition: number, proceeds: number) {
    if (currentPosition > 0) {
      // Closing long position: sell all shares
      stats.value.money += proceeds;
      coinHoldings.value = 0;
      
      showStatChange('💰', proceeds);
      
      addJuiceMessage({
        text: `💸 @TheOrangeOfficial closes long position for ${proceeds}B! ${proceeds > 0 ? 'Profit secured!' : 'Cut losses!'} #ExitStrategy`,
        type: 'news'
      });
    } else if (currentPosition < 0) {
      // Closing short position: buy back shares
      stats.value.money += proceeds; // proceeds is negative (cost)
      coinHoldings.value = 0;
      
      showStatChange('💰', proceeds);
      
      const profit = proceeds > 0;
      addJuiceMessage({
        text: `🔒 @TheOrangeOfficial closes short position! ${profit ? 'Short squeeze averted!' : 'Covered the short!'} #ShortCovering`,
        type: 'news'
      });
    }
  }

  // Stock Trading Functions (for multiple stocks)
  function buyStock(stockId: string, shares: number) {
    const stock = stocks.value.find(s => s.id === stockId);
    if (!stock) return;

    const cost = Math.ceil((shares * stock.currentPrice) / 100);
    stats.value.money -= cost;

    // Update portfolio
    if (!portfolio.value[stockId]) {
      portfolio.value[stockId] = { shares: 0, averageCost: stock.currentPrice };
    }

    const currentPosition = portfolio.value[stockId];
    const totalShares = currentPosition.shares + shares;
    const totalCost = (currentPosition.shares * currentPosition.averageCost) + (shares * stock.currentPrice);
    currentPosition.averageCost = totalCost / totalShares;
    currentPosition.shares = totalShares;

    // Track trade result for animations
    lastTradeResult.value = {
      stockId,
      type: 'buy',
      shares,
      amount: -cost,
      timestamp: Date.now()
    };

    showStatChange('💰', -cost);

    const isMarginTrading = stats.value.money < 0;
    addJuiceMessage({
      text: `📈 @TheOrangeOfficial buys ${shares.toLocaleString()} ${stock.emoji} ${stock.name} shares${isMarginTrading ? ' ON MARGIN' : ''}! ${isMarginTrading ? 'Risky move!' : 'Big money!'} #Trading`,
      type: 'news'
    });
  }

  function sellStock(stockId: string, shares: number) {
    const stock = stocks.value.find(s => s.id === stockId);
    if (!stock) return;

    const position = portfolio.value[stockId];
    if (!position || position.shares < shares) return;

    const sellPrice = Math.ceil(stock.currentPrice * 0.8); // 20% spread
    const revenue = Math.ceil((shares * sellPrice) / 100);

    // Calculate profit/loss
    const costBasis = Math.ceil((shares * position.averageCost) / 100);
    const profitLoss = revenue - costBasis;

    stats.value.money += revenue;
    position.shares -= shares;

    if (position.shares === 0) {
      delete portfolio.value[stockId];
    }

    // Track trade result for animations
    lastTradeResult.value = {
      stockId,
      type: 'sell',
      shares,
      amount: revenue,
      profitLoss,
      timestamp: Date.now()
    };

    showStatChange('💰', revenue);

    addJuiceMessage({
      text: `💸 @TheOrangeOfficial sells ${shares.toLocaleString()} ${stock.emoji} ${stock.name} shares for ${revenue}B! ${profitLoss >= 0 ? 'Profit!' : 'Cut losses!'} #Trading`,
      type: 'news'
    });
  }

  function shortStock(stockId: string, shares: number) {
    const stock = stocks.value.find(s => s.id === stockId);
    if (!stock) return;

    const sellPrice = Math.ceil(stock.currentPrice * 0.8); // Sell at spread price
    const revenue = Math.ceil((shares * sellPrice) / 100);
    stats.value.money += revenue;

    // Update portfolio with negative shares
    if (!portfolio.value[stockId]) {
      portfolio.value[stockId] = { shares: 0, averageCost: stock.currentPrice };
    }

    portfolio.value[stockId].shares -= shares; // Go negative
    portfolio.value[stockId].averageCost = stock.currentPrice; // Track short entry price

    // Track trade result for animations
    lastTradeResult.value = {
      stockId,
      type: 'short',
      shares,
      amount: revenue,
      timestamp: Date.now()
    };

    showStatChange('💰', revenue);

    addJuiceMessage({
      text: `📉 @TheOrangeOfficial shorts ${shares.toLocaleString()} ${stock.emoji} ${stock.name}! Betting on crash! #ShortSelling #BearMarket`,
      type: 'news'
    });
  }

  function closeStockPosition(stockId: string) {
    const stock = stocks.value.find(s => s.id === stockId);
    if (!stock) return;

    const position = portfolio.value[stockId];
    if (!position || position.shares === 0) return;

    let proceeds = 0;
    let profitLoss = 0;
    const shares = Math.abs(position.shares);

    if (position.shares > 0) {
      // Closing long: sell at spread price
      const sellPrice = Math.ceil(stock.currentPrice * 0.8);
      proceeds = Math.ceil((shares * sellPrice) / 100);
      const costBasis = Math.ceil((shares * position.averageCost) / 100);
      profitLoss = proceeds - costBasis;
      stats.value.money += proceeds;

      addJuiceMessage({
        text: `💸 @TheOrangeOfficial closes ${stock.emoji} ${stock.name} for ${proceeds}B! ${profitLoss >= 0 ? 'Winner!' : 'Ouch!'} #ExitStrategy`,
        type: 'news'
      });
    } else {
      // Closing short: buy back at current price
      const buyPrice = stock.currentPrice;
      const cost = Math.ceil((shares * buyPrice) / 100);
      const shortRevenue = Math.ceil((shares * position.averageCost * 0.8) / 100);
      profitLoss = shortRevenue - cost;
      stats.value.money -= cost;
      proceeds = -cost;

      addJuiceMessage({
        text: `🔒 @TheOrangeOfficial covers ${stock.emoji} ${stock.name} short! ${profitLoss >= 0 ? 'Profit!' : 'Squeezed!'} #ShortCovering`,
        type: 'news'
      });
    }

    // Track trade result for animations
    lastTradeResult.value = {
      stockId,
      type: 'close',
      shares,
      amount: proceeds,
      profitLoss,
      timestamp: Date.now()
    };

    delete portfolio.value[stockId];
    showStatChange('💰', proceeds);
  }

  // Research a stock to reveal hints about plan effects
  function researchStock(planId: string, stockId: string): number {
    const key = `${planId}-${stockId}`;
    const currentLevel = stockResearch.value[key] || 0;

    if (currentLevel >= 3) return 3; // Already fully researched

    // Increase research level
    const newLevel = Math.min(3, currentLevel + 1) as 0 | 1 | 2 | 3;
    stockResearch.value[key] = newLevel;

    return newLevel;
  }

  // Get research level for a specific plan-stock combination
  function getStockResearchLevel(planId: string, stockId: string): number {
    return stockResearch.value[`${planId}-${stockId}`] || 0;
  }

  // Clear trade result (after animation completes)
  function clearTradeResult() {
    lastTradeResult.value = null;
  }

  function updateStockPrices(planId: string) {
    // Get stock effects for this plan
    const effects = PLAN_STOCK_EFFECTS[planId];
    if (!effects) return;

    effects.forEach(effect => {
      const stock = stocks.value.find(s => s.id === effect.stockId);
      if (stock) {
        const changePercent = effect.change / 100;
        const newPrice = Math.max(10, Math.ceil(stock.currentPrice * (1 + changePercent)));
        stock.currentPrice = newPrice;
        
        // Update price history (keep last 10 prices)
        if (!stock.priceHistory) stock.priceHistory = [stock.basePrice];
        stock.priceHistory.push(newPrice);
        if (stock.priceHistory.length > 10) {
          stock.priceHistory.shift();
        }
        
        addJuiceMessage({
          text: `${stock.emoji} ${stock.name}: ${effect.change > 0 ? '📈' : '📉'} ${Math.abs(effect.change)}%! ${effect.reason} #StockMarket`,
          type: 'news'
        });
      }
    });
  }

  // Computed for portfolio value
  const portfolioValue = computed(() => {
    let total = 0;
    Object.entries(portfolio.value).forEach(([stockId, position]) => {
      const stock = stocks.value.find(s => s.id === stockId);
      if (stock) {
        if (position.shares > 0) {
          // Long position: current sell value
          const sellPrice = Math.ceil(stock.currentPrice * 0.8);
          total += Math.ceil((position.shares * sellPrice) / 100);
        } else {
          // Short position: cost to buy back (negative)
          const buyPrice = stock.currentPrice;
          total += Math.ceil((position.shares * buyPrice) / 100);
        }
      }
    });
    return total;
  });

  // Total cost basis of all positions
  const portfolioCost = computed(() => {
    let total = 0;
    Object.entries(portfolio.value).forEach(([stockId, position]) => {
      if (position.shares > 0) {
        // Long: we paid averageCost per share
        total += Math.ceil((position.shares * position.averageCost) / 100);
      } else {
        // Short: we received averageCost per share (negative cost = profit received)
        total -= Math.ceil((Math.abs(position.shares) * position.averageCost) / 100);
      }
    });
    return total;
  });

  // Unrealized profit/loss
  const portfolioProfit = computed(() => {
    return portfolioValue.value - portfolioCost.value;
  });

  return {
    // State
    currentTurn,
    maxTurns,
    term,
    isGameOver,
    gameOverReason,
    stats,
    debt,
    interestRate,
    coinHoldings,
    portfolio,
    stocks,
    availablePlans,
    selectedPlan,
    timeRemaining,
    pendingEffects,
    juiceMessages,
    financialHistory,
    statChangeNotifications,
    slotSpinsRemaining,
    currentSlotTotal,
    slotResults,
    highScore,
    currentScore,
    showAnnualReport,
    tutorialCompleted,
    currentSituation,
    lastPlanChoice,
    achievements,
    newlyUnlockedAchievements,
    achievementTracking,
    // Computed
    healthTier,
    maxCards,
    researchMultiplier,
    monthName,
    quarterName,
    year,
    portfolioValue,
    portfolioCost,
    portfolioProfit,
    // Actions
    initGame,
    startTurn,
    startTimer,
    stopTimer,
    closeAnnualReport,
    selectPlan,
    researchPlan,
    researchPlanRandom,
    spinSlot,
    executePlan,
    executeBlindPlay,
    calculateBlindScore,
    skipTurn,
    addJuiceMessage,
    addPlayerRant,
    rant,
    deletePost,
    banUser,
    engageWithPositivePost,
    likePositivePost,
    showStatChange,
    checkAchievements,
    dismissAchievement,
    setTutorialCompleted,
    getShareText,
    getAdjustedCost,
    getSecondTermLoyaltyThreshold,
    getMinimumScoreThreshold,
    evaluatePlanChoice,
    buyCoinTokens,
    sellCoinTokens,
    shortCoinTokens,
    closePosition,
    buyStock,
    sellStock,
    shortStock,
    closeStockPosition,
    updateStockPrices,
    researchStock,
    getStockResearchLevel,
    clearTradeResult,
    stockResearch,
    lastTradeResult
  };
});
