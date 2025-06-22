# Endorphin AI Test Project

Welcome to your Endorphin AI test project! 🎉

## 🚀 Quick Start

### 1. Configure API Key
Edit `.env` file and add your OpenAI API key:
```bash
OPENAI_API_KEY=your_actual_api_key_here
```

Get your API key from: https://platform.openai.com/api-keys

### 2. Run Example Test
```bash
npx endorphin run test HEALTH-001
```

### 3. Record Your Own Test
```bash
npx endorphin run test-recorder
```

### 4. List All Tests
```bash
npx endorphin list
```

## 📁 Project Structure
```
├── .env                    # Environment variables
├── endorphin.config.js     # Framework configuration
├── tests/                  # Your test files
│   └── sample-test.js      # Sample test
├── test-results/          # Test execution results
└── test-recorder/         # Recorded test artifacts
```

## 📚 Learn More
- [User Guide](https://github.com/andrewnovykov/endorphin-ai/blob/main/doc/user-guide/)
- [Test Recorder Guide](https://github.com/andrewnovykov/endorphin-ai/blob/main/doc/user-guide/Test-Recorder.md)
- [Configuration Reference](https://github.com/andrewnovykov/endorphin-ai#configuration)

Happy Testing! 🧪
