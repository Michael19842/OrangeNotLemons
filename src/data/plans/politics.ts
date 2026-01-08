import type { PlanCard } from '@/types/game';

export const POLITICS_PLANS: PlanCard[] = [
  {
    id: 'rally',
    name: 'Tremendous Rally',
    emoji: '📣',
    category: 'politics',
    baseCost: 150,
    revealable: {
      risk: 'Might say something... off-script',
      reward: 'Base loves the rallies',
      timing: 'Immediate loyalty boost',
      secret: 'Crowd size will be "adjusted" in photos'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 50, maxScore: 100,
        title: 'HUGE Crowd!',
        description: 'Biggest rally ever! (Don\'t check aerial photos)',
        immediateEffects: { loyalty: 25, support: 10, health: -5, chaos: 8 }, // Increased loyalty from 20, reduced chaos
        delayedEffects: [{
          turnsDelay: 9,
          description: 'Rally promises impossible to keep',
          effects: { support: -5, chaos: 5 }
        }]
      },
      {
        minScore: 20, maxScore: 49,
        title: 'Decent Turnout',
        description: 'The crowd was... respectable. Media lies about size.',
        immediateEffects: { loyalty: 12, support: 5, health: -5, chaos: 3 } // Increased loyalty from 10, reduced chaos
      },
      {
        minScore: -100, maxScore: 19,
        title: 'Rally Gone Wrong',
        description: 'Said the quiet part loud. Several times.',
        immediateEffects: { loyalty: 5, support: -15, health: -10, chaos: 20 },
        delayedEffects: [{
          turnsDelay: 3,
          description: 'Rally clips go viral for all the wrong reasons',
          effects: { support: -10, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'police_chief',
    name: 'Loyal Police Chief',
    emoji: '👮',
    category: 'politics',
    baseCost: 300,
    revealable: {
      risk: 'Previous chief might talk',
      reward: 'Investigations could... slow down',
      timing: 'Takes effect next month',
      secret: 'New chief has some skeletons too'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 60, maxScore: 100,
        title: 'Loyalty Secured!',
        description: 'New chief understands the assignment. Investigations paused.',
        immediateEffects: { loyalty: 15, chaos: -5 },
        delayedEffects: [{
          turnsDelay: 11,
          description: 'Old chief writes tell-all book',
          effects: { loyalty: -10, support: -5, chaos: 15 }
        }]
      },
      {
        minScore: 25, maxScore: 59,
        title: 'Partial Compliance',
        description: 'New chief is loyal-ish. Some investigations continue.',
        immediateEffects: { loyalty: 5 },
        delayedEffects: [{
          turnsDelay: 8,
          description: 'New chief leaks concerns to press',
          effects: { loyalty: -5, chaos: 5 }
        }]
      },
      {
        minScore: -100, maxScore: 24,
        title: 'Confirmation Disaster',
        description: 'Senate rejects nominee. Old chief stays and is VERY motivated.',
        immediateEffects: { loyalty: -15, support: -10, chaos: 20 },
        delayedEffects: [{
          turnsDelay: 4,
          description: 'Investigation into Mandarin Business intensifies',
          effects: { loyalty: -20, chaos: 15 }
        }]
      }
    ]
  },
  {
    id: 'election_claims',
    name: 'Election Integrity',
    emoji: '🗳️',
    category: 'politics',
    baseCost: 50,
    revealable: {
      risk: 'No evidence exists',
      reward: 'Base gets fired up',
      timing: 'Immediate controversy',
      secret: 'Your own lawyers say it\'s false'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 55, maxScore: 100,
        title: 'Many Questions Raised!',
        description: 'Followers demand audits! Media covers it 24/7!',
        immediateEffects: { loyalty: 25, support: -10, chaos: 25 },
        delayedEffects: [
          {
            turnsDelay: 6,
            description: 'Audits find nothing, but damage done',
            effects: { money: -100, chaos: 5 }
          },
          {
            turnsDelay: 12,
            description: 'Court cases dismissed. Lawyers sanctioned.',
            effects: { money: -100, support: -5, chaos: 10, coinValuation: -5 }
          }
        ]
      },
      {
        minScore: 20, maxScore: 54,
        title: 'Some Doubt Sown',
        description: 'Base believes, others roll their eyes.',
        immediateEffects: { loyalty: 10, support: -5, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 2,
          description: 'International observers concerned',
          effects: { support: -5, coinValuation: -5 }
        }]
      },
      {
        minScore: -100, maxScore: 19,
        title: 'Fact-Checked into Oblivion',
        description: 'Even friendly media can\'t spin this one.',
        immediateEffects: { loyalty: -5, support: -20, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Defamation lawsuits incoming',
          effects: { money: -400, chaos: 15 }
        }]
      }
    ]
  },
  {
    id: 'pardon_spree',
    name: 'Pardon Party',
    emoji: '📜',
    category: 'politics',
    baseCost: 0,
    revealable: {
      risk: 'Some recipients are... controversial',
      reward: 'Friends remember favors',
      timing: 'Best done late at night',
      secret: 'Pardon applications cost $2M "consulting fee"'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 55, maxScore: 100,
        title: 'Justice Reformed!',
        description: 'Pardoned 50 people! All totally deserving!',
        immediateEffects: { loyalty: 25, money: 500, chaos: 20 },
        delayedEffects: [{
          turnsDelay: 6,
          description: 'Pardoned person immediately re-offends on TV',
          effects: { support: -20, chaos: 15 }
        }]
      },
      {
        minScore: 25, maxScore: 54,
        title: 'Quiet Pardons',
        description: 'A few friends walked free. Media barely noticed.',
        immediateEffects: { loyalty: 10, money: 200, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 13,
          description: 'Pardon list leaked to press',
          effects: { support: -10, chaos: 10 }
        }]
      },
      {
        minScore: -100, maxScore: 24,
        title: 'Pardon Backlash',
        description: 'Pardoned someone even your base hates.',
        immediateEffects: { loyalty: -15, support: -15, chaos: 25 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Bipartisan condemnation',
          effects: { support: -10, loyalty: -10 }
        }]
      }
    ]
  },
  {
    id: 'fire_everyone',
    name: 'You\'re Fired!',
    emoji: '🔥',
    category: 'politics',
    baseCost: 0,
    revealable: {
      risk: 'Might fire someone important',
      reward: 'Shows who is boss',
      timing: 'Usually via tweet at dawn',
      secret: 'You don\'t actually know their names'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 50, maxScore: 100,
        title: 'Swamp Drained!',
        description: 'Fired 12 officials! New loyalty secured!',
        immediateEffects: { loyalty: 20, chaos: 20 },
        delayedEffects: [{
          turnsDelay: 3,
          description: 'Fired officials testifying to Congress',
          effects: { loyalty: -25, chaos: 15 }
        }]
      },
      {
        minScore: 20, maxScore: 49,
        title: 'Standard Turnover',
        description: 'A few firings. The usual chaos.',
        immediateEffects: { loyalty: 5, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 2,
          description: 'Replacements need training, efficiency drops',
          effects: { money: -100, chaos: 5 }
        }]
      },
      {
        minScore: -100, maxScore: 19,
        title: 'Obstruction Concerns',
        description: 'Fired the investigator investigating you. Oops.',
        immediateEffects: { loyalty: -20, support: -15, chaos: 30 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Special counsel appointed',
          effects: { loyalty: -15, chaos: 20, coinValuation: -10 }
        }]
      }
    ]
  },
  {
    id: 'supreme_court',
    name: 'Pack the Court',
    emoji: '⚖️',
    category: 'politics',
    baseCost: 800,
    revealable: {
      risk: 'Opposition will be furious',
      reward: 'Favorable rulings for decades',
      timing: 'Rush it through before anyone notices',
      secret: 'Nominee owes you big time'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 70, maxScore: 100,
        title: 'Justice Served!',
        description: 'Your nominee confirmed! Courts secured for decades!',
        immediateEffects: { loyalty: 30, support: -10, chaos: 15, coinValuation: 10 },
        delayedEffects: [{
          turnsDelay: 6,
          description: 'Court rules in your favor on key case',
          effects: { loyalty: 15, chaos: -10 }
        }]
      },
      {
        minScore: 35, maxScore: 69,
        title: 'Narrow Confirmation',
        description: 'Confirmed by 1 vote. Very dramatic.',
        immediateEffects: { loyalty: 15, chaos: 10 }
      },
      {
        minScore: -100, maxScore: 34,
        title: 'Nomination Implodes',
        description: 'Yearbook photos surface. Nominee withdraws.',
        immediateEffects: { loyalty: -10, support: -20, chaos: 20 },
        delayedEffects: [{
          turnsDelay: 2,
          description: 'Senate demands better vetting process',
          effects: { loyalty: -5, chaos: 10, coinValuation: -5 }
        }]
      }
    ]
  },
  {
    id: 'space_force',
    name: 'Space Force!',
    emoji: '🚀',
    category: 'politics',
    baseCost: 2000,
    revealable: {
      risk: 'Pentagon thinks it\'s unnecessary',
      reward: 'Cool logo though',
      timing: 'Takes years to implement',
      secret: 'Mainly for merchandising rights'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 60, maxScore: 100,
        title: 'To Infinity and Beyond!',
        description: 'Space Force is real! New uniforms! New logo! Very cool!',
        immediateEffects: { loyalty: 20, support: 10, money: -1000, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 4,
          description: 'Space Force does... basically nothing',
          effects: { support: -5, chaos: 5, coinValuation: -5 }
        }]
      },
      {
        minScore: 25, maxScore: 59,
        title: 'Modest Launch',
        description: 'Space Force exists. Pentagon confused but compliant.',
        immediateEffects: { loyalty: 10, money: -500, chaos: 5 }
      },
      {
        minScore: -100, maxScore: 24,
        title: 'Star Trek Lawsuit',
        description: 'Logo looks too much like Star Trek. Lawyers involved.',
        immediateEffects: { money: -300, support: -10, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 2,
          description: 'Sci-fi fans mock you relentlessly',
          effects: { support: -5, chaos: 5 }
        }]
      }
    ]
  },
  {
    id: 'loyalty_dinner',
    name: 'Private Dinner',
    emoji: '🍽️',
    category: 'politics',
    baseCost: 200,
    revealable: {
      risk: 'Guest might record it',
      reward: 'Direct loyalty request',
      timing: 'When you need favors',
      secret: '"I need loyalty" is the main course'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 60, maxScore: 100,
        title: 'Loyalty Pledged!',
        description: 'Guest understood the assignment! Very loyal now!',
        immediateEffects: { loyalty: 20, chaos: 5 },
        delayedEffects: [{
          turnsDelay: 4,
          description: 'Guest writes memoir about the dinner',
          effects: { loyalty: -15, support: -10, chaos: 15 }
        }]
      },
      {
        minScore: 25, maxScore: 59,
        title: 'Awkward Dinner',
        description: 'Guest nodded politely. Unclear if loyal.',
        immediateEffects: { loyalty: 5, money: -100, chaos: 5 }
      },
      {
        minScore: -100, maxScore: 24,
        title: 'Recorded Everything',
        description: 'Guest had phone recording. Testimony incoming.',
        immediateEffects: { loyalty: -25, support: -10, chaos: 25 },
        delayedEffects: [{
          turnsDelay: 2,
          description: 'Transcript released to press',
          effects: { loyalty: -15, chaos: 20, coinValuation: -10 }
        }]
      }
    ]
  },
  {
    id: 'infrastructure_week',
    name: 'Infrastructure Week',
    emoji: '🏗️',
    category: 'politics',
    baseCost: 500,
    revealable: {
      risk: 'Something always derails it',
      reward: 'Sounds presidential',
      timing: 'Whenever you need distraction',
      secret: 'Infrastructure week never actually happens'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 65, maxScore: 100,
        title: 'Finally! Infrastructure!',
        description: 'Actually announced infrastructure plans! Historic!',
        immediateEffects: { support: 15, loyalty: 10, coinValuation: 10 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Scandal breaks, infrastructure forgotten',
          effects: { support: -5, chaos: 10 }
        }]
      },
      {
        minScore: 30, maxScore: 64,
        title: 'Week Announced',
        description: 'Declared infrastructure week. Got distracted.',
        immediateEffects: { support: 5, chaos: 5 }
      },
      {
        minScore: -100, maxScore: 29,
        title: 'Immediately Derailed',
        description: 'Infrastructure week lasted 2 hours before tweet storm.',
        immediateEffects: { support: -10, chaos: 20 },
        delayedEffects: [{
          turnsDelay: 1,
          description: '"Infrastructure Week" becomes meme',
          effects: { support: -5, chaos: 10 }
        }]
      }
    ]
  },
];
