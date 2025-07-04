# Test Writing Tips

Write better tests with these simple tips.

## 🎯 Golden Rule

Write test instructions like you're explaining to a person. The AI understands natural language!

```typescript
// ✅ Good - Natural and clear
task: `
  Go to amazon.com
  Search for "wireless headphones"
  Click on the first result
  Add it to cart
  Verify the cart shows 1 item
`

// ❌ Bad - Too vague
task: 'Test shopping'
```

## 📝 Essential Actions

### Navigate to Pages
```
Go to https://example.com
Navigate to the login page
Visit https://myapp.com/dashboard
Open the website
```

### Click Things
```
Click the "Sign In" button
Click on "Submit"
Click the login link
Click Continue
```

### Fill Forms
```
Enter user@example.com in the email field
Fill password field with mypassword123
Type "John Smith" in the name field
Fill the search box with "laptops"
```

### Verify Results
```
Verify login was successful
Check if error message appears
Confirm the dashboard is visible
Make sure "Welcome" message shows up
```

### Wait for Things
```
Wait 2 seconds for page to load
Wait for the spinner to disappear
Wait until results appear
Pause for 3 seconds
```

## 💡 Writing Clear Tests

### 1. Be Specific
```typescript
// ❌ Too vague
task: 'Click the button'

// ✅ Specific
task: 'Click the "Add to Cart" button'
```

### 2. Add Waits After Actions
```typescript
// ❌ May fail - too fast
task: `
  Click Submit
  Verify success message
`

// ✅ Better - gives time to load
task: `
  Click Submit
  Wait 2 seconds
  Verify success message appears
`
```

### 3. Verify Important Steps
```typescript
// ❌ No verification
task: `
  Fill email and password
  Click login
`

// ✅ With verification
task: `
  Fill email and password
  Click login
  Verify dashboard appears
  Check username is displayed
`
```

## 🔄 Common Test Patterns

### Login Test
```typescript
task: `
  Navigate to login page
  Enter test@example.com in email field
  Enter password123 in password field
  Click "Sign In" button
  Wait 3 seconds
  Verify dashboard is visible
  Check if username appears in header
`
```

### Search Test
```typescript
task: `
  Go to homepage
  Click on search box
  Type "laptop computer"
  Press Enter or click search button
  Wait for results to load
  Verify at least 10 results appear
  Check first result contains "laptop"
`
```

### Shopping Cart Test
```typescript
task: `
  Navigate to product page
  Select size "Medium"
  Choose color "Blue"
  Click "Add to Cart"
  Wait 2 seconds
  Go to cart
  Verify item is in cart
  Check price is correct
`
```

### Form Submission Test
```typescript
task: `
  Go to contact form
  Fill name field with "John Doe"
  Fill email with john@example.com
  Fill message with "Test message"
  Click Submit
  Wait for confirmation
  Verify "Thank you" message appears
`
```

## 🚀 Advanced Tips

### Step-by-Step Format
Number your steps for clarity:

```typescript
task: `
  1. Navigate to registration page
  2. Fill username with testuser123
  3. Fill email with test@example.com
  4. Fill password with SecurePass123!
  5. Re-enter password in confirmation field
  6. Check "I agree to terms" checkbox
  7. Click "Create Account"
  8. Wait 3 seconds
  9. Verify welcome message appears
  10. Check if logged in automatically
`
```

### Handle Different Scenarios
```typescript
task: `
  Go to login page
  
  First try with wrong password:
  - Enter valid@email.com
  - Enter wrongpassword
  - Click Sign In
  - Verify error message appears
  
  Then try with correct password:
  - Clear password field
  - Enter correctpassword
  - Click Sign In
  - Verify login successful
`
```

### Use Natural Variations
The AI understands many ways to say the same thing:

```
✅ All of these work:
- Click "Submit"
- Click the Submit button
- Press Submit
- Click on the Submit button
- Hit the Submit button
```

## ⚠️ Common Mistakes

### 1. Being Too Technical
```typescript
// ❌ Too technical
task: 'Execute click event on element selector #btn-submit'

// ✅ Natural
task: 'Click the Submit button'
```

### 2. Missing Context
```typescript
// ❌ No context
task: 'Fill field with data'

// ✅ Clear context
task: 'Fill the email field with test@example.com'
```

### 3. No Error Checking
```typescript
// ❌ Assumes success
task: `
  Submit form
  Go to next page
`

// ✅ Checks for errors
task: `
  Submit form
  Wait 2 seconds
  Check if any error messages appear
  If no errors, verify next page loads
`
```

## 📸 Screenshots

Screenshots are taken automatically, but you can request them:

```
Take a screenshot
Capture the current page
Take a screenshot of the error message
Screenshot the completed form
```

## 🎯 Quick Reference

### Actions
- **Navigate**: Go to, Visit, Open, Navigate to
- **Click**: Click, Press, Hit, Select, Choose
- **Type**: Fill, Enter, Type, Input, Write
- **Wait**: Wait, Pause, Wait for, Wait until
- **Verify**: Check, Verify, Confirm, Make sure, Ensure

### Common Fields
- Email field, email input, email box
- Password field, password input
- Search box, search field, search bar
- Username field, username input
- Submit button, Sign In button, Login button

### Timing
- Wait 1 second (1000ms)
- Wait 2 seconds (2000ms)
- Wait 5 seconds (5000ms)
- Wait for [element] to appear
- Wait until [element] is visible

## 💪 Practice Makes Perfect

Start simple and build up:

1. **Start with basic navigation**: "Go to google.com"
2. **Add an action**: "Search for Endorphin AI"
3. **Add verification**: "Verify search results appear"
4. **Add timing**: "Wait 2 seconds for results to load"

---

Remember: If you can explain it to a person, the AI can do it!