<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## AIでE2Eテストを再発明
</div>

日本語でテストを書きます。AIに自動生成、検証、修正を任せましょう。

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

LangChain、OpenAI
GPT-4o、Playwrightを使ったAI駆動テストによる強力でモジュラーなブラウザ自動化フレームワーク。自動要素検出、視覚的検証、包括的なテスト管理を備えたインテリジェントなブラウザ自動化を提供します。

## 🎬 デモを見る

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_デモを見る-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="デモを見る" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Endorphin AIの動作を見る - 完全ガイド</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ AIがあなたのテストを書いて実行する様子を見る<br />
    🔍 リアルタイムでのインテリジェントな要素検出を発見<br />
    📊 スクリーンショット付きの美しいHTMLレポートを探る<br />
    ⚡ セットアップからテスト実行まで10分で完了
  </p>
</div>

---

## 🚀 クイックスタート

### 📦 インストールとセットアップ

30秒以内に開始：

```bash
# ⚡ クイックセットアップ（推奨）
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**または手動セットアップ：**

```bash
# 1. プロジェクトを作成
mkdir my-ai-tests && cd my-ai-tests

# 2. Endorphin AIをインストール
npm install endorphin-ai@latest --save-dev

# 3. 必要なものすべてで初期化
npx endorphin-ai init
```

### 🔑 OpenAI APIキーを追加

```bash
# 作成された.envファイルを編集
echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
```

### ▶️ 最初のテストを実行

```bash
# サンプルヘルスチェックテストを実行
npx endorphin-ai run test HEALTH-001

# 美しいHTMLレポートを生成
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 主要機能

### 🤖 AI駆動テスト

- **シンプルな日本語でテストを書く** - 複雑なセレクタは不要
- **インテリジェント要素検出** -
  AIが自動的にボタン、フォーム、コンテンツを見つける
- **自己修復テスト** - UIの変更に適応し、壊れない
- **スマートエラー回復** - 異なる戦略で失敗したアクションを自動的に再試行

### 📊 美しいレポート

- **インタラクティブなHTMLレポート** - スクリーンショットとステップバイステップの実行
- **コストとトークン追跡** - AI使用量を監視し、コストを最適化
- **AI決定履歴** - AIがテストを分析し実行する過程を正確に確認
- **リアルタイム絞り込みと検索** - 問題を素早く発見

### 🛠️ 開発者体験

- **ゼロ設定** - すぐに動作
- **TypeScriptサポート** - 完全な型定義付き
- **スマートテスト構造** - 動的セットアップ、データ生成、タスク関数
- **組み込みツールシステム** - 12の包括的自動化ツールを含む

## 🔧 スマートテスト構造

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'ユーザーログインテスト',
  description: '生成された認証情報でのログインテスト',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // テストデータを動的に生成
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // テスト環境をセットアップ
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // 生成されたデータを使用したメインテスト指示
  task: async (data, setupData) => {
    return `
      ${setupData.baseUrl}/loginに移動
      メールフィールドに"${data.email}"を入力
      パスワードフィールドに"${data.password}"を入力
      送信ボタンをクリック
      ウェルカムメッセージに"${data.firstName}"が含まれることを確認
    `;
  },
};
```

## 📝 テストファイル形式

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: '基本ログインテスト',
  description: '有効な認証情報でのログイン機能をテスト',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `シンプルな日本語でのテスト指示...`,
};
```

## 🏆 なぜEndorphin AIを選ぶのか？

| 従来のテスト         | Endorphin AI                            |
| -------------------- | --------------------------------------- |
| ❌ 脆弱なCSSセレクタ | ✅ AIがインテリジェントに要素を見つける |
| ❌ UI変更で壊れる    | ✅ 自己修復テスト                       |
| ❌ 複雑な設定        | ✅ ゼロ設定                             |
| ❌ 保守困難          | ✅ シンプルな日本語でのテスト記述       |

## 🎮 完全なCLIリファレンス

```bash
# 特定のテストを実行
npx endorphin run test TEST-001

# すべてのテストを実行
npx endorphin run test all

# タグでテストを実行
npx endorphin run test --tag smoke

# HTMLレポートを生成
npx endorphin generate report

# レポートを開く
npx endorphin open report
```

## 🔄 最新状態を保つ

```bash
# 現在のバージョンを確認
npx endorphin-ai --version

# 最新バージョンに更新
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ ハッピーテスティング！</strong></p>
</div>
