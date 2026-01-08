import type { PlanCard } from '@/types/game';

export const PERSONAL_PLANS: PlanCard[] = [
  {
    id: 'golf',
    name: 'Executive Golf',
    emoji: '⛳',
    category: 'personal',
    baseCost: 100,
    revealable: {
      risk: 'Media will count the days',
      reward: 'Good for your health',
      timing: 'Relaxing weekend',
      secret: 'At your own resort. Charging full price.'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 40, maxScore: 100,
        title: 'Great Round!',
        description: 'Shot under par! (According to you)',
        immediateEffects: { health: 15, money: 50, support: -5, chaos: -5 }
      },
      {
        minScore: 10, maxScore: 39,
        title: 'Decent Game',
        description: 'A relaxing day on the links.',
        immediateEffects: { health: 10, support: -3, chaos: -3 }
      },
      {
        minScore: -100, maxScore: 9,
        title: 'Golf Cart Incident',
        description: 'Drove cart onto green. Groundskeeper quit.',
        immediateEffects: { health: 5, support: -10, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 4,
          description: 'Golf cart video goes viral',
          effects: { support: -5, chaos: 5 }
        }]
      }
    ]
  },
  {
    id: 'ballroom',
    name: 'Grand Ballroom Event',
    emoji: '💃',
    category: 'personal',
    baseCost: 500,
    revealable: {
      risk: 'Guest list might leak',
      reward: 'Networking with the elite',
      timing: 'One glamorous evening',
      secret: 'Foreign dignitaries paying for access'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 55, maxScore: 100,
        title: 'Glittering Gala!',
        description: 'The elite bow to the Orange! Deals are made!',
        immediateEffects: { money: 1000, loyalty: 10, coinValuation: 10, chaos: 5 },
        delayedEffects: [{
          turnsDelay: 14,
          description: 'Ethics complaint filed about guest list',
          effects: { loyalty: -5, chaos: 10 }
        }]
      },
      {
        minScore: 25, maxScore: 54,
        title: 'Nice Party',
        description: 'Standard elite gathering. Nothing special.',
        immediateEffects: { money: 200, loyalty: 5, coinValuation: 5 }
      },
      {
        minScore: -100, maxScore: 24,
        title: 'Party Foul',
        description: 'Fell asleep during speech. Photos circulate.',
        immediateEffects: { health: -10, support: -10, loyalty: -5, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Late night hosts mock the footage',
          effects: { support: -5, chaos: 5 }
        }]
      }
    ]
  },
  {
    id: 'fast_food',
    name: 'Hamberder Diplomacy',
    emoji: '🍔',
    category: 'personal',
    baseCost: 50,
    revealable: {
      risk: 'Not exactly presidential',
      reward: 'Relatable to common fruit',
      timing: 'Quick photo op',
      secret: 'You actually love this stuff'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 35, maxScore: 100,
        title: 'Man of the People!',
        description: 'Serving fast food at state dinner. Base loves it!',
        immediateEffects: { support: 10, loyalty: 10, health: -5, chaos: 5 }
      },
      {
        minScore: 10, maxScore: 34,
        title: 'Comfort Food',
        description: 'A quiet burger. No one cares.',
        immediateEffects: { health: -3 }
      },
      {
        minScore: -100, maxScore: 9,
        title: 'Food Poisoning',
        description: 'Bad batch. Very bad batch.',
        immediateEffects: { health: -20, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Health scare makes headlines',
          effects: { support: -5, loyalty: -5, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'diet_coke',
    name: 'Executive Diet',
    emoji: '🥤',
    category: 'personal',
    baseCost: 0,
    revealable: {
      risk: 'Doctors have concerns',
      reward: 'You do you',
      timing: 'Every meal, every day',
      secret: '12 diet cokes a day is normal, right?'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 40, maxScore: 100,
        title: 'Peak Performance!',
        description: 'Caffeine levels optimal! Energy tremendous!',
        immediateEffects: { health: 5, luck: 5, chaos: -5 }
      },
      {
        minScore: 15, maxScore: 39,
        title: 'Standard Consumption',
        description: 'Another day, another dozen diet cokes.',
        immediateEffects: { health: -2 }
      },
      {
        minScore: -100, maxScore: 14,
        title: 'Jitters',
        description: 'Hands shaking in photo op. Concerning.',
        immediateEffects: { health: -10, chaos: 10 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Health speculation intensifies',
          effects: { support: -5, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'spray_tan',
    name: 'Maintenance Day',
    emoji: '🍊',
    category: 'personal',
    baseCost: 200,
    revealable: {
      risk: 'Might go a shade too far',
      reward: 'Looking tremendous',
      timing: 'Every week, religiously',
      secret: 'Staff has "Orange Alert" protocol'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 45, maxScore: 100,
        title: 'Glowing!',
        description: 'Perfect orange hue achieved! Radiant!',
        immediateEffects: { health: 5, loyalty: 5, luck: 5, chaos: -5 }
      },
      {
        minScore: 20, maxScore: 44,
        title: 'Standard Glow',
        description: 'Usual maintenance. Nothing notable.',
        immediateEffects: { health: 2 }
      },
      {
        minScore: -100, maxScore: 19,
        title: 'Oompa Loompa Incident',
        description: 'Went WAY too orange. Photos everywhere.',
        immediateEffects: { support: -15, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Memes achieve immortality',
          effects: { support: -5, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'tv_binge',
    name: 'Executive Time',
    emoji: '📺',
    category: 'personal',
    baseCost: 0,
    revealable: {
      risk: 'Schedule might leak',
      reward: 'Stay informed (via Fox)',
      timing: '6 hours daily, minimum',
      secret: 'Staff calls it "Executive Time" officially'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 40, maxScore: 100,
        title: 'Very Informed!',
        description: 'Watched all the shows! Know all the takes!',
        immediateEffects: { health: 5, loyalty: 5, chaos: 5 }
      },
      {
        minScore: 15, maxScore: 39,
        title: 'Standard Viewing',
        description: 'Just the usual 6 hours. Productive.',
        immediateEffects: { health: 2 }
      },
      {
        minScore: -100, maxScore: 14,
        title: 'Schedule Leaked',
        description: 'Daily schedule shows 4 hours of "Executive Time".',
        immediateEffects: { support: -15, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Late night hosts read schedule on air',
          effects: { support: -5, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'church_photo',
    name: 'Church Photo Op',
    emoji: '⛪',
    category: 'personal',
    baseCost: 50,
    revealable: {
      risk: 'Might hold book wrong',
      reward: 'Religious base loves it',
      timing: 'Best during crisis',
      secret: 'You don\'t attend otherwise'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 50, maxScore: 100,
        title: 'Faith Demonstrated!',
        description: 'Powerful photo! Base inspired!',
        immediateEffects: { loyalty: 15, support: 5, chaos: 5 }
      },
      {
        minScore: 20, maxScore: 49,
        title: 'Brief Visit',
        description: 'In and out. Photo taken. Mission accomplished.',
        immediateEffects: { loyalty: 5 }
      },
      {
        minScore: -100, maxScore: 19,
        title: 'Tear Gas Controversy',
        description: 'Cleared protesters for photo. Not a good look.',
        immediateEffects: { loyalty: 10, support: -25, chaos: 25 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Church condemns the visit',
          effects: { support: -10, loyalty: -5, chaos: 15, coinValuation: -10 }
        }]
      }
    ]
  },
  {
    id: 'classified_docs',
    name: 'Take Souvenirs',
    emoji: '📁',
    category: 'personal',
    baseCost: 0,
    revealable: {
      risk: 'These might be... classified',
      reward: 'Great bathroom reading',
      timing: 'Pack them on the way out',
      secret: 'Some have very interesting intel'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 60, maxScore: 100,
        title: 'Perfect Mementos!',
        description: 'Beautiful documents! So presidential! Safely stored!',
        immediateEffects: { loyalty: 5, chaos: 5 },
        delayedEffects: [{
          turnsDelay: 6,
          description: 'FBI wants to chat about your bathroom',
          effects: { loyalty: -30, chaos: 30, coinValuation: -20 }
        }]
      },
      {
        minScore: 25, maxScore: 59,
        title: 'Some Light Reading',
        description: 'Took a few papers. Totally normal.',
        immediateEffects: { chaos: 5 },
        delayedEffects: [{
          turnsDelay: 8,
          description: 'National Archives asking questions',
          effects: { loyalty: -15, chaos: 15 }
        }]
      },
      {
        minScore: -100, maxScore: 24,
        title: 'Caught on Camera',
        description: 'Security footage shows boxes being loaded.',
        immediateEffects: { loyalty: -10, chaos: 20 },
        delayedEffects: [{
          turnsDelay: 3,
          description: 'Subpoenas incoming, markets spooked',
          effects: { loyalty: -25, money: -500, chaos: 25, coinValuation: -15 }
        }]
      }
    ]
  },
  {
    id: 'wwe_appearance',
    name: 'Wrestling Cameo',
    emoji: '🤼',
    category: 'personal',
    baseCost: 0,
    revealable: {
      risk: 'Not very presidential',
      reward: 'Hall of Fame material',
      timing: 'Perfect distraction',
      secret: 'You genuinely love this'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 45, maxScore: 100,
        title: 'Body Slam Victory!',
        description: 'Tackled a WWE villain! Crowd goes wild! Hall of Fame!',
        immediateEffects: { support: 15, loyalty: 10, health: -5, chaos: 10 }
      },
      {
        minScore: 15, maxScore: 44,
        title: 'Ringside Appearance',
        description: 'Waved from the ropes. Fans cheered. Good time.',
        immediateEffects: { support: 5, loyalty: 5, chaos: 5 }
      },
      {
        minScore: -100, maxScore: 14,
        title: 'Wardrobe Malfunction',
        description: 'Pants ripped on camera. Internet never forgets.',
        immediateEffects: { support: -15, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'GIF goes viral forever',
          effects: { support: -5, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'ramp_walk',
    name: 'Dramatic Exit',
    emoji: '🚶',
    category: 'personal',
    baseCost: 0,
    revealable: {
      risk: 'Ramp is slippery',
      reward: 'Shows... something',
      timing: 'After any speech',
      secret: 'New shoes have no grip'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 45, maxScore: 100,
        title: 'Graceful Descent!',
        description: 'Walked down ramp perfectly! Very stable! Athletic!',
        immediateEffects: { health: 5, support: 5, chaos: -5 }
      },
      {
        minScore: 15, maxScore: 44,
        title: 'Careful Steps',
        description: 'Took it slow. Nothing notable.',
        immediateEffects: { health: 2 }
      },
      {
        minScore: -100, maxScore: 14,
        title: 'West Point Shuffle',
        description: 'Very careful tiny steps down ramp. Questions arise.',
        immediateEffects: { support: -15, health: -5, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Health speculation dominates news cycle',
          effects: { support: -10, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'water_glass',
    name: 'Hydration Break',
    emoji: '🥤',
    category: 'personal',
    baseCost: 0,
    revealable: {
      risk: 'Cameras are always watching',
      reward: 'Staying hydrated is important',
      timing: 'During any speech',
      secret: 'The glass is heavy, okay?'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 50, maxScore: 100,
        title: 'Refreshing!',
        description: 'Drank water normally! One hand! Very strong!',
        immediateEffects: { health: 5, chaos: -5 }
      },
      {
        minScore: 20, maxScore: 49,
        title: 'Quick Sip',
        description: 'Standard water break. Nothing to see.',
        immediateEffects: { health: 2 }
      },
      {
        minScore: -100, maxScore: 19,
        title: 'Two Hands Required',
        description: 'Needed both hands for small water glass. Uh oh.',
        immediateEffects: { support: -15, chaos: 15 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Endless slow-motion replays',
          effects: { support: -5, chaos: 10 }
        }]
      }
    ]
  },
  {
    id: 'eclipse_stare',
    name: 'Eclipse Viewing',
    emoji: '☀️',
    category: 'personal',
    baseCost: 0,
    revealable: {
      risk: 'Don\'t look directly at it',
      reward: 'You do what you want',
      timing: 'During solar eclipse',
      secret: 'Staff shouting "DON\'T LOOK"'
    },
    revealed: [],
    outcomes: [
      {
        minScore: 50, maxScore: 100,
        title: 'Tremendous Eclipse!',
        description: 'Looked directly at sun! Eyes of steel! Very strong!',
        immediateEffects: { loyalty: 10, health: -5, chaos: 10 }
      },
      {
        minScore: 20, maxScore: 49,
        title: 'Brief Glance',
        description: 'Peeked at eclipse. Staff panicked.',
        immediateEffects: { loyalty: 5, health: -2, chaos: 5 }
      },
      {
        minScore: -100, maxScore: 19,
        title: 'Photographic Evidence',
        description: 'Photo of you staring at sun goes viral.',
        immediateEffects: { support: -20, health: -10, chaos: 20 },
        delayedEffects: [{
          turnsDelay: 1,
          description: 'Eye doctor visits become news',
          effects: { support: -5, chaos: 10, health: -5 }
        }]
      }
    ]
  },
];
