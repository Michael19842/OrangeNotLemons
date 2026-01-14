// Trading stocks system
export interface Stock {
  id: string;
  name: string;
  ticker: string; // Stock ticker symbol (e.g., AAPL, GOOGL)
  emoji: string;
  sector: 'tech' | 'energy' | 'finance' | 'defense' | 'media' | 'healthcare' | 'real-estate' | 'manufacturing';
  basePrice: number;
  currentPrice: number;
  volatility: number; // How much it moves
  description: string;
  priceHistory?: number[]; // Track last 10 prices for mini chart
}

export const STOCKS: Stock[] = [
  {
    id: 'maga-media',
    name: 'Truth Broadcasting Network',
    ticker: 'TRTH',
    emoji: '📺',
    sector: 'media',
    basePrice: 50,
    currentPrice: 50,
    volatility: 0.8,
    description: 'Alternative facts media empire'
  },
  {
    id: 'orange-oil',
    name: 'Patriot Energy Corp',
    ticker: 'PATR',
    emoji: '🛢️',
    sector: 'energy',
    basePrice: 75,
    currentPrice: 75,
    volatility: 0.6,
    description: 'Domestic oil drilling company'
  },
  {
    id: 'wall-builders',
    name: 'BigBeautifulWall Construction',
    ticker: 'WALL',
    emoji: '🧱',
    sector: 'manufacturing',
    basePrice: 40,
    currentPrice: 40,
    volatility: 0.5,
    description: 'Construction and border security'
  },
  {
    id: 'golden-casino',
    name: 'Gilded Palace Resorts',
    ticker: 'GOLD',
    emoji: '🎰',
    sector: 'real-estate',
    basePrice: 60,
    currentPrice: 60,
    volatility: 0.7,
    description: 'Luxury hotels and casinos'
  },
  {
    id: 'defense-first',
    name: 'Eagle Defense Industries',
    ticker: 'EAGL',
    emoji: '🚀',
    sector: 'defense',
    basePrice: 100,
    currentPrice: 100,
    volatility: 0.4,
    description: 'Military equipment manufacturer'
  },
  {
    id: 'twitter-clone',
    name: 'Liberty Chirp Social',
    ticker: 'CHRP',
    emoji: '🐦',
    sector: 'tech',
    basePrice: 35,
    currentPrice: 35,
    volatility: 1.0,
    description: 'Free speech social platform'
  },
  {
    id: 'pharma-price',
    name: 'MediCorp Industries',
    ticker: 'PILL',
    emoji: '💊',
    sector: 'healthcare',
    basePrice: 80,
    currentPrice: 80,
    volatility: 0.5,
    description: 'Pharmaceutical company'
  },
  {
    id: 'coal-power',
    name: 'Clean Coal Energy Co',
    ticker: 'COAL',
    emoji: '⚡',
    sector: 'energy',
    basePrice: 45,
    currentPrice: 45,
    volatility: 0.6,
    description: 'Beautiful clean coal power'
  },
  {
    id: 'banks-first',
    name: 'Tremendous Financial Group',
    ticker: 'BANK',
    emoji: '🏦',
    sector: 'finance',
    basePrice: 90,
    currentPrice: 90,
    volatility: 0.3,
    description: 'Major financial institution'
  },
  {
    id: 'steel-america',
    name: 'United Steel Industries',
    ticker: 'STLX',
    emoji: '🏭',
    sector: 'manufacturing',
    basePrice: 55,
    currentPrice: 55,
    volatility: 0.5,
    description: 'Domestic steel production'
  },
  {
    id: 'fake-news',
    name: 'Legacy News Network',
    ticker: 'FAKE',
    emoji: '📰',
    sector: 'media',
    basePrice: 30,
    currentPrice: 30,
    volatility: 0.9,
    description: 'Traditional journalism outlet'
  },
  {
    id: 'china-goods',
    name: 'Global Import Trading',
    ticker: 'GYNA',
    emoji: '📦',
    sector: 'manufacturing',
    basePrice: 65,
    currentPrice: 65,
    volatility: 0.7,
    description: 'International imports company'
  },
  {
    id: 'green-energy',
    name: 'Renewable Power Systems',
    ticker: 'WIND',
    emoji: '🌞',
    sector: 'energy',
    basePrice: 70,
    currentPrice: 70,
    volatility: 0.8,
    description: 'Solar and wind energy provider'
  },
  {
    id: 'immigration-tech',
    name: 'Secure Border Technologies',
    ticker: 'BRDR',
    emoji: '🛡️',
    sector: 'defense',
    basePrice: 85,
    currentPrice: 85,
    volatility: 0.6,
    description: 'Border control technology'
  },
  {
    id: 'luxury-goods',
    name: 'Premium Lifestyle Brands',
    ticker: 'LUXE',
    emoji: '💎',
    sector: 'real-estate',
    basePrice: 120,
    currentPrice: 120,
    volatility: 0.4,
    description: 'Luxury goods and services'
  }
];

// Plan effects on stocks
export interface StockEffect {
  stockId: string;
  change: number; // Percentage change
  reason: string;
  hint: string; // Vague hint shown before research
}

// Stock research state - tracks which stocks the player has researched
export interface StockResearch {
  stockId: string;
  researchLevel: 0 | 1 | 2 | 3; // 0=unknown, 1=sector hint, 2=direction hint, 3=full info
}

// Map plan IDs to their stock effects
export const PLAN_STOCK_EFFECTS: Record<string, StockEffect[]> = {
  'tariffs': [
    { stockId: 'china-goods', change: -25, reason: 'Import tariffs devastate business', hint: 'International trade disrupted' },
    { stockId: 'steel-america', change: +15, reason: 'Domestic steel benefits', hint: 'Local industry protected' },
    { stockId: 'wall-builders', change: +10, reason: 'Construction demand up', hint: 'Infrastructure buzz' }
  ],
  'crypto': [
    { stockId: 'orange-oil', change: +30, reason: 'Crypto mining energy demand', hint: 'Power hungry technology' },
    { stockId: 'coal-power', change: +20, reason: 'Power consumption rises', hint: 'Electricity demand surging' },
    { stockId: 'twitter-clone', change: +25, reason: 'Crypto hype on social media', hint: 'Buzz on social platforms' },
    { stockId: 'banks-first', change: -10, reason: 'Traditional finance threatened', hint: 'Old money worried' },
    { stockId: 'maga-media', change: +15, reason: 'Platform promotes coin', hint: 'Media attention likely' }
  ],
  'border_wall': [
    { stockId: 'wall-builders', change: +40, reason: 'Massive construction contract', hint: 'Builders very interested' },
    { stockId: 'defense-first', change: +15, reason: 'Border security tech', hint: 'Security implications' },
    { stockId: 'immigration-tech', change: +25, reason: 'Surveillance systems needed', hint: 'Tech sector affected' }
  ],
  'press_ban': [
    { stockId: 'fake-news', change: -30, reason: 'Press credentials revoked', hint: 'Traditional media in trouble' },
    { stockId: 'maga-media', change: +20, reason: 'Alternative media rises', hint: 'New voices emerge' },
    { stockId: 'twitter-clone', change: +15, reason: 'Platform gains users', hint: 'Direct communication benefits' }
  ],
  'tax_cuts': [
    { stockId: 'luxury-goods', change: +25, reason: 'Wealthy spend more', hint: 'Rich people happy' },
    { stockId: 'golden-casino', change: +20, reason: 'High rollers return', hint: 'Entertainment spending up' },
    { stockId: 'banks-first', change: +15, reason: 'Corporate profits up', hint: 'Big business benefits' }
  ],
  'infrastructure_week': [
    { stockId: 'steel-america', change: +30, reason: 'Infrastructure projects', hint: 'Building materials needed' },
    { stockId: 'wall-builders', change: +25, reason: 'Construction boom', hint: 'Construction boom expected' },
    { stockId: 'china-goods', change: +10, reason: 'Materials needed', hint: 'Supply chains activated' }
  ],
  // Media plans
  'fake_news': [
    { stockId: 'fake-news', change: -25, reason: 'Called out as fake news', hint: 'Legacy media targeted' },
    { stockId: 'maga-media', change: +20, reason: 'Alternative media benefits', hint: 'Alternative voices rise' }
  ],
  'social_media': [
    { stockId: 'twitter-clone', change: +30, reason: 'Social media engagement surge', hint: 'Digital platforms booming' },
    { stockId: 'maga-media', change: +15, reason: 'Platform gains traction', hint: 'Media attention expected' }
  ],
  'book_deal': [
    { stockId: 'maga-media', change: +20, reason: 'Book promotion tour', hint: 'Publishing buzz' },
    { stockId: 'luxury-goods', change: +10, reason: 'Luxury book editions', hint: 'Premium products possible' }
  ],
  // Foreign plans
  'buy_country': [
    { stockId: 'wall-builders', change: +20, reason: 'Expansion construction', hint: 'Real estate implications' },
    { stockId: 'defense-first', change: +15, reason: 'Security concerns', hint: 'Military interested' }
  ],
  'trade_deal': [
    { stockId: 'china-goods', change: +25, reason: 'Trade deal signed', hint: 'International trade affected' },
    { stockId: 'steel-america', change: -10, reason: 'Import competition returns', hint: 'Domestic industry concerned' }
  ],
  'nato_tantrum': [
    { stockId: 'defense-first', change: +25, reason: 'US increases own defense', hint: 'Military spending likely' },
    { stockId: 'orange-oil', change: -10, reason: 'European energy uncertainty', hint: 'Energy markets volatile' }
  ],
  // Economy plans
  'nft_collection': [
    { stockId: 'twitter-clone', change: +25, reason: 'NFT buzz on social media', hint: 'Digital art trending' },
    { stockId: 'luxury-goods', change: +15, reason: 'Digital collectibles trend', hint: 'Luxury collectibles' }
  ],
  'stock_pump': [
    { stockId: 'maga-media', change: +35, reason: 'Direct stock promotion', hint: 'Media stocks moving' },
    { stockId: 'twitter-clone', change: +30, reason: 'Social media pumping', hint: 'Social buzz incoming' }
  ],
  'windmill_rant': [
    { stockId: 'coal-power', change: +20, reason: 'Fossil fuels praised', hint: 'Traditional energy praised' },
    { stockId: 'green-energy', change: -25, reason: 'Wind energy attacked', hint: 'Renewables under fire' },
    { stockId: 'orange-oil', change: +15, reason: 'Oil seen as alternative', hint: 'Fossil fuels favored' }
  ],
  // Politics plans
  'rally': [
    { stockId: 'maga-media', change: +15, reason: 'Rally coverage boosts ratings', hint: 'Media attention' },
    { stockId: 'golden-casino', change: +10, reason: 'Rally merchandise sales', hint: 'Merchandise potential' }
  ],
  'fire_everyone': [
    { stockId: 'banks-first', change: -10, reason: 'Government instability', hint: 'Uncertainty in markets' },
    { stockId: 'defense-first', change: +15, reason: 'New loyalists hired', hint: 'New contracts coming' }
  ],
  'space_force': [
    { stockId: 'defense-first', change: +40, reason: 'Massive space contracts', hint: 'Defense sector excited' },
    { stockId: 'steel-america', change: +15, reason: 'Rocket materials needed', hint: 'Materials needed' }
  ],
  // Personal plans with economic impact
  'golf': [
    { stockId: 'golden-casino', change: +15, reason: 'Golf resort promotion', hint: 'Luxury resorts promoted' },
    { stockId: 'luxury-goods', change: +10, reason: 'Luxury leisure trend', hint: 'High-end lifestyle' }
  ],
  'fast_food': [
    { stockId: 'china-goods', change: +5, reason: 'Fast food imports increase', hint: 'Food industry affected' }
  ],
  'wwe_appearance': [
    { stockId: 'maga-media', change: +20, reason: 'Entertainment crossover publicity', hint: 'Entertainment buzz' }
  ],
  'bible_sales': [
    { stockId: 'luxury-goods', change: +20, reason: 'Luxury bible editions', hint: 'Premium products' },
    { stockId: 'golden-casino', change: +10, reason: 'Merchandise sales', hint: 'Retail opportunities' }
  ],
  // Medical/Healthcare related
  'medical_advice': [
    { stockId: 'pharma-price', change: +25, reason: 'Controversial medical claims', hint: 'Healthcare in spotlight' },
    { stockId: 'fake-news', change: +15, reason: 'Medical fact-checking surge', hint: 'Media coverage up' }
  ],
  // Personal plans that affect markets
  'classified_docs': [
    { stockId: 'defense-first', change: -15, reason: 'Security concerns raised', hint: 'Security concerns' },
    { stockId: 'immigration-tech', change: +10, reason: 'Document security demand', hint: 'Tech solutions needed' }
  ],
  'awards_show': [
    { stockId: 'maga-media', change: +15, reason: 'Media attention increases', hint: 'Entertainment news' },
    { stockId: 'twitter-clone', change: +20, reason: 'Social media buzz', hint: 'Social media active' }
  ],
  'sharpie_weather': [
    { stockId: 'fake-news', change: +10, reason: 'Media covers controversy', hint: 'News coverage' },
    { stockId: 'twitter-clone', change: +15, reason: 'Viral moment spreads', hint: 'Viral potential' }
  ],
  // Political appointments
  'police_chief': [
    { stockId: 'defense-first', change: +20, reason: 'Law enforcement contracts', hint: 'Law enforcement affected' },
    { stockId: 'immigration-tech', change: +15, reason: 'Police tech upgrades', hint: 'Security tech needed' }
  ],
  'supreme_court': [
    { stockId: 'banks-first', change: +15, reason: 'Business-friendly court', hint: 'Business implications' },
    { stockId: 'orange-oil', change: +10, reason: 'Deregulation expectations', hint: 'Regulations may change' }
  ],
  // Trade and economic chaos
  'election_claims': [
    { stockId: 'banks-first', change: -20, reason: 'Political instability', hint: 'Markets nervous' },
    { stockId: 'defense-first', change: +15, reason: 'Security concerns rise', hint: 'Security focus' }
  ],
  'pardon_spree': [
    { stockId: 'banks-first', change: -10, reason: 'Rule of law concerns', hint: 'Legal uncertainty' },
    { stockId: 'golden-casino', change: +10, reason: 'Loyalty rewarded', hint: 'Friends benefit' }
  ],
  // International incidents
  'dictator_love': [
    { stockId: 'defense-first', change: -15, reason: 'Alliance concerns', hint: 'Alliances questioned' },
    { stockId: 'orange-oil', change: +20, reason: 'Oil deals with dictators', hint: 'Energy deals possible' }
  ],
  'paper_towels': [
    { stockId: 'fake-news', change: +15, reason: 'Disaster coverage increases', hint: 'News coverage up' },
    { stockId: 'maga-media', change: +10, reason: 'Positive spin coverage', hint: 'Media attention' }
  ],
  'nuke_hurricane': [
    { stockId: 'defense-first', change: +25, reason: 'Nuclear weapons interest', hint: 'Defense buzz' },
    { stockId: 'fake-news', change: +20, reason: 'Absurd news coverage', hint: 'Major headlines' }
  ],
  // Personal lifestyle
  'ballroom': [
    { stockId: 'luxury-goods', change: +15, reason: 'Luxury event spending', hint: 'High-end events' },
    { stockId: 'golden-casino', change: +20, reason: 'Casino ballroom bookings', hint: 'Casino buzz' }
  ],
  'spray_tan': [
    { stockId: 'luxury-goods', change: +10, reason: 'Beauty product demand', hint: 'Beauty products' }
  ],
  'tv_binge': [
    { stockId: 'maga-media', change: +10, reason: 'TV ratings discussion', hint: 'TV ratings' },
    { stockId: 'fake-news', change: +5, reason: 'Cable news monitoring', hint: 'Cable news' }
  ],
  // Tech and modern economy
  'covfefe': [
    { stockId: 'twitter-clone', change: +30, reason: 'Viral typo moment', hint: 'Viral moment' },
    { stockId: 'maga-media', change: +15, reason: 'Meme coverage surge', hint: 'Meme potential' }
  ],
  'tim_apple': [
    { stockId: 'twitter-clone', change: +15, reason: 'Tech CEO gaffe goes viral', hint: 'Tech headlines' },
    { stockId: 'china-goods', change: -10, reason: 'Tech manufacturing concerns', hint: 'Manufacturing affected' }
  ],
  'cognitive_test': [
    { stockId: 'pharma-price', change: +10, reason: 'Medical testing interest', hint: 'Healthcare focus' },
    { stockId: 'fake-news', change: +15, reason: 'Health coverage increases', hint: 'Health news' }
  ],
  // Remaining plans with smaller market impact
  'diet_coke': [
    { stockId: 'china-goods', change: +5, reason: 'Soda import increase', hint: 'Beverage industry' }
  ],
  'church_photo': [
    { stockId: 'maga-media', change: +10, reason: 'Religious base photo op', hint: 'Media opportunity' }
  ],
  'ramp_walk': [
    { stockId: 'luxury-goods', change: +5, reason: 'Fashion moment', hint: 'Fashion attention' }
  ],
  'water_glass': [
    { stockId: 'fake-news', change: +10, reason: 'Viral moment coverage', hint: 'Viral news' }
  ],
  'eclipse_stare': [
    { stockId: 'pharma-price', change: +15, reason: 'Eye care product demand', hint: 'Eye care focus' },
    { stockId: 'fake-news', change: +20, reason: 'Science coverage surge', hint: 'Science news' }
  ],
  'loyalty_dinner': [
    { stockId: 'golden-casino', change: +15, reason: 'Luxury dining event', hint: 'Luxury dining' },
    { stockId: 'defense-first', change: +10, reason: 'Loyalty rewarded', hint: 'Inner circle benefits' }
  ]
};

// Generate market rumors based on upcoming plan effects
export function generateMarketRumor(planId: string, stocks: Stock[]): string {
  const effects = PLAN_STOCK_EFFECTS[planId];
  if (!effects || effects.length === 0) return '';

  const rumors = [
    'Insiders whisper about movement in certain sectors...',
    'Market analysts are closely watching several stocks...',
    'Rumors of big changes are circulating on trading floors...',
    'Some traders seem to know something the market doesn\'t...',
    'Unusual trading volume detected in specific sectors...'
  ];

  return rumors[Math.floor(Math.random() * rumors.length)];
}

// Get hint for a specific stock effect (without revealing exact numbers)
export function getEffectHint(effect: StockEffect, researchLevel: number): string {
  if (researchLevel >= 3) {
    // Full info: show direction and magnitude
    const direction = effect.change > 0 ? '📈' : '📉';
    const magnitude = Math.abs(effect.change) >= 25 ? 'significant' :
                      Math.abs(effect.change) >= 15 ? 'moderate' : 'minor';
    return `${direction} ${magnitude} impact expected`;
  } else if (researchLevel >= 2) {
    // Direction hint
    return effect.change > 0 ? '📈 Likely positive' : '📉 Likely negative';
  } else if (researchLevel >= 1) {
    // Just the sector hint
    return effect.hint;
  }
  return '??? Unknown impact';
}
