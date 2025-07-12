<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## Test E2E reinventati con l'IA
</div>

Scrivi test in italiano semplice. Lascia che l'IA li generi, validi e corregga
automaticamente.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

Un framework di automazione browser potente e modulare che utilizza test
alimentati da IA con LangChain, OpenAI GPT-4o e Playwright. Fornisce automazione
browser intelligente con rilevamento automatico degli elementi, validazione
visiva e gestione completa dei test.

## 🎬 Guarda la demo

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_GUARDA_DEMO-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Guarda demo" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Scopri Endorphin AI in azione - Guida completa</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ Guarda come l'IA scrive ed esegue i tuoi test<br />
    🔍 Scopri il rilevamento intelligente degli elementi in tempo reale<br />
    📊 Esplora bellissimi report HTML con screenshot<br />
    ⚡ Dalla configurazione all'esecuzione dei test in 10 minuti
  </p>
</div>

---

## 🚀 Avvio rapido

### 📦 Installazione e configurazione

Inizia in meno di 30 secondi:

```bash
# ⚡ Configurazione rapida (consigliata)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**O configurazione manuale:**

```bash
# 1. Crea il tuo progetto
mkdir my-ai-tests && cd my-ai-tests

# 2. Installa Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. Inizializza con tutto ciò di cui hai bisogno
npx endorphin-ai init
```

### 🔑 Aggiungi la tua chiave API OpenAI

```bash
# Modifica il file .env che è stato creato
echo "OPENAI_API_KEY=la-tua-chiave-api-openai-qui" > .env
```

### ▶️ Esegui il tuo primo test

```bash
# Esegui il test di verifica della salute di esempio
npx endorphin-ai run test HEALTH-001

# Genera un bellissimo report HTML
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 Caratteristiche principali

### 🤖 Test alimentati da IA

- **Scrivi test in italiano semplice** - Nessun selettore complesso necessario
- **Rilevamento intelligente degli elementi** - L'IA trova automaticamente
  pulsanti, form e contenuti
- **Test auto-riparanti** - Si adatta ai cambiamenti dell'UI senza rompersi
- **Recupero intelligente degli errori** - Riprova automaticamente azioni
  fallite con strategie diverse

### 📊 Report bellissimi

- **Report HTML interattivi** con screenshot ed esecuzione passo dopo passo
- **Tracciamento costi e token** - Monitora l'uso dell'IA e ottimizza le spese
- **Cronologia decisioni IA** - Vedi esattamente come l'IA analizza ed esegue i
  test
- **Filtro e ricerca in tempo reale** per trovare rapidamente i problemi

### 🛠️ Esperienza dello sviluppatore

- **Configurazione zero** - Funziona immediatamente
- **Supporto TypeScript** con definizioni di tipo complete
- **Struttura test intelligente** - Configurazione dinamica, generazione dati e
  funzioni di task
- **Sistema di strumenti integrato** - 12 strumenti di automazione completi
  inclusi

## 🔧 Struttura test intelligente

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Test di accesso utente',
  description: 'Test di accesso con credenziali generate',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // Genera dati di test dinamicamente
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // Configura ambiente di test
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // Istruzioni principali del test usando dati generati
  task: async (data, setupData) => {
    return `
      Naviga a ${setupData.baseUrl}/login
      Riempi email con "${data.email}"
      Riempi password con "${data.password}"
      Clicca il pulsante Submit
      Verifica che il messaggio di benvenuto contenga "${data.firstName}"
    `;
  },
};
```

## 📝 Formato file di test

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'Test di accesso base',
  description: 'Testa la funzionalità di accesso con credenziali valide',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `Le tue istruzioni di test in italiano semplice...`,
};
```

## 🏆 Perché scegliere Endorphin AI?

| Test tradizionali                | Endorphin AI                             |
| -------------------------------- | ---------------------------------------- |
| ❌ Selettori CSS fragili         | ✅ L'IA trova elementi intelligentemente |
| ❌ Si rompe con i cambiamenti UI | ✅ Test auto-riparanti                   |
| ❌ Configurazione complessa      | ✅ Configurazione zero                   |
| ❌ Difficile da mantenere        | ✅ Descrizioni test in italiano semplice |

## 🎮 Riferimento CLI completo

```bash
# Eseguire un test specifico
npx endorphin run test TEST-001

# Eseguire tutti i test
npx endorphin run test all

# Eseguire test per tag
npx endorphin run test --tag smoke

# Generare report HTML
npx endorphin generate report

# Aprire report
npx endorphin open report
```

## 🔄 Rimanere aggiornati

```bash
# Verificare versione attuale
npx endorphin-ai --version

# Aggiornare all'ultima versione
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ Buon testing!</strong></p>
</div>
