import type { PlanCard, GameStats, JuiceMessage } from '@/types/game';

// Critical/Salty messages that require moderation
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

// Random nonsense messages
const NONSENSE_MESSAGES = [
  "🍊 Sources say @TheOrangeOfficial is considering renaming Thursday to 'Orangeday' #TremendousIdeas",
  "🥤 BREAKING: Orange juice sales up 400% for no particular reason #OrangeEffect #Markets",
  "🌴 Experts agree: Palm trees are just tall pineapples #Science #FruitFacts",
  "📊 Poll: 78% of fruits prefer being in a fruit salad to being juiced #FruitRights",
  "🎭 Tonight's debate: Is a tomato a fruit or a traitor? @TomatoTruth #TomatoGate",
  "🌡️ Weather report: 100% chance of tremendous success today #Winning",
  "🎪 Circus announces new act: Juggling Mandarins (unrelated to anything) #NotSuspicious",
  "📈 Stock tip: Invest in orange futures. Trust me. #FinancialAdvice #NotLegalAdvice",
  "🎨 Art critics call @TheOrangeOfficial portrait 'very round, much color' #Art",
  "🏆 @TheOrangeOfficial wins 'Most Orange' award for 47th consecutive year #StillGotIt",
  "🎵 New hit single: 'Squeeze Me Maybe' tops the charts #1 #OrangeMusic",
  "🌙 @NASA confirms: The sun is just a really big orange #SpaceNews #BREAKING",
  "🎬 Hollywood announces Orange biopic, casting search begins #OrangeMovie",
  "🏰 Sources: @TheOrangeOfficial considering adding moat to residence #Security",
  "🎰 Casino reports record wins by 'anonymous orange individual' #LuckyOrange #Winning",
  "📚 Best-seller: 'The Art of the Peel' sells 1 billion copies (estimated) #BestSeller",
  "🚀 @SpaceForce reports no lemons detected in orbit #AllClear #NoLemons",
  "🎭 Theater critic: '@TheOrangeOfficial press conference was RIVETING' #Drama",
  "🌈 Scientists discover new color: 'Tremendous Orange' #ScienceNews",
  "🎯 Poll: @TheOrangeOfficial rated 'most likely to succeed' by oranges #OrangePoll",
  "🦅 Bald eagle refuses to land on arm. @FakeNews claims it 'attacked' #LIES",
  "☀️ @TheOrangeOfficial stares directly at eclipse. Doctors say 'tremendous eyes' #Science",
  "🌊 Hurricane redirected with sharpie. Science baffled. #WeatherControl #Tremendous",
  "🧻 Toilet paper stuck to shoe incident. Staff: 'Intentional power move' #Fashion",
  "🎺 @TheOrangeOfficial claims to have invented the word 'tremendous' #Facts",
  "📱 BREAKING: Caps lock discovered. Tweets now 340% MORE TREMENDOUS #WINNING",
  "🎪 @WWE Hall of Fame inductee status somehow relevant to diplomacy #Qualified",
  "🍕 @TheOrangeOfficial eats pizza with fork. New York declares emergency #PizzaGate",
  "☔ 'I would have gone to the cemetery but it was raining' - @TheOrangeOfficial",
  "🎤 Microphone works perfectly. Taps it 47 times anyway #JustToBeSure",
  "📺 @TheOrangeOfficial live-tweets own interview while doing interview #Multitasking",
  "🎂 BREAKING: Largest inauguration cake in history #Records #Tremendous",
  "🦠 Very interesting internal cleaning solutions suggested #Innovation #Medicine",
  "🌪️ Paper towels thrown at hurricane victims. 'Great arm!' #HurricaneRelief",
  "💇 Wind reveals complex hair architecture. Internet goes wild. #HairGate #Trending",
  "🎯 Cognitive test aced. 'Person, woman, man, camera, TV' #Genius #StableGenius",
  "🏈 Football team declines invite. Fast food served anyway. #Hamberders",
  "🚁 @TheOrangeOfficial speaks over helicopter noise for 45 minutes straight #Leadership",
  "📰 Vocabulary rated 'very good, the best words' by @WordExperts #Bigly",
  "🎨 Signature described as 'aggressive seismograph reading' #Art #Unique",
  "☕ Water drunk with two hands. Hydration is serious business. #Health",
  "🏌️ Golf handicap disputed. 'I'm actually a scratch golfer' - @TheOrangeOfficial",
  "🎪 @TheOrangeOfficial wrestles @CNN logo in video. Emmy consideration pending.",
  "🌍 Question asked: Is Finland part of Russia? Geography is hard. #Education",
  "💼 Briefcase contains only @McDonalds. Efficient! #FastFood #Executive",
  "🎵 Ramp walked down carefully. Very steep, many people saying. #Rampgate",
  "📊 'I understand nuclear better than anyone' - @TheOrangeOfficial #Nuclear",
  "🗺️ Suggestion to nuke hurricane. Meteorologists: 'Please don't' #WeatherIdeas",
  "🍎 @Apple CEO Tim Cook renamed 'Tim Apple'. Saves time! #Efficiency",
  "🚿 Water pressure complaints. Showers take forever now. #FirstWorldProblems",
  "💡 Stares at lightbulb. 'I know more about light than anyone' #Science",
  "🎬 @TheOrangeOfficial suggests buying Greenland. Denmark: 'What?' #Dealmaking",
  "🌮 Taco salad posted with caption 'I love Hispanics!' #PanderBear #TacoTuesday",
  "🎪 Threatens to sue wind turbines for being 'ugly' #Windmills #Lawsuit",
  "📸 Official portrait retouched 47 times. 'Still not orange enough' #Perfectionist",
  "🎤 Says 'believe me' 73 times in one speech. New record! #BelieveMe #Records",
  "🏛️ Suggests fourth face on Mount Rushmore. 'Just brainstorming' #Ideas",
  "📱 Accidentally tweets nuclear codes. 'Fat fingers!' #Oops #Deleted",
  "🎨 Declares orange the official color of everything #Branding #Orange",
  "🌟 Claims to have 'great genes' and 'very good brain' #Genetics #Stable",
  "🎯 Mispronounces country name. Insists 'that's how THEY say it' #Geography",
  "🏆 Awards self 'Most Humble' medal #Irony #Humble #TheBest",
  "📚 Says doesn't read books because 'I just know' #Knowledge #Intuition",
  "🎪 Crowd size debate continues into third year #StillTalking #BiggestEver",
  "🌊 Suggests raking ocean to prevent hurricanes #Innovation #Science",
  "☀️ Looks directly at sun during solar event. Again. #Science #EyeHealth",
  "🎤 Refers to self in third person 47 times. New personal best! #TheOrange",
  "🧠 'Nobody knows more about [topic] than me' - applies to 47 different topics #Expert",
  "🎭 Insists 'I'm very presidential' while eating hamberders #Presidential",
  "🏛️ Mispronounces own policy name. Declares it 'new pronunciation' #Leadership",
  "📊 Polls showing bad numbers declared 'fake' and 'rigged' #NotMyPolls",
  "🎪 Rally features interpretive dance about tariffs #Culture #TariffDance",
  "🌍 Discovers Earth is round. 'Many people didn't know that!' #Geography #Facts",
  "🏆 Claims to have invented the question mark #Innovation #Punctuation",
  "📱 Blocking spree: 47 people blocked for questioning crowd sizes #Blocked",
  "🎤 Press conference derails into 45-minute rant about lemons #Focus #Lemons",
  "🏌️ Golf score disputed. Witness: 'That's not how counting works' #Math",
  "📺 Watches 8 hours of TV daily. 'Research' explains aide #Homework",
  "🎨 Orange makeup supplier reveals secret formula. Stock soars 400% #Beauty",
  "🌮 Says 'the blacks love me' while eating a taco #Cringe #StopTalking",
  "🎪 Suggests wall should be transparent 'to see lemons coming' #WallIdeas",
  "📱 Tweets 'covfefe' at 3am. Declares it classified information #Mysterious",
  "🏛️ Forgets which country bombed. 'One of the 'stans' probably' #Geography",
  "🎤 Uses air accordion gestures 127 times during speech #Gestures #Accordion",
  "🌟 'I'm like a smart person' - actual quote #SmartPerson #Stable",
  "🎯 Boasts about acing dementia test. Repeatedly. #CognitiveTest #Pride",
  "📚 Dictionary changes 'narcissism' definition to just a picture of an orange #Language",
];

// News messages tied to stats
const STAT_MESSAGES: Record<string, (value: number) => string[]> = {
  health: (h) => {
    if (h < 30) return [
      "⚠️ Sources close to @TheOrangeOfficial report 'frequent naps' #Health #Concerning",
      "🏥 White House denies tired claims - says 'resting his eyes' #FakeNews #EnergyLevel",
      "💊 Pharmacist seen entering through back door #HealthWatch",
      "🤒 Canceled public appearance. 'Just a minor cold' claims spokesperson #Health",
      "😴 Aides say boss 'needs more executive nap time' #Tired #Energy",
      "🩹 Reports of 'vitamin deficiency' being treated #HealthConcerns",
    ];
    if (h < 60) return [
      "🩺 Annual physical results: 'Incredibly healthy for an orange' #HealthUpdate",
      "🏃 @TheOrangeOfficial walks full 18 holes! (with cart) #Fitness #Golf",
      "💊 Daily vitamin regimen 'most advanced in history' #Health #Wellness",
      "🧃 Sources say juice intake at healthy levels #OrangeJuice #Hydration",
    ];
    return [
      "💪 Vigor demonstrated by lifting hamburger #StrongLeader #Tremendous",
      "🏋️ Sources: Doctor says could live to 200 #HealthyOrange #Records",
      "⚡ Energy levels 'unprecedented' says staff #HighEnergy #Unstoppable",
      "🤸 Seen doing 'advanced stretches' before rally #Fitness #Athletic",
    ];
  },
  loyalty: (l) => {
    if (l < 30) return [
      "🍋 ALERT: #LemonFiles trending on social media #Breaking #Scandal",
      "📂 Anonymous source threatens to release 'the documents' #Leaks #Whistleblower",
      "🔍 Former associate 'considering options' @LawyersAtLaw #LegalTrouble",
      "⚠️ Inner circle showing signs of nervousness #Loyalty #Crisis",
      "📱 Encrypted messages being sent by staff to journalists #Leaks #Trouble",
      "🗣️ 'Anonymous insider' book deal announced #Betrayal #TellAll",
      "📰 Three aides resign in one day. 'Unrelated' says @PressOffice #Exodus",
    ];
    if (l < 60) return [
      "🤝 Key ally seen having lunch with opposition #Betrayal #Politics",
      "📞 'Loyalty test' calls made to all department heads #TrustIssues",
      "👀 Staff caught looking at job listings during meeting #Loyalty #Awkward",
      "📝 New 'enhanced' NDA drafted by legal team #TrustIssues #Paranoia",
    ];
    return [
      "🎖️ Loyalty levels at 'tremendous' according to internal poll #StrongTeam",
      "🤐 All associates have signed new NDAs #Loyalty #Secure",
      "💯 Inner circle pledges 'absolute devotion' to The Orange #Loyalty #United",
      "🛡️ Staff willing to 'take a bullet' for boss (metaphorically) #Devoted #TeamOrange",
    ];
  },
  money: (m) => {
    if (m < 0) return [
      "💸 Accountants 'concerned' about cash flow per @FinancialTimes #Debt #Money",
      "🏦 Banks reportedly 'asking questions' #FinancialNews #Loans",
      "💳 Credit card declined at gift shop (sources say) #Awkward #Broke",
      "📉 Creditors 'getting impatient' reports @WallStreetJuice #Debt #Crisis",
      "🚨 Debt collectors spotted near residence @FinancialTimes #Money #Trouble",
      "💰 Emergency fundraiser scheduled. Again. #Desperate #CashFlow",
    ];
    if (m < 500) return [
      "📉 Financial advisor recommends 'fiscal responsibility' (ignored) #Money #Advice",
      "💰 Fundraising dinner scheduled at own resort #MoneyMaking #SmartBusiness",
      "🎰 'Creative accounting' praised by some, investigated by others #Finances",
      "💵 Budget described as 'optimistic' by economists #Money #Spending",
    ];
    return [
      "🤑 @TheOrangeOfficial announces he is 'very rich' #Wealthy #Billionaire",
      "💎 New gold-plated item added to residence #Luxury #GoldEverything",
      "📈 Treasury reports 'record surplus' (sources unclear) #Money #Winning",
      "🏆 Financial magazines call fiscal policy 'genius' #Success #Wealthy",
      "💰 Donation requests declined. 'Don't need your money' #Rich #Independent",
    ];
  },
  support: (s) => {
    if (s < 30) return [
      "📉 Approval rating at 'historic' low per @PollsterNews #Polls #Unpopular",
      "🗣️ Focus group describes as 'concerning' #PublicOpinion #Yikes",
      "📺 Cable news coverage 87% negative (13% is ads) #Media #FakeNews",
      "😬 Rally attendance down. Blamed on 'bad weather' (sunny day) #Support #Awkward",
      "🎪 Supporters outnumbered by protesters at event #Polls #Unpopular",
      "📊 Even family members 'reconsidering' support (anonymous) #Crisis",
    ];
    if (s < 60) return [
      "📊 Polls show @TheOrangeOfficial tied with 'generic fruit' #Polls #Average",
      "🎤 Rally attendance 'respectable' says campaign #Support #Rally",
      "🤷 Public opinion described as 'mixed' by analysts #Polls #Neutral",
      "📈 Support stable, neither rising nor falling #PublicOpinion #Status",
    ];
    return [
      "📈 Claims highest ratings in history #Polls #Winning #1",
      "🎉 Supporters describe as 'their guy' @SupportersUnited #Loyal #MFGA",
      "🎊 Rallies packed to capacity! 'Never seen crowds like this!' #Support #YUGE",
      "🏆 Approval ratings 'through the roof' per @FriendlyPollster #Winning",
      "👥 Massive online following celebrates latest move #Support #Popular",
    ];
  },
  luck: (l) => {
    if (l < 30) return [
      "🍀 Horoscope warns of 'challenging times ahead' #Luck #Astrology",
      "🎲 Casino bans @TheOrangeOfficial after 'suspicious losses' #BadLuck #Cursed",
      "🌂 Walks under ladder, breaks mirror, black cat crosses path. All in one day. #Unlucky",
      "⚡ Lightning strikes golf cart. Fourth time this month. #BadLuck #Concerning",
      "🔮 Fortune teller refuses to do reading. 'Bad vibes' cited #Luck #Ominous",
    ];
    if (l < 60) return [
      "🎰 Luck described as 'average' by gambling experts #Luck #Casino",
      "🎲 Win some, lose some, says @TheOrangeOfficial #Luck #Balance",
      "🍀 Lucky rabbit's foot ordered from online store #Luck #Superstition",
    ];
    return [
      "🍀 Everything's coming up oranges! #Lucky #Blessed #Winning",
      "🎰 Wins big at casino. Again. 'Just lucky' says management #Luck #Jackpot",
      "✨ Horseshoe found. Stock market immediately rises. Coincidence? #Lucky",
      "🎲 'Luckiest person alive' declares @FortuneMagazine #Blessed #Lucky",
    ];
  },
};

// Hint messages about available plans
// Crisis messages (when multiple stats are low)
const CRISIS_MESSAGES = [
  "🚨 CRISIS MODE: Staff seen panic-buying aspirin @BreakingNews #Emergency",
  "⚠️ Anonymous source: 'It's all falling apart' #Crisis #Scandal",
  "📰 'Worst week ever' headlines appearing everywhere #Crisis #Disaster",
  "🔥 Fire drill becomes actual fire. Metaphorically speaking. #Crisis",
  "🌪️ Perfect storm of bad decisions hitting hard #Crisis #Consequences",
  "😰 Advisors reportedly 'stress-eating' in closets #Crisis #Panic",
  "📉 All metrics trending wrong direction #Crisis #Help",
  "🆘 Emergency meeting called. Then canceled. Then called again. #Chaos",
];

// Winning messages (when multiple stats are high)
const WINNING_MESSAGES = [
  "🎉 WINNING STREAK CONTINUES! Can't stop! Won't stop! #Winning #Tremendous",
  "🏆 Everything going according to plan! #Success #MFGA",
  "✨ Golden age of Orange administration! #Prosperity #Winning",
  "🎊 Best month ever! Numbers through the roof! #Success #Records",
  "🌟 Perfection achieved! Well, almost. #Excellence #Winning",
  "💯 All systems go! Full steam ahead! #Success #Momentum",
  "🚀 Breaking records left and right! #Winning #Unstoppable",
  "👑 Reign of prosperity continues! #Success #GoldenAge",
];

// Time-based messages
const TIME_MESSAGES = [
  "⏰ One month down, tremendous months ahead! #Time #Progress",
  "📅 Making great use of time! Bigly productive! #TimeManagement",
  "⏳ Time flies when you're winning! #Fast #Winning",
  "🕐 Another month, another tremendous achievement! #Progress",
  "📆 History being made in real-time! #Legacy #History",
  "⏰ Tick tock goes the #LemonFiles clock... #Time #Suspense",
  "📅 Campaign promises: Check! Check! Check! #Progress #Promises",
];

function generateHint(plan: PlanCard): string {
  const hints = [
    `💡 Insiders whisper about potential ${plan.emoji} ${plan.name.toLowerCase()} strategy... #Leaked`,
    `🔮 Crystal ball suggests ${plan.emoji} might be important today #Prediction`,
    `📝 Someone left notes about '${plan.name}' on a desk per @InsiderNews #Leak`,
    `🤫 A little bird says ${plan.emoji} could be the play... @AnonymousSource`,
    `💭 Rumor: The ${plan.name} option looking interesting #Strategy #Hint`,
  ];
  return hints[Math.floor(Math.random() * hints.length)];
}

// Rumor messages (mix of true and false)
const RUMORS = [
  "🕵️ Rumor: #LemonFiles contain recipe for world's best lemonade #Conspiracy",
  "🗣️ Unconfirmed: @TheOrangeOfficial once lost to a grapefruit at chess #Embarrassing",
  "📰 Tabloid claims secret twin exists (also orange) #TwinGate @TabloidNews",
  "🎭 Gossip: Practices speeches in front of mirror for hours #Vanity",
  "🌶️ Hot take: The #MandarinBusiness was actually about mandarins #PlotTwist",
  "🎪 Rumor mill: @TheOrangeOfficial considering reality TV comeback #ShowBiz",
  "🔮 Prediction: Something tremendous will happen (very vague) #Prophecy",
  "🎲 Vegas odds: 50/50 something goes wrong today @VegasInsider #Betting",
  "🤫 Insider says briefings not actually read #Scandal @LeakySource",
  "💇 Rumor: Hair takes 2 hours daily. Worth it, says source #HairCare",
  "🎬 Anonymous: 'Just watches himself on TV all day' #MediaConsumption",
  "📱 Staff allegedly hides phone after 10pm. Finds it anyway. #PhoneAddiction",
  "🍔 Kitchen staff: Only eats food if it's 'well done' @ChefComplains #FoodCritic",
  "🛏️ Multiple sources: Calls friendly dictators before bed #DictatorDialing",
  "📋 Leaked schedule shows 'Executive Time' is 60% of day #Productivity #LOL",
  "🎯 Rumor: Asks aides 'Was that good?' after every speech #Insecure",
  "🗑️ Janitor finds torn up documents in bin @JanitorWhistleblower #Shredding",
  "🖊️ Sources say uses sharpie for everything, even checks #SharpieGate",
  "📺 Staff: Yells at TV during bad coverage #MediaObsessed @InsiderSource",
  "🎪 Former aide: 'He genuinely believes his crowd sizes' #Delusion",
  "🍊 Kitchen ordered to make steak well-done with ketchup. Chefs weep. #Culinary Crime",
  "🛋️ Rumor: Oval Office has extra TVs behind paintings #TVAddiction",
  "📞 Reportedly calls cable hosts for policy advice @MediaMatters #Unprofessional",
  "🎤 Teleprompter operator: 'Goes off-script within 30 seconds' #ADHD",
  "🏌️ Caddy claims ball moved when nobody's looking #CheatGate @GolfInsider",
  "📰 Former press sec: 'We just made stuff up' @FormerStaffer #Confession",
  "🎭 Acting coach allegedly hired for 'sincere face' #ActingLessons",
  "💊 Doctor's note reportedly written by himself @MedicalFraud #Suspicious",
  "🎪 Rumor: Considering own news network. 'Fair and Orangey' #MediaEmpire",
  "🍕 Puts ketchup on pizza. Italy recalls ambassador. #PizzaCrime @ItalyNews",
  "📊 Insiders: Checks approval ratings hourly #ObsessedWithPolls",
  "🎤 Rumor: Practices tough faces in bathroom mirror #Vanity #ToughGuy",
  "🗂️ Aide: 'We put his name in every paragraph so he reads it' #Tricks",
  "📱 Rumor: Has separate phone for 3am tweets @TwitterAddiction #Insomnia",
  "🎨 Former staffer: 'Insisted on bigger desk' for power #CompensatingForSomething",
];

export function generateJuiceMessage(
  availablePlans: PlanCard[],
  stats: GameStats,
  turn: number
): Omit<JuiceMessage, 'id' | 'turn'> {
  const rand = Math.random();

  // Check for crisis (2+ stats below 40)
  const lowStats = Object.values(stats).filter(v => v < 40).length;
  if (lowStats >= 2 && rand < 0.15) {
    return {
      text: CRISIS_MESSAGES[Math.floor(Math.random() * CRISIS_MESSAGES.length)],
      type: 'news'
    };
  }

  // Check for winning (3+ stats above 70)
  const highStats = Object.values(stats).filter(v => v > 70).length;
  if (highStats >= 3 && rand < 0.15) {
    return {
      text: WINNING_MESSAGES[Math.floor(Math.random() * WINNING_MESSAGES.length)],
      type: 'news'
    };
  }

  // 5% chance of time-based message
  if (rand < 0.05) {
    return {
      text: TIME_MESSAGES[Math.floor(Math.random() * TIME_MESSAGES.length)],
      type: 'news'
    };
  }

  // 25% chance of plan hint (but subtle)
  if (rand < 0.3 && availablePlans.length > 0) {
    const plan = availablePlans[Math.floor(Math.random() * availablePlans.length)];
    return {
      text: generateHint(plan),
      type: 'hint',
      relatedPlanId: plan.id
    };
  }

  // 30% chance of stat-related message
  if (rand < 0.6) {
    const statKeys = Object.keys(STAT_MESSAGES);
    const statKey = statKeys[Math.floor(Math.random() * statKeys.length)] as keyof GameStats;
    const messages = STAT_MESSAGES[statKey](stats[statKey]);
    return {
      text: messages[Math.floor(Math.random() * messages.length)],
      type: 'news'
    };
  }

  // 20% chance of rumor
  if (rand < 0.8) {
    return {
      text: RUMORS[Math.floor(Math.random() * RUMORS.length)],
      type: 'rumor'
    };
  }

  // 20% chance of pure nonsense
  return {
    text: NONSENSE_MESSAGES[Math.floor(Math.random() * NONSENSE_MESSAGES.length)],
    type: 'nonsense'
  };
}

// Special event messages for specific situations
export const SPECIAL_JUICE = {
  gameStart: [
    "🍊 THE ORANGE HAS ARRIVED! Let the tremendous term begin! #Inauguration #MFGA",
    "📢 Inauguration complete! Time to make fruit great again! #OrangeAdmin #NewEra",
  ],
  lowHealth: [
    "🚨 MEDICAL ALERT: Looking a bit... pale orange @HealthExperts #Concerned",
    "⚠️ Staff preparing 'contingency plans' (unrelated, surely) #HealthWatch",
  ],
  lowLoyalty: [
    "🍋 THE #LemonFiles ARE TRENDING! Someone is talking! @Whistleblower #BREAKING",
    "📂 Anonymous tips flooding in about 'The #MandarinBusiness' #Scandal #Leaks",
  ],
  secondTerm: [
    "🎉 FOUR MORE YEARS! The Orange persists! #SecondTerm #Victory #MFGA",
    "👑 History made! Second term begins! @HistoricalNews #Historic #Unprecedented",
  ],
  highDebt: [
    "💸 Accountants seen crying in parking lot per @FinanceNews #Debt #Crisis",
    "🏦 'Creative financing' reaches new heights #Accounting #Questionable",
  ],
};

// Export critical messages for use in game store
export { CRITICAL_MESSAGES };
