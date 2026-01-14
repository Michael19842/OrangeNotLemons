# Tutorial Feature Documentation

## Overzicht

Er is nu een **optionele interactieve tutorial** toegevoegd aan Orange Not Lemons die nieuwe spelers helpt de basis van het spel te begrijpen.

## Features

### 1. Tutorial Prompt bij Eerste Start
- Wanneer een speler het spel voor het eerst start, krijgen ze een vriendelijke vraag: **"Eerste keer hier?"**
- Twee opties:
  - **"Ja, leg het uit!"** - Start de tutorial
  - **"Nee, ik spring erin!"** - Slaat tutorial over en start direct het spel
- De keuze wordt opgeslagen in localStorage, dus de vraag komt niet meer terug

### 2. Interactive Tutorial Modal (8 Stappen)

De tutorial bestaat uit 8 slides die de basis uitleggen:

#### Stap 1: Welkom 🍊
- Introductie tot het spel
- Uitleg over The Orange en de Lemon Files

#### Stap 2: De Stats 💯
- Uitleg over alle 4 hoofdstats:
  - ❤️ Health - op 0 = game over
  - 💰 Money - negatief = schulden met rente
  - 👥 Loyalty - op 0 = files lekken
  - 📊 Support - bepaalt hoe makkelijk je wint
- Inclusief visuele demo van de stats bar

#### Stap 3: Plannen Kiezen 🃏
- Hoe plan cards werken
- Research mechaniek (🎲 Info 50B)
- 30 seconden time limit
- Visuele demo van een plan card

#### Stap 4: The Juice Feed 📱
- Uitleg over de Twitter-achtige feed
- Kritieke posts met 🔴 badge
- Reactie opties (Delete, Ban, Ignore)
- Positieve posts en engagement

#### Stap 5: Ranten 📢
- Hoe je zelf posts maakt
- Success chance mechaniek
- Bot systeem en gratis bots elke 5 beurten

#### Stap 6: Golfen ⛳
- Skip turn functionaliteit
- Wanneer het nuttig is

#### Stap 7: Win & Lose Conditions 🏆
- Game over conditions
- Victory conditions
- Tweede termijn mechaniek

#### Stap 8: Klaar om te Spelen! 🚀
- Samenvatting van key points
- Motiverende afsluiting

### 3. Tutorial Herbekijken
- Spelers die de tutorial hebben voltooid zien een **"📚 Tutorial"** knop op het hoofdmenu
- Ze kunnen de tutorial altijd opnieuw bekijken

### 4. Tutorial Design
- **Nederlandse tekst** voor toegankelijkheid
- **Visuele voorbeelden** waar relevant (stats bar demo, plan card demo)
- **Progress dots** om voortgang te tonen
- **Navigatie knoppen**: Vorige / Volgende / Start Spel
- **Skip optie** altijd beschikbaar rechtsboven
- **Modern UI** met animaties en smooth transitions

## Implementatie Details

### Nieuwe Componenten
1. **TutorialModal.vue** (`src/components/game/TutorialModal.vue`)
   - Bevat alle tutorial stappen
   - Visuele demos met Vue render functions
   - Navigation logic
   - Emit events: `complete`, `skip`

### Aangepaste Componenten
1. **StartScreen.vue**
   - Toegevoegd: Tutorial prompt modal
   - Toegevoegd: Tutorial knop voor spelers die het al hebben gezien
   - Emit events: `start`, `tutorial`

2. **HomePage.vue**
   - Integreert TutorialModal
   - Handelt tutorial flow af

### Store Updates
**gameStore.ts** nieuwe state/actions:
- `tutorialCompleted` - boolean ref met localStorage persistence
- `setTutorialCompleted()` - markeer tutorial als voltooid

### LocalStorage Keys
- `orangeTutorialCompleted` - "true" als speler tutorial heeft voltooid

## User Flow

### Nieuwe Speler Flow
1. Open spel
2. Klik "🍊 Start Game"
3. Zie tutorial prompt: "Eerste keer hier?"
4. Optie A: Kies "Ja, leg het uit!"
   - Tutorial opent
   - Doorloop 8 stappen
   - Klik "🍊 Start Spel!" of skip
   - Ga naar intro
5. Optie B: Kies "Nee, ik spring erin!"
   - Tutorial geskipt
   - Direct naar intro

### Terugkerende Speler Flow
1. Open spel
2. Zie "📚 Tutorial" knop (optioneel)
3. Klik om tutorial opnieuw te bekijken
4. Of klik "🍊 Start Game" om direct te spelen

## Styling Highlights

- **Gradient backgrounds** met orange/dark theme
- **Pulse animations** op belangrijke elementen
- **Smooth slide transitions** (left/right)
- **Progress dots** met active/completed states
- **Responsive design** voor mobile/tablet
- **Dutch language** voor Nederlandse spelers

## Toekomstige Verbeteringen (Optioneel)

1. **In-game tooltips** - Context-sensitive help tijdens het spel
2. **Interactive demo** - Laat spelers een test plan kiezen tijdens tutorial
3. **Video tutorials** - Korte video clips voor complexe mechanismen
4. **Difficulty hints** - Suggest tutorial revisit na meerdere game overs
5. **Multi-language** - Engels/Nederlands toggle

## Testing Checklist

- [x] Tutorial prompt verschijnt bij eerste start
- [x] "Ja" optie opent tutorial correct
- [x] "Nee" optie skipt en markeert als completed
- [x] Alle 8 stappen laden correct
- [x] Navigatie werkt (previous/next)
- [x] Visuele demos renderen correct
- [x] Skip link werkt op elke stap
- [x] Tutorial knop verschijnt na completion
- [x] LocalStorage persistence werkt
- [x] Animaties zijn smooth
- [x] Build slaagt zonder errors

---

**Status**: ✅ Geïmplementeerd en getest
**Versie**: 1.0
**Laatste update**: 2026-01-09
