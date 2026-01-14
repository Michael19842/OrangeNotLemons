# Trading Feature - Market Manipulation & Short Selling

## Overzicht
De **Stock Trading** feature stelt spelers in staat om de markt te manipuleren door strategisch in te spelen op de effecten van hun plannen. Inclusief **short selling** (put options) om te profiteren van dalende markten!

## Concept: Markt Manipulatie
Het kernidee is dat **ieder plan een effect heeft op de markt** (coinValuation stat). De speler kan:
1. Een plan kiezen dat de markt zal beïnvloeden
2. **VOORDAT** het plan wordt uitgevoerd, posities openen:
   - **Long (Buy)**: Koop shares - profit als markt stijgt
   - **Short (Sell)**: Short shares - profit als markt daalt
3. Profiteren van de voorkennis over het effect

Dit is **insider trading / market manipulation** - perfect passend bij het satirische thema!

## Trading Mechanismen

### 1. Long Position (Buy)
- Traditioneel: koop shares, verkoop later duurder
- Positieve shares in portfolio
- Profit = (verkoopprijs - koopprijs) × shares
- **Risico**: Markt daalt → verlies

### 2. Short Position (Sell Short / Put)
- **Verkoop shares die je niet hebt!**
- Ontvang geld nu, maar moet later terugkopen
- Negatieve shares in portfolio
- Profit = (shortprijs - buybackprijs) × shares
- **Risico**: Markt stijgt → onbeperkt verlies!

### 3. Close Position
- Sluit je huidige positie (long of short)
- Long: verkoop alle shares
- Short: koop terug om te sluiten
- Profit/loss wordt gerealiseerd

## Implementatie

### Locatie
- **Component**: `src/components/game/TradingPanel.vue`
- **Store functionaliteit**: `src/stores/gameStore.ts` (`buyCoinTokens`, `sellCoinTokens`)
- **UI**: Geïntegreerd in de "📈 Cliff Street" tab in het hoofdspel (onderaan na de charts)

### Game Mechanics

#### Prijsberekening
- **Basis prijs**: 100B per 100 shares
- **Aangepast aan valuation**: Prijs × (coinValuation / 100)
  - Bij 120% valuation: 120B per 100 shares
  - Bij 80% valuation: 80B per 100 shares

#### Spread (Market Maker)
- **Koopprijs**: Basis prijs × valuation
- **Verkoopprijs**: 80% van koopprijs
- Verschil van 20% simuleert market spread / handelskosten

#### Margin Trading (Geleend Geld)
- ✅ **Kopen met debt is toegestaan!**
- Geen limiet op aankoop bedrag
- Rente wordt berekend op totale debt
- Risico: Als markt daalt, verlies + rente

### Plan Effects op Markt
Elk plan heeft een `coinValuation` effect in de outcomes:
```typescript
// Voorbeeld: Tariffs plan
immediateEffects: { 
  money: 500, 
  coinValuation: -15  // Markt daalt 15%
}
```

#### Strategie Voorbeelden:

**Scenario 1: Short Selling (Negatief effect)**
1. Zie plan met negatief market effect (bijv. "Tariffs" → -15% valuation)
2. **Open SHORT** @ 100% = ontvang 80B per 100 shares
3. Voer plan uit → markt daalt naar 85%
4. **Close SHORT** (buyback) @ 85% = betaal 85B per 100 shares  
5. **Profit: 80B - 85B = -5B... FOUT!**

Correcte strategie:
1. Short @ valuation 100% → ontvang 80B (80% van 100B)
2. Market daalt naar 85% 
3. Buyback @ 85% → betaal 85B
4. Loss: -5B (spread zorgt voor verlies bij kleine movements)

**Beter: Grotere swing**
1. Plan geeft -20% valuation
2. Short @ 100% → ontvang 80B per 100 shares
3. Market → 80%
4. Buyback @ 80% → betaal 64B
5. **Profit: +16B per 100 shares!**

**Scenario 2: Long Position (Positief effect)**  
1. Zie plan met positief market effect (+20% valuation)
2. **Open LONG** @ 100% = betaal 100B per 100 shares
3. Voer plan uit → markt stijgt naar 120%
4. **Close LONG** (sell) @ 120% = ontvang 96B (80% van 120B)
5. **Loss: -4B... spread effect!**

**Beter: Leverage Play**
1. Plan geeft +30% valuation
2. Long @ 100% → betaal 100B (on margin)
3. Market → 130%
4. Sell @ 130% → ontvang 104B  
5. **Profit: +4B per 100 shares**

**Scenario 3: Short Squeeze Risk**
1. Open short @ 100% → ontvang 80B
2. Unexpected event → market stijgt naar 150%!
3. Must buyback @ 150% → betaal 150B
4. **Loss: -70B per 100 shares + debt interest!**
5. **Unlimited downside risk!**

**Scenario 4: Perfect Manipulation**
1. Geen positie, market @ 100%
2. Plan A: +20% effect
3. **BUY** 5000 shares @ 100B = -500B (into debt)
4. Execute plan → market 120%
5. **SELL** 5000 shares @ 96B = +480B
6. **Loss: -20B... but wait!**
7. Next turn: Plan B with -25% effect
8. **SHORT** 10000 shares @ 96B (from 120%) = +768B
9. Execute → market drops to 95%
10. **BUYBACK** @ 95B = -950B
11. **Total: Started 0B, now at 298B!**

### Game Balance

#### Kopen van Shares
- **Effect**: Money -cost (kan negatief worden)
- **Bonus**: Geen loyalty change (business is business)
- **Juice message**: Margin trading melding als debt

#### Verkopen van Shares  
- **Effect**: Money +revenue
- **Penalty**: Geen loyalty change
- **Juice message**: Profit taking berichten

### UI Features

#### Hoofdscherm
- Market Index (coinValuation) met trend
- Portfolio holdings en waarde
- Buy/Sell buttons (altijd enabled)
- Info over margin trading en market manipulation

#### Modals
- Debt warning bij margin trading
- Berekening van nieuwe debt
- Geen restrictie op aankoop bedrag
- Real-time prijzen

### Risico's en Rewards
- **Risico**: Verkeerd voorspellen = verlies + debt interest
- **Reward**: Goed voorspellen = grote winst
- **Leverage Risk**: Margin trading vergroot winst EN verlies
- **Timing**: Plans hebben delayed effects - timing is cruciaal

## Technische Details

### State Management
```typescript
// gameStore.ts
const coinHoldings = ref(0);

function buyCoinTokens(amount: number, cost: number) {
  stats.value.money -= cost; // Can go negative!
  coinHoldings.value += amount;
  // Check for margin trading message
}
```

### Plan Integration
Plans moeten `coinValuation` effects hebben:
```typescript
immediateEffects: { coinValuation: +10 }  // Markt stijgt
delayedEffects: [{ 
  turnsDelay: 4, 
  effects: { coinValuation: -20 }  // Later crash
}]
```

## Strategie Tips voor Spelers

### Beginner: Safe Trading
- Alleen kopen met positief money
- Kleine posities
- Verkoop snel bij winst

### Advanced: Market Timing
- Analyseer plan effects
- Koop voor positieve plans
- Verkoop voor negatieve plans

### Expert: Leverage & Manipulation
- Trade on margin voor grote positions
- Anticipeer delayed effects
- Chain trades over meerdere turns
- Balance debt interest vs profit

## Toekomstige Uitbreidingen (Optioneel)

### Mogelijk Toevoegen
- [ ] Trade history met P&L tracking
- [ ] Achievement: "Wolf of Cliff Street"
- [ ] Achievement: "Perfect Timing" (buy low, sell high 5x)
- [ ] Market volatility events
- [ ] Options/derivatives trading
- [ ] Portfolio diversificatie (multiple stocks)

### Testing
De feature is gebouwd en getest:
- ✅ TypeScript compilatie
- ✅ Build succesvol  
- ✅ Margin trading enabled
- ✅ **Short selling enabled**
- ✅ **Negative holdings (short positions)**
- ✅ **Close position functionaliteit**
- ✅ No loyalty penalties
- ✅ Market manipulation messages

## UI & UX

### Portfolio Display
- **Long**: "+1000 (Long)" in groen
- **Short**: "-1000 (Short)" in rood
- **Flat**: "0 (No Position)"

### Trading Buttons
- 📈 **Long (Buy)**: "Profit when market rises"
- 📉 **Short (Sell)**: "Profit when market falls"  
- 💸 **Close Long**: Alleen zichtbaar bij long position
- 🔒 **Close Short**: Alleen zichtbaar bij short position

### Warnings
- ⚠️ "Unlimited risk if market rises!" (short modal)
- ⚠️ "Must buy back later to close position" (short modal)
- Market info: "Short selling & margin trading enabled"

## Gebruik in Spel
Spelers kunnen nu:
1. Cliff Street tab openen
2. Plans bekijken voor market effects
3. **ANTICIPEREN** op effecten:
   - Market gaat OMHOOG? → Open LONG
   - Market gaat OMLAAG? → Open SHORT
4. Posities openen (ook on margin!)
5. Plan uitvoeren → market beweegt
6. **Close position** om profit/loss te realiseren
7. Risk/reward balanceren met debt interest

## Advanced Strategieën

### The Double Dip
1. Short position voor dalend plan
2. Close short wanneer markt laag is
3. Immediately go long voor recovery
4. Close long op rebound

### The Hedge
1. Open long position
2. See unexpected negative plan coming
3. Open short to hedge downside
4. Net position = reduced risk

### The Squeeze
1. Identify heavily shorted position (many shorts open)
2. Execute positive plan → short squeeze!
3. Shorts must cover at high price
4. Market manipulation at its finest!

## Game Design Philosophy
Dit is **pure market manipulation met short selling**:
- Speler heeft voorkennis (insider trading)
- Kan long EN short gaan
- Unlimited upside (long) en downside risk (short)
- Perfect satirisch element! 📈📉💰
