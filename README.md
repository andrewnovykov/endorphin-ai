# Browser Automation with JavaScript and LLM

This project uses LangChain, OpenAI, and Playwright to create an AI agent that can automate browser interactions.

## Features

- Uses GPT-4o to analyze HTML structure and determine correct selectors
- Provides tools for navigation, clicking, filling forms, and analyzing page content
- Visual browser automation with Playwright
- Includes timing and verification capabilities for reliable form filling

## How It Works

The agent has a set of tools it can use to interact with the browser:

- `navigate`: Navigate to a URL
- `getPageContent`: Get the HTML content of the current page for analysis
- `click`: Click on elements using CSS selectors with automatic waiting
- `fill`: Fill in form inputs with text, including focusing and clearing fields first
- `wait`: Pause execution for a specified amount of time
- `verifyElement`: Check if an element is visible and available for interaction

When running a task, the agent first navigates to the page, then uses `getPageContent` to analyze the HTML structure and determine the correct selectors before performing actions like clicking and filling forms.

## Usage

1. Set up your `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

2. Run the script:
   ```
   node tool.js
   ```

3. The agent will:
   - Navigate to the specified URL
   - Analyze the page structure
   - Identify and click on the login button
   - Wait for form elements to be fully visible
   - Fill in the email field with proper focusing
   - Wait between field interactions
   - Fill in the password field
   - Submit the form
