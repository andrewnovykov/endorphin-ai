// QE-001: Basic Login Test
// Description: Test the login functionality with valid credentials
// Priority: High
// Tags: authentication, login, smoke
export const QE_001 = {
    id: 'QE-001',
    name: 'Basic Login Test',
    description: 'Test the login functionality with valid credentials',
    priority: 'High',
    tags: ['authentication', 'login', 'smoke'],
    site: 'https://qafromla.herokuapp.com/',
    testData: {
        email: 'papapin888@gmail.com',
        password: 'lalalend',
    },
    task: "Navigate to https://qafromla.herokuapp.com/, click on 'Log In' button, fill email field with 'papapin888@gmail.com', fill password field with 'lalalend', click 'Sign In' button, and verify successful login by checking for dashboard or user menu elements.",
};
//# sourceMappingURL=QE-001-basic-login-test.js.map