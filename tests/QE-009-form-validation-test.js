// QE-009: Form Validation Test
// Description: Test form validation with invalid inputs
// Priority: High
// Tags: validation, forms, security, negative-testing

export const QE009 = {
  id: "QE-009",
  name: "Form Validation Test",
  description: "Test form validation with invalid inputs",
  priority: "High",
  tags: ["validation", "forms", "security", "negative-testing"],
  site: "https://qafromla.herokuapp.com/",
  testData: {
    uid: "test_user_009",
    invalidEmails: ["invalid-email", "@example.com", "user@", "user@.com"],
    weakPasswords: ["123", "password", ""],
    sqlInjection: ["'; DROP TABLE users; --", "<script>alert('xss')</script>"]
  },
  task: `Navigate to https://qafromla.herokuapp.com/. Click Login button. Submit empty login form. Verify error messages appear. Fill email field with invalid email format. Submit form. Verify email validation error. Fill password field with weak password. Submit form. Verify password validation. Test form with various invalid inputs. Verify all form validation works properly.`
};
