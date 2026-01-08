import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  GameState,
  GameStats,
  PlanCard,
  DelayedEffect,
  JuiceMessage,
  SlotResult,
  FinancialSnapshot
} from '@/types/game';
import { INITIAL_STATS, HEALTH_TIERS, SLOT_SYMBOLS } from '@/types/game';
import { getRandomPlans, ALL_PLANS } from '@/data/plans';
import { generateJuiceMessage } from '@/data/juice';
import { ACHIEVEMENTS, type Achievement } from '@/types/achievements';

// Import critical messages
const CRITICAL_MESSAGES = [
  "🚨 BREAKING: Leaked documents show @TheOrangeOfficial's tax returns are... interesting. Very interesting. #LemonFiles",
  "📉 Reports: Multiple advisors quit this week citing 'moral concerns' and 'sanity preservation' #ExodusWatch",
  "🔍 Investigation reveals @TheOrangeOfficial's degree is from 'Totally Legit University Online' #FakeCredentials",
  "💰 Sources: @TheOrangeOfficial owes $500B to foreign entities. 'Business as usual' says spokesperson #FollowTheMoney",
  "🤥 Fact-check: @TheOrangeOfficial made 247 false claims this week. That's a new record! #PathologicalLiar",
  "😬 Former aide: 'He can't read. We use picture books.' White House: 'FAKE NEWS!' #TellAll",
  "🍋 Whistleblower: 'The Lemon Files are real. I have copies.' #ThisIsHuge #Scandal",
  "📱 @TheOrangeOfficial accidentally tweets nuclear codes. Again. #NationalSecurity #Oops",
  "🤡 Polls show 73% of fruits think @TheOrangeOfficial is 'embarrassing' and 'unqualified' #Approval",
  "📰 NYT: 'The Orange is losing his mind' - 12 current aides confirm #Anonymous #Chaos",
  "💸 Forensic accountant: 'This isn't creative accounting, this is fraud' #FollowTheMoney",
  "🎪 World leaders caught laughing at @TheOrangeOfficial during summit #NoRespect #Humiliating",
  "⚖️ Breaking: Grand jury indictments imminent. @TheOrangeOfficial lawyers lawyering up lawyers #LegalTrouble",
  "🔥 Leaked audio: @TheOrangeOfficial admits 'I have no idea what I'm doing' #TruthSlips",
  "📉 Stock market tanks after @TheOrangeOfficial tweet storm. Again. #EconomicAnxiety",
  "🌍 Foreign press: 'America elected... THAT?!' #WorldwideDisbelief",
  "🤦 Staff physically removes Sharpie from @TheOrangeOfficial's hand during weather briefing #StableGenius",
  "💀 Medical experts: '@TheOrangeOfficial shows clear signs of cognitive decline' #Concerning",
  "🗳️ Election officials: 'He definitely lost. By a lot. Stop asking.' #DenialAintJustaRiver",
  "🎤 Hot mic catches @TheOrangeOfficial: 'These idiots believe everything I say' #Leaked",
  "📊 Insider trading investigation focuses on @TheOrangeOfficial's suspiciously timed tweets #SEC",
  "🔐 Former general: '@TheOrangeOfficial gave classified intel to enemies for laughs' #Treason?",
  "💩 Aide reveals: 'We have a team that just follows him cleaning up disasters' #DamageControl",
  "🎭 Psychologist: '@TheOrangeOfficial exhibits textbook narcissistic personality disorder' #Diagnosis",
  "📱 Twitter removes @TheOrangeOfficial post for 'inciting violence'. Again. #PlatformViolations",
  "🏦 Bank leaks: @TheOrangeOfficial's accounts show 'extremely suspicious activity' #MoneyLaundering",
  "🤬 Veteran aide quits: 'I can't work for this man anymore. My conscience won't allow it' #Morals",
  "📰 Bombshell report: @TheOrangeOfficial family profited $2B from presidency #Corruption",
  "🎪 Late night hosts have field day with latest @TheOrangeOfficial gaffe #CantMakeThisUp",
  "⚡ Staff caught editing @TheOrangeOfficial's speeches in real-time to 'make sense' #Embarrassing",
  "🌐 International community: 'We no longer take @TheOrangeOfficial seriously' #Reputation",
  "💼 Business partners: 'We're distancing ourselves from the Orange brand' #Toxic",
  "🔊 Leaked call: @TheOrangeOfficial tries to pressure officials to 'find votes' #ElectionFraud",
  "📉 Loyalty among inner circle at all-time low. 'Everyone's looking for exits' #SinkingShip",
  "🎯 Critics: '@TheOrangeOfficial is the most corrupt leader in modern history' #Legacy",
];

export const useGameStore = defineStore('game', () => {
  // Core state
  const currentTurn = ref(1);
  const maxTurns = ref(48);
  const term = ref<1 | 2>(1);
  const isGameOver = ref(false);
  const gameOverReason = ref<'death' | 'leaked' | 'term_ended' | 'victory' | null>(null);

  // Stats
  const stats = ref<GameStats>({ ...INITIAL_STATS });

  // Debt
  const debt = ref(0);
  const interestRate = ref(0.08); // 8% base interest (increased from 5%)
  
  // Loyalty recovery tracking
  const lastLoyaltyRecoveryTurn = ref(0);

  // Turn state
  const availablePlans = ref<PlanCard[]>([]);
  const selectedPlan = ref<PlanCard | null>(null);
  const timeRemaining = ref(30);
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

  const monthName = computed(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[(currentTurn.value - 1) % 12];
  });

  const year = computed(() => {
    return Math.floor((currentTurn.value - 1) / 12) + 1;
  });

  // Actions
  function initGame() {
    currentTurn.value = 1;
    maxTurns.value = 48;
    term.value = 1;
    isGameOver.value = false;
    gameOverReason.value = null;
    stats.value = { ...INITIAL_STATS };
    debt.value = 0;
    interestRate.value = 0.08; // Match new base rate
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

    // Apply interest on debt (affected by chaos and coinValuation)
    if (debt.value > 0) {
      // Higher chaos increases effective interest rate
      // Lower coinValuation also increases effective interest rate
      const chaosInterestBonus = (stats.value.chaos / 100) * 0.05; // Up to +5% at max chaos
      const valuationInterestBonus = ((100 - stats.value.coinValuation) / 100) * 0.03; // Up to +3% at low valuation
      const effectiveRate = interestRate.value + chaosInterestBonus + valuationInterestBonus;

      const interest = Math.floor(debt.value * effectiveRate);
      debt.value += interest;
      addJuiceMessage({
        text: `💸 Interest payment: ${interest}B coins. Total debt: ${debt.value}B. Rate: ${(effectiveRate * 100).toFixed(1)}%`,
        type: 'news'
      });
    }

    // Fluctuate coin valuation based on chaos
    updateCoinValuation();

    // Record financial snapshot for Cliff Street
    recordFinancialSnapshot();

    // Check game over conditions
    if (checkGameOver()) return;

    // Get new plans based on health tier
    availablePlans.value = getRandomPlans(maxCards.value);

    // Reset selection state
    selectedPlan.value = null;
    timeRemaining.value = 30;
    slotSpinsRemaining.value = 0;
    currentSlotTotal.value = 0;
    slotResults.value = [];

    // Generate some juice messages
    generateTurnJuice();

    // Start timer
    startTimer();
  }

  // Apply chaos effects each turn
  function applyChaosEffects() {
    const chaos = stats.value.chaos;

    // Chaos effects - softened for better balance
    if (chaos > 80) {
      // Very high chaos: -2 support, -1 loyalty (75% chance), -1 health per turn
      stats.value.support = Math.max(0, stats.value.support - 2);
      if (Math.random() < 0.75) {
        stats.value.loyalty = Math.max(0, stats.value.loyalty - 1);
      }
      stats.value.health = Math.max(0, stats.value.health - 1);
      if (Math.random() < 0.4) {
        addJuiceMessage({
          text: `🌪️ EXTREME CHAOS! -2 Support, -1 Health`,
          type: 'news'
        });
      }
    } else if (chaos > 60) {
      // High chaos: -1 support, -1 loyalty (50% chance) per turn
      stats.value.support = Math.max(0, stats.value.support - 1);
      if (Math.random() < 0.5) {
        stats.value.loyalty = Math.max(0, stats.value.loyalty - 1);
      }
      if (Math.random() < 0.3) {
        addJuiceMessage({
          text: `📉 High chaos causing instability! -1 Support`,
          type: 'news'
        });
      }
    } else if (chaos > 40) {
      // Medium chaos: -1 support every other turn (50% chance)
      if (Math.random() < 0.5) {
        stats.value.support = Math.max(0, stats.value.support - 1);
      }
    }
    
    // Chaos naturally decays over time if low
    if (chaos > 10 && chaos < 50) {
      if (Math.random() < 0.3) { // 30% chance
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

    if (stats.value.money < adjustedCost && debt.value === 0) {
      // Need to take on debt
      const needed = adjustedCost - stats.value.money;
      debt.value = needed;
      stats.value.money = 0;
      addJuiceMessage({
        text: `🏦 Borrowed ${needed}B coins to fund the plan. Don't worry, what could go wrong?`,
        type: 'news'
      });
    } else if (stats.value.money < adjustedCost) {
      // Already in debt, add more
      debt.value += adjustedCost;
      interestRate.value = Math.min(0.35, interestRate.value + 0.03); // Interest increases 3% (max 35%)
      addJuiceMessage({
        text: `📈 More debt! Interest rate now ${(interestRate.value * 100).toFixed(0)}%. Totally sustainable!`,
        type: 'news'
      });
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

    // Find matching outcome
    const outcome = plan.outcomes.find(o => score >= o.minScore && score <= o.maxScore)
      || plan.outcomes[plan.outcomes.length - 1]; // Default to last (worst) outcome

    // Apply immediate effects
    applyEffects(outcome.immediateEffects);

    // Add to score
    currentScore.value += Math.max(0, score);

    // Queue delayed effects if any
    if (outcome.delayedEffects && outcome.delayedEffects.length > 0) {
      outcome.delayedEffects.forEach(delayedEffect => {
        const effect: DelayedEffect = {
          id: `${plan.id}-${currentTurn.value}-${delayedEffect.turnsDelay}`,
          triggerTurn: currentTurn.value + delayedEffect.turnsDelay,
          planId: plan.id,
          description: delayedEffect.description,
          effects: delayedEffect.effects
        };
        pendingEffects.value.push(effect);
      });
    }

    // Juice message about outcome
    addJuiceMessage({
      text: `📢 ${outcome.title}: ${outcome.description}`,
      type: 'news'
    });

    // Next turn
    currentTurn.value++;
    checkAchievements();
    startTurn();
  }

  function executeBlindPlay() {
    if (!selectedPlan.value) return;

    const plan = selectedPlan.value;

    // Calculate blind score based on stats + randomness - laziness penalty
    const chaosBonus = Math.floor(stats.value.chaos * 0.3); // 0-30 points from chaos
    const supportBonus = Math.floor(stats.value.support * 0.2); // 0-20 points from support
    const loyaltyBonus = Math.floor(stats.value.loyalty * 0.2); // 0-20 points from loyalty
    const randomFactor = Math.floor(Math.random() * 31) - 15; // -15 to +15 random
    const lazinessPenalty = -5;

    const blindScore = Math.max(0, chaosBonus + supportBonus + loyaltyBonus + randomFactor + lazinessPenalty);

    // Set the score directly
    currentSlotTotal.value = blindScore;

    // Find matching outcome
    const outcome = plan.outcomes.find(o => blindScore >= o.minScore && blindScore <= o.maxScore)
      || plan.outcomes[plan.outcomes.length - 1];

    // Apply immediate effects
    applyEffects(outcome.immediateEffects);

    // Add to score
    currentScore.value += Math.max(0, blindScore);

    // Queue delayed effects if any
    if (outcome.delayedEffects && outcome.delayedEffects.length > 0) {
      outcome.delayedEffects.forEach(delayedEffect => {
        const effect: DelayedEffect = {
          id: `${plan.id}-${currentTurn.value}-${delayedEffect.turnsDelay}`,
          triggerTurn: currentTurn.value + delayedEffect.turnsDelay,
          planId: plan.id,
          description: delayedEffect.description,
          effects: delayedEffect.effects
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

    // Next turn
    currentTurn.value++;
    checkAchievements();
    startTurn();
  }

  function skipTurn() {
    // Skipping costs stats (balanced penalties)
    stats.value.loyalty = Math.max(0, stats.value.loyalty - 4);
    stats.value.support = Math.max(0, stats.value.support - 3);
    
    showStatChange('👥', -4);
    showStatChange('📊', -3);
    
    // Track for achievement
    achievementTracking.value.turnsSkipped++;

    addJuiceMessage({
      text: "😴 The Orange did nothing today. Followers are getting restless...",
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
        maxTurns.value = 96;
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
    if (stats.value.money < DELETE_COST) return false;
    
    stats.value.money -= DELETE_COST;
    showStatChange('💰', -DELETE_COST);
    
    // Small loyalty hit for censorship
    stats.value.loyalty = Math.max(0, stats.value.loyalty - 3);
    showStatChange('👥', -3);
    
    // Track for achievement
    achievementTracking.value.postsDeleted++;
    
    // Mark as moderated and remove from feed
    const index = juiceMessages.value.findIndex(m => m.id === messageId);
    if (index !== -1) {
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
    if (stats.value.money < BAN_COST) return false;
    
    stats.value.money -= BAN_COST;
    showStatChange('💰', -BAN_COST);
    
    // Bigger loyalty hit + chaos increase
    stats.value.loyalty = Math.max(0, stats.value.loyalty - 5);
    stats.value.chaos = Math.min(100, stats.value.chaos + 10);
    showStatChange('👥', -5);
    showStatChange('🌀', 10);
    
    // Track for achievement
    achievementTracking.value.usersBanned++;
    
    // Remove post
    const index = juiceMessages.value.findIndex(m => m.id === messageId);
    if (index !== -1) {
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
    
    // Apply penalties for not moderating (after first comment appears)
    setTimeout(() => {
      if (message.hasBeenModerated) return;
      
      stats.value.loyalty = Math.max(0, stats.value.loyalty - 5);
      stats.value.support = Math.max(0, stats.value.support - 5);
      stats.value.health = Math.max(0, stats.value.health - 3);
      
      showStatChange('👥', -5);
      showStatChange('📊', -5);
      showStatChange('❤️', -3);
      
      addJuiceMessage({
        text: '💬 Critical post is getting mocked heavily in the comments... This looks bad. #PR_Disaster',
        type: 'news'
      });
    }, 1000); // After 1 second
  }

  function generateTurnJuice() {
    // Generate 2-4 random messages per turn
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const msg = generateJuiceMessage(availablePlans.value, stats.value, currentTurn.value);
      addJuiceMessage(msg);
    }
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
    achievements,
    newlyUnlockedAchievements,
    achievementTracking,
    // Computed
    healthTier,
    maxCards,
    researchMultiplier,
    monthName,
    year,
    // Actions
    initGame,
    startTurn,
    stopTimer,
    selectPlan,
    researchPlan,
    researchPlanRandom,
    spinSlot,
    executePlan,
    executeBlindPlay,
    skipTurn,
    addJuiceMessage,
    addPlayerRant,
    deletePost,
    banUser,
    showStatChange,
    checkAchievements,
    dismissAchievement,
    getShareText,
    getAdjustedCost,
    getSecondTermLoyaltyThreshold,
    getMinimumScoreThreshold
  };
});
