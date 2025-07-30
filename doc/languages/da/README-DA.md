<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## E2E-testning genopfundet med AI
</div>

Skriv tests på simpelt dansk. Lad AI generere, validere og reparere dem
automatisk.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

Et kraftfuldt, modulært browserautomatiseringsframework, der bruger AI-drevne
tests med LangChain, OpenAI GPT-4o og Playwright. Giver intelligent
browserautomatisering med automatisk elementdetektering, visuel validering og
omfattende testhåndtering.

## 🎬 Se demo

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_SE_DEMO-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Se demo" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Se Endorphin AI i aktion - Komplet guide</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ Se hvordan AI skriver og udfører dine tests<br />
    🔍 Oplev intelligent elementdetektering i realtid<br />
    📊 Udforsk smukke HTML-rapporter med screenshots<br />
    ⚡ Fra opsætning til testudførelse på 10 minutter
  </p>
</div>

---

## 🚀 Hurtig start

### 📦 Installation og opsætning

Kom i gang på under 30 sekunder:

```bash
# ⚡ Hurtig opsætning (anbefalet)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**Eller manuel opsætning:**

```bash
# 1. Opret dit projekt
mkdir my-ai-tests && cd my-ai-tests

# 2. Installer Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. Initialiser med alt du har brug for
npx endorphin-ai init
```

### 🔑 Tilføj din OpenAI API-nøgle

```bash
# Rediger .env-filen som blev oprettet
echo "OPENAI_API_KEY=din-openai-api-nøgle-her" > .env
```

### ▶️ Kør din første test

```bash
# Kør eksempel sundhedscheck-test
npx endorphin-ai run test HEALTH-001

# Generer en smuk HTML-rapport
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 Hovedfunktioner

### 🤖 AI-drevne tests

- **Skriv tests på simpelt dansk** - Ingen komplekse selektorer nødvendige
- **Intelligent elementdetektering** - AI finder automatisk knapper, formularer
  og indhold
- **Selvhelbredende tests** - Tilpasser sig UI-ændringer uden at gå i stykker
- **Smart fejlgendannelse** - Prøver automatisk mislykkede handlinger med
  forskellige strategier

### 📊 Smukke rapporter

- **Interaktive HTML-rapporter** med screenshots og trin-for-trin-udførelse
- **Omkostnings- og tokensporing** - Overvåg AI-brug og optimer udgifter
- **AI-beslutningshistorik** - Se præcist hvordan AI analyserer og udfører tests
- **Realtidsfiltrering og søgning** for hurtigt at finde problemer

### 🛠️ Udvikleroplevelse

- **Nul konfiguration** - Virker med det samme
- **TypeScript-support** med komplette typedefinitioner
- **Smart teststruktur** - Dynamisk opsætning, datagenerering og
  opgavefunktioner
- **Indbygget værktøjssystem** - 12 omfattende automatiseringsværktøjer
  inkluderet

## 🔧 Smart teststruktur

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Brugerlogin test',
  description: 'Test login med genererede legitimationsoplysninger',
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

  // Opsæt testmiljø
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // Hoved-testinstruktioner med genererede data
  task: async (data, setupData) => {
    return `
      Naviger til ${setupData.baseUrl}/login
      Udfyld email-felt med "${data.email}"
      Udfyld adgangskode-felt med "${data.password}"
      Klik på Submit-knappen
      Verificer at velkomstbesked indeholder "${data.firstName}"
    `;
  },
};
```

## 📝 Testfilformat

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'Grundlæggende login test',
  description: 'Test login-funktionalitet med gyldige legitimationsoplysninger',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `Dine testinstruktioner på simpelt dansk...`,
};
```

## 🏆 Hvorfor vælge Endorphin AI?

| Traditionel testning              | Endorphin AI                         |
| --------------------------------- | ------------------------------------ |
| ❌ Skrøbelige CSS-selektorer      | ✅ AI finder elementer intelligent   |
| ❌ Går i stykker ved UI-ændringer | ✅ Selvhelbredende tests             |
| ❌ Kompleks opsætning             | ✅ Nul konfiguration                 |
| ❌ Svær at vedligeholde           | ✅ Testbeskrivelser på simpelt dansk |

## 🎮 Komplet CLI-reference

```bash
# Kør specifik test
npx endorphin-ai run test TEST-001

# Kør alle tests
npx endorphin-ai run test all

# Kør tests efter tag
npx endorphin-ai run test --tag smoke

# Generer HTML-rapport
npx endorphin-ai generate report

# Åbn rapport
npx endorphin-ai open report
```

## 🔄 Hold dig opdateret

```bash
# Tjek nuværende version
npx endorphin-ai --version

# Opdater til nyeste version
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ Glad testning!</strong></p>
</div>
