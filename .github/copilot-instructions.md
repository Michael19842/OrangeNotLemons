# GitHub Copilot Instructions - Orange Not Lemons

## Project Overview
This is "Orange Not Lemons" - a satirical simulation game built with Vue 3 + Ionic for Android. The player controls "The Orange", an old, greedy fruit trying to prevent the leak of the "Lemon Files" through distraction maneuvers while managing their stats.

## Core Game Mechanics

### Game Loop (48 turns = 1 term)
1. Delayed effects from previous plans trigger
2. Interest on debt is paid
3. "The Juice" shows news, hints & nonsense
4. Receive plan cards (amount depends on health tier)
5. 30-second timer starts - investigate cards by spending money or health
6. Choose a plan OR skip turn
7. Slot machine spins (3 times, total score determines outcome tier)
8. Outcome + delayed effect scheduled
9. Stats update
10. Game over check

### Stats System
- **❤️ Health** (0-100): Mental/physical health. At 0 = GAME OVER (death)
- **💰 Money** (-∞ to +∞): Can go negative = debt. Negative triggers interest system
- **👥 Loyalty** (0-100): Inner circle loyalty. At 0 = GAME OVER (files leak)
- **📊 Support** (0-100): Public support. Low makes winning harder
- **🍀 Luck** (0-100): Affects slot machine outcomes

### Health Tiers
- Tier 4 (76-100 HP): 4 cards, normal investigation speed
- Tier 3 (51-75 HP): 3 cards, 1.5x slower investigation
- Tier 2 (26-50 HP): 2 cards, 2.0x slower investigation
- Tier 1 (0-25 HP): 1 card, 3.0x extremely slow investigation

### Debt System
- Negative money = debt with interest
- Starting interest: 5%
- Each time borrowing: +2% interest (max 25%)
- Interest calculated every turn

## Plan Cards

Each card has:
- **Name & Emoji**: Visual identification
- **Category**: economy, politics, media, foreign, personal
- **Base Cost**: Money to execute the plan
- **Hidden Properties** (unlockable by investigation):
  - Risk: What can go wrong
  - Reward: What can go right
  - Timing: When effects occur
  - Secret: Hidden twist

### Outcome Tiers
Each plan has 3 outcomes based on slot machine score:
- **Good** (high score): Positive effects + mild delayed penalty
- **Average** (medium score): Mixed effects
- **Bad** (low score): Negative effects + heavy delayed penalty

### Delayed Effects
- Effects that trigger X turns later
- Create unexpected consequences
- Example: Tariffs win now but cause price increases in 4 months

## The Juice 📱
Twitter-like feed always visible:
- **News**: Relevant stats and event updates
- **Hints**: Subtle tips about good cards
- **Rumors**: Mix of truth and nonsense
- **Nonsense**: Pure satirical content

## Slot Machine Symbols
- 🍊 Orange (+10)
- 🍋 Lemon (+5)
- 🥭 Mango (+8)
- 🍑 Peach (+7)
- 💰 Money (+15)
- ⛈️ Storm (-5)
- 📜 Lemon Files (-10)
- **Jackpot**: 3x same symbol = score x3

## Win/Lose Conditions
- **Game Over**: Health = 0 OR Loyalty = 0
- **First Term End** (turn 48): Loyalty ≥ 85% = second term, else game ends
- **Second Term** (turn 96): Loyalty ≥ 85% = VICTORY with score x2

## Tech Stack & Architecture

### Core Technologies
- **Framework**: Vue 3 with Composition API
- **UI Framework**: Ionic Framework
- **State Management**: Pinia stores
- **Platform**: Android via Capacitor
- **Build Tool**: Vite
- **Language**: TypeScript

### Project Structure
```
src/
├── components/
│   ├── game/          # Game-specific components
│   │   ├── GameHeader.vue     # Stats, timer, turn info
│   │   ├── TheJuice.vue       # News feed
│   │   ├── PlanCard.vue       # Interactive card with reveal
│   │   ├── SlotMachine.vue    # Animated slot machine
│   │   ├── GameOverModal.vue  # End screen
│   │   └── StatsBar.vue       # Stats display
│   └── ui/            # Reusable UI components
├── data/
│   ├── plans.ts       # Plan card definitions
│   └── juice.ts       # News feed content
├── stores/
│   └── gameStore.ts   # Game state management
├── types/
│   └── game.ts        # TypeScript interfaces
└── views/
    ├── HomePage.vue   # Start screen
    └── GamePage.vue   # Main game view
```

### State Management
Use Pinia store (`gameStore.ts`) for:
- Current turn number (0-96)
- All stats (health, money, loyalty, support, luck)
- Active cards and their investigation status
- Delayed effects queue
- Debt and interest rate
- Game status (playing, paused, game over, victory)

## Coding Guidelines

### TypeScript
- Use strict typing for all game data
- Define interfaces in `types/game.ts`
- Example interfaces needed:
  - `GameStats`: All player stats
  - `PlanCard`: Card data structure
  - `DelayedEffect`: Scheduled future events
  - `SlotResult`: Slot machine spin result
  - `JuiceItem`: News feed item

### Vue Components
- Use Composition API with `<script setup>`
- Prefer composables for reusable logic
- Keep components focused and single-responsibility
- Use TypeScript props with proper typing

### Ionic Components
- Use Ionic UI components for mobile-first design
- Follow Ionic's design patterns
- Use ion-header, ion-content, ion-footer structure
- Implement ion-modal for game over and results

### Game Logic
- Separate game rules from UI logic
- Use computed properties for derived values (health tier, card count)
- Implement turn-based logic with clear state transitions
- Timer logic should be reactive and pausable

### Styling
- Use CSS custom properties from `theme/variables.css`
- Follow Ionic's theming system
- Ensure responsive design for various Android screen sizes
- Use emojis for visual flavor (🍊💰❤️👥📊🍀)

### Data Storage
- Use LocalStorage for high scores
- No backend - fully offline game
- Consider serializing game state for save/load feature

## Satirical Tone Guidelines

The game should be:
- **Humorous, not hateful**: Light-hearted satire
- **Exaggerated**: Overdramatize real situations
- **Absurd**: Highlight absurdity of real-world events
- **Accessible**: Everyone can enjoy regardless of background
- **Clever**: Smart references without being mean-spirited

Example card names:
- "Tremendous Tariffs"
- "OrangeCoin Launch"
- "Hamberder Diplomacy"
- "Buy Greenland"
- "Beautiful Letter" (dictator diplomacy)

## Testing

### E2E Tests (Cypress)
- Test complete game flow from start to game over
- Verify stat calculations
- Test delayed effects triggering correctly
- Validate win/lose conditions

### Unit Tests
- Test game store actions and getters
- Verify debt/interest calculations
- Test health tier calculations
- Validate slot machine scoring logic

## Development Priorities

1. **Core Game Loop**: Turn-based mechanics with timer
2. **Stats System**: Reactive stat tracking with proper calculations
3. **Plan Cards**: Interactive cards with reveal mechanics
4. **Slot Machine**: Animated spinning with jackpot detection
5. **The Juice**: Dynamic news feed generation
6. **Delayed Effects**: Queue system for future events
7. **Game Over**: Win/lose detection and scoring

## Common Patterns

### Reactive Stats
```typescript
const gameStore = useGameStore()
const healthTier = computed(() => {
  if (gameStore.health >= 76) return 4
  if (gameStore.health >= 51) return 3
  if (gameStore.health >= 26) return 2
  return 1
})
```

### Debt Interest
```typescript
if (gameStore.money < 0) {
  const interest = Math.abs(gameStore.money) * (gameStore.interestRate / 100)
  gameStore.money -= interest
}
```

### Delayed Effects
```typescript
interface DelayedEffect {
  turnToTrigger: number
  effect: () => void
  description: string
}
```

## Key Features to Implement

- [ ] Turn-based system (48/96 turns)
- [ ] 30-second timer per turn
- [ ] Card investigation mechanic (spend money or health)
- [ ] Health-based card count (1-4 cards)
- [ ] Slot machine with 7 symbols
- [ ] Jackpot detection (3x same)
- [ ] Delayed effects queue
- [ ] Debt with compound interest
- [ ] The Juice news feed
- [ ] Game over detection
- [ ] Second term mechanic
- [ ] Local high score
- [ ] Native share API integration

---

*"Making Fruit Great Again, one terrible decision at a time"* 🍊