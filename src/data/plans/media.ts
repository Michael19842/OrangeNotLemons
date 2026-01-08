import type { PlanCard } from '@/types/game';

export const MEDIA_PLANS: PlanCard[] = [
  {
    id: 'fake_news',
    name: 'Attack Fake News',
    emoji: '📰',
    category: 'media',
    baseCost: 0,
    revealable: {
      risk: 'The news might be... real',
      reward: 'Base loves media attacks',
      timing: 'Immediate controversy',
      secret: 'Your own media says same things'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 45, maxScore: 100,
        title: 'Enemy of the People!',
        description: 'Media in disarray! Followers only trust YOU now!',
        immediateEffects: { loyalty: 15, support: -5, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 12,
          description: 'Journalists dig deeper out of spite',
          effects: { loyalty: -5, chaos: 10 }
        }]
      },
      {
        minScore: 15, maxScore: 44,
        title: 'Standard Deflection',
        description: 'The usual fake news claims. Everyone moves on.',
        immediateEffects: { loyalty: 5, chaos: 5 }
      },
      {
        minScore: -100, maxScore: 14,
        title: 'Receipts Produced',
        description: 'Media shows video evidence. Of you. Saying the thing.',
        immediateEffects: { loyalty: -10, support: -15, chaos: 20 },
        delayedEffects: [{
          turnsDelay: 2,
          description: 'Clip plays on loop for a week',
          effects: { support: -10, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'social_media',
    name: 'Truth Social Rant',
    emoji: '📱',
    category: 'media',
    baseCost: 0,
    revealable: {
      risk: 'Might type something at 3am',
      reward: 'Direct line to followers',
      timing: 'Instant impact',
      secret: 'Staff tries to hide your phone'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 50, maxScore: 100,
        title: 'Viral Victory!',
        description: 'Post goes mega-viral! Trending for days!',
        immediateEffects: { loyalty: 20, support: 5, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 6,
          description: 'Old tweets resurface in response',
          effects: { support: -5, chaos: 5 }
        }]
      },
      {
        minScore: 20, maxScore: 49,
        title: 'Standard Engagement',
        description: 'The usual likes and shares.',
        immediateEffects: { loyalty: 5, chaos: 5 }
      },
      {
        minScore: -100, maxScore: 19,
        title: '3AM Meltdown',
        description: 'Posted something unhinged. Even supporters concerned.',
        immediateEffects: { loyalty: -5, support: -15, health: -5, chaos: 25 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Staff "loses" your phone for a week',
          effects: { loyalty: -5, chaos: -10 }
        }]
      }
    ]
  },
  {
    id: 'press_ban',
    name: 'Ban the Press',
    emoji: '🚫',
    category: 'media',
    baseCost: 0,
    revealable: {
      risk: 'First Amendment exists',
      reward: 'No hard questions',
      timing: 'Immediate media circus',
      secret: 'They\'ll just report from outside'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 50, maxScore: 100,
        title: 'Press Silenced!',
        description: 'Banned 5 outlets! Only friendly media now!',
        immediateEffects: { loyalty: 15, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 7,
          description: 'Banned outlets run biggest stories yet',
          effects: { support: -15, chaos: 10, coinValuation: -5 }
        }]
      },
      {
        minScore: 20, maxScore: 49,
        title: 'Brief Ban',
        description: 'Banned one reporter. Quietly let back in.',
        immediateEffects: { loyalty: 5, chaos: 5 }
      },
      {
        minScore: -100, maxScore: 19,
        title: 'Streisand Effect',
        description: 'Banned outlet\'s ratings triple. Oops.',
        immediateEffects: { support: -20, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Free speech advocates rally, international concern',
          effects: { support: -10, coinValuation: -10 }
        }]
      }
    ]
  },
  {
    id: 'awards_show',
    name: 'Fake News Awards',
    emoji: '🏆',
    category: 'media',
    baseCost: 100,
    revealable: {
      risk: 'Media will mock it',
      reward: 'Followers love the drama',
      timing: 'Peak entertainment value',
      secret: 'You wrote all the categories yourself'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 45, maxScore: 100,
        title: 'Most Watched Event!',
        description: 'Awards go viral! "Winners" humiliated! (They\'re fine)',
        immediateEffects: { loyalty: 20, support: 5, chaos: 10 }
      },
      {
        minScore: 15, maxScore: 44,
        title: 'Moderate Attention',
        description: 'Some laughed, some cheered. Standard day.',
        immediateEffects: { loyalty: 10, chaos: 5 }
      },
      {
        minScore: -100, maxScore: 14,
        title: 'Website Crashed',
        description: 'Awards site went down immediately. Tech fail.',
        immediateEffects: { support: -10, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Late night hosts have field day',
          effects: { support: -5, chaos: 5 }
        }]
      }
    ]
  },
  {
    id: 'book_deal',
    name: 'Write a Book',
    emoji: '📚',
    category: 'media',
    baseCost: 50,
    revealable: {
      risk: 'Ghost writer might talk',
      reward: 'Bestseller guaranteed (bulk buys)',
      timing: 'Perfect for campaign season',
      secret: 'You haven\'t read it either'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 50, maxScore: 100,
        title: 'Bestseller!',
        description: '#1 on all lists! (Campaign bought 100,000 copies)',
        immediateEffects: { money: 800, loyalty: 10, support: 5, coinValuation: 5 }
      },
      {
        minScore: 20, maxScore: 49,
        title: 'Respectable Sales',
        description: 'Book exists. Some people bought it.',
        immediateEffects: { money: 200, loyalty: 5 }
      },
      {
        minScore: -100, maxScore: 19,
        title: 'Ghostwriter Speaks',
        description: 'Writer reveals you didn\'t write a single word.',
        immediateEffects: { support: -15, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Ghost writer\'s tell-all outsells your book',
          effects: { support: -5, money: -100, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'sharpie_weather',
    name: 'Weather Correction',
    emoji: '🌀',
    category: 'media',
    baseCost: 0,
    revealable: {
      risk: 'NOAA might disagree',
      reward: 'You\'re never wrong',
      timing: 'Best during actual hurricane',
      secret: 'The sharpie is mightier than the forecast'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 55, maxScore: 100,
        title: 'Forecast Fixed!',
        description: 'Drew new path on map! You were right all along!',
        immediateEffects: { loyalty: 10, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Sharpiegate trends for a week',
          effects: { support: -15, chaos: 10 }
        }]
      },
      {
        minScore: 20, maxScore: 54,
        title: 'Minor Adjustment',
        description: 'Small sharpie addition. Barely noticeable.',
        immediateEffects: { loyalty: 5, chaos: 5 }
      },
      {
        minScore: -100, maxScore: 19,
        title: 'NOAA Revolt',
        description: 'Weather service publicly corrects you. Embarrassing.',
        immediateEffects: { support: -20, loyalty: -5, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 2,
          description: 'Scientists band together against you',
          effects: { support: -10, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'covfefe',
    name: 'Late Night Tweet',
    emoji: '🌙',
    category: 'media',
    baseCost: 0,
    revealable: {
      risk: 'Might not make sense',
      reward: 'Creates mystery and engagement',
      timing: '3 AM is optimal',
      secret: 'You fell asleep mid-tweet'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 50, maxScore: 100,
        title: 'Viral Mystery!',
        description: '"Covfefe" trends worldwide! Everyone talking! Genius!',
        immediateEffects: { loyalty: 15, support: 5, chaos: 10 }
      },
      {
        minScore: 20, maxScore: 49,
        title: 'Standard Typo',
        description: 'Gibberish tweet. Staff deletes it quickly.',
        immediateEffects: { loyalty: 5, chaos: 5 }
      },
      {
        minScore: -100, maxScore: 19,
        title: 'Staff Intervention',
        description: 'Phone confiscated. Doctors consulted.',
        immediateEffects: { health: -5, support: -10, chaos: 20 },
        delayedEffects: [{
          turnsDelay: 1,
          description: '25th Amendment speculation',
          effects: { loyalty: -10, chaos: 15, coinValuation: -10 }
        }]
      }
    ]
  },
  {
    id: 'medical_advice',
    name: 'Health Tips Live',
    emoji: '💉',
    category: 'media',
    baseCost: 0,
    revealable: {
      risk: 'You\'re not a doctor',
      reward: 'Shows you\'re thinking outside the box',
      timing: 'During press conference',
      secret: 'Staff begging you to stop'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 60, maxScore: 100,
        title: 'Very Interesting Ideas!',
        description: 'Suggested UV light inside the body! Scientists intrigued!',
        immediateEffects: { loyalty: 10, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Poison control calls spike. You meant "sarcasm"',
          effects: { support: -25, chaos: 15 }
        }]
      },
      {
        minScore: 25, maxScore: 59,
        title: 'Creative Thinking',
        description: 'Some unusual ideas shared. Staff intervenes.',
        immediateEffects: { loyalty: 5, support: -5, chaos: 10 }
      },
      {
        minScore: -100, maxScore: 24,
        title: 'Public Health Crisis',
        description: 'People actually tried it. Lawsuits pending.',
        immediateEffects: { support: -30, loyalty: -10, chaos: 30 },
        delayedEffects: [{
          turnsDelay: 2,
          description: 'Medical associations issue corrections, markets react',
          effects: { support: -10, coinValuation: -15, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'cognitive_test',
    name: 'Genius Test Results',
    emoji: '🧠',
    category: 'media',
    baseCost: 0,
    revealable: {
      risk: 'It\'s a basic test',
      reward: 'Proves mental fitness',
      timing: 'When questioned',
      secret: 'The doctors were impressed you knew a camel'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 55, maxScore: 100,
        title: 'Person Woman Man Camera TV!',
        description: 'Aced the test! Extra points! Doctors amazed!',
        immediateEffects: { loyalty: 15, support: 5, chaos: 5 },
        delayedEffects: [{
          turnsDelay: 3,
          description: 'Experts point out it\'s a dementia screening',
          effects: { support: -5, chaos: 5 }
        }]
      },
      {
        minScore: 25, maxScore: 54,
        title: 'Test Passed',
        description: 'Passed the cognitive test. As expected.',
        immediateEffects: { loyalty: 5, support: 5 }
      },
      {
        minScore: -100, maxScore: 24,
        title: 'Wrong Order',
        description: 'Said "Person TV Camera Woman Man." Close enough?',
        immediateEffects: { support: -15, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Comedy shows have new material',
          effects: { support: -5, chaos: 10 }
        }]
      }
    ]
  },
];
