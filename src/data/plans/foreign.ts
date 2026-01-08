import type { PlanCard } from '@/types/game';

export const FOREIGN_PLANS: PlanCard[] = [
  {
    id: 'buy_country',
    name: 'Buy Greenland',
    emoji: '🏝️',
    category: 'foreign',
    baseCost: 1000,
    revealable: {
      risk: 'Denmark will say no. Loudly.',
      reward: 'Would be pretty cool though',
      timing: 'International incident immediately',
      secret: 'Already hired real estate developers'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 80, maxScore: 100,
        title: 'Deal of the Century!',
        description: 'Against all odds, negotiations begin! (They won\'t succeed)',
        immediateEffects: { support: 15, loyalty: 10, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 7,
          description: 'Denmark officially says no. You cancel state visit in tantrum.',
          effects: { support: -10, chaos: 10, coinValuation: -5 }
        }]
      },
      {
        minScore: 40, maxScore: 79,
        title: 'Interesting Proposal',
        description: 'World leaders confused but intrigued.',
        immediateEffects: { support: 5, loyalty: 5, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 10,
          description: 'Real estate investors ask awkward questions',
          effects: { money: -100, chaos: 5 }
        }]
      },
      {
        minScore: -100, maxScore: 39,
        title: 'International Laughingstock',
        description: 'Denmark\'s response goes viral. Memes everywhere.',
        immediateEffects: { support: -15, loyalty: -5, luck: -10, chaos: 20 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Allies reconsider their relationship',
          effects: { support: -10, coinValuation: -10 }
        }]
      }
    ]
  },
  {
    id: 'dictator_love',
    name: 'Beautiful Letter',
    emoji: '💌',
    category: 'foreign',
    baseCost: 0,
    revealable: {
      risk: 'Legitimizes dictator',
      reward: 'Photo ops!',
      timing: 'Summit takes 2 months to arrange',
      secret: 'The letter was mostly about you'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 50, maxScore: 100,
        title: 'Historic Summit!',
        description: 'Photos with dictator! Base loves the strength!',
        immediateEffects: { loyalty: 15, support: -5, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 13,
          description: 'Dictator continues doing dictator things. You look naive.',
          effects: { support: -15, chaos: 10, coinValuation: -5 }
        }]
      },
      {
        minScore: 20, maxScore: 49,
        title: 'Letter Received',
        description: 'Dictator responds politely. Nothing changes.',
        immediateEffects: { loyalty: 5, chaos: 5 },
        delayedEffects: [{
          turnsDelay: 9,
          description: 'Letter contents leaked to press',
          effects: { support: -5, chaos: 10 }
        }]
      },
      {
        minScore: -100, maxScore: 19,
        title: 'Left on Read',
        description: 'Dictator ignores letter. Embarrassing.',
        immediateEffects: { support: -10, loyalty: -5, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 5,
          description: 'Dictator mocks you publicly',
          effects: { support: -10, loyalty: -5, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'nato_tantrum',
    name: 'NATO Shakedown',
    emoji: '🏴',
    category: 'foreign',
    baseCost: 0,
    revealable: {
      risk: 'Allies might get... nervous',
      reward: 'Look tough on world stage',
      timing: 'Best done at summit, on camera',
      secret: 'You can\'t actually leave NATO'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 55, maxScore: 100,
        title: 'They Blinked!',
        description: 'Allies promise to pay more! (They won\'t)',
        immediateEffects: { loyalty: 15, support: 10, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 10,
          description: 'Allies quietly ignore promises',
          effects: { support: -5, chaos: 5, coinValuation: -5 }
        }]
      },
      {
        minScore: 25, maxScore: 54,
        title: 'Tense Meeting',
        description: 'Everyone smiled for cameras. Privately furious.',
        immediateEffects: { loyalty: 5, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 8,
          description: 'Leaked audio of you insulting allies',
          effects: { support: -10, chaos: 10 }
        }]
      },
      {
        minScore: -100, maxScore: 24,
        title: 'Alliance Strained',
        description: 'Allies holding emergency meetings without you.',
        immediateEffects: { support: -15, loyalty: -5, chaos: 25 },
        delayedEffects: [{
          turnsDelay: 5,
          description: 'Defense contractors very concerned, markets react',
          effects: { money: -300, coinValuation: -15, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'border_wall',
    name: 'Build The Wall',
    emoji: '🧱',
    category: 'foreign',
    baseCost: 1500,
    revealable: {
      risk: 'Mexico won\'t pay for it',
      reward: 'Base absolutely loves this',
      timing: 'Construction takes forever',
      secret: 'Contractor is your friend\'s company'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 65, maxScore: 100,
        title: '10 Miles Built!',
        description: 'Beautiful wall! The best wall! (10 of 2000 miles)',
        immediateEffects: { loyalty: 25, support: 5, chaos: 10 },
        delayedEffects: [
          {
            turnsDelay: 8,
            description: 'Environmental lawsuits filed',
            effects: { money: -150, chaos: 10 }
          },
          {
            turnsDelay: 14,
            description: 'Wall segment falls over in wind',
            effects: { support: -15, loyalty: -5, chaos: 15, coinValuation: -5 }
          }
        ]
      },
      {
        minScore: 30, maxScore: 64,
        title: 'Some Fencing',
        description: 'Built some fence. Close enough to a wall.',
        immediateEffects: { loyalty: 10, chaos: 5 },
        delayedEffects: [{
          turnsDelay: 11,
          description: 'Cost overruns discovered',
          effects: { money: -200, chaos: 5 }
        }]
      },
      {
        minScore: -100, maxScore: 29,
        title: 'Budget Blocked',
        description: 'Congress says no. Government shutdown begins.',
        immediateEffects: { support: -20, loyalty: 5, chaos: 25 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Shutdown blamed on you, economy suffers',
          effects: { support: -10, coinValuation: -15, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'trade_deal',
    name: 'Renegotiate Everything',
    emoji: '🤝',
    category: 'foreign',
    baseCost: 300,
    revealable: {
      risk: 'Might get a worse deal',
      reward: 'New name = new deal',
      timing: 'Negotiations take 6+ months',
      secret: 'New deal is 95% identical to old deal'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 55, maxScore: 100,
        title: 'Art of the Deal!',
        description: 'New deal signed! Totally different! (It\'s the same)',
        immediateEffects: { loyalty: 15, support: 10, money: 200, coinValuation: 10, chaos: -5 },
        delayedEffects: [{
          turnsDelay: 4,
          description: 'Experts point out it\'s the same deal with new name',
          effects: { support: -5, chaos: 5 }
        }]
      },
      {
        minScore: 25, maxScore: 54,
        title: 'Rebranded Success',
        description: 'Same deal, new name. Everyone happy.',
        immediateEffects: { loyalty: 5, support: 5, coinValuation: 5 }
      },
      {
        minScore: -100, maxScore: 24,
        title: 'Negotiations Collapse',
        description: 'Walked out in huff. No deal at all now.',
        immediateEffects: { money: -400, support: -10, chaos: 20, coinValuation: -15 },
        delayedEffects: [{
          turnsDelay: 2,
          description: 'Trading partners find new partners, markets spooked',
          effects: { money: -200, coinValuation: -10, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'paper_towels',
    name: 'Disaster Relief',
    emoji: '🧻',
    category: 'foreign',
    baseCost: 100,
    revealable: {
      risk: 'Optics might be... off',
      reward: 'Shows you care (sort of)',
      timing: 'After natural disaster',
      secret: 'You have great throwing arm'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 55, maxScore: 100,
        title: 'MVP Throws!',
        description: 'Threw supplies to crowd! Great arm! Very athletic!',
        immediateEffects: { loyalty: 15, support: -5, health: 5, chaos: 10 }
      },
      {
        minScore: 25, maxScore: 54,
        title: 'Brief Visit',
        description: 'Handed out some supplies. Photos taken.',
        immediateEffects: { loyalty: 5, support: 5 }
      },
      {
        minScore: -100, maxScore: 24,
        title: 'Tone Deaf',
        description: 'Throwing paper towels at hurricane victims. Not great.',
        immediateEffects: { support: -25, loyalty: 5, chaos: 20 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Video plays on loop for weeks',
          effects: { support: -10, chaos: 10, coinValuation: -5 }
        }]
      }
    ]
  },
  {
    id: 'nuke_hurricane',
    name: 'Nuclear Weather',
    emoji: '☢️',
    category: 'foreign',
    baseCost: 0,
    revealable: {
      risk: 'Scientists say no',
      reward: 'Bold thinking!',
      timing: 'During hurricane season',
      secret: 'You saw it in a movie once'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 65, maxScore: 100,
        title: 'Thinking Big!',
        description: 'Proposed nuking hurricanes! Outside the box! Genius!',
        immediateEffects: { loyalty: 10, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'NOAA releases statement: "Please don\'t"',
          effects: { support: -15, chaos: 10 }
        }]
      },
      {
        minScore: 30, maxScore: 64,
        title: 'Just Asking Questions',
        description: 'Floated the idea. Staff quickly moved on.',
        immediateEffects: { loyalty: 5, chaos: 10 }
      },
      {
        minScore: -100, maxScore: 29,
        title: 'International Concern',
        description: 'Other nations worried about your nuclear ideas.',
        immediateEffects: { support: -25, loyalty: -5, chaos: 25 },
        delayedEffects: [{
          turnsDelay: 2,
          description: 'UN requests clarification, markets spooked',
          effects: { support: -10, coinValuation: -15, chaos: 10 }
        }]
      }
    ]
  },
];
