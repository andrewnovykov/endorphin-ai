<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## E2E-testing gjenoppfunnet med AI
</div>

Skriv tester på enkel norsk. La AI generere, validere og reparere dem
automatisk.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

Et kraftig, modulært nettleserautomatiseringsrammeverk som bruker AI-drevne
tester med LangChain, OpenAI GPT-4o og Playwright. Gir intelligent
nettleserautomatisering med automatisk elementdeteksjon, visuell validering og
omfattende testhåndtering.

## 🎬 Se demo

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_SE_DEMO-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Se demo" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Se Endorphin AI i aksjon - Fullstendig guide</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ Se hvordan AI skriver og kjører testene dine<br />
    🔍 Oppdag intelligent elementdeteksjon i sanntid<br />
    📊 Utforsk vakre HTML-rapporter med skjermbilder<br />
    ⚡ Fra oppsett til testkjøring på 10 minutter
  </p>
</div>

---

## 🚀 Rask start

### 📦 Installasjon og oppsett

Kom i gang på under 30 sekunder:

```bash
# ⚡ Rask oppsett (anbefalt)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**Eller manuelt oppsett:**

```bash
# 1. Opprett prosjektet ditt
mkdir my-ai-tests && cd my-ai-tests

# 2. Installer Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. Initialiser med alt du trenger
npx endorphin-ai init
```

### 🔑 Legg til din OpenAI API-nøkkel

```bash
# Rediger .env-filen som ble opprettet
echo "OPENAI_API_KEY=din-openai-api-nøkkel-her" > .env
```

### ▶️ Kjør din første test

```bash
# Kjør eksempel helsesjekk-test
npx endorphin-ai run test HEALTH-001

# Generer en vakker HTML-rapport
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 Hovedfunksjoner

### 🤖 AI-drevne tester

- **Skriv tester på enkel norsk** - Ingen komplekse selektorer nødvendig
- **Intelligent elementdeteksjon** - AI finner automatisk knapper, skjemaer og
  innhold
- **Selvhelbredende tester** - Tilpasser seg UI-endringer uten å gå i stykker
- **Smart feilgjenoppretting** - Prøver automatisk mislykkede handlinger med
  forskjellige strategier

### 📊 Vakre rapporter

- **Interaktive HTML-rapporter** med skjermbilder og steg-for-steg-kjøring
- **Kostnads- og tokensporing** - Overvåk AI-bruk og optimaliser utgifter
- **AI-beslutningshistorikk** - Se nøyaktig hvordan AI analyserer og kjører
  tester
- **Sanntidsfiltrering og søk** for å raskt finne problemer

### 🛠️ Utvikleropplevelse

- **Null konfigurasjon** - Fungerer umiddelbart
- **TypeScript-støtte** med fullstendige typedefinisjoner
- **Smart teststruktur** - Dynamisk oppsett, datagenerering og oppgavefunksjoner
- **Innebygd verktøysystem** - 12 omfattende automatiseringsverktøy inkludert

## 🔧 Smart teststruktur

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Brukerinnloggingstest',
  description: 'Test innlogging med genererte legitimasjon',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // Generer testdata dynamisk
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // Sett opp testmiljø
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // Hovedtestinstruksjoner med genererte data
  task: async (data, setupData) => {
    return `
      Naviger til ${setupData.baseUrl}/login
      Fyll ut e-postfelt med "${data.email}"
      Fyll ut passord-felt med "${data.password}"
      Klikk på Submit-knappen
      Verifiser at velkomstmeldingen inneholder "${data.firstName}"
    `;
  },
};
```

## 📝 Testfilformat

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'Grunnleggende innloggingstest',
  description: 'Test innloggingsfunksjonalitet med gyldig legitimasjon',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `Dine testinstruksjoner på enkel norsk...`,
};
```

## 🏆 Hvorfor velge Endorphin AI?

| Tradisjonell testing              | Endorphin AI                       |
| --------------------------------- | ---------------------------------- |
| ❌ Skjøre CSS-selektorer          | ✅ AI finner elementer intelligent |
| ❌ Går i stykker ved UI-endringer | ✅ Selvhelbredende tester          |
| ❌ Kompleks oppsett               | ✅ Null konfigurasjon              |
| ❌ Vanskelig å vedlikeholde       | ✅ Testbeskrivelser på enkel norsk |

## 🎮 Fullstendig CLI-referanse

```bash
# Kjør spesifikk test
npx endorphin run test TEST-001

# Kjør alle tester
npx endorphin run test all

# Kjør tester etter tagg
npx endorphin run test --tag smoke

# Generer HTML-rapport
npx endorphin generate report

# Åpne rapport
npx endorphin open report
```

## 🔄 Hold deg oppdatert

```bash
# Sjekk gjeldende versjon
npx endorphin-ai --version

# Oppdater til nyeste versjon
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ Glad testing!</strong></p>
</div>
