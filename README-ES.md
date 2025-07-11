<div align="center">
  <img src="./doc/images/endorphin-ai-logo-no-bg.png" alt="Endorphin Logo" width="200" />
  
  # 💜 ENDORPHIN
  
  ## Pruebas E2E reinventadas con IA
</div>

Escribe pruebas en español simple. Deja que la IA las genere, valide y corrija
automáticamente.

<div align="center">
  <img src="./doc/images/playwright-logo.png" alt="Playwright" height="30" />
  &nbsp;&nbsp;&nbsp;<strong>+</strong>&nbsp;&nbsp;&nbsp;
  <img src="./doc/images/langchain-logo.png" alt="LangChain" height="30" />
</div>

Un framework de automatización de navegador potente y modular que utiliza
pruebas impulsadas por IA con LangChain, OpenAI GPT-4o y Playwright. Proporciona
automatización de navegador inteligente con detección automática de elementos,
validación visual y gestión completa de pruebas.

## 🎬 Ver demo

<div align="center">
  <a href="https://youtu.be/ev_71RBO6g8?si=F9xTPSJNp36Mr1wx" target="_blank">
    <img src="https://img.shields.io/badge/🎬_VER_DEMO-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&scale=1.5" alt="Ver demo" style="transform: scale(1.5); margin: 20px 0;" width="300" />
  </a>
  <br />
  <p style="font-size: 18px; font-weight: bold; margin: 15px 0;">🎯 Descubre Endorphin AI en acción - Guía completa</p>
  <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
    ✨ Mira cómo la IA escribe y ejecuta tus pruebas<br />
    🔍 Descubre la detección inteligente de elementos en tiempo real<br />
    📊 Explora hermosos reportes HTML con capturas de pantalla<br />
    ⚡ De la configuración a la ejecución de pruebas en 10 minutos
  </p>
</div>

---

## 🚀 Inicio rápido

### 📦 Instalación y configuración

Comienza en menos de 30 segundos:

```bash
# ⚡ Configuración rápida (recomendada)
npx create-endorphin-ai@latest my-ai-tests
cd my-ai-tests
```

**O configuración manual:**

```bash
# 1. Crea tu proyecto
mkdir my-ai-tests && cd my-ai-tests

# 2. Instala Endorphin AI
npm install endorphin-ai@latest --save-dev

# 3. Inicializa con todo lo que necesitas
npx endorphin-ai init
```

### 🔑 Agrega tu clave API de OpenAI

```bash
# Edita el archivo .env que fue creado
echo "OPENAI_API_KEY=tu-clave-api-openai-aqui" > .env
```

### ▶️ Ejecuta tu primera prueba

```bash
# Ejecuta la prueba de verificación de salud de ejemplo
npx endorphin-ai run test HEALTH-001

# Genera un hermoso reporte HTML
npx endorphin-ai generate report && npx endorphin-ai open report
```

## 🎯 Características principales

### 🤖 Pruebas impulsadas por IA

- **Escribe pruebas en español simple** - No se necesitan selectores complejos
- **Detección inteligente de elementos** - La IA encuentra automáticamente
  botones, formularios y contenido
- **Pruebas auto-reparadoras** - Se adapta a cambios de UI sin romperse
- **Recuperación inteligente de errores** - Reintenta automáticamente acciones
  fallidas con diferentes estrategias

### 📊 Reportes hermosos

- **Reportes HTML interactivos** con capturas de pantalla y ejecución paso a
  paso
- **Seguimiento de costos y tokens** - Monitorea el uso de IA y optimiza gastos
- **Historial de decisiones de IA** - Ve exactamente cómo la IA analiza y
  ejecuta pruebas
- **Filtrado y búsqueda en tiempo real** para encontrar problemas rápidamente

### 🛠️ Experiencia del desarrollador

- **Configuración cero** - Funciona inmediatamente
- **Soporte TypeScript** con definiciones de tipos completas
- **Estructura de prueba inteligente** - Configuración dinámica, generación de
  datos y funciones de tareas
- **Sistema de herramientas incorporado** - 12 herramientas de automatización
  completas incluidas

## 🔧 Estructura de prueba inteligente

```typescript
import type { TestCase } from 'endorphin-ai';

export const SMART_TEST: TestCase = {
  id: 'LOGIN-001',
  name: 'Prueba de inicio de sesión de usuario',
  description: 'Prueba de inicio de sesión con credenciales generadas',
  priority: 'High',
  tags: ['auth', 'smoke'],

  // Generar datos de prueba dinámicamente
  data: async () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  },

  // Configurar entorno de prueba
  setup: async () => {
    return {
      baseUrl: process.env.TEST_URL || 'https://example.com',
      startTime: new Date().toISOString(),
    };
  },

  // Instrucciones principales de prueba usando datos generados
  task: async (data, setupData) => {
    return `
      Navegar a ${setupData.baseUrl}/login
      Llenar email con "${data.email}"
      Llenar contraseña con "${data.password}"
      Hacer clic en el botón Submit
      Verificar que el mensaje de bienvenida contenga "${data.firstName}"
    `;
  },
};
```

## 📝 Formato de archivo de prueba

```typescript
import type { TestCase } from 'endorphin-ai';

export const QE001: TestCase = {
  id: 'QE-001',
  name: 'Prueba de inicio de sesión básica',
  description:
    'Prueba la funcionalidad de inicio de sesión con credenciales válidas',
  priority: 'High',
  tags: ['authentication', 'login', 'smoke'],
  site: 'https://example.com/',
  data: async () => {
    return {
      email: 'test@example.com',
      password: 'password123',
    };
  },
  task: `Tus instrucciones de prueba en español simple...`,
};
```

## 🏆 ¿Por qué elegir Endorphin AI?

| Pruebas tradicionales         | Endorphin AI                                  |
| ----------------------------- | --------------------------------------------- |
| ❌ Selectores CSS frágiles    | ✅ La IA encuentra elementos inteligentemente |
| ❌ Se rompe con cambios de UI | ✅ Pruebas auto-reparadoras                   |
| ❌ Configuración compleja     | ✅ Configuración cero                         |
| ❌ Difícil de mantener        | ✅ Descripciones de pruebas en español simple |

## 🎮 Referencia CLI completa

```bash
# Ejecutar una prueba específica
npx endorphin run test TEST-001

# Ejecutar todas las pruebas
npx endorphin run test all

# Ejecutar pruebas por etiqueta
npx endorphin run test --tag smoke

# Generar reporte HTML
npx endorphin generate report

# Abrir reporte
npx endorphin open report
```

## 🔄 Mantenerse actualizado

```bash
# Verificar versión actual
npx endorphin-ai --version

# Actualizar a la última versión
npm update endorphin-ai
```

---

<div align="center">
  <p><strong>⚡ ¡Feliz testing!</strong></p>
</div>
