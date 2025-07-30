<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## בדיקות E2E הומצאו מחדש עם AI
</div>

כתבו בדיקות בעברית פשוטה. תנו ל-AI לייצר, לאמת ולתקן אותן אוטומטית.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

מסגרת אוטומציה לדפדפן עוצמתית ומודולרית המשתמשת בבדיקות מונעות AI עם LangChain,
OpenAI GPT-4o ו-Playwright. מספקת אוטומציה חכמה לדפדפן עם זיהוי אוטומטי של
אלמנטים, אימות ויזואלי וניהול בדיקות מקיף.

## 🎬 צפייה בהדגמה

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_צפייה_בהדגמה-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="צפייה בהדגמה" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 ראו את Endorphin AI בפעולה - מדריך מלא</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ ראו איך AI כותב ומריץ את הבדיקות שלכם<br />
    🔍 גלו זיהוי אלמנטים חכם בזמן אמת<br />
    📊 חקרו דוחות HTML יפים עם צילומי מסך<br />
    ⚡ מהתקנה להרצת בדיקות ב-10 דקות
  </p>
</div>

---

## 🚀 התחלה מהירה

### 📦 התקנה והגדרה

התחילו בפחות מ-30 שניות:

```bash
# ⚡ הגדרה מהירה (מומלץ)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**או הגדרה ידנית:**

```bash
# 1. יצירת הפרויקט שלכם
mkdir my-ai-tests && cd my-ai-tests

# 2. התקנת Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. אתחול עם כל מה שאתם צריכים
npx endorphin-ai init
```

### 🔑 הוספת מפתח OpenAI API

```bash
# עריכת קובץ .env שנוצר
echo "OPENAI_API_KEY=מפתח-openai-api-שלכם-כאן" > .env
```

### ▶️ הרצת הבדיקה הראשונה

```bash
# הרצת בדיקת בריאות לדוגמה
npx endorphin-ai run test HEALTH-001

# יצירת דוח HTML יפה
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 תכונות עיקריות

### 🤖 בדיקות מונעות AI

- **כתיבת בדיקות בעברית פשוטה** - אין צורך בסלקטורים מורכבים
- **זיהוי אלמנטים חכם** - AI מוצא אוטומטית כפתורים, טפסים ותוכן
- **בדיקות המתרפאות מעצמן** - מתאימות לשינויי UI בלי להישבר
- **התאוששות חכמה משגיאות** - מנסה אוטומטית פעולות שנכשלו באסטרטגיות שונות

### 📊 דוחות יפים

- **דוחות HTML אינטראקטיביים** עם צילומי מסך והרצה שלב אחר שלב
- **מעקב עלויות ואסימונים** - ניטור שימוש ב-AI ואופטימיזציה של הוצאות
- **היסטוריית החלטות AI** - ראו בדיוק איך AI מנתח ומריץ בדיקות
- **סינון וחיפוש בזמן אמת** למציאת בעיות מהירה

### 🛠️ חוויית מפתח

- **אפס תצורה** - עובד מיד
- **תמיכה ב-TypeScript** עם הגדרות טיפוסים מלאות
- **מבנה בדיקה חכם** - הגדרה דינמית, יצירת נתונים ופונקציות משימות
- **מערכת כלים מובנית** - 12 כלי אוטומציה מקיפים כלולים

## 🔧 מבנה בדיקה חכם

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'בדיקת התחברות משתמש',
  description: 'בדיקת התחברות עם פרטי כניסה שנוצרו',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // יצירת נתוני בדיקה דינמית
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // הגדרת סביבת בדיקה
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // הוראות בדיקה עיקריות עם נתונים שנוצרו
  task: async (data, setupData) => {
    return `
      נווטו ל-${setupData.baseUrl}/login
      מלאו שדה אימייל עם "${data.email}"
      מלאו שדה סיסמה עם "${data.password}"
      לחצו על כפתור Submit
      ודאו שהודעת הברכה מכילה "${data.firstName}"
    `;
  },
};
```

## 📝 פורמט קובץ בדיקה

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'בדיקת התחברות בסיסית',
  description: 'בדיקת פונקציונליות התחברות עם פרטי כניסה תקינים',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `הוראות הבדיקה שלכם בעברית פשוטה...`,
};
```

## 🏆 למה לבחור ב-Endorphin AI?

| בדיקות מסורתיות       | Endorphin AI                  |
| --------------------- | ----------------------------- |
| ❌ סלקטורי CSS שבירים | ✅ AI מוצא אלמנטים בחכמה      |
| ❌ נשבר עם שינויי UI  | ✅ בדיקות המתרפאות מעצמן      |
| ❌ הגדרה מורכבת       | ✅ אפס תצורה                  |
| ❌ קשה לתחזוקה        | ✅ תיאורי בדיקות בעברית פשוטה |

## 🎮 עזר CLI מלא

```bash
# הרצת בדיקה ספציפית
npx endorphin-ai run test TEST-001

# הרצת כל הבדיקות
npx endorphin-ai run test all

# הרצת בדיקות לפי תג
npx endorphin-ai run test --tag smoke

# יצירת דוח HTML
npx endorphin-ai generate report

# פתיחת דוח
npx endorphin-ai open report
```

## 🔄 להישאר מעודכנים

```bash
# בדיקת הגרסה הנוכחית
npx endorphin-ai --version

# עדכון לגרסה האחרונה
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ בדיקות שמחות!</strong></p>
</div>
