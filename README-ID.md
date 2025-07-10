<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## Pengujian E2E Diciptakan Ulang dengan AI
</div>

Tulis tes dalam bahasa Indonesia yang sederhana. Biarkan AI menghasilkan,
memvalidasi, dan memperbaikinya secara otomatis.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

Framework otomasi browser yang kuat dan modular menggunakan pengujian bertenaga
AI dengan LangChain, OpenAI GPT-4o, dan Playwright. Memberikan otomasi browser
cerdas dengan deteksi elemen otomatis, validasi visual, dan manajemen tes yang
komprehensif.

## 🎬 Tonton Demo

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_TONTON_DEMO-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Tonton Demo" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Lihat Endorphin AI Beraksi - Panduan Lengkap</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ Lihat bagaimana AI menulis dan menjalankan tes Anda<br />
    🔍 Temukan deteksi elemen cerdas secara real-time<br />
    📊 Jelajahi laporan HTML yang indah dengan screenshot<br />
    ⚡ Dari setup hingga eksekusi tes dalam 10 menit
  </p>
</div>

---

## 🚀 Mulai Cepat

### 📦 Instalasi & Setup

Mulai dalam waktu kurang dari 30 detik:

```bash
# ⚡ Setup cepat (direkomendasikan)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**Atau setup manual:**

```bash
# 1. Buat proyek Anda
mkdir my-ai-tests && cd my-ai-tests

# 2. Install Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. Inisialisasi dengan semua yang Anda butuhkan
npx endorphin-ai init
```

### 🔑 Tambahkan Kunci API OpenAI Anda

```bash
# Edit file .env yang dibuat
echo "OPENAI_API_KEY=kunci-api-openai-anda-di-sini" > .env
```

### ▶️ Jalankan Tes Pertama Anda

```bash
# Jalankan tes pemeriksaan kesehatan contoh
npx endorphin-ai run test HEALTH-001

# Buat laporan HTML yang indah
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 Fitur Utama

### 🤖 Pengujian Bertenaga AI

- **Tulis tes dalam bahasa Indonesia sederhana** - Tidak perlu selector kompleks
- **Deteksi elemen cerdas** - AI secara otomatis menemukan tombol, form, dan
  konten
- **Tes yang dapat memperbaiki diri** - Beradaptasi dengan perubahan UI tanpa
  rusak
- **Pemulihan kesalahan cerdas** - Secara otomatis mencoba ulang aksi yang gagal
  dengan strategi berbeda

### 📊 Laporan Indah

- **Laporan HTML interaktif** dengan screenshot dan eksekusi langkah demi
  langkah
- **Pelacakan biaya dan token** - Pantau penggunaan AI dan optimalkan
  pengeluaran
- **Riwayat keputusan AI** - Lihat persis bagaimana AI menganalisis dan
  menjalankan tes
- **Penyaringan dan pencarian real-time** untuk menemukan masalah dengan cepat

### 🛠️ Pengalaman Developer

- **Konfigurasi nol** - Bekerja langsung
- **Dukungan TypeScript** dengan definisi tipe lengkap
- **Struktur tes cerdas** - Setup dinamis, generasi data, dan fungsi tugas
- **Sistem alat built-in** - 12 alat otomasi komprehensif disertakan

## 🔧 Struktur Tes Cerdas

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Tes Login Pengguna',
  description: 'Tes login dengan kredensial yang dihasilkan',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // Hasilkan data tes secara dinamis
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // Setup lingkungan tes
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // Instruksi tes utama menggunakan data yang dihasilkan
  task: async (data, setupData) => {
    return `
      Navigasi ke ${setupData.baseUrl}/login
      Isi field email dengan "${data.email}"
      Isi field password dengan "${data.password}"
      Klik tombol Submit
      Verifikasi pesan selamat datang berisi "${data.firstName}"
    `;
  },
};
```

## 📝 Format File Tes

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'Tes Login Dasar',
  description: 'Tes fungsi login dengan kredensial yang valid',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `Instruksi tes Anda dalam bahasa Indonesia sederhana...`,
};
```

## 🏆 Mengapa Memilih Endorphin AI?

| Pengujian Tradisional        | Endorphin AI                                      |
| ---------------------------- | ------------------------------------------------- |
| ❌ Selector CSS yang rapuh   | ✅ AI menemukan elemen secara cerdas              |
| ❌ Rusak dengan perubahan UI | ✅ Tes yang dapat memperbaiki diri                |
| ❌ Setup kompleks            | ✅ Konfigurasi nol                                |
| ❌ Sulit dipelihara          | ✅ Deskripsi tes dalam bahasa Indonesia sederhana |

## 🎮 Referensi CLI Lengkap

```bash
# Jalankan tes tertentu
npx endorphin run test TEST-001

# Jalankan semua tes
npx endorphin run test all

# Jalankan tes berdasarkan tag
npx endorphin run test --tag smoke

# Buat laporan HTML
npx endorphin generate report

# Buka laporan
npx endorphin open report
```

## 🔄 Tetap Terkini

```bash
# Cek versi saat ini
npx endorphin-ai --version

# Update ke versi terbaru
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ Selamat Testing!</strong></p>
</div>
