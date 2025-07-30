<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## AI重新发明E2E测试
</div>

用简单的中文编写测试。让AI自动生成、验证和修复它们。

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

强大的模块化浏览器自动化框架，使用LangChain、OpenAI
GPT-4o和Playwright的AI驱动测试。提供智能浏览器自动化，具有自动元素检测、视觉验证和全面的测试管理。

## 🎬 观看演示

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_观看演示-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="观看演示" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 观看Endorphin AI实际运行 - 完整指南</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ 看AI如何编写和执行您的测试<br />
    🔍 发现实时智能元素检测<br />
    📊 探索带有屏幕截图的精美HTML报告<br />
    ⚡ 从设置到测试执行10分钟内完成
  </p>
</div>

---

## 🚀 快速开始

### 📦 安装和设置

30秒内开始：

```bash
# ⚡ 快速设置（推荐）
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**或手动设置：**

```bash
# 1. 创建您的项目
mkdir my-ai-tests && cd my-ai-tests

# 2. 安装Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. 用您需要的一切初始化
npx endorphin-ai init
```

### 🔑 添加您的OpenAI API密钥

```bash
# 编辑创建的.env文件
echo "OPENAI_API_KEY=您的openai-api密钥在这里" > .env
```

### ▶️ 运行您的第一个测试

```bash
# 运行示例健康检查测试
npx endorphin-ai run test HEALTH-001

# 生成精美的HTML报告
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 主要功能

### 🤖 AI驱动的测试

- **用简单的中文编写测试** - 不需要复杂的选择器
- **智能元素检测** - AI自动查找按钮、表单和内容
- **自我修复测试** - 适应UI变化而不会中断
- **智能错误恢复** - 用不同策略自动重试失败的操作

### 📊 精美的报告

- **交互式HTML报告** 带有屏幕截图和逐步执行
- **成本和令牌跟踪** - 监控AI使用情况并优化支出
- **AI决策历史** - 准确了解AI如何分析和执行测试
- **实时过滤和搜索** 快速找到问题

### 🛠️ 开发者体验

- **零配置** - 立即可用
- **TypeScript支持** 完整的类型定义
- **智能测试结构** - 动态设置、数据生成和任务功能
- **内置工具系统** - 包含12个综合自动化工具

## 🔧 智能测试结构

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: '用户登录测试',
  description: '使用生成的凭据进行登录测试',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // 动态生成测试数据
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // 设置测试环境
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // 使用生成数据的主要测试指令
  task: async (data, setupData) => {
    return `
      导航到${setupData.baseUrl}/login
      用"${data.email}"填充电子邮件字段
      用"${data.password}"填充密码字段
      点击提交按钮
      验证欢迎消息包含"${data.firstName}"
    `;
  },
};
```

## 📝 测试文件格式

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: '基本登录测试',
  description: '使用有效凭据测试登录功能',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `您的测试说明用简单的中文...`,
};
```

## 🏆 为什么选择Endorphin AI？

| 传统测试           | Endorphin AI        |
| ------------------ | ------------------- |
| ❌ 脆弱的CSS选择器 | ✅ AI智能查找元素   |
| ❌ UI变化时中断    | ✅ 自我修复测试     |
| ❌ 复杂设置        | ✅ 零配置           |
| ❌ 难以维护        | ✅ 简单中文测试描述 |

## 🎮 完整CLI参考

```bash
# 运行特定测试
npx endorphin-ai run test TEST-001

# 运行所有测试
npx endorphin-ai run test all

# 按标签运行测试
npx endorphin-ai run test --tag smoke

# 生成HTML报告
npx endorphin-ai generate report

# 打开报告
npx endorphin-ai open report
```

## 🔄 保持更新

```bash
# 检查当前版本
npx endorphin-ai --version

# 更新到最新版本
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ 快乐测试！</strong></p>
</div>
