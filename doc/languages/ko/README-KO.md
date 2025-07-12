<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## AI로 E2E 테스트 재발명
</div>

한국어로 테스트를 작성하세요. AI가 자동으로 생성, 검증, 수정합니다.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

LangChain, OpenAI GPT-4o, Playwright를 사용한 AI 기반 테스트로 구축된 강력하고
모듈화된 브라우저 자동화 프레임워크입니다. 자동 요소 감지, 시각적 검증, 포괄적인
테스트 관리를 통한 지능형 브라우저 자동화를 제공합니다.

## 🎬 데모 보기

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_데모_보기-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="데모 보기" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Endorphin AI 실제 동작 보기 - 완전 가이드</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ AI가 테스트를 작성하고 실행하는 방법 보기<br />
    🔍 실시간 지능형 요소 감지 발견<br />
    📊 스크린샷이 포함된 아름다운 HTML 보고서 탐색<br />
    ⚡ 설정부터 테스트 실행까지 10분 안에 완료
  </p>
</div>

---

## 🚀 빠른 시작

### 📦 설치 및 설정

30초 안에 시작:

```bash
# ⚡ 빠른 설정 (권장)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**또는 수동 설정:**

```bash
# 1. 프로젝트 생성
mkdir my-ai-tests && cd my-ai-tests

# 2. Endorphin AI 설치
npm install endorphin-ai@latest --save-dev

# 3. 필요한 모든 것으로 초기화
npx endorphin-ai init
```

### 🔑 OpenAI API 키 추가

```bash
# 생성된 .env 파일 편집
echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
```

### ▶️ 첫 번째 테스트 실행

```bash
# 샘플 헬스 체크 테스트 실행
npx endorphin-ai run test HEALTH-001

# 아름다운 HTML 보고서 생성
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 주요 기능

### 🤖 AI 기반 테스트

- **간단한 한국어로 테스트 작성** - 복잡한 셀렉터 불필요
- **지능형 요소 감지** - AI가 자동으로 버튼, 폼, 콘텐츠를 찾음
- **자가 치유 테스트** - UI 변경에 적응하여 깨지지 않음
- **스마트 오류 복구** - 다른 전략으로 실패한 액션을 자동으로 재시도

### 📊 아름다운 보고서

- **대화형 HTML 보고서** - 스크린샷과 단계별 실행 포함
- **비용 및 토큰 추적** - AI 사용량을 모니터링하고 비용 최적화
- **AI 결정 히스토리** - AI가 테스트를 분석하고 실행하는 과정을 정확히 확인
- **실시간 필터링 및 검색** - 문제를 빠르게 찾기

### 🛠️ 개발자 경험

- **제로 구성** - 즉시 작동
- **TypeScript 지원** - 완전한 타입 정의 제공
- **스마트 테스트 구조** - 동적 설정, 데이터 생성, 태스크 함수
- **내장 도구 시스템** - 12개의 포괄적인 자동화 도구 포함

## 🔧 스마트 테스트 구조

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: '사용자 로그인 테스트',
  description: '생성된 자격 증명으로 로그인 테스트',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // 테스트 데이터를 동적으로 생성
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // 테스트 환경 설정
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // 생성된 데이터를 사용한 메인 테스트 지시사항
  task: async (data, setupData) => {
    return `
      ${setupData.baseUrl}/login으로 이동
      이메일 필드에 "${data.email}" 입력
      비밀번호 필드에 "${data.password}" 입력
      Submit 버튼 클릭
      환영 메시지에 "${data.firstName}" 포함되어 있는지 확인
    `;
  },
};
```

## 📝 테스트 파일 형식

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: '기본 로그인 테스트',
  description: '유효한 자격 증명으로 로그인 기능 테스트',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `간단한 한국어로 테스트 지시사항...`,
};
```

## 🏆 왜 Endorphin AI를 선택해야 할까요?

| 기존 테스트               | Endorphin AI                   |
| ------------------------- | ------------------------------ |
| ❌ 깨지기 쉬운 CSS 셀렉터 | ✅ AI가 지능적으로 요소를 찾음 |
| ❌ UI 변경 시 테스트 실패 | ✅ 자가 치유 테스트            |
| ❌ 복잡한 설정            | ✅ 제로 구성                   |
| ❌ 유지보수 어려움        | ✅ 간단한 한국어 테스트 설명   |

## 🎮 완전한 CLI 참조

```bash
# 특정 테스트 실행
npx endorphin run test TEST-001

# 모든 테스트 실행
npx endorphin run test all

# 태그로 테스트 실행
npx endorphin run test --tag smoke

# HTML 보고서 생성
npx endorphin generate report

# 보고서 열기
npx endorphin open report
```

## 🔄 최신 상태 유지

```bash
# 현재 버전 확인
npx endorphin-ai --version

# 최신 버전으로 업데이트
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ 행복한 테스팅!</strong></p>
</div>
