# Environment Variables Guide

This guide covers all available environment variables for configuring the Endorphin AI Framework.

## Quick Setup

1. Copy the example environment file:
   ```bash
   cp examples/.env.example .env
   ```

2. Edit `.env` and set your OpenAI API key:
   ```bash
   OPENAI_API_KEY=your_actual_api_key_here
   ```

3. Customize other settings as needed

## Core Configuration (Required)

### OPENAI_API_KEY
- **Required**: Yes
- **Type**: String
- **Description**: Your OpenAI API key for AI-powered testing
- **Example**: `sk-proj-abc123...`
- **How to get**: Visit [OpenAI API Keys](https://platform.openai.com/api-keys)

### BASE_URL
- **Required**: No
- **Type**: String
- **Default**: `https://qafromla.herokuapp.com`
- **Description**: Base URL for your application under test
- **Example**: `https://my-app.com`

## Debug & Logging Configuration

### ENDORPHIN_DEBUG
- **Type**: String
- **Options**: `false`, `true`, `verbose`
- **Default**: `false`
- **Description**: Controls debug logging level
  - `false`: Standard logging only
  - `true`: Enable debug logging
  - `verbose`: Enable verbose debug with detailed information

### ENDORPHIN_LOG_LEVEL
- **Type**: String
- **Options**: `error`, `warn`, `info`, `debug`
- **Default**: `info`
- **Description**: Sets the minimum log level to display

### ENDORPHIN_CONSOLE_REPORTER
- **Type**: Boolean
- **Default**: `false`
- **Description**: Show detailed console output during test execution

## Browser Configuration

### ENDORPHIN_BROWSER_TYPE
- **Type**: String
- **Options**: `chromium`, `firefox`, `webkit`
- **Default**: `chromium`
- **Description**: Browser engine to use for testing

### ENDORPHIN_BROWSER_HEADLESS
- **Type**: Boolean
- **Default**: `true`
- **Description**: Run browser in headless mode (no GUI)

### ENDORPHIN_BROWSER_TIMEOUT
- **Type**: Number (milliseconds)
- **Default**: `30000`
- **Description**: Timeout for browser operations

### ENDORPHIN_BROWSER_WIDTH / ENDORPHIN_BROWSER_HEIGHT
- **Type**: Number (pixels)
- **Default**: `1280` / `720`
- **Description**: Browser viewport dimensions

## Test Execution Configuration

### ENDORPHIN_RUN_QUARANTINED
- **Type**: Boolean
- **Default**: `false`
- **Description**: Include quarantined tests in execution

### ENDORPHIN_PARALLEL_WORKERS
- **Type**: Number
- **Default**: `2`
- **Description**: Number of parallel workers for test execution

### ENDORPHIN_TEST_TIMEOUT
- **Type**: Number (milliseconds)
- **Default**: `60000`
- **Description**: Maximum time allowed for test execution

### ENDORPHIN_TEST_RETRIES
- **Type**: Number
- **Default**: `0`
- **Description**: Number of times to retry failed tests

## AI Configuration

### ENDORPHIN_AI_MODEL
- **Type**: String
- **Default**: `gpt-4o`
- **Description**: OpenAI model to use for AI operations
- **Options**: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo`

### ENDORPHIN_AI_TEMPERATURE
- **Type**: Number (0.0 to 2.0)
- **Default**: `0.1`
- **Description**: AI response randomness (lower = more deterministic)

### ENDORPHIN_MAX_TOKENS
- **Type**: Number
- **Default**: `4000`
- **Description**: Maximum tokens for AI responses

## Reporting Configuration

### ENDORPHIN_REPORT_FORMAT
- **Type**: String
- **Options**: `html`, `json`, `console`
- **Default**: `html`
- **Description**: Primary report format

### ENDORPHIN_SCREENSHOTS
- **Type**: Boolean
- **Default**: `true`
- **Description**: Enable screenshot capture in reports

### ENDORPHIN_VIDEO_RECORDING
- **Type**: Boolean
- **Default**: `false`
- **Description**: Enable video recording of test execution

### ENDORPHIN_MAX_REPORTS_PER_TEST
- **Type**: Number
- **Default**: `10`
- **Description**: Maximum number of reports to keep per test

## Advanced Features

### ENDORPHIN_CUSTOM_TOOLS_PATH
- **Type**: String
- **Default**: `./tools`
- **Description**: Path to custom tools directory

### ENDORPHIN_GLOBAL_SETUP_PATH
- **Type**: String
- **Default**: `./global-setup.ts`
- **Description**: Path to global setup file

### ENDORPHIN_ENABLE_DATA_GENERATION
- **Type**: Boolean
- **Default**: `true`
- **Description**: Enable AI-powered test data generation

## Performance & Optimization

### ENDORPHIN_CONTENT_OPTIMIZATION
- **Type**: Boolean
- **Default**: `true`
- **Description**: Enable content optimization features

### ENDORPHIN_TOKEN_OPTIMIZATION
- **Type**: String
- **Options**: `basic`, `advanced`
- **Default**: `basic`
- **Description**: Token usage optimization level

### ENDORPHIN_STEP_DELAY
- **Type**: Number (milliseconds)
- **Default**: `1000`
- **Description**: Delay between test actions

## Development & Testing

### ENDORPHIN_DEV_MODE
- **Type**: Boolean
- **Default**: `false`
- **Description**: Enable development mode features

### ENDORPHIN_SKIP_BROWSER_CHECK
- **Type**: Boolean
- **Default**: `false`
- **Description**: Skip browser installation verification

### ENDORPHIN_FORCE_BROWSER_INSTALL
- **Type**: Boolean
- **Default**: `false`
- **Description**: Force reinstallation of browser engines

## Common Configurations

### Development Setup
```bash
ENDORPHIN_DEBUG=verbose
ENDORPHIN_BROWSER_HEADLESS=false
ENDORPHIN_DEV_MODE=true
ENDORPHIN_STEP_DELAY=2000
```

### CI/CD Setup
```bash
ENDORPHIN_DEBUG=false
ENDORPHIN_BROWSER_HEADLESS=true
ENDORPHIN_CONSOLE_REPORTER=true
ENDORPHIN_VIDEO_RECORDING=false
ENDORPHIN_PARALLEL_WORKERS=4
```

### Performance Testing Setup
```bash
ENDORPHIN_PARALLEL_WORKERS=8
ENDORPHIN_TEST_TIMEOUT=120000
ENDORPHIN_STEP_DELAY=500
ENDORPHIN_CONTENT_OPTIMIZATION=true
```

## Troubleshooting

### Debug Issues
Set `ENDORPHIN_DEBUG=verbose` to get detailed logging information.

### Performance Issues
- Increase `ENDORPHIN_TEST_TIMEOUT` for slower environments
- Adjust `ENDORPHIN_PARALLEL_WORKERS` based on system resources
- Enable `ENDORPHIN_CONTENT_OPTIMIZATION` for better performance

### Browser Issues
- Try different `ENDORPHIN_BROWSER_TYPE` options
- Set `ENDORPHIN_BROWSER_HEADLESS=false` to see browser interactions
- Increase `ENDORPHIN_BROWSER_TIMEOUT` for slow pages

### AI Issues
- Verify `OPENAI_API_KEY` is correct
- Try different `ENDORPHIN_AI_MODEL` options
- Adjust `ENDORPHIN_AI_TEMPERATURE` for more/less deterministic responses