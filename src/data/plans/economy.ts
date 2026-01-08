import type { PlanCard } from '@/types/game';

export const ECONOMY_PLANS: PlanCard[] = [
  {
    id: 'tariffs',
    name: 'Tremendous Tariffs',
    emoji: '📦',
    category: 'economy',
    baseCost: 200,
    revealable: {
      risk: 'Other countries will retaliate',
      reward: 'Could boost domestic production',
      timing: 'Effects take 4 months to materialize',
      secret: 'Your own businesses are exempt, of course'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 60, maxScore: 100,
        title: 'Trade War Won!',
        description: 'Other fruits bow to the Orange\'s economic genius!',
        immediateEffects: { money: 500, loyalty: 15, support: 5, chaos: 10 }, // Increased loyalty from 10
        delayedEffects: [
          {
            turnsDelay: 4,
            description: 'Consumer prices skyrocket from tariffs',
            effects: { support: -15, money: -200, coinValuation: -10 }
          },
          {
            turnsDelay: 9,
            description: 'Domestic manufacturers struggle with supply chain',
            effects: { support: -5, coinValuation: -5 }
          }
        ]
      },
      {
        minScore: 30, maxScore: 59,
        title: 'Tariff Tantrum',
        description: 'Mixed results. Some fruits are impressed, others are squashed.',
        immediateEffects: { money: 100, loyalty: 8, chaos: 8 }, // Increased loyalty from 5, reduced chaos from 10
        delayedEffects: [
          {
            turnsDelay: 5,
            description: 'Trading partners impose counter-tariffs',
            effects: { money: -150, support: -5, coinValuation: -5 }
          }
        ]
      },
      {
        minScore: -100, maxScore: 29,
        title: 'Tariff Disaster',
        description: 'The economy tanks. Who knew trade was complicated?',
        immediateEffects: { money: -100, support: -10, loyalty: -5, chaos: 20, coinValuation: -15 },
        delayedEffects: [
          {
            turnsDelay: 3,
            description: 'Supply chains collapse',
            effects: { money: -150, coinValuation: -10 }
          },
          {
            turnsDelay: 6,
            description: 'Recession hits! The Mandarin Business becomes harder to hide...',
            effects: { loyalty: -10, money: -150, coinValuation: -5 }
          }
        ]
      }
    ]
  },
  {
    id: 'crypto',
    name: 'OrangeCoin Launch',
    emoji: '🪙',
    category: 'economy',
    baseCost: 500,
    revealable: {
      risk: 'SEC might investigate (lol)',
      reward: 'Potentially unlimited money',
      timing: 'Pump happens immediately, dump later',
      secret: 'You own 80% of the supply'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 70, maxScore: 100,
        title: 'TO THE MOON!',
        description: 'OrangeCoin hits $1000! Early investors (you) are thrilled!',
        immediateEffects: { money: 2000, loyalty: 15, luck: 10, coinValuation: 25, chaos: 8 },
        delayedEffects: [
          {
            turnsDelay: 2,
            description: 'Media hypes OrangeCoin! Retail investors FOMO in',
            effects: { money: 500, loyalty: 5, coinValuation: 10 }
          },
          {
            turnsDelay: 5,
            description: 'OrangeCoin volatility spooks regulators',
            effects: { chaos: 10, coinValuation: -10 }
          },
          {
            turnsDelay: 8,
            description: 'OrangeCoin crashes 99%. Retail investors are furious.',
            effects: { support: -20, loyalty: -10, coinValuation: -30, chaos: 15 }
          },
          {
            turnsDelay: 12,
            description: 'Congressional hearings scheduled on crypto fraud',
            effects: { loyalty: -5, chaos: 10, money: -300 }
          }
        ]
      },
      {
        minScore: 30, maxScore: 69,
        title: 'Modest Gains',
        description: 'OrangeCoin does okay. Not great, not terrible.',
        immediateEffects: { money: 300, loyalty: 5, support: 5, coinValuation: 10 },
        delayedEffects: [
          {
            turnsDelay: 2,
            description: 'Early adopters sell for profit, others hold bags',
            effects: { money: 200, coinValuation: -5 }
          },
          {
            turnsDelay: 4,
            description: 'Crypto winter hits. OrangeCoin holders demand refunds.',
            effects: { support: -10, coinValuation: -15 }
          },
          {
            turnsDelay: 7,
            description: 'OrangeCoin becomes forgotten meme',
            effects: { coinValuation: -10, chaos: 5 }
          }
        ]
      },
      {
        minScore: -100, maxScore: 29,
        title: 'Rug Pull Allegations',
        description: 'OrangeCoin tanks immediately. People are asking questions.',
        immediateEffects: { money: -200, loyalty: -10, support: -15, coinValuation: -20, chaos: 20 },
        delayedEffects: [
          {
            turnsDelay: 2,
            description: 'Twitter hashtag #OrangeScam trends worldwide',
            effects: { support: -10, chaos: 10 }
          },
          {
            turnsDelay: 6,
            description: 'SEC opens investigation',
            effects: { chaos: 15, loyalty: -5 }
          },
          {
            turnsDelay: 10,
            description: 'Class action lawsuit filed. Legal fees mount.',
            effects: { money: -500, chaos: 10 }
          },
          {
            turnsDelay: 14,
            description: 'Crypto exchanges delist OrangeCoin',
            effects: { coinValuation: -20, support: -5 }
          }
        ]
      }
    ]
  },
  {
    id: 'tax_cuts',
    name: 'Tax Cuts for Fruits',
    emoji: '💰',
    category: 'economy',
    baseCost: 100,
    revealable: {
      risk: 'Deficit will explode',
      reward: 'Rich fruits will love you',
      timing: 'Immediate popularity boost',
      secret: 'Only applies to fruits worth over $10M'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 50, maxScore: 100,
        title: 'Trickle Down Success!',
        description: 'Rich fruits are ecstatic! Surely wealth will trickle down any day now.',
        immediateEffects: { money: 800, loyalty: 15, coinValuation: 10 },
        delayedEffects: [
          {
            turnsDelay: 3,
            description: 'Budget deficit grows alarmingly',
            effects: { coinValuation: -10, chaos: 5 }
          },
          {
            turnsDelay: 6,
            description: 'National debt skyrockets. Services cut.',
            effects: { support: -20, health: -5, coinValuation: -5, chaos: 10 }
          },
          {
            turnsDelay: 10,
            description: 'Wealth gap reaches historic levels. Unrest grows.',
            effects: { support: -10, chaos: 15, loyalty: -5 }
          }
        ]
      },
      {
        minScore: 20, maxScore: 49,
        title: 'Mixed Reception',
        description: 'Some fruits benefit, others wonder where their cut is.',
        immediateEffects: { money: 200, loyalty: 5, support: -5 },
        delayedEffects: [
          {
            turnsDelay: 4,
            description: 'Middle class realizes they got nothing',
            effects: { support: -10, chaos: 5 }
          },
          {
            turnsDelay: 8,
            description: 'Tax bill comes due for average fruits',
            effects: { support: -5, chaos: 10 }
          }
        ]
      },
      {
        minScore: -100, maxScore: 19,
        title: 'PR Disaster',
        description: 'Someone leaked that the Orange pays $750 in taxes.',
        immediateEffects: { support: -15, loyalty: -5, chaos: 15 },
        delayedEffects: [
          {
            turnsDelay: 2,
            description: 'Opposition demands full tax returns',
            effects: { chaos: 10, support: -5 }
          },
          {
            turnsDelay: 3,
            description: 'Media digs into tax history',
            effects: { chaos: 10 }
          },
          {
            turnsDelay: 7,
            description: 'Tax return investigations intensify',
            effects: { loyalty: -10, chaos: 10 }
          },
          {
            turnsDelay: 11,
            description: 'IRS audit announced publicly',
            effects: { loyalty: -10, money: -400, chaos: 15 }
          }
        ]
      }
    ]
  },
  {
    id: 'nft_collection',
    name: 'Orange NFT Drop',
    emoji: '🖼️',
    category: 'economy',
    baseCost: 200,
    revealable: {
      risk: 'NFT market is dead',
      reward: 'Loyal buyers will pay anything',
      timing: 'Quick cash grab',
      secret: 'Art is AI-generated clipart'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 60, maxScore: 100,
        title: 'Sold Out in Seconds!',
        description: 'Collectors fight over pixelated Oranges! $99 each!',
        immediateEffects: { money: 1500, loyalty: 5, coinValuation: 15, chaos: 5 },
        delayedEffects: [
          {
            turnsDelay: 3,
            description: 'NFT resellers flip for huge profits',
            effects: { money: 300, loyalty: 3 }
          },
          {
            turnsDelay: 6,
            description: 'NFT hype fades, resale market collapses',
            effects: { coinValuation: -10, chaos: 5 }
          },
          {
            turnsDelay: 11,
            description: 'NFT values crash to $0. Buyers demand refunds.',
            effects: { support: -10, loyalty: -5, coinValuation: -10, chaos: 10 }
          }
        ]
      },
      {
        minScore: 25, maxScore: 59,
        title: 'Modest Sales',
        description: 'Some die-hards bought in. Others confused by "NFT".',
        immediateEffects: { money: 300, coinValuation: 5 },
        delayedEffects: [
          {
            turnsDelay: 3,
            description: 'NFT buyers realize they can\'t resell',
            effects: { support: -5, coinValuation: -10 }
          },
          {
            turnsDelay: 7,
            description: 'OpenSea delists collection for ToS violation',
            effects: { coinValuation: -10, chaos: 5 }
          }
        ]
      },
      {
        minScore: -100, maxScore: 24,
        title: 'Screenshot Disaster',
        description: 'Everyone just right-clicked. Sales near zero.',
        immediateEffects: { money: -50, support: -5, coinValuation: -10, chaos: 10 },
        delayedEffects: [
          {
            turnsDelay: 1,
            description: 'Becomes internet meme for worst NFT launch',
            effects: { support: -5, chaos: 10 }
          },
          {
            turnsDelay: 5,
            description: 'Tech press roasts NFT understanding',
            effects: { support: -5, chaos: 5 }
          }
        ]
      }
    ]
  },
  {
    id: 'stock_pump',
    name: 'Market Manipulation',
    emoji: '📈',
    category: 'economy',
    baseCost: 400,
    revealable: {
      risk: 'SEC is watching (maybe)',
      reward: 'Massive short-term gains',
      timing: 'Buy low, sell high, tweet in between',
      secret: 'Your friends are already positioned'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 65, maxScore: 100,
        title: 'Stonks Only Go Up!',
        description: 'One tweet moved markets! Perfectly legal!',
        immediateEffects: { money: 2000, luck: 5, coinValuation: 20, chaos: 15 },
        delayedEffects: [
          {
            turnsDelay: 8,
            description: 'Trading patterns raise SEC eyebrows',
            effects: { chaos: 10, coinValuation: -10 }
          },
          {
            turnsDelay: 15,
            description: 'Congressional investigation announced',
            effects: { loyalty: -15, money: -500, coinValuation: -15, chaos: 10 }
          }
        ]
      },
      {
        minScore: 30, maxScore: 64,
        title: 'Minor Movement',
        description: 'Market twitched. Insiders made money.',
        immediateEffects: { money: 400, coinValuation: 10, chaos: 5 },
        delayedEffects: [{
          turnsDelay: 3,
          description: 'Market corrects itself',
          effects: { coinValuation: -10 }
        }]
      },
      {
        minScore: -100, maxScore: 29,
        title: 'Wrong Direction',
        description: 'Tweeted "SELL!" instead of "BUY!" by accident.',
        immediateEffects: { money: -600, loyalty: -10, coinValuation: -20, chaos: 25 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Market crash makes headlines',
          effects: { support: -10, coinValuation: -15 }
        }]
      }
    ]
  },
  {
    id: 'bible_sales',
    name: 'Holy Orange Bible',
    emoji: '📖',
    category: 'economy',
    baseCost: 100,
    revealable: {
      risk: 'Some might find it... sacrilegious',
      reward: 'Base will buy ANYTHING',
      timing: 'Perfect for the holidays',
      secret: 'Made in China, $3 production cost'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 50, maxScore: 100,
        title: 'Blessed Sales!',
        description: '$60 bibles flying off shelves! (To your pockets)',
        immediateEffects: { money: 1200, loyalty: 15, coinValuation: 10, chaos: 5 },
        delayedEffects: [{
          turnsDelay: 3,
          description: 'Religious leaders express "concerns"',
          effects: { support: -10, chaos: 5 }
        }]
      },
      {
        minScore: 20, maxScore: 49,
        title: 'Modest Faith',
        description: 'Sold a few. The faithful are faithful.',
        immediateEffects: { money: 300, loyalty: 5, chaos: 3 }
      },
      {
        minScore: -100, maxScore: 19,
        title: 'Thou Shalt Not',
        description: 'Viral video of you holding it upside down.',
        immediateEffects: { support: -15, loyalty: -5, chaos: 15, coinValuation: -5 },
        delayedEffects: [{
          turnsDelay: 2,
          description: 'Faith leaders distance themselves publicly',
          effects: { loyalty: -10, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'windmill_rant',
    name: 'Windmill Warning',
    emoji: '💨',
    category: 'economy',
    baseCost: 0,
    revealable: {
      risk: 'Science disagrees',
      reward: 'Oil donors love it',
      timing: 'Any rally works',
      secret: 'One blocked your golf course view'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 50, maxScore: 100,
        title: 'Bird Massacre Exposed!',
        description: 'Windmills kill birds! Cause cancer! Very dangerous!',
        immediateEffects: { loyalty: 15, money: 300, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 2,
          description: 'Fact-checkers have a field day',
          effects: { support: -10, chaos: 5 }
        }]
      },
      {
        minScore: 20, maxScore: 49,
        title: 'Noise Concerns',
        description: 'Mentioned windmill noise. Some nodded.',
        immediateEffects: { loyalty: 5, money: 100, chaos: 5 }
      },
      {
        minScore: -100, maxScore: 19,
        title: 'Sound of Windmills',
        description: 'Mimicked windmill sound for 2 minutes. Concerning.',
        immediateEffects: { support: -15, chaos: 20 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Clip becomes legendary meme',
          effects: { support: -5, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'tim_apple',
    name: 'CEO Meeting',
    emoji: '🍎',
    category: 'economy',
    baseCost: 0,
    revealable: {
      risk: 'Names are hard',
      reward: 'Shows business connections',
      timing: 'During business roundtable',
      secret: 'You don\'t remember anyone\'s name'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 50, maxScore: 100,
        title: 'Great Meeting, Tim Apple!',
        description: 'Called CEO by wrong name! Power move! He didn\'t correct you!',
        immediateEffects: { money: 200, loyalty: 5, coinValuation: 5 },
        delayedEffects: [{
          turnsDelay: 3,
          description: 'CEOs invest more to stay on your good side',
          effects: { money: 300, coinValuation: 5 }
        }]
      },
      {
        minScore: 20, maxScore: 49,
        title: 'Business Discussion',
        description: 'Met with CEOs. Used note cards for names.',
        immediateEffects: { money: 100, coinValuation: 3 }
      },
      {
        minScore: -100, maxScore: 19,
        title: 'Name Disaster',
        description: 'Called everyone by company names. Tim Apple, Jeff Amazon, Elon Twitter.',
        immediateEffects: { support: -10, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Becomes running joke, affects business confidence',
          effects: { support: -5, coinValuation: -5 }
        }]
      }
    ]
  },
];
