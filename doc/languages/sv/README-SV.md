<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## E2E-testning återuppfunnen med AI
</div>

Skriv tester på enkel svenska. Låt AI generera, validera och fixa dem
automatiskt.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

Ett kraftfullt, modulärt webbläsarautomatiseringsramverk som använder AI-drivna
tester med LangChain, OpenAI GPT-4o och Playwright. Tillhandahåller intelligent
webbläsarautomatisering med automatisk elementdetektering, visuell validering
och omfattande testhantering.

## 🎬 Se demon

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_SE_DEMO-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Se demo" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Se Endorphin AI i aktion - Fullständig guide</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ Se hur AI skriver och kör dina tester<br />
    🔍 Upptäck intelligent elementdetektering i realtid<br />
    📊 Utforska vackra HTML-rapporter med skärmdumpar<br />
    ⚡ Från installation till testkörning på 10 minuter
  </p>
</div>

---

## 🚀 Snabbstart

### 📦 Installation & Inställning

Kom igång på under 30 sekunder:

```bash
# ⚡ Snabb installation (rekommenderad)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**Eller manuell installation:**

```bash
# 1. Skapa ditt projekt
mkdir my-ai-tests && cd my-ai-tests

# 2. Installera Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. Initialisera med allt du behöver
npx endorphin-ai init
```

### 🔑 Lägg till din OpenAI API-nyckel

```bash
# Redigera .env-filen som skapades
echo "OPENAI_API_KEY=din-openai-api-nyckel-här" > .env
```

### ▶️ Kör ditt första test

```bash
# Kör exempel-hälsokontrolltest
npx endorphin-ai run test HEALTH-001

# Generera en vacker HTML-rapport
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 Huvudfunktioner

### 🤖 AI-drivna tester

- **Skriv tester på enkel svenska** - Inga komplexa selektorer behövs
- **Intelligent elementdetektering** - AI hittar automatiskt knappar, formulär
  och innehåll
- **Självläkande tester** - Anpassar sig till UI-ändringar utan att brytas
- **Smart felåterställning** - Försöker automatiskt misslyckade åtgärder med
  olika strategier

### 📊 Vackra rapporter

- **Interaktiva HTML-rapporter** med skärmdumpar och steg-för-steg-körning
- **Kostnads- och tokenspårning** - Övervaka AI-användning och optimera utgifter
- **AI-beslutshistorik** - Se exakt hur AI analyserar och kör tester
- **Realtidsfiltrering och sökning** för att snabbt hitta problem

### 🛠️ Utvecklarupplevelse

- **Noll konfiguration** - Fungerar direkt
- **TypeScript-stöd** med fullständiga typdefinitioner
- **Smart teststruktur** - Dynamisk installation, datagenerering och
  uppgiftsfunktioner
- **Inbyggt verktygssystem** - 12 omfattande automatiseringsverktyg ingår

## 🔧 Smart teststruktur

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Användarinloggningstest',
  description: 'Test inloggning med genererade inloggningsuppgifter',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // Generera testdata dynamiskt
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // Ställ in testmiljö
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // Huvudtestinstruktioner med genererad data
  task: async (data, setupData) => {
    return `
      Navigera till ${setupData.baseUrl}/login
      Fyll i e-postfält med "${data.email}"
      Fyll i lösenordsfält med "${data.password}"
      Klicka på Submit-knappen
      Verifiera att välkomstmeddelandet innehåller "${data.firstName}"
    `;
  },
};
```

## 📝 Testfilformat

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'Grundläggande inloggningstest',
  description:
    'Testa inloggningsfunktionalitet med giltiga inloggningsuppgifter',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `Dina testinstruktioner på enkel svenska...`,
};
```

## 🏆 Varför välja Endorphin AI?

| Traditionell testning     | Endorphin AI                          |
| ------------------------- | ------------------------------------- |
| ❌ Sköra CSS-selektorer   | ✅ AI hittar element intelligent      |
| ❌ Bryts vid UI-ändringar | ✅ Självläkande tester                |
| ❌ Komplex installation   | ✅ Noll konfiguration                 |
| ❌ Svårt att underhålla   | ✅ Testbeskrivningar på enkel svenska |

## 🎮 Fullständig CLI-referens

```bash
# Kör specifikt test
npx endorphin run test TEST-001

# Kör alla tester
npx endorphin run test all

# Kör tester efter tagg
npx endorphin run test --tag smoke

# Generera HTML-rapport
npx endorphin generate report

# Öppna rapport
npx endorphin open report
```

## 🔄 Håll dig uppdaterad

```bash
# Kontrollera nuvarande version
npx endorphin-ai --version

# Uppdatera till senaste version
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ Glad testning!</strong></p>
</div>
