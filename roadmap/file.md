# 🌍 Endorphin AI Translation System Design

**The Simple, Bulletproof Translation System**

---

## 🎯 Core Principles

1. **Language Lock at Init**: User chooses language ONCE during project
   initialization
2. **Complete Language Packs**: 100% complete or don't ship - no partial
   translations
3. **English Foundation**: English is the base - always works, always complete
4. **Extensions Only**: Other languages extend English, never replace core
   functionality
5. **AI Agent Consistency**: System prompts, tools, and messages all in same
   language
6. **Zero Runtime Complexity**: No language detection, switching, or fallbacks
   at runtime

---

## 🏗️ Architecture Overview

### Language Selection Flow

```
User runs: npx endorphin-ai init --language=de
    ↓
Validate German language pack is 100% complete
    ↓
Create endorphin.config.ts with language: 'de' (LOCKED)
    ↓
Copy German examples (examples-de/ → user project)
    ↓
ALL future operations use German: console, reports, AI prompts, tool descriptions
```

### Language Consistency Guarantee

```
German User Experience:
├── System Prompts (German): "Du bist ein Web-Test-Assistent..."
├── Tool Descriptions (German): "klicken - Element anklicken"
├── Console Messages (German): "Test gestartet..."
├── HTML Reports (German): "Testergebnisse"
└── AI Agent thinks in German throughout entire flow
```

---

## 📁 File Structure

### Translation Files (Complete Language Packs)

```
translations/
├── en/                           # BASE LANGUAGE PACK (always 100%)
│   ├── system/
│   │   ├── prompts.json         # AI agent system prompts
│   │   ├── tool-descriptions.json # Tool names & descriptions for AI
│   │   └── console.json         # Console messages
│   ├── ui/
│   │   ├── reports.json         # HTML report interface
│   │   └── cli.json             # CLI command messages
│   └── examples/
│       └── test-messages.json   # Example test instructions
├── de/                          # GERMAN LANGUAGE PACK (100% or not shipped)
│   ├── system/
│   │   ├── prompts.json         # "Du bist ein Web-Test-Assistent..."
│   │   ├── tool-descriptions.json # "klicken", "eingeben", "warten"
│   │   └── console.json         # "Test gestartet", "Fehler"
│   ├── ui/
│   │   ├── reports.json         # "Testergebnisse", "Bestanden"
│   │   └── cli.json             # "Projekt initialisiert"
│   └── examples/
│       └── test-messages.json   # German test instructions
└── fr/                          # FRENCH LANGUAGE PACK (future)
    └── (same structure as above)
```

### Framework Code Structure

```
framework/
├── i18n/
│   ├── translation-manager.ts   # Simple translation loader
│   ├── language-validator.ts    # Validates language pack completeness
│   ├── language-detector.ts     # Detects user's preferred language
│   └── types.ts                 # Translation types
├── core/
│   ├── config-loader.ts         # Loads language from config (once)
│   └── logger.ts                # Translation-aware logging
└── templates/
    ├── examples-en/             # English examples template
    ├── examples-de/             # German examples template
    └── examples-fr/             # French examples template
```

### User Project Structure (After Init)

```
user-project/
├── endorphin.config.ts          # { language: 'de' } - LOCKED
├── tests/
│   ├── GESUNDHEIT-001.ts        # German test names & instructions
│   └── BEISPIEL-001.ts
├── README-ENDORPHIN.md          # German documentation
└── global-setup.ts              # German comments
```

---

## 🔧 Implementation Details

### 1. Init Command Enhancement

```typescript
// framework/cli/init-command.ts
export async function initializeProject(options: {
  directory: string;
  language?: 'en' | 'de' | 'fr';
}) {
  const language = options.language || 'en';

  // 1. Validate language pack completeness
  const validator = new LanguageValidator();
  const validation = await validator.validateLanguagePack(language);

  if (!validation.isComplete) {
    throw new Error(
      `❌ ${language.toUpperCase()} translation pack is incomplete.\n` +
        `Missing: ${validation.missing.join(', ')}\n` +
        `Use --language=en or help complete ${language} translations.`
    );
  }

  // 2. Create configuration with locked language
  const config = {
    language: language, // NEVER CHANGES AFTER INIT
    ai: {
      /* ... */
    },
    browser: {
      /* ... */
    },
  };

  await writeConfig(config);

  // 3. Copy language-specific examples
  await copyLanguageExamples(language, options.directory);

  // 4. Show next steps in user's language
  const messages = await loadLanguagePack(language);
  console.log(messages.ui.nextSteps);
}
```

### 2. Translation Manager (Simple)

```typescript
// framework/i18n/translation-manager.ts
export class TranslationManager {
  private languagePack: LanguagePack;
  private language: string;

  constructor(language: string) {
    this.language = language;
    this.languagePack = this.loadLanguagePack(language);
  }

  private loadLanguagePack(language: string): LanguagePack {
    try {
      // Load complete language pack - no fallbacks!
      const pack = require(`../../translations/${language}/index.json`);
      return pack;
    } catch (error) {
      throw new Error(`Language pack '${language}' not found or invalid`);
    }
  }

  // Simple translation - no fallbacks needed
  translate(
    category: string,
    key: string,
    params?: Record<string, string>
  ): string {
    const message = this.languagePack[category][key];
    if (!message) {
      throw new Error(
        `Translation missing: ${category}.${key} for language ${this.language}`
      );
    }

    // Simple parameter replacement
    return this.replacePlaceholders(message, params);
  }

  private replacePlaceholders(
    message: string,
    params?: Record<string, string>
  ): string {
    if (!params) return message;

    return Object.entries(params).reduce((msg, [key, value]) => {
      return msg.replace(new RegExp(`{${key}}`, 'g'), value);
    }, message);
  }
}
```

### 3. Language Pack Validator

```typescript
// framework/i18n/language-validator.ts
export class LanguageValidator {
  private requiredKeys = {
    'system/prompts': ['agent_system_prompt', 'validation_prompt'],
    'system/tool-descriptions': ['click', 'fill', 'navigate', 'verify'],
    'system/console': ['test_started', 'test_completed', 'test_failed'],
    'ui/reports': ['test_results', 'passed', 'failed', 'duration'],
    'ui/cli': ['project_initialized', 'next_steps'],
  };

  async validateLanguagePack(language: string): Promise<ValidationResult> {
    const missing: string[] = [];

    for (const [category, keys] of Object.entries(this.requiredKeys)) {
      try {
        const categoryFile = await this.loadCategoryFile(language, category);

        for (const key of keys) {
          if (!categoryFile[key]) {
            missing.push(`${category}.${key}`);
          }
        }
      } catch (error) {
        missing.push(`${category} (entire file missing)`);
      }
    }

    return {
      language,
      isComplete: missing.length === 0,
      missing,
      completeness:
        ((this.getTotalKeys() - missing.length) / this.getTotalKeys()) * 100,
    };
  }
}
```

### 4. AI Agent Integration

```typescript
// framework/ai/agent-setup.ts
export class AIAgentSetup {
  constructor(private translationManager: TranslationManager) {}

  async createAgent(): Promise<Agent> {
    // Get system prompt in user's language
    const systemPrompt = this.translationManager.translate(
      'system/prompts',
      'agent_system_prompt'
    );

    // Get tool descriptions in user's language
    const tools = await this.createLocalizedTools();

    return new Agent({
      systemPrompt, // German: "Du bist ein Web-Test-Assistent..."
      tools, // German: [{name: "klicken", description: "Element anklicken"}]
    });
  }

  private async createLocalizedTools(): Promise<Tool[]> {
    const toolNames = ['click', 'fill', 'navigate', 'verify'];

    return toolNames.map((toolName) => ({
      name: this.translationManager.translate(
        'system/tool-descriptions',
        `${toolName}_name`
      ),
      description: this.translationManager.translate(
        'system/tool-descriptions',
        `${toolName}_description`
      ),
      // ... tool implementation
    }));
  }
}
```

### 5. Console Logging Integration

```typescript
// framework/core/logger.ts
export class TranslationLogger {
  constructor(private translationManager: TranslationManager) {}

  info(key: string, params?: Record<string, string>): void {
    const message = this.translationManager.translate(
      'system/console',
      key,
      params
    );
    console.log(`${ICONS.INFO} ${message}`);
  }

  success(key: string, params?: Record<string, string>): void {
    const message = this.translationManager.translate(
      'system/console',
      key,
      params
    );
    console.log(`${ICONS.SUCCESS} ${message}`);
  }

  error(key: string, params?: Record<string, string>): void {
    const message = this.translationManager.translate(
      'system/console',
      key,
      params
    );
    console.error(`${ICONS.ERROR} ${message}`);
  }
}
```

---

## 📋 Implementation Phases

### Phase 1: Foundation (English Perfection)

**Goal**: Make English work perfectly with new architecture

1. **Clean Current Mess**
   - Remove all complex translation files and documentation
   - Remove git submodule
   - Start with clean English-only implementation

2. **Build Core System**
   - Create simple TranslationManager
   - Build LanguageValidator
   - Update init command to use language lock
   - Ensure English flows through: console → reports → AI agent

3. **Test English Thoroughly**
   - `npx endorphin-ai init` (defaults to English)
   - `npx endorphin-ai run test HEALTH-001`
   - Verify console messages, HTML reports, AI agent all in English

**Success Criteria**: English works perfectly ✅

### Phase 2: German Extension

**Goal**: Add complete German language pack

1. **Create Complete German Pack**
   - Translate all system prompts for AI agent
   - Translate all tool descriptions (click → klicken)
   - Translate all console messages
   - Translate all HTML report labels
   - Create German examples (GESUNDHEIT-001.ts)

2. **Validate Completeness**
   - Run language validator
   - Ensure 100% coverage
   - Test German init and execution

3. **Test German Flow**
   - `npx endorphin-ai init --language=de`
   - `npx endorphin-ai run test GESUNDHEIT-001`
   - Verify German console, German reports, German AI prompts

**Success Criteria**: German works completely, English unaffected ✅

### Phase 3: French Extension

**Goal**: Prove the system scales

1. **Create Complete French Pack**
   - Full French translation following German pattern
   - French examples and documentation

2. **Test Multi-Language Support**
   - English, German, French all work independently
   - Each language is 100% consistent internally

**Success Criteria**: 3 complete languages working ✅

---

## 🤝 Contributor Workflow

### For Framework Developers

```bash
# 1. Start new language
npm run translations:create fr

# 2. This creates template structure:
# translations/fr/ (copied from English with TODO markers)

# 3. Work through categories systematically
# 4. Validate completeness
npm run translations:validate fr

# 5. Test the language
npm run test:language fr
```

### For Community Contributors

```bash
# 1. Fork repository
# 2. Pick a language to complete
# 3. Translate JSON files (keep keys, translate values only)
# 4. Test with: npx endorphin-ai init --language=fr
# 5. Submit PR with complete language pack
```

### Language Pack Requirements

- **100% Complete**: All required keys must be translated
- **Culturally Appropriate**: Not just literal translation
- **Consistent Terminology**: Same terms used throughout
- **Tested**: Must work end-to-end with real tests

---

## 🛡️ Quality Guarantees

### Reliability

- **English Always Works**: Foundation language, never breaks
- **Complete Languages Only**: Incomplete packs rejected at init
- **No Runtime Failures**: Language set once, never changes
- **Validation Built-in**: Automatic completeness checking

### Consistency

- **AI Agent Coherence**: System prompts, tools, responses all same language
- **User Experience**: Console, reports, documentation all match
- **Terminology**: Consistent terms across all components

### Maintainability

- **Simple Architecture**: Easy to understand and extend
- **Clear Separation**: Each language pack is independent
- **Easy Testing**: Test each language in isolation
- **Community Friendly**: Simple JSON translation workflow

---

## 🚀 Expected User Experience

### English User (Default)

```bash
$ npx endorphin-ai init
✅ Project initialized successfully
🚀 Next steps:
  1. Edit .env and add your OpenAI API key
  2. Run: npx endorphin-ai run test HEALTH-001

$ npx endorphin-ai run test HEALTH-001
🔍 Starting test HEALTH-001...
✅ Test completed successfully
💰 Token usage: 1,234 tokens ($0.012)
```

### German User

```bash
$ npx endorphin-ai init --language=de
✅ Projekt erfolgreich initialisiert
🚀 Nächste Schritte:
  1. Bearbeiten Sie .env und fügen Sie Ihren OpenAI API-Schlüssel hinzu
  2. Ausführen: npx endorphin-ai run test GESUNDHEIT-001

$ npx endorphin-ai run test GESUNDHEIT-001
🔍 Test GESUNDHEIT-001 wird gestartet...
✅ Test erfolgreich abgeschlossen
💰 Token-Verbrauch: 1.234 Token (0,012 $)
```

Both users get complete, consistent experience in their chosen language with AI
agent thinking and responding appropriately.

---

## 🎯 Success Metrics

1. **Zero English Breakage**: English users unaffected by translation work
2. **Complete Language Experience**: Users get 100% consistent language
3. **AI Agent Coherence**: No mixed-language confusion in tool usage
4. **Simple Contribution**: Community can easily add new languages
5. **Maintainable Codebase**: Clean, simple architecture

This design ensures Endorphin AI can scale to multiple languages while
maintaining the reliability and simplicity that users expect.
