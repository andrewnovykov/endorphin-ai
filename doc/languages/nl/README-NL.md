<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## E2E Testing opnieuw uitgevonden met AI
</div>

Schrijf tests in eenvoudig Nederlands. Laat AI ze automatisch genereren,
valideren en repareren.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

Een krachtig, modulair browserautomatiseringsframework dat AI-aangedreven
testing gebruikt met LangChain, OpenAI GPT-4o en Playwright. Biedt intelligente
browserautomatisering met automatische elementdetectie, visuele validatie en
uitgebreid testbeheer.

## 🎬 Demo bekijken

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_DEMO_BEKIJKEN-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Demo bekijken" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Zie Endorphin AI in actie - Volledige handleiding</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ Bekijk hoe AI je tests schrijft en uitvoert<br />
    🔍 Ontdek intelligente elementdetectie in real-time<br />
    📊 Verken prachtige HTML-rapporten met screenshots<br />
    ⚡ Van setup tot testuitvoering in 10 minuten
  </p>
</div>

---

## 🚀 Snel starten

### 📦 Installatie & Setup

Start binnen 30 seconden:

```bash
# ⚡ Snelle setup (aanbevolen)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**Of handmatige setup:**

```bash
# 1. Maak je project aan
mkdir my-ai-tests && cd my-ai-tests

# 2. Installeer Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. Initialiseer met alles wat je nodig hebt
npx endorphin-ai init
```

### 🔑 Voeg je OpenAI API-sleutel toe

```bash
# Bewerk het aangemaakte .env bestand
echo "OPENAI_API_KEY=jouw-openai-api-sleutel-hier" > .env
```

### ▶️ Voer je eerste test uit

```bash
# Voer de voorbeeld gezondheidscheck test uit
npx endorphin-ai run test HEALTH-001

# Genereer een prachtig HTML rapport
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 Kernfuncties

### 🤖 AI-aangedreven Testing

- **Schrijf tests in eenvoudig Nederlands** - Geen complexe selectors nodig
- **Intelligente elementdetectie** - AI vindt automatisch knoppen, formulieren
  en inhoud
- **Zelfherstellende tests** - Past zich aan UI-wijzigingen aan zonder te breken
- **Slim foutherstel** - Probeert mislukte acties automatisch opnieuw met
  verschillende strategieën

### 📊 Prachtige Rapporten

- **Interactieve HTML-rapporten** met screenshots en stap-voor-stap uitvoering
- **Kosten- en tokentracking** - Monitor AI-gebruik en optimaliseer uitgaven
- **AI-beslissingsgeschiedenis** - Zie precies hoe AI tests analyseert en
  uitvoert
- **Real-time filtering en zoeken** om snel problemen te vinden

### 🛠️ Ontwikkelaarservaring

- **Nul configuratie** - Werkt meteen
- **TypeScript ondersteuning** met volledige typedefinities
- **Slimme teststructuur** - Dynamische setup, datageneratie en taakfuncties
- **Ingebouwd toolsysteem** - 12 uitgebreide automatiseringstools inbegrepen

## 🔧 Slimme Teststructuur

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Gebruiker Inlog Test',
  description: 'Test inloggen met gegenereerde inloggegevens',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // Testdata dynamisch genereren
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // Testomgeving instellen
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // Hoofdtest instructies met gegenereerde data
  task: async (data, setupData) => {
    return `
      Navigeer naar ${setupData.baseUrl}/login
      Vul emailveld in met "${data.email}"
      Vul wachtwoordveld in met "${data.password}"
      Klik op Submit knop
      Verifieer dat welkomstbericht "${data.firstName}" bevat
    `;
  },
};
```

## 📝 Testbestand Formaat

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'Basis Inlog Test',
  description: 'Test inlogfunctionaliteit met geldige inloggegevens',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `Je testinstructies in eenvoudig Nederlands...`,
};
```

## 🏆 Waarom Endorphin AI kiezen?

| Traditionele Testing         | Endorphin AI                                  |
| ---------------------------- | --------------------------------------------- |
| ❌ Breekbare CSS selectors   | ✅ AI vindt elementen intelligent             |
| ❌ Breekt bij UI wijzigingen | ✅ Zelfherstellende tests                     |
| ❌ Complexe setup            | ✅ Nul configuratie                           |
| ❌ Moeilijk te onderhouden   | ✅ Testbeschrijvingen in eenvoudig Nederlands |

## 🎮 Volledige CLI Referentie

```bash
# Specifieke test uitvoeren
npx endorphin-ai run test TEST-001

# Alle tests uitvoeren
npx endorphin-ai run test all

# Tests uitvoeren op tag
npx endorphin-ai run test --tag smoke

# HTML rapport genereren
npx endorphin-ai generate report

# Rapport openen
npx endorphin-ai open report
```

## 🔄 Bijgewerkt blijven

```bash
# Huidige versie controleren
npx endorphin-ai --version

# Bijwerken naar nieuwste versie
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ Blij testen!</strong></p>
</div>
