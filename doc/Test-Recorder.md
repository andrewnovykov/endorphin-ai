# Start the recorder
npm run test-recorder

# Interactive session example:
Test ID: QE-LOGIN-001
Test Name: User Login Test
Test Description: Test user login functionality
Priority: High
Tags: authentication, login
Site URL: https://myapp.com

# Then the browser opens and you can give commands like:
🎬 Next step: click login button
🎬 Next step: fill email field with test@example.com
🎬 Next step: click submit button
🎬 Next step: done

# Creates artifacts in:
test-recorder/QE-LOGIN-001-[timestamp]/
├── test-session.json
├── summary.json
└── steps/
    ├── 001-navigate-to-site/
    │   ├── step-info.json
    │   ├── before.png
    │   └── after.png
    ├── 002-click-login-button/
    └── 003-fill-email-field/

# Generated test file:
tests/qe-login-001-recorded-test.js