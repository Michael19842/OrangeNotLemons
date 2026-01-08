# 🍊 Orange Not Lemons - Game Design Document

## Concept
Een satirische simulatiegame waarin je "The Orange" speelt - een oud, gierig fruit dat betrokken is geweest bij duistere "Mandarin Business" (beschreven in de geheime Lemon Files). Je doel is om te voorkomen dat deze files uitkomen door afleidingsmanoeuvres, terwijl je je stats managed.

## Core Loop

```
┌─────────────────────────────────────────────────────┐
│  BEURT START (Maand X van 48)                       │
├─────────────────────────────────────────────────────┤
│  1. Delayed effects van eerdere plannen triggeren   │
│  2. Rente op schulden betalen                       │
│  3. "The Juice" toont nieuws, hints & onzin         │
├─────────────────────────────────────────────────────┤
│  4. Ontvang plan-kaarten (aantal = health tier)     │
│     - Tier 4 (76-100% HP): 4 kaarten                │
│     - Tier 3 (51-75% HP): 3 kaarten                 │
│     - Tier 2 (26-50% HP): 2 kaarten                 │
│     - Tier 1 (0-25% HP): 1 kaart                    │
│                                                     │
│  5. 30 SECONDEN TIMER START                         │
│     └─ Onderzoek kaarten:                           │
│        • Geld uitgeven (uitbesteden) - $50          │
│        • Gezondheid gebruiken (zelf doen) - 5 HP    │
│        • Bij lagere HP duurt onderzoek langer       │
│     └─ Ontgrendel verborgen eigenschappen           │
│                                                     │
│  6. KEUZE: Plan selecteren OF Skip (beurt over)     │
├─────────────────────────────────────────────────────┤
│  7. FRUITMACHINE (als plan gekozen)                 │
│     └─ 3x draaien                                   │
│     └─ Totaal van 3 draaien = eindscore             │
│     └─ Score bepaalt welke uitkomst-tier            │
│                                                     │
│  Symbolen:                                          │
│     🍊 Orange (+10)    🍋 Lemon (+5)                │
│     🥭 Mango (+8)      🍑 Peach (+7)                │
│     💰 Money (+15)     ⛈️ Storm (-5)                │
│     📜 Lemon Files (-10)                            │
│                                                     │
│  Jackpot: 3x zelfde = score x3                      │
│                                                     │
│  8. Uitkomst + delayed effect ingepland             │
├─────────────────────────────────────────────────────┤
│  9. Stats update                                    │
│  10. Game Over check                                │
│      └─ ❤️ = 0 → Dood                               │
│      └─ 👥 = 0 → Lemon Files lekken                 │
│      └─ Beurt 48 + 👥 > 85% → Tweede termijn!       │
│      └─ Beurt 96 + 👥 > 85% → VICTORY!              │
└─────────────────────────────────────────────────────┘
```

## Stats

| Stat | Bereik | Beschrijving | Bij 0 |
|------|--------|--------------|-------|
| ❤️ Health | 0-100 | Geestelijke/fysieke gezondheid | GAME OVER (dood) |
| 💰 Money | -∞ tot +∞ | Geld (kan negatief = schuld) | Moet lenen |
| 👥 Loyalty | 0-100 | Loyaliteit van inner circle | GAME OVER (files lekken) |
| 📊 Support | 0-100 | Publieke steun | Moeilijker winnen |
| 🍀 Luck | 0-100 | Beïnvloedt fruitmachine | Slechtere spins |

### Schulden Systeem
- Negatief geld = schuld
- Rente begint op 5%
- Elke keer meer lenen = +2% rente (max 25%)
- Rente wordt elke beurt berekend

### Gezondheid Tiers
| Tier | HP Range | Max Kaarten | Onderzoek Snelheid |
|------|----------|-------------|-------------------|
| 4 | 76-100 | 4 | 1.0x (normaal) |
| 3 | 51-75 | 3 | 1.5x (langzamer) |
| 2 | 26-50 | 2 | 2.0x (veel langzamer) |
| 1 | 0-25 | 1 | 3.0x (extreem traag) |

## Plan Kaarten

Elke kaart heeft:
- **Naam & Emoji**: Visuele identificatie
- **Categorie**: economy, politics, media, foreign, personal
- **Basiskosten**: Hoeveel het plan kost om uit te voeren
- **Verborgen eigenschappen** (te ontgrendelen):
  - Risk: Wat kan er misgaan
  - Reward: Wat kan er goed gaan
  - Timing: Wanneer effecten optreden
  - Secret: Verborgen twist

### Uitkomsten per Plan
Elk plan heeft 3 uitkomst-tiers gebaseerd op fruitmachine score:
- **Goed** (hoge score): Positieve effecten + milde delayed penalty
- **Gemiddeld** (medium score): Gemengde effecten
- **Slecht** (lage score): Negatieve effecten + zware delayed penalty

### Delayed Effects
- Elke uitkomst kan een "delayed effect" hebben
- Triggert X beurten later
- Zorgt voor onverwachte consequenties
- Voorbeeld: Tarieven winnen nu, maar veroorzaken prijsstijgingen over 4 maanden

## The Juice 📱

Twitter-achtige feed die altijd zichtbaar is:
- **News**: Relevante updates over stats en gebeurtenissen
- **Hints**: Subtiele tips over welke kaart goed zou zijn
- **Rumors**: Mix van waar en onzin
- **Nonsense**: Pure satirische onzin

De speler moet leren filteren wat nuttig is!

## Win/Lose Condities

### Game Over
- ❤️ Health = 0: "The Orange has expired"
- 👥 Loyalty = 0: "The Lemon Files have leaked!"

### Termijn Einde (beurt 48)
- Loyalty < 85%: Termijn eindigt, score genoteerd
- Loyalty ≥ 85%: **TWEEDE TERMIJN** begint!

### Tweede Termijn
- Stats worden gedeeltelijk hersteld (+20 HP, -20 loyalty)
- Nog 48 beurten (totaal 96)
- Extreem moeilijk
- Bij loyalty ≥ 85% na beurt 96: **VICTORY** (score x2)

## Scoring

- Punten = totaal van alle succesvolle fruitmachine scores
- Negatieve scores tellen ook
- Victory bonus: score x2
- High score wordt lokaal opgeslagen
- Score kan gedeeld worden op social media

## MVP Plan Categorieën

### Economy 📦
- Tremendous Tariffs
- OrangeCoin Launch
- Tax Cuts for Fruits

### Politics 🏛️
- Tremendous Rally
- Loyal Police Chief
- Election Integrity Claims

### Foreign 🌍
- Buy Greenland
- Beautiful Letter (dictator diplomacy)

### Media 📺
- Attack Fake News
- Truth Social Rant

### Personal 🍔
- Executive Golf
- Grand Ballroom Event
- Hamberder Diplomacy

## Tech Stack

- **Framework**: Vue 3 + Ionic
- **State Management**: Pinia
- **Platform**: Android (via Capacitor)
- **Art Style**: 2D Cartoon met emoji's
- **Storage**: LocalStorage voor high scores
- **Online**: Geen - alleen lokaal spelen
- **Share**: Score delen via native share API

## UI Componenten

1. **GameHeader**: Stats, timer, beurt info
2. **TheJuice**: Scrollende nieuws feed
3. **PlanCard**: Interactieve kaart met reveal mechanic
4. **SlotMachine**: Geanimeerde fruitmachine
5. **ResultModal**: Uitkomst van plan
6. **GameOverScreen**: Eindscherm met score & share

## Satirische Toon

Het spel moet:
- Humoristisch zijn, niet haatdragend
- Herkenbare situaties overdrijven
- De absurditeit van de echte wereld benadrukken
- Een glimlach op gezichten brengen
- Toegankelijk zijn voor iedereen

---

*"Making Fruit Great Again, one terrible decision at a time"* 🍊
