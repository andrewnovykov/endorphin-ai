<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## Testy E2E wynalezione na nowo z AI
</div>

Pisz testy w prostym języku polskim. Pozwól AI automatycznie je generować,
walidować i naprawiać.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

Potężny, modularny framework automatyzacji przeglądarki wykorzystujący testy
oparte na AI z LangChain, OpenAI GPT-4o i Playwright. Zapewnia inteligentną
automatyzację przeglądarki z automatycznym wykrywaniem elementów, walidacją
wizualną i kompleksowym zarządzaniem testami.

## 🎬 Zobacz demo

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_ZOBACZ_DEMO-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Zobacz demo" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Zobacz Endorphin AI w akcji - Kompletny przewodnik</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ Zobacz jak AI pisze i wykonuje twoje testy<br />
    🔍 Odkryj inteligentne wykrywanie elementów w czasie rzeczywistym<br />
    📊 Eksploruj piękne raporty HTML ze zrzutami ekranu<br />
    ⚡ Od konfiguracji do wykonania testów w 10 minut
  </p>
</div>

---

## 🚀 Szybki start

### 📦 Instalacja i konfiguracja

Zacznij w mniej niż 30 sekund:

```bash
# ⚡ Szybka konfiguracja (zalecana)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**Lub konfiguracja manualna:**

```bash
# 1. Utwórz swój projekt
mkdir my-ai-tests && cd my-ai-tests

# 2. Zainstaluj Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. Zainicjuj ze wszystkim czego potrzebujesz
npx endorphin-ai init
```

### 🔑 Dodaj swój klucz API OpenAI

```bash
# Edytuj utworzony plik .env
echo "OPENAI_API_KEY=twoj-klucz-api-openai-tutaj" > .env
```

### ▶️ Uruchom swój pierwszy test

```bash
# Uruchom przykładowy test sprawdzania zdrowia
npx endorphin-ai run test HEALTH-001

# Wygeneruj piękny raport HTML
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 Główne funkcje

### 🤖 Testy oparte na AI

- **Pisz testy w prostym języku polskim** - Nie potrzebujesz skomplikowanych
  selektorów
- **Inteligentne wykrywanie elementów** - AI automatycznie znajduje przyciski,
  formularze i zawartość
- **Samonaprawiające się testy** - Dostosowują się do zmian interfejsu bez
  psucia
- **Inteligentne odzyskiwanie błędów** - Automatycznie ponawia nieudane akcje z
  różnymi strategiami

### 📊 Piękne raporty

- **Interaktywne raporty HTML** ze zrzutami ekranu i wykonaniem krok po kroku
- **Śledzenie kosztów i tokenów** - Monitoruj użycie AI i optymalizuj wydatki
- **Historia decyzji AI** - Zobacz dokładnie jak AI analizuje i wykonuje testy
- **Filtrowanie i wyszukiwanie w czasie rzeczywistym** do szybkiego znajdowania
  problemów

### 🛠️ Doświadczenie developera

- **Zerowa konfiguracja** - Działa od razu
- **Wsparcie TypeScript** z pełnymi definicjami typów
- **Inteligentna struktura testów** - Dynamiczna konfiguracja, generowanie
  danych i funkcje zadań
- **Wbudowany system narzędzi** - 12 kompleksowych narzędzi automatyzacji w
  zestawie

## 🔧 Inteligentna struktura testów

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Test logowania użytkownika',
  description: 'Test logowania z wygenerowanymi danymi uwierzytelniającymi',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // Generuj dane testowe dynamicznie
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // Skonfiguruj środowisko testowe
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // Główne instrukcje testowe z wygenerowanymi danymi
  task: async (data, setupData) => {
    return `
      Przejdź do ${setupData.baseUrl}/login
      Wypełnij pole email z "${data.email}"
      Wypełnij pole hasła z "${data.password}"
      Kliknij przycisk Submit
      Zweryfikuj że wiadomość powitalna zawiera "${data.firstName}"
    `;
  },
};
```

## 📝 Format pliku testowego

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'Podstawowy test logowania',
  description:
    'Test funkcjonalności logowania z prawidłowymi danymi uwierzytelniającymi',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `Twoje instrukcje testowe w prostym języku polskim...`,
};
```

## 🏆 Dlaczego wybrać Endorphin AI?

| Tradycyjne testowanie         | Endorphin AI                             |
| ----------------------------- | ---------------------------------------- |
| ❌ Kruche selektory CSS       | ✅ AI znajduje elementy inteligentnie    |
| ❌ Psuje się przy zmianach UI | ✅ Samonaprawiające się testy            |
| ❌ Skomplikowana konfiguracja | ✅ Zerowa konfiguracja                   |
| ❌ Trudne w utrzymaniu        | ✅ Opisy testów w prostym języku polskim |

## 🎮 Kompletna referencja CLI

```bash
# Uruchom konkretny test
npx endorphin run test TEST-001

# Uruchom wszystkie testy
npx endorphin run test all

# Uruchom testy według tagu
npx endorphin run test --tag smoke

# Wygeneruj raport HTML
npx endorphin generate report

# Otwórz raport
npx endorphin open report
```

## 🔄 Pozostań na bieżąco

```bash
# Sprawdź obecną wersję
npx endorphin-ai --version

# Aktualizuj do najnowszej wersji
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ Szczęśliwego testowania!</strong></p>
</div>
