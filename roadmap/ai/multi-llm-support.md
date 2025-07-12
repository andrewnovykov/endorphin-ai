# Multi-LLM Provider Support Roadmap

## Overview

This document outlines the plan to add support for multiple LLM providers (OpenAI, Google Gemini, Anthropic, etc.) to the Endorphin AI framework. The implementation will allow users to configure their preferred LLM provider through both configuration files and CLI flags.

## Current State

The framework currently has hardcoded dependency on OpenAI:
- Model: GPT-4o (default)
- Configuration: `OPENAI_API_KEY` environment variable
- Implementation: Direct instantiation of `ChatOpenAI` in multiple places

## Proposed Architecture

### 1. Configuration Structure

#### In `endorphin.config.ts`:
```typescript
export default {
  ai: {
    provider: 'openai', // or 'gemini', 'anthropic', 'azure', 'local'
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4096,
    },
    gemini: {
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini-pro',
      maxOutputTokens: 2048,
      temperature: 0.7,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-opus',
      maxTokens: 4096,
    },
    // Future providers...
  },
  // Existing config...
}
```

### 2. CLI Flags Support

```bash
# Use specific provider
endorphin run test TEST-001 --provider gemini --model gemini-pro

# Override temperature
endorphin run test TEST-001 --provider openai --temperature 0.3

# Use API key from CLI (useful for CI/CD)
endorphin run test TEST-001 --provider gemini --api-key "your-key-here"

# Full example with all options
endorphin run test TEST-001 \
  --provider anthropic \
  --model claude-3-opus \
  --api-key $ANTHROPIC_API_KEY \
  --temperature 0.5 \
  --max-tokens 8192
```

### 3. Configuration Priority System

Priority order (highest to lowest):
1. **CLI flags** - Override everything
2. **Config file** (endorphin.config.ts)
3. **Environment variables**
4. **Default values**

Example:
```typescript
// Priority resolution
const provider = 
  cliArgs.provider ||                    // 1. CLI flag
  config.ai?.provider ||                  // 2. Config file
  process.env.ENDORPHIN_AI_PROVIDER ||    // 3. Env var
  'openai';                               // 4. Default
```

### 4. Provider Factory Pattern

```typescript
// framework/ai/providers/types.ts
interface ProviderConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

interface LLMProvider {
  name: string;
  createModel(config: ProviderConfig): BaseChatModel;
  validateConfig(config: ProviderConfig): void;
  getDefaultModel(): string;
  getPricing(): { input: number; output: number };
}

// framework/ai/providers/provider-factory.ts
class ProviderFactory {
  private static providers = new Map<string, LLMProvider>();

  static register(provider: LLMProvider) {
    this.providers.set(provider.name, provider);
  }

  static getProvider(name: string): LLMProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Unknown provider: ${name}`);
    }
    return provider;
  }

  static listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Register providers
ProviderFactory.register(new OpenAIProvider());
ProviderFactory.register(new GeminiProvider());
ProviderFactory.register(new AnthropicProvider());
```

### 5. Provider Implementations

```typescript
// framework/ai/providers/openai-provider.ts
class OpenAIProvider implements LLMProvider {
  name = 'openai';

  createModel(config: ProviderConfig): BaseChatModel {
    return new ChatOpenAI({
      openAIApiKey: config.apiKey,
      modelName: config.model || 'gpt-4o',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens,
    });
  }

  validateConfig(config: ProviderConfig): void {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
  }

  getDefaultModel(): string {
    return 'gpt-4o';
  }

  getPricing() {
    return { input: 0.005, output: 0.015 }; // per 1K tokens
  }
}

// framework/ai/providers/gemini-provider.ts
class GeminiProvider implements LLMProvider {
  name = 'gemini';

  createModel(config: ProviderConfig): BaseChatModel {
    return new ChatGoogleGenerativeAI({
      apiKey: config.apiKey,
      model: config.model || 'gemini-pro',
      maxOutputTokens: config.maxTokens || 2048,
      temperature: config.temperature || 0.7,
    });
  }

  validateConfig(config: ProviderConfig): void {
    if (!config.apiKey) {
      throw new Error('Google API key is required');
    }
  }

  getDefaultModel(): string {
    return 'gemini-pro';
  }

  getPricing() {
    return { input: 0.00025, output: 0.0005 }; // per 1K tokens
  }
}
```

### 6. Updated Agent Setup

```typescript
// framework/ai/agent-setup.ts
export async function setupAgent(
  tools: BrowserTool[],
  options: AgentOptions = {}
): Promise<any> {
  // Get provider from options or config
  const providerName = options.provider || AGENT_CONFIG.ai.provider || 'openai';
  const provider = ProviderFactory.getProvider(providerName);
  
  // Merge configurations
  const providerConfig = {
    ...AGENT_CONFIG.ai[providerName],
    ...options.providerConfig,
  };
  
  // Validate and create model
  provider.validateConfig(providerConfig);
  const model = provider.createModel(providerConfig).bindTools(tools);
  
  // Create agent with the model
  const agent = createReactAgent({
    llm: model,
    tools,
    checkpointer: new MemorySaver(),
  });
  
  return agent;
}
```

### 7. Token Tracking Updates

```typescript
// framework/core/token-tracker.ts
class TokenTracker {
  constructor(
    private provider: string,
    private model: string,
    private customPricing?: PricingConfig
  ) {
    this.initializePricing();
  }

  private initializePricing() {
    if (this.customPricing?.[this.model]) {
      this.pricing = this.customPricing[this.model];
    } else {
      // Get default pricing from provider
      const provider = ProviderFactory.getProvider(this.provider);
      this.pricing = provider.getPricing();
    }
  }
}
```

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Update type definitions for multi-provider support
- [ ] Create provider interface and base classes
- [ ] Implement provider factory pattern
- [ ] Update configuration types

### Phase 2: Provider Implementations (Week 2)
- [ ] Implement OpenAI provider (refactor existing)
- [ ] Implement Gemini provider
- [ ] Implement Anthropic provider (optional)
- [ ] Add provider validation and error handling

### Phase 3: CLI Integration (Week 3)
- [ ] Add CLI flags for provider selection
- [ ] Implement configuration priority system
- [ ] Update help documentation
- [ ] Add provider listing command

### Phase 4: Testing & Documentation (Week 4)
- [ ] Unit tests for each provider
- [ ] Integration tests for provider switching
- [ ] Update user documentation
- [ ] Add example configurations

## Benefits

1. **Flexibility**: Users can choose their preferred LLM provider
2. **Cost Optimization**: Switch between providers based on cost/performance needs
3. **Redundancy**: Fallback to different providers if one is down
4. **CI/CD Friendly**: Easy to configure via environment variables or CLI
5. **Future-proof**: Simple to add new providers as they become available

## Considerations

1. **Backward Compatibility**: Ensure existing configurations continue to work
2. **Error Handling**: Clear error messages for missing API keys or invalid providers
3. **Token Counting**: Different providers may report tokens differently
4. **Feature Parity**: Not all providers support all features (e.g., function calling)

## Dependencies to Add

```json
{
  "dependencies": {
    "@langchain/google-genai": "^0.0.x",
    "@langchain/anthropic": "^0.0.x"
    // Keep existing @langchain/openai
  }
}
```

## Migration Guide

For existing users, the migration will be seamless:

```typescript
// Old config (still works)
export default {
  // Uses OpenAI by default
}

// New config (opt-in to other providers)
export default {
  ai: {
    provider: 'gemini',
    gemini: {
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini-pro',
    }
  }
}
```

## Future Enhancements

1. **Provider Chaining**: Use multiple providers in sequence or parallel
2. **Smart Routing**: Route different types of tasks to different providers
3. **Local Models**: Support for Ollama, llama.cpp, etc.
4. **Azure OpenAI**: Special handling for Azure-hosted models
5. **Cost Tracking**: Per-provider cost tracking and reporting