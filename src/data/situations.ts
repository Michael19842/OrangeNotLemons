import type { Situation } from '@/types/game';

export const SITUATIONS: Situation[] = [
  {
    id: 'economic_crisis',
    name: 'Economic Crisis',
    description: 'Markets are crashing and investors are panicking!',
    hints: [
      '📉 BREAKING: Stock market in free fall! Investors demand action! #MarketCrash',
      '💸 Wall Street insiders say "DO SOMETHING about the economy!" #Panic',
      '🏦 Banks requesting emergency meetings with leadership #FinancialCrisis',
      '📊 Economic advisors flooding your inbox with urgent memos #ActNow'
    ],
    idealCategories: ['economy'],
    worstCategories: ['personal', 'media'],
    bonusMultiplier: 1.5,
    penaltyMultiplier: 2.0
  },
  {
    id: 'media_frenzy',
    name: 'Media Frenzy',
    description: 'The press is circling like vultures!',
    hints: [
      '📺 ALERT: Major networks preparing hit pieces! Time to control the narrative! #FakeNews',
      '🎤 Press corps demanding answers - maybe give them something else to talk about?',
      '📰 Journalists digging into your past - distraction needed! #MediaWar',
      '🗞️ Anonymous sources leaking to press - time for a media counter-attack!'
    ],
    idealCategories: ['media'],
    worstCategories: ['economy', 'foreign'],
    bonusMultiplier: 1.5,
    penaltyMultiplier: 2.0
  },
  {
    id: 'international_tensions',
    name: 'International Tensions',
    description: 'Foreign leaders are making threats!',
    hints: [
      '🌍 URGENT: Foreign leaders issuing ultimatums! Diplomacy needed! #WorldStage',
      '🕊️ Allies requesting summit meeting - international response required!',
      '⚔️ Border tensions rising - the world watches your next move! #GlobalCrisis',
      '🤝 Trade partners threatening to walk away - foreign policy moment!'
    ],
    idealCategories: ['foreign'],
    worstCategories: ['personal', 'media'],
    bonusMultiplier: 1.5,
    penaltyMultiplier: 2.0
  },
  {
    id: 'political_scandal',
    name: 'Political Scandal',
    description: 'Your opponents smell blood!',
    hints: [
      '🏛️ Opposition party planning major offensive! Political counter needed! #Politics',
      '⚖️ Congressional hearings announced - time for political maneuvering!',
      '🗳️ Poll numbers slipping - need a political win NOW! #Campaign',
      '👔 Party members expressing "concerns" - shore up political support!'
    ],
    idealCategories: ['politics'],
    worstCategories: ['personal', 'economy'],
    bonusMultiplier: 1.5,
    penaltyMultiplier: 2.0
  },
  {
    id: 'health_concerns',
    name: 'Health Concerns',
    description: 'The public is worried about your stamina!',
    hints: [
      '🏥 Rumors about your health spreading! Show strength or address it! #Stamina',
      '💊 Doctors advising rest - but maybe a show of strength instead?',
      '🏃 Media questioning your energy levels - personal response needed!',
      '😰 Staff worried about your schedule - self-care or power move?'
    ],
    idealCategories: ['personal'],
    worstCategories: ['foreign', 'economy'],
    bonusMultiplier: 1.5,
    penaltyMultiplier: 2.0
  },
  {
    id: 'loyalty_crisis',
    name: 'Loyalty Crisis',
    description: 'Inner circle members are wavering!',
    hints: [
      '🐀 Whispers of betrayal in your inner circle! Loyalty test needed! #Traitors',
      '👥 Key allies not returning calls - reward loyalty or punish disloyalty?',
      '🤫 Anonymous sources sound like insiders - find the leakers!',
      '💼 Staff resignations rumored - personal attention required!'
    ],
    idealCategories: ['personal', 'politics'],
    worstCategories: ['foreign', 'media'],
    bonusMultiplier: 1.6,
    penaltyMultiplier: 1.8
  },
  {
    id: 'public_unrest',
    name: 'Public Unrest',
    description: 'The people are restless!',
    hints: [
      '📢 Protests growing nationwide! Address the people! #Unrest',
      '🔥 Social media exploding with criticism - media response or political action?',
      '👥 Approval ratings in danger zone - connect with supporters!',
      '📊 Pollsters warning of "enthusiasm gap" - energize the base!'
    ],
    idealCategories: ['media', 'politics'],
    worstCategories: ['economy', 'foreign'],
    bonusMultiplier: 1.4,
    penaltyMultiplier: 1.9
  },
  {
    id: 'opportunity_moment',
    name: 'Golden Opportunity',
    description: 'The stars are aligning for a big move!',
    hints: [
      '⭐ Advisors say conditions are PERFECT for a bold economic move! #Opportunity',
      '🎯 Intelligence suggests foreign adversaries are distracted - strike now?',
      '📈 Market conditions favorable for that plan you\'ve been considering!',
      '🌟 Political opponents in disarray - time to push your agenda!'
    ],
    idealCategories: ['economy', 'foreign'],
    worstCategories: ['personal'],
    bonusMultiplier: 1.8,
    penaltyMultiplier: 1.5
  },
  {
    id: 'calm_waters',
    name: 'Calm Waters',
    description: 'Things are quiet... maybe too quiet.',
    hints: [
      '😌 Slow news day - perfect time for personal matters or self-promotion!',
      '📰 Media has nothing to cover - give them something positive!',
      '🏖️ No major crises... enjoy it while it lasts? Or make your own news?',
      '✨ Staff says "take it easy" but winners never rest! What\'s the play?'
    ],
    idealCategories: ['personal', 'media'],
    worstCategories: ['foreign'],
    bonusMultiplier: 1.3,
    penaltyMultiplier: 1.4
  },
  {
    id: 'money_troubles',
    name: 'Money Troubles',
    description: 'The coffers are running low!',
    hints: [
      '💰 Treasury warning: funds dangerously low! Time to make money! #BrokeOrange',
      '🏦 Creditors calling - need a cash injection FAST!',
      '💵 Campaign funds drying up - economic action or fundraising needed!',
      '📉 Accountants looking nervous - revenue generation critical!'
    ],
    idealCategories: ['economy'],
    worstCategories: ['foreign', 'politics'],
    bonusMultiplier: 1.7,
    penaltyMultiplier: 2.2
  }
];

export function getRandomSituation(): Situation {
  return SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
}

export function getSituationById(id: string): Situation | undefined {
  return SITUATIONS.find(s => s.id === id);
}
