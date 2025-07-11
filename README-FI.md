<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## E2E-testaus uudelleenkeksittynä AI:n avulla
</div>

Kirjoita testejä yksinkertaisella suomella. Anna AI:n generoida, validoida ja
korjata ne automaattisesti.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

Tehokas, modulaarinen selainautomatisointikehys, joka käyttää AI-pohjaista
testausta LangChain, OpenAI GPT-4o ja Playwright kanssa. Tarjoaa älykkään
selainautomatisoinnin automaattisella elementintunnistuksella, visuaalisella
validoinnilla ja kattavalla testinhallinnalla.

## 🎬 Katso demo

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_KATSO_DEMO-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Katso demo" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Katso Endorphin AI toiminnassa - Täydellinen opas</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ Katso kuinka AI kirjoittaa ja suorittaa testejäsi<br />
    🔍 Tutustu älykkääseen elementintunnistukseen reaaliajassa<br />
    📊 Tutustu kauniisiin HTML-raportteihin kuvakaappauksilla<br />
    ⚡ Asennuksesta testin suorittamiseen 10 minuutissa
  </p>
</div>

---

## 🚀 Pika-aloitus

### 📦 Asennus ja määritys

Aloita alle 30 sekunnissa:

```bash
# ⚡ Pika-asennus (suositeltu)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**Tai manuaalinen asennus:**

```bash
# 1. Luo projektisi
mkdir my-ai-tests && cd my-ai-tests

# 2. Asenna Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. Alusta kaikella mitä tarvitset
npx endorphin-ai init
```

### 🔑 Lisää OpenAI API-avaimesi

```bash
# Muokkaa luotua .env-tiedostoa
echo "OPENAI_API_KEY=sinun-openai-api-avaimesi-tahan" > .env
```

### ▶️ Suorita ensimmäinen testisi

```bash
# Suorita esimerkki-terveystarkistustesti
npx endorphin-ai run test HEALTH-001

# Luo kaunis HTML-raportti
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 Pääominaisuudet

### 🤖 AI-pohjaiset testit

- **Kirjoita testejä yksinkertaisella suomella** - Ei monimutkaisia valitsimia
  tarvita
- **Älykäs elementintunnistus** - AI löytää automaattisesti painikkeet,
  lomakkeet ja sisällön
- **Itsekorjaavat testit** - Sopeutuu käyttöliittymämuutoksiin rikkoontumatta
- **Älykäs virheiden korjaus** - Yrittää automaattisesti epäonnistuneita
  toimintoja eri strategioilla

### 📊 Kauniit raportit

- **Interaktiiviset HTML-raportit** kuvakaappauksilla ja vaiheittaisella
  suorituksella
- **Kustannus- ja token-seuranta** - Seuraa AI-käyttöä ja optimoi kuluja
- **AI-päätöshistoria** - Katso tarkalleen kuinka AI analysoi ja suorittaa
  testejä
- **Reaaliaikainen suodatus ja haku** ongelmien nopeaan löytämiseen

### 🛠️ Kehittäjäkokemus

- **Nolla konfiguraatio** - Toimii heti
- **TypeScript-tuki** täydellisillä tyyppimäärittelyillä
- **Älykäs testirakenne** - Dynaaminen asennus, datan generointi ja
  tehtävätoiminnot
- **Sisäänrakennettu työkalujärjestelmä** - 12 kattavaa automatisointityökalua
  mukana

## 🔧 Älykäs testirakenne

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Käyttäjän kirjautumistesti',
  description: 'Testaa kirjautumista generoiduilla tunnuksilla',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // Generoi testidataa dynaamisesti
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // Aseta testiympäristö
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // Pää-testiohjeet generoidulla datalla
  task: async (data, setupData) => {
    return `
      Siirry osoitteeseen ${setupData.baseUrl}/login
      Täytä sähköpostikentässä "${data.email}"
      Täytä salasanakentässä "${data.password}"
      Klikkaa Submit-painiketta
      Varmista että tervetuloviesti sisältää "${data.firstName}"
    `;
  },
};
```

## 📝 Testitiedoston muoto

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'Peruskirjautumistesti',
  description: 'Testaa kirjautumistoiminnallisuutta kelvollisilla tunnuksilla',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `Testiohjeet yksinkertaisella suomella...`,
};
```

## 🏆 Miksi valita Endorphin AI?

| Perinteinen testaus         | Endorphin AI                                |
| --------------------------- | ------------------------------------------- |
| ❌ Hauraat CSS-valitsimet   | ✅ AI löytää elementit älykkäästi           |
| ❌ Rikkoutuu UI-muutoksissa | ✅ Itsekorjaavat testit                     |
| ❌ Monimutkainen asennus    | ✅ Nolla konfiguraatio                      |
| ❌ Vaikea ylläpitää         | ✅ Testikuvaukset yksinkertaisella suomella |

## 🎮 Täydellinen CLI-viite

```bash
# Suorita tietty testi
npx endorphin run test TEST-001

# Suorita kaikki testit
npx endorphin run test all

# Suorita testejä tagin mukaan
npx endorphin run test --tag smoke

# Generoi HTML-raportti
npx endorphin generate report

# Avaa raportti
npx endorphin open report
```

## 🔄 Pysy ajan tasalla

```bash
# Tarkista nykyinen versio
npx endorphin-ai --version

# Päivitä uusimpaan versioon
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ Iloista testausta!</strong></p>
</div>
