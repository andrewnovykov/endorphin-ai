<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## Testes E2E reinventados com IA
</div>

Escreva testes em português simples. Deixe a IA gerá-los, validá-los e
corrigi-los automaticamente.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

Um framework de automação de navegador poderoso e modular usando testes
alimentados por IA com LangChain, OpenAI GPT-4o e Playwright. Fornece automação
de navegador inteligente com detecção automática de elementos, validação visual
e gestão completa de testes.

## 🎬 Assistir demo

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_ASSISTIR_DEMO-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Assistir demo" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Descubra Endorphin AI em ação - Guia completo</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ Veja como a IA escreve e executa seus testes<br />
    🔍 Descubra detecção inteligente de elementos em tempo real<br />
    📊 Explore lindos relatórios HTML com capturas de tela<br />
    ⚡ Da configuração à execução de testes em 10 minutos
  </p>
</div>

---

## 🚀 Início rápido

### 📦 Instalação e configuração

Comece em menos de 30 segundos:

```bash
# ⚡ Configuração rápida (recomendada)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**Ou configuração manual:**

```bash
# 1. Crie seu projeto
mkdir my-ai-tests && cd my-ai-tests

# 2. Instale Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. Inicialize com tudo que você precisa
npx endorphin-ai init
```

### 🔑 Adicione sua chave API OpenAI

```bash
# Edite o arquivo .env que foi criado
echo "OPENAI_API_KEY=sua-chave-api-openai-aqui" > .env
```

### ▶️ Execute seu primeiro teste

```bash
# Execute o teste de verificação de saúde de exemplo
npx endorphin-ai run test HEALTH-001

# Gere um lindo relatório HTML
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 Características principais

### 🤖 Testes alimentados por IA

- **Escreva testes em português simples** - Nenhum seletor complexo necessário
- **Detecção inteligente de elementos** - A IA encontra automaticamente botões,
  formulários e conteúdo
- **Testes auto-reparadores** - Adapta-se a mudanças de UI sem quebrar
- **Recuperação inteligente de erros** - Retenta automaticamente ações falhadas
  com estratégias diferentes

### 📊 Relatórios lindos

- **Relatórios HTML interativos** com capturas de tela e execução passo a passo
- **Rastreamento de custos e tokens** - Monitore o uso da IA e otimize gastos
- **Histórico de decisões da IA** - Veja exatamente como a IA analisa e executa
  testes
- **Filtro e busca em tempo real** para encontrar problemas rapidamente

### 🛠️ Experiência do desenvolvedor

- **Configuração zero** - Funciona imediatamente
- **Suporte TypeScript** com definições de tipos completas
- **Estrutura de teste inteligente** - Configuração dinâmica, geração de dados e
  funções de tarefas
- **Sistema de ferramentas integrado** - 12 ferramentas de automação completas
  incluídas

## 🔧 Estrutura de teste inteligente

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Teste de login de usuário',
  description: 'Teste de login com credenciais geradas',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // Gerar dados de teste dinamicamente
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // Configurar ambiente de teste
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // Instruções principais do teste usando dados gerados
  task: async (data, setupData) => {
    return `
      Navegar para ${setupData.baseUrl}/login
      Preencher email com "${data.email}"
      Preencher senha com "${data.password}"
      Clicar no botão Submit
      Verificar que a mensagem de boas-vindas contém "${data.firstName}"
    `;
  },
};
```

## 📝 Formato de arquivo de teste

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'Teste de login básico',
  description: 'Testa a funcionalidade de login com credenciais válidas',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `Suas instruções de teste em português simples...`,
};
```

## 🏆 Por que escolher Endorphin AI?

| Testes tradicionais          | Endorphin AI                                |
| ---------------------------- | ------------------------------------------- |
| ❌ Seletores CSS frágeis     | ✅ IA encontra elementos inteligentemente   |
| ❌ Quebra com mudanças de UI | ✅ Testes auto-reparadores                  |
| ❌ Configuração complexa     | ✅ Configuração zero                        |
| ❌ Difícil de manter         | ✅ Descrições de teste em português simples |

## 🎮 Referência CLI completa

```bash
# Executar um teste específico
npx endorphin run test TEST-001

# Executar todos os testes
npx endorphin run test all

# Executar testes por tag
npx endorphin run test --tag smoke

# Gerar relatório HTML
npx endorphin generate report

# Abrir relatório
npx endorphin open report
```

## 🔄 Manter-se atualizado

```bash
# Verificar versão atual
npx endorphin-ai --version

# Atualizar para a versão mais recente
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ Bom testing!</strong></p>
</div>
