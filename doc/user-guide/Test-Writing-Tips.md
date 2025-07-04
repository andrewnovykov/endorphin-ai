_Last Updated: July 4, 2025 - v0.9.0_
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

## 🏢 Enterprise Application Testing

### User Management System
```typescript
export const USER_ADMIN_TEST: TestCase = {
  id: 'ADMIN-001',
  name: 'Create User in Enterprise System',
  
  data: async () => ({
    employeeId: `EMP${Date.now()}`,
    firstName: 'Jane',
    lastName: 'Smith',
    department: 'Engineering',
    role: 'Senior Developer',
    email: `jane.smith${Date.now()}@company.com`
  }),
  
  task: async (data) => `
    Navigate to admin dashboard
    Click "User Management" in sidebar
    Click "Add New User" button
    
    Fill employee ID with "${data.employeeId}"
    Fill first name with "${data.firstName}"
    Fill last name with "${data.lastName}"
    Select department "${data.department}" from dropdown
    Select role "${data.role}" from dropdown
    Fill email with "${data.email}"
    
    Click "Save User"
    Wait 3 seconds for user creation
    
    Search for user "${data.firstName} ${data.lastName}"
    Verify user appears in results
    Verify all details are correct
    
    Take screenshot of user profile
  `
};
```

### Complex Workflow Testing
```typescript
export const APPROVAL_WORKFLOW: TestCase = {
  id: 'WORKFLOW-001',
  name: 'Multi-Step Approval Process',
  
  setup: async () => ({
    requestId: `REQ-${Date.now()}`,
    approverEmail: 'manager@company.com'
  }),
  
  task: async (data, setup) => `
    # Step 1: Submit Request
    Go to expense requests page
    Click "New Request"
    Fill amount with "2500.00"
    Select category "Travel"
    Fill description with "Business trip to client site"
    Upload receipt (use test file)
    Click "Submit for Approval"
    Wait 2 seconds
    
    # Step 2: Verify Email Notification
    Check that confirmation shows request ${setup.requestId}
    Verify status shows "Pending Approval"
    
    # Step 3: Manager Approval
    Logout current user
    Login as ${setup.approverEmail}
    Go to approvals dashboard
    Find request ${setup.requestId}
    Click "Review"
    Verify all details are correct
    Add approval comment "Approved for business travel"
    Click "Approve"
    
    # Step 4: Verify Final Status
    Verify status changed to "Approved"
    Take screenshot of approved request
  `
};
```

## 🌐 Small Web App Testing

### Blog Website Testing
```typescript
export const BLOG_POST_TEST: TestCase = {
  id: 'BLOG-001',
  name: 'Create and Publish Blog Post',
  
  data: async () => ({
    title: `Test Post ${Date.now()}`,
    content: 'This is a test blog post created by automated testing.',
    tags: ['testing', 'automation', 'endorphin']
  }),
  
  task: async (data) => `
    Go to blog admin area
    Login with test credentials
    
    Click "New Post"
    Fill title with "${data.title}"
    
    Click in content editor
    Type the blog content: "${data.content}"
    
    Add tags: ${data.tags.join(', ')}
    
    Click "Preview" to see how it looks
    Verify preview shows correct title and content
    
    Go back to editor
    Click "Publish"
    
    Go to public blog page
    Verify new post appears in list
    Click on the post
    Verify content displays correctly
  `
};
```

### E-commerce Store Testing
```typescript
export const SMALL_SHOP_TEST: TestCase = {
  id: 'SHOP-001',
  name: 'Complete Purchase Flow',
  
  data: async () => ({
    product: 'Handmade Ceramic Mug',
    quantity: 2,
    customerEmail: `customer${Date.now()}@gmail.com`,
    customerName: 'Test Customer'
  }),
  
  task: async (data) => `
    Visit the shop homepage
    
    # Browse and select product
    Click on "${data.product}" in product grid
    Verify product page loads
    Check price and description
    
    Change quantity to ${data.quantity}
    Click "Add to Cart"
    Verify cart icon shows ${data.quantity} items
    
    # Proceed to checkout
    Click cart icon
    Click "Checkout"
    
    # Fill customer information
    Fill email with "${data.customerEmail}"
    Fill name with "${data.customerName}"
    Fill address with "123 Test Street"
    Fill city with "Test City"
    Fill zip code with "12345"
    
    # Payment (test mode)
    Select "Credit Card" payment method
    Fill card number with test card "4242424242424242"
    Fill expiry with "12/25"
    Fill CVC with "123"
    
    # Complete order
    Click "Place Order"
    Wait 5 seconds for processing
    
    Verify order confirmation page
    Check order total is correct
    Take screenshot of confirmation
  `
};
```

### Portfolio Website Testing
```typescript
export const PORTFOLIO_TEST: TestCase = {
  id: 'PORTFOLIO-001',
  name: 'Contact Form and Portfolio Navigation',
  
  task: `
    Go to portfolio homepage
    
    # Test navigation
    Click "About" in navigation
    Verify about section is visible
    
    Click "Projects" in navigation
    Verify project gallery loads
    Count at least 3 project cards
    
    Click on first project
    Verify project details modal opens
    Click close button
    
    # Test contact form
    Click "Contact" in navigation
    Fill name with "Potential Client"
    Fill email with "client@example.com"
    Fill subject with "Website Inquiry"
    Fill message with "I'm interested in your services"
    
    Click "Send Message"
    Wait 3 seconds
    Verify success message "Thank you for your message" appears
    
    # Test responsive design
    Take screenshot at desktop size
    Resize browser to mobile width (375px)
    Take screenshot at mobile size
    Verify navigation menu collapses to hamburger
  `
};
```

## 🎯 Industry-Specific Examples

### Healthcare Portal Testing
```typescript
export const PATIENT_PORTAL: TestCase = {
  id: 'HEALTH-001',
  name: 'Patient Appointment Booking',
  
  task: `
    Login to patient portal
    
    Click "Book Appointment"
    Select doctor "Dr. Sarah Johnson"
    Choose appointment type "General Consultation"
    Select next available date
    Choose time slot "2:00 PM"
    
    Fill reason for visit "Annual checkup"
    Confirm insurance information is correct
    
    Click "Book Appointment"
    Verify confirmation message
    Check appointment appears in "My Appointments"
    
    Verify appointment details are correct
  `
};
```

### Real Estate Website Testing
```typescript
export const PROPERTY_SEARCH: TestCase = {
  id: 'REALTY-001',
  name: 'Property Search and Inquiry',
  
  task: `
    Go to property search page
    
    Set price range $200,000 to $500,000
    Select "3+ bedrooms"
    Select "2+ bathrooms"
    Choose location "Downtown District"
    
    Click "Search Properties"
    Wait for results to load
    
    Verify at least 5 properties shown
    Sort by "Price: Low to High"
    
    Click on first property
    View all photos in gallery
    Check property details
    Calculate monthly payment
    
    Click "Contact Agent"
    Fill contact form with inquiry
    Submit request
    
    Verify inquiry was sent successfully
  `
};
```

## 💪 Practice Makes Perfect

### For Beginners
Start simple and build up:

1. **Start with basic navigation**: "Go to google.com"
2. **Add an action**: "Search for Endorphin AI"
3. **Add verification**: "Verify search results appear"
4. **Add timing**: "Wait 2 seconds for results to load"

### For Small Teams
Focus on critical user journeys:
- User registration and login
- Core product features
- Contact forms and inquiries
- Payment processes (if applicable)

### For Enterprise Teams
Build comprehensive test suites:
- User management workflows
- Multi-step approval processes
- Data export/import features
- Security and permission testing
- Integration testing

---

Remember: If you can explain it to a person, the AI can do it!