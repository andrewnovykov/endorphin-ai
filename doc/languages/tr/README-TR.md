<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## AI ile E2E Testleri Yeniden İcat Etmek
</div>

Testleri basit Türkçe ile yazın. AI'ın otomatik olarak oluşturmasına,
doğrulamasına ve düzeltmesine izin verin.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

LangChain, OpenAI GPT-4o ve Playwright ile AI destekli testleri kullanan güçlü
ve modüler bir tarayıcı otomasyon çerçevesi. Otomatik element algılama, görsel
doğrulama ve kapsamlı test yönetimi ile akıllı tarayıcı otomasyonu sağlar.

## 🎬 Demoyu İzle

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_DEMO_İZLE-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Demo İzle" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Endorphin AI'ı İş Başında Görün - Tam Rehber</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ AI'ın testlerinizi nasıl yazdığını ve çalıştırdığını görün<br />
    🔍 Gerçek zamanlı akıllı element algılamayı keşfedin<br />
    📊 Ekran görüntüleri ile güzel HTML raporları inceleyin<br />
    ⚡ Kurulumdan test çalıştırmaya 10 dakikada
  </p>
</div>

---

## 🚀 Hızlı Başlangıç

### 📦 Kurulum ve Ayarlama

30 saniyede başlayın:

```bash
# ⚡ Hızlı kurulum (önerilen)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**Veya manuel kurulum:**

```bash
# 1. Projenizi oluşturun
mkdir my-ai-tests && cd my-ai-tests

# 2. Endorphin AI'ı kurun
npm install endorphin-ai@latest --save-dev

# 3. İhtiyacınız olan her şeyle başlatın
npx endorphin-ai init
```

### 🔑 OpenAI API Anahtarınızı Ekleyin

```bash
# Oluşturulan .env dosyasını düzenleyin
echo "OPENAI_API_KEY=openai-api-anahtariniz-buraya" > .env
```

### ▶️ İlk Testinizi Çalıştırın

```bash
# Örnek sağlık kontrolü testini çalıştırın
npx endorphin-ai run test HEALTH-001

# Güzel bir HTML raporu oluşturun
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 Ana Özellikler

### 🤖 AI Destekli Test

- **Basit Türkçe ile test yazma** - Karmaşık seçiciler gereksiz
- **Akıllı element algılama** - AI otomatik olarak butonları, formları ve
  içeriği bulur
- **Kendini onarabilen testler** - UI değişikliklerine uyum sağlar ve bozulmaz
- **Akıllı hata kurtarma** - Başarısız eylemleri farklı stratejilerle otomatik
  yeniden dener

### 📊 Güzel Raporlar

- **Etkileşimli HTML raporları** - Ekran görüntüleri ve adım adım yürütme ile
- **Maliyet ve token takibi** - AI kullanımını izleyin ve giderleri optimize
  edin
- **AI karar geçmişi** - AI'ın testleri nasıl analiz ettiğini ve yürüttüğünü tam
  olarak görün
- **Gerçek zamanlı filtreleme ve arama** - Sorunları hızla bulun

### 🛠️ Geliştirici Deneyimi

- **Sıfır yapılandırma** - Anında çalışır
- **TypeScript desteği** - Tam tip tanımları ile
- **Akıllı test yapısı** - Dinamik kurulum, veri üretimi ve görev fonksiyonları
- **Dahili araç sistemi** - 12 kapsamlı otomasyon aracı dahil

## 🔧 Akıllı Test Yapısı

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Kullanıcı Giriş Testi',
  description: 'Oluşturulan kimlik bilgileri ile giriş testi',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // Test verilerini dinamik olarak oluştur
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // Test ortamını ayarla
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // Oluşturulan verileri kullanarak ana test talimatları
  task: async (data, setupData) => {
    return `
      ${setupData.baseUrl}/login adresine git
      E-posta alanını "${data.email}" ile doldur
      Şifre alanını "${data.password}" ile doldur
      Gönder butonuna tıkla
      Hoş geldin mesajının "${data.firstName}" içerdiğini doğrula
    `;
  },
};
```

## 📝 Test Dosyası Formatı

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'Temel Giriş Testi',
  description: 'Geçerli kimlik bilgileri ile giriş işlevini test et',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `Basit Türkçe ile test talimatlarınız...`,
};
```

## 🏆 Neden Endorphin AI'ı Seçmelisiniz?

| Geleneksel Test                 | Endorphin AI                      |
| ------------------------------- | --------------------------------- |
| ❌ Kırılgan CSS seçicileri      | ✅ AI elementleri akıllıca bulur  |
| ❌ UI değişikliklerinde bozulur | ✅ Kendini onarabilen testler     |
| ❌ Karmaşık kurulum             | ✅ Sıfır yapılandırma             |
| ❌ Bakımı zor                   | ✅ Basit Türkçe test açıklamaları |

## 🎮 Tam CLI Referansı

```bash
# Belirli bir testi çalıştır
npx endorphin-ai run test TEST-001

# Tüm testleri çalıştır
npx endorphin-ai run test all

# Etikete göre testleri çalıştır
npx endorphin-ai run test --tag smoke

# HTML raporu oluştur
npx endorphin-ai generate report

# Raporu aç
npx endorphin-ai open report
```

## 🔄 Güncel Kalın

```bash
# Mevcut sürümü kontrol et
npx endorphin-ai --version

# En son sürüme güncelle
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ Mutlu Test Etme!</strong></p>
</div>
