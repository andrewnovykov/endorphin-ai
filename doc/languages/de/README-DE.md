<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## E2E-Tests neu erfunden mit KI
</div>

Schreiben Sie Tests in einfachem Deutsch. Lassen Sie KI sie automatisch
generieren, validieren und reparieren.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

Ein leistungsstarkes, modulares Browser-Automatisierungsframework mit
KI-gestützten Tests mit LangChain, OpenAI GPT-4o und Playwright. Bietet
intelligente Browser-Automatisierung mit automatischer Elementerkennung,
visueller Validierung und umfassendem Testmanagement.

## 🎬 Demo ansehen

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_DEMO_ANSEHEN-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Demo ansehen" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Erleben Sie Endorphin AI in Aktion - Vollständige Anleitung</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ Sehen Sie, wie KI Ihre Tests schreibt und ausführt<br />
    🔍 Erleben Sie intelligente Elementerkennung in Echtzeit<br />
    📊 Entdecken Sie schöne HTML-Berichte mit Screenshots<br />
    ⚡ Von der Einrichtung bis zur Testausführung in 10 Minuten
  </p>
</div>

---

## 🚀 Schnellstart

### 📦 Installation & Einrichtung

In unter 30 Sekunden starten:

```bash
# ⚡ Schnelle Einrichtung (empfohlen)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**Oder manuelle Einrichtung:**

```bash
# 1. Erstellen Sie Ihr Projekt
mkdir my-ai-tests && cd my-ai-tests

# 2. Installieren Sie Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. Initialisieren Sie mit allem, was Sie brauchen
npx endorphin-ai init
```

### 🔑 Fügen Sie Ihren OpenAI API-Schlüssel hinzu

```bash
# Bearbeiten Sie die .env-Datei, die erstellt wurde
echo "OPENAI_API_KEY=ihr-openai-api-schluessel-hier" > .env
```

### ▶️ Führen Sie Ihren ersten Test aus

```bash
# Führen Sie den Beispiel-Gesundheitscheck-Test aus
npx endorphin-ai run test HEALTH-001

# Generieren Sie einen schönen HTML-Bericht
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 Hauptfunktionen

### 🤖 KI-gestütztes Testen

- **Tests in einfachem Deutsch schreiben** - Keine komplexen Selektoren
  erforderlich
- **Intelligente Elementerkennung** - KI findet automatisch Buttons, Formulare
  und Inhalte
- **Selbstheilende Tests** - Passt sich an UI-Änderungen an, ohne zu brechen
- **Intelligente Fehlerbehebung** - Wiederholt automatisch fehlgeschlagene
  Aktionen mit verschiedenen Strategien

### 📊 Schöne Berichte

- **Interaktive HTML-Berichte** mit Screenshots und schrittweiser Ausführung
- **Kosten- und Token-Tracking** - Überwachen Sie die KI-Nutzung und optimieren
  Sie Ausgaben
- **KI-Entscheidungshistorie** - Sehen Sie genau, wie KI Tests analysiert und
  ausführt
- **Echtzeit-Filterung und Suche** zum schnellen Finden von Problemen

### 🛠️ Entwicklererfahrung

- **Null-Konfiguration** - Funktioniert sofort
- **TypeScript-Unterstützung** mit vollständigen Typdefinitionen
- **Intelligente Teststruktur** - Dynamische Einrichtung, Datengenerierung und
  Aufgabenfunktionen
- **Integriertes Werkzeugsystem** - 12 umfassende Automatisierungstools
  enthalten

## 🔧 Intelligente Teststruktur

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Benutzer-Login-Test',
  description: 'Test-Login mit generierten Anmeldedaten',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // Testdaten dynamisch generieren
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // Testumgebung einrichten
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // Haupttest-Anweisungen mit generierten Daten
  task: async (data, setupData) => {
    return `
      Navigiere zu ${setupData.baseUrl}/login
      Fülle E-Mail mit "${data.email}"
      Fülle Passwort mit "${data.password}"
      Klicke Submit-Button
      Verifiziere Willkommensnachricht enthält "${data.firstName}"
    `;
  },
};
```

## 📝 Testdatei-Format

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'Basic Login Test',
  description: 'Test Login-Funktionalität mit gültigen Anmeldedaten',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `Ihre Testanweisungen in einfachem Deutsch...`,
};
```

## 🏆 Warum Endorphin AI wählen?

| Traditionelles Testen       | Endorphin AI                               |
| --------------------------- | ------------------------------------------ |
| ❌ Brüchige CSS-Selektoren  | ✅ KI findet Elemente intelligent          |
| ❌ Bricht bei UI-Änderungen | ✅ Selbstheilende Tests                    |
| ❌ Komplexe Einrichtung     | ✅ Null-Konfiguration                      |
| ❌ Schwer zu warten         | ✅ Testbeschreibungen in einfachem Deutsch |

## 🎮 Vollständige CLI-Referenz

```bash
# Spezifischen Test ausführen
npx endorphin run test TEST-001

# Alle Tests ausführen
npx endorphin run test all

# Tests nach Tag ausführen
npx endorphin run test --tag smoke

# HTML-Bericht generieren
npx endorphin generate report

# Bericht öffnen
npx endorphin open report
```

## 🔄 Aktuell bleiben

```bash
# Aktuelle Version prüfen
npx endorphin-ai --version

# Auf neueste Version aktualisieren
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ Viel Spaß beim Testen!</strong></p>
</div>
