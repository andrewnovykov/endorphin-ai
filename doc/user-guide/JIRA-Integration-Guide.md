# JIRA Integration Guide

This guide shows you how to set up and use JIRA integration with Endorphin AI to automatically sync test cases from JIRA tickets and run them.

## Overview

JIRA integration allows you to:
- Automatically fetch test cases from JIRA tickets
- Convert JIRA tickets with special format to executable tests
- Generate test data using AI
- Run JIRA-synced tests alongside your regular tests
- Track raw JIRA data for auditing and debugging

## Prerequisites

- JIRA Cloud account with API access
- JIRA project with test case tickets
- Node.js 16+ and Endorphin AI installed

## Step 1: Get JIRA Credentials

### 1.1 Find Your JIRA URL
Your JIRA URL format: `https://yourcompany.atlassian.net`

### 1.2 Get Your Email
Use the email address associated with your JIRA account.

### 1.3 Create API Token
1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a name (e.g., "Endorphin AI Integration")
4. Copy the generated token (save it securely)

### 1.4 Find Project ID
1. Go to your JIRA project
2. Click "Project settings" → "Details"
3. Note the Project ID (numeric, e.g., `10001`)

### 1.5 Find Issue Type ID
1. Go to JIRA Administration → Issues → Issue types
2. Find your test case issue type
3. Note the ID (numeric, e.g., `10013`)

## Step 2: Configuration Setup

You can configure JIRA integration using environment variables or configuration file.

### Option 1: Environment Variables (.env file)

Create or update your `.env` file:

```bash
# JIRA Integration Settings
JIRA_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your_api_token_here
JIRA_PROJECT_ID=10001
JIRA_ISSUE_TYPE_ID=10013
JIRA_LABEL=ai-test-case
```

### Option 2: Configuration File (endorphin.config.ts)

Add JIRA configuration to your `endorphin.config.ts`:

```typescript
export default {
  // ... other config options
  
  jira: {
    url: 'https://yourcompany.atlassian.net',
    email: 'your-email@company.com',
    apiToken: 'your_api_token_here',
    projectId: '10001',
    issueTypeId: '10013',
    label: 'ai-test-case'
  }
};
```

## Step 3: JIRA Ticket Format

Create JIRA tickets with the following special format in the description:

### Enhanced Format with Role-Based Users (Recommended)

```
@USERS [@ADMIN, @SELLER, @USER]

@DATA('Generate test credentials for different user roles')
admin_email: administrator email address
admin_password: administrator password
seller_email: seller account email
seller_password: seller account password
user_email: regular user email
user_password: regular user password

@STEPS

@ADMIN.PHASE1
Navigate to https://yourapp.com/admin
Login with ${data.admin_email} and ${data.admin_password}
Access admin dashboard
Verify admin privileges

@SELLER.PHASE1
Navigate to https://yourapp.com/seller
Login with ${data.seller_email} and ${data.seller_password}
Access product management
Create new product

@USER.PHASE1
Navigate to https://yourapp.com/login
Login with ${data.user_email} and ${data.user_password}
Browse products
Verify user can see products
```

### Basic Format (Legacy Support)

```
@DATA('Generate realistic test user credentials')
email: valid email address for testing
password: simple password for testing
username: simple username for testing

@STEPS

@USER1
Navigate to https://yourapp.com/login
Click on "Login" button
Enter ${data.email} in the email field
Enter ${data.password} in the password field
Click "Sign In" button
Verify login was successful
```

### Alternative Single-User Format

```
@DATA('Generate realistic test user credentials')
email: valid email address for testing
password: simple password for testing
username: simple username for testing

@STEPS

@USER.PHASE1
Navigate to https://yourapp.com/login
Click on "Login" button
Wait 2 seconds for page load
Enter ${data.email} in the email field
Enter ${data.password} in the password field
Click "Sign In" button
Wait 3 seconds for page load
Verify login was successful by checking username ${data.username} is visible
```

### Format Breakdown

#### @USERS Section (Optional, but Recommended)
- `@USERS [@ROLE1, @ROLE2, @ROLE3]` - Declare user roles for the test
- Supports descriptive role names like `@ADMIN`, `@SELLER`, `@USER`, `@MANAGER`
- Role names are case-insensitive and converted to lowercase (e.g., `@ADMIN` becomes `admin`)
- Special characters are removed (e.g., `@USER-BUYER` becomes `userbuyer`)
- Must have corresponding `@ROLE.PHASE1` sections in `@STEPS`

#### @DATA Section
- `@DATA('prompt')` - AI prompt for generating test data
- List field definitions (one per line):
  - `fieldname: description of what this field should contain`
- Supports any field names you need
- Use role-specific field names for multi-user tests (e.g., `admin_email`, `seller_email`)

#### @STEPS Section
- Contains all test execution phases
- Supports multiple user formats:
  - **Role-based (Recommended)**: `@ADMIN.PHASE1`, `@SELLER.PHASE1` - Uses declared role names
  - **Legacy**: `@USER1`, `@USER.PHASE1`, `@USER1.PHASE1` - Numeric user identifiers

#### User/Role Section
- Test steps to execute for each user/role
- Use `${data.fieldname}` to reference generated data
- Each line is a test instruction
- Steps execute in parallel for multi-user tests

### Multi-User Tests

#### Role-Based Multi-User Format (Recommended)

For tests with multiple users running in parallel using descriptive role names:

```
@USERS [@ADMIN, @CUSTOMER]

@DATA('Generate user credentials for admin and customer roles')
admin_email: administrator email address
admin_password: administrator password
customer_email: customer email address
customer_password: customer password

@STEPS

@ADMIN.PHASE1
Navigate to https://yourapp.com/admin
Login with ${data.admin_email} and ${data.admin_password}
Access user management
Create new customer account
Verify account creation successful

@CUSTOMER.PHASE1
Navigate to https://yourapp.com/login
Login with ${data.customer_email} and ${data.customer_password}
Browse product catalog
Add item to cart
Verify cart shows correct item
```

This generates a test with:
- `users: ['admin', 'customer']` - Two browser sessions with meaningful role names
- `tasks` object with keys `admin.phase1` and `customer.phase1`
- Each role executes their phase in parallel

#### Legacy Multi-User Format

For backward compatibility, the numeric format still works:

```
@DATA('Generate test user credentials')
email: valid email address for testing
password: simple password for testing
username: simple username for testing

@STEPS

@USER1.PHASE1
Navigate to https://yourapp.com/login
Click on "Login" button
Enter ${data.email} in the email field
Enter ${data.password} in the password field
Click "Sign In" button
Verify login was successful

@USER2.PHASE1
Navigate to https://yourapp.com/login
Click on "Login" button
Enter ${data.email} in the email field
Enter ${data.password} in the password field
Click "Sign In" button
Verify "Email not found" message appears
```

This generates a test with:
- `users: ['user1', 'user2']` - Two browser sessions
- `tasks` object with keys `user1.phase1` and `user2.phase1`
- Each user executes their phase in parallel

### Single-User Multi-Phase Tests

For tests with one user going through multiple phases:

```
@DATA('Generate admin credentials')
admin_email: administrator email address
admin_password: administrator password

@STEPS

@USER.PHASE1
Login as administrator using ${data.admin_email} and ${data.admin_password}
Navigate to user management
Create new user account

@USER.PHASE2
Navigate to settings
Update system configuration
Logout
```

This generates a test with:
- Single `task` function (not `tasks`)
- All phases combined into sequential steps

## Step 4: Running JIRA Sync

### Sync and Run Tests

```bash
# Sync from JIRA and run specific test
npx endorphin run test --jira-sync TICKET-123

# Sync from JIRA and run all tests
npx endorphin run test --jira-sync all
```

### Sync Only (No Test Execution)

Currently, JIRA sync is integrated with test execution. To sync without running tests, you can run a sync and then cancel the test execution.

## Step 5: Understanding the Sync Process

### What Happens During Sync

1. **Connection Test**: Verifies JIRA credentials and connectivity
2. **Ticket Fetch**: Downloads tickets matching your project, issue type, and label
3. **Raw Data Storage**: Saves original tickets to `jira-raw/` folder
4. **Conversion**: Transforms JIRA tickets to Endorphin AI test cases
5. **File Generation**: Creates TypeScript test files in `tests/jira/`
6. **Test Execution**: Runs the generated tests

### File Structure After Sync

```
project/
├── jira-raw/                    # Raw JIRA ticket data
│   ├── TICKET-001.json
│   └── TICKET-002.json
├── tests/jira/                  # Generated test files
│   ├── TICKET_001.ts
│   └── TICKET_002.ts
└── test-results/                # Test execution results
    └── ...
```

## Step 6: Advanced Usage

### Custom Field Names

You can use any field names in your @DATA section:

```
@DATA('Generate e-commerce test data')
product_name: realistic product name
price: product price between $10-100
category: product category
customer_name: customer full name
shipping_address: realistic shipping address
```

### Dynamic Data Generation

The AI will generate realistic data based on your field descriptions:

```
@DATA('Generate healthcare appointment data')
patient_name: realistic patient full name
doctor_name: medical doctor full name
appointment_date: future appointment date
medical_condition: common medical condition
insurance_id: health insurance ID number
```

### Variable Substitution

Use `${data.fieldname}` anywhere in your test steps:

```
Navigate to /patient/${data.patient_name}
Enter "${data.medical_condition}" in the diagnosis field
Select appointment date ${data.appointment_date}
Verify insurance ${data.insurance_id} is accepted
```

## Troubleshooting

### Common Issues

#### Authentication Failed
```
❌ JIRA sync failed: 401 Unauthorized
```
**Solution**: Check your JIRA_EMAIL and JIRA_API_TOKEN. Regenerate the API token if needed.

#### No Tickets Found
```
ℹ️ No tickets found matching the criteria
```
**Solution**: 
- Verify JIRA_PROJECT_ID and JIRA_ISSUE_TYPE_ID are correct
- Check that tickets have the specified label (JIRA_LABEL)
- Ensure tickets exist in the project

#### Invalid Ticket Format
```
❌ QE-1: Missing @STEPS section in description
```
**Solution**: Ensure your JIRA ticket description follows the required format with @DATA, @STEPS, and @USER.PHASE1 sections.

#### Field Parsing Issues
```
❌ Generated data format is incorrect
```
**Solution**: 
- Ensure each field is on a separate line in the @DATA section
- Use clear field descriptions
- Avoid special characters in field names

### Debug Mode

Enable detailed logging:

```bash
ENDORPHIN_DEBUG=verbose npx endorphin run test --jira-sync TICKET-123
```

### Checking Raw Data

Inspect raw JIRA data in the `jira-raw/` folder to debug ticket format issues.

## Best Practices

### 1. Consistent Naming
- Use descriptive field names (e.g., `user_email` instead of `email1`)
- Follow consistent naming patterns across tickets

### 2. Clear Descriptions
- Write clear field descriptions for better AI data generation
- Be specific about data requirements (e.g., "valid email address for testing")

### 3. Test Organization
- Use consistent labels for grouping related test tickets
- Include ticket IDs in test names for easy tracking

### 4. Version Control
- Add `jira-raw/` to `.gitignore` if data contains sensitive information
- Include generated test files in version control for review

### 5. Regular Sync
- Run JIRA sync regularly to get the latest ticket updates
- Review generated tests before important test runs

## Security Considerations

- Store API tokens securely (use `.env` file, not in code)
- Add `.env` to `.gitignore` to prevent credential exposure
- Regularly rotate JIRA API tokens
- Review generated test data for sensitive information

## Example Workflow

Here's a complete example workflow:

### 1. Create JIRA Ticket (QE-001)
**Summary**: Login Flow Test
**Description**:
```
@DATA('Generate login test credentials')
email: valid email address for testing
password: secure password for testing
username: unique username for testing

@STEPS

@USER.PHASE1
Navigate to https://myapp.com/login
Enter ${data.email} in email field
Enter ${data.password} in password field
Click "Sign In" button
Verify welcome message shows ${data.username}
```

### 2. Run Sync and Test
```bash
npx endorphin run test --jira-sync QE-001
```

### 3. Review Results
- Check `tests/jira/QE_001.ts` for generated test
- Review test execution results
- Update JIRA ticket if needed

## Next Steps

- Explore the [Test Writing Guide](Test-Writing-Tips.md) for advanced test patterns
- Learn about [HTML Reports](HTML-Reporter-Guide.md) to view detailed test results
- Check out [Environment Variables Guide](Environment-Variables-Guide.md) for more configuration options

---

For more information, see the [Quick Start Guide](Quick-Start.md) or [Project Setup Guide](Project-Setup-Guide.md).