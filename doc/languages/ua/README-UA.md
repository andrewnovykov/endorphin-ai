<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## E2E тестування перевинайдено з AI
</div>

Пишіть тести простою українською мовою. Дозвольте AI автоматично генерувати,
валідувати та виправляти їх.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

Потужна модульна платформа автоматизації браузера, що використовує AI-керовані
тести з LangChain, OpenAI GPT-4o та Playwright. Забезпечує розумну автоматизацію
браузера з автоматичним виявленням елементів, візуальною валідацією та
всеохоплюючим управлінням тестами.

## 🎬 Подивитися демо

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_ДЕМО-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Демо" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Подивіться Endorphin AI в дії - Повний гід</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ Дивіться, як AI пише та виконує ваші тести<br />
    🔍 Відкрийте для себе розумне виявлення елементів у реальному часі<br />
    📊 Досліджуйте красиві HTML звіти зі скріншотами<br />
    ⚡ Від налаштування до виконання тесту за 10 хвилин
  </p>
</div>

---

## 🚀 Швидкий старт

### 📦 Встановлення та налаштування

Розпочніть менш ніж за 30 секунд:

```bash
# ⚡ Швидке налаштування (рекомендовано)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**Або ручне налаштування:**

```bash
# 1. Створіть ваш проект
mkdir my-ai-tests && cd my-ai-tests

# 2. Встановіть Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. Ініціалізуйте з усім необхідним
npx endorphin-ai init
```

### 🔑 Додайте ваш OpenAI API ключ

```bash
# Відредагуйте створений .env файл
echo "OPENAI_API_KEY=ваш-openai-api-ключ-тут" > .env
```

### ▶️ Запустіть ваш перший тест

```bash
# Запустіть приклад тесту перевірки здоров'я
npx endorphin-ai run test HEALTH-001

# Згенеруйте красивий HTML звіт
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 Основні функції

### 🤖 AI-керовані тести

- **Пишіть тести простою українською мовою** - Не потрібні складні селектори
- **Розумне виявлення елементів** - AI автоматично знаходить кнопки, форми та
  контент
- **Самовідновлювальні тести** - Адаптуються до змін UI без поломок
- **Розумне відновлення після помилок** - Автоматично повторює невдалі дії з
  різними стратегіями

### 📊 Красиві звіти

- **Інтерактивні HTML звіти** зі скріншотами та покроковим виконанням
- **Відстеження витрат та токенів** - Контролюйте використання AI та оптимізуйте
  витрати
- **Історія рішень AI** - Бачте точно, як AI аналізує та виконує тести
- **Фільтрація та пошук у реальному часі** для швидкого пошуку проблем

### 🛠️ Досвід розробника

- **Нульова конфігурація** - Працює відразу
- **Підтримка TypeScript** з повними визначеннями типів
- **Розумна структура тестів** - Динамічне налаштування, генерація даних та
  функції завдань
- **Вбудована система інструментів** - 12 комплексних інструментів автоматизації
  включено

## 🔧 Розумна структура тестів

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Тест входу користувача',
  description: 'Тест входу з згенерованими облікові дані',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // Генерувати тестові дані динамічно
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // Налаштувати тестове середовище
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // Основні інструкції тесту з згенерованими даними
  task: async (data, setupData) => {
    return `
      Перейдіть до ${setupData.baseUrl}/login
      Заповніть поле email з "${data.email}"
      Заповніть поле пароль з "${data.password}"
      Натисніть кнопку Submit
      Перевірте, що привітальне повідомлення містить "${data.firstName}"
    `;
  },
};
```

## 📝 Формат файлу тесту

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'Базовий тест входу',
  description: 'Тест функціональності входу з дійсними обліковими даними',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `Ваші інструкції тесту простою українською мовою...`,
};
```

## 🏆 Чому обрати Endorphin AI?

| Традиційне тестування      | Endorphin AI                              |
| -------------------------- | ----------------------------------------- |
| ❌ Крихкі CSS селектори    | ✅ AI розумно знаходить елементи          |
| ❌ Ломається при змінах UI | ✅ Самовідновлювальні тести               |
| ❌ Складне налаштування    | ✅ Нульова конфігурація                   |
| ❌ Важко підтримувати      | ✅ Описи тестів простою українською мовою |

## 🎮 Повний довідник CLI

```bash
# Запустити конкретний тест
npx endorphin-ai run test TEST-001

# Запустити всі тести
npx endorphin-ai run test all

# Запустити тести за тегом
npx endorphin-ai run test --tag smoke

# Згенерувати HTML звіт
npx endorphin-ai generate report

# Відкрити звіт
npx endorphin-ai open report
```

## 🔄 Залишатися в курсі

```bash
# Перевірити поточну версію
npx endorphin-ai --version

# Оновити до найновішої версії
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ Щасливого тестування!</strong></p>
</div>
