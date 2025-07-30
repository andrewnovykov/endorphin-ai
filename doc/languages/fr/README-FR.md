<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## Tests E2E réinventés avec l'IA
</div>

Écrivez des tests en français simple. Laissez l'IA les générer, valider et
corriger automatiquement.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

Un framework d'automatisation de navigateur puissant et modulaire utilisant les
tests alimentés par l'IA avec LangChain, OpenAI GPT-4o et Playwright. Fournit
une automatisation de navigateur intelligente avec détection automatique
d'éléments, validation visuelle et gestion complète des tests.

## 🎬 Regarder la démo

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_VOIR_DÉMO-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Voir la démo" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Découvrez Endorphin AI en action - Guide complet</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ Regardez comment l'IA écrit et exécute vos tests<br />
    🔍 Découvrez la détection intelligente d'éléments en temps réel<br />
    📊 Explorez de magnifiques rapports HTML avec captures d'écran<br />
    ⚡ De la configuration à l'exécution des tests en 10 minutes
  </p>
</div>

---

## 🚀 Démarrage rapide

### 📦 Installation et configuration

Commencez en moins de 30 secondes :

```bash
# ⚡ Configuration rapide (recommandée)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**Ou configuration manuelle :**

```bash
# 1. Créez votre projet
mkdir my-ai-tests && cd my-ai-tests

# 2. Installez Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. Initialisez avec tout ce dont vous avez besoin
npx endorphin-ai init
```

### 🔑 Ajoutez votre clé API OpenAI

```bash
# Modifiez le fichier .env qui a été créé
echo "OPENAI_API_KEY=votre-clé-api-openai-ici" > .env
```

### ▶️ Exécutez votre premier test

```bash
# Exécutez le test de vérification de santé d'exemple
npx endorphin-ai run test HEALTH-001

# Générez un magnifique rapport HTML
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 Fonctionnalités principales

### 🤖 Tests alimentés par l'IA

- **Écrivez des tests en français simple** - Aucun sélecteur complexe nécessaire
- **Détection intelligente d'éléments** - L'IA trouve automatiquement les
  boutons, formulaires et contenus
- **Tests auto-réparateurs** - S'adapte aux changements d'interface sans se
  casser
- **Récupération d'erreur intelligente** - Répète automatiquement les actions
  échouées avec différentes stratégies

### 📊 Rapports magnifiques

- **Rapports HTML interactifs** avec captures d'écran et exécution étape par
  étape
- **Suivi des coûts et tokens** - Surveillez l'utilisation de l'IA et optimisez
  les dépenses
- **Historique des décisions de l'IA** - Voyez exactement comment l'IA analyse
  et exécute les tests
- **Filtrage et recherche en temps réel** pour trouver rapidement les problèmes

### 🛠️ Expérience développeur

- **Configuration zéro** - Fonctionne immédiatement
- **Support TypeScript** avec définitions de types complètes
- **Structure de test intelligente** - Configuration dynamique, génération de
  données et fonctions de tâches
- **Système d'outils intégré** - 12 outils d'automatisation complets inclus

## 🔧 Structure de test intelligente

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Test de connexion utilisateur',
  description: 'Test de connexion avec identifiants générés',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // Générer des données de test dynamiquement
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // Configurer l'environnement de test
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // Instructions de test principales utilisant les données générées
  task: async (data, setupData) => {
    return `
      Naviguez vers ${setupData.baseUrl}/login
      Remplissez l'email avec "${data.email}"
      Remplissez le mot de passe avec "${data.password}"
      Cliquez sur le bouton Submit
      Vérifiez que le message de bienvenue contient "${data.firstName}"
    `;
  },
};
```

## 📝 Format de fichier de test

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'Test de connexion basique',
  description:
    'Test de la fonctionnalité de connexion avec identifiants valides',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `Vos instructions de test en français simple...`,
};
```

## 🏆 Pourquoi choisir Endorphin AI ?

| Tests traditionnels                          | Endorphin AI                                |
| -------------------------------------------- | ------------------------------------------- |
| ❌ Sélecteurs CSS fragiles                   | ✅ L'IA trouve les éléments intelligemment  |
| ❌ Se casse avec les changements d'interface | ✅ Tests auto-réparateurs                   |
| ❌ Configuration complexe                    | ✅ Configuration zéro                       |
| ❌ Difficile à maintenir                     | ✅ Descriptions de tests en français simple |

## 🎮 Référence CLI complète

```bash
# Exécuter un test spécifique
npx endorphin-ai run test TEST-001

# Exécuter tous les tests
npx endorphin-ai run test all

# Exécuter les tests par tag
npx endorphin-ai run test --tag smoke

# Générer un rapport HTML
npx endorphin-ai generate report

# Ouvrir le rapport
npx endorphin-ai open report
```

## 🔄 Rester à jour

```bash
# Vérifier la version actuelle
npx endorphin-ai --version

# Mettre à jour vers la dernière version
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ Bon testing !</strong></p>
</div>
