# Cypress E2E Tests for MediSupply

This directory contains end-to-end tests for the MediSupply application using Cypress.

## Test Files

- `login-flow.cy.js` - Comprehensive login flow tests with detailed scenarios
- `login-flow-simplified.cy.js` - Simplified login tests using custom commands
- `spec.cy.js` - Default Cypress template (can be removed)

## Test Fixtures

- `login.json` - Test data for login scenarios including valid/invalid credentials

## Custom Commands

Custom commands are organized into separate modules for better maintainability:

### Authentication Commands (`cypress/support/commands/auth-commands.js`)
- `cy.login(email, password)` - Performs login with given credentials
- `cy.mockSuccessfulLogin(userData)` - Mocks successful login API response
- `cy.mockFailedLogin(statusCode)` - Mocks failed login API response
- `cy.mockNetworkError()` - Mocks network error for login
- `cy.logout()` - Performs logout action

### Session Management Commands (`cypress/support/commands/session-commands.js`)
- `cy.setUserSession(userData)` - Sets user session in localStorage
- `cy.clearUserSession()` - Clears user session from localStorage
- `cy.verifyUserInSession(expectedUser)` - Verifies user data in session
- `cy.verifyTokenInSession(expectedToken)` - Verifies token in session
- `cy.verifySessionCleared()` - Verifies session is completely cleared

### UI Interaction Commands (`cypress/support/commands/ui-commands.js`)
- `cy.verifyDashboardElements(userName)` - Verifies dashboard page elements
- `cy.verifyLoginPage()` - Verifies login page elements
- `cy.verifyRegisterPage()` - Verifies register page elements
- `cy.togglePasswordVisibility()` - Toggles password field visibility
- `cy.verifyPasswordVisible()` - Verifies password is visible
- `cy.verifyPasswordHidden()` - Verifies password is hidden
- `cy.verifyLoadingState()` - Verifies loading spinner and disabled state
- `cy.verifyFormValidationErrors()` - Verifies form validation errors
- `cy.navigateToRegister()` - Clicks register button
- `cy.navigateToLogin()` - Navigates to login page

### Form Interaction Commands (`cypress/support/commands/form-commands.js`)
- `cy.fillLoginForm(email, password)` - Fills complete login form
- `cy.submitLoginForm()` - Submits the login form
- `cy.fillEmailField(email)` - Fills email field only
- `cy.fillPasswordField(password)` - Fills password field only
- `cy.verifyEmailField(expectedEmail)` - Verifies email field value
- `cy.verifyPasswordField(expectedPassword)` - Verifies password field value
- `cy.clearLoginForm()` - Clears all form fields
- `cy.verifySubmitButtonDisabled()` - Verifies submit button is disabled
- `cy.verifySubmitButtonEnabled()` - Verifies submit button is enabled

### Navigation Commands (`cypress/support/commands/navigation-commands.js`)
- `cy.visitLoginPage()` - Visits login page
- `cy.visitRegisterPage()` - Visits register page
- `cy.visitDashboard()` - Visits dashboard page
- `cy.verifyOnLoginPage()` - Verifies current page is login
- `cy.verifyOnRegisterPage()` - Verifies current page is register
- `cy.verifyOnDashboard()` - Verifies current page is dashboard
- `cy.waitForNavigation(expectedUrl)` - Waits for navigation to specific URL
- `cy.waitForDashboardNavigation()` - Waits for dashboard navigation
- `cy.waitForLoginNavigation()` - Waits for login page navigation

## Running Tests

### Prerequisites

1. Make sure the Angular application is running:
   ```bash
   npm start
   ```

2. Ensure the backend API is running (if testing against real API)

### Running Tests

#### Open Cypress Test Runner (Interactive Mode)
```bash
npm run e2e:open
# or
npm run cy:open
```

#### Run Tests Headlessly
```bash
npm run e2e
# or
npm run cy:run
```

### Running Specific Test Files

```bash
# Run only login flow tests
npx cypress run --spec "cypress/e2e/login-flow*.cy.js"

# Run with specific browser
npx cypress run --browser chrome
```

## Test Scenarios Covered

### Successful Login Flow
- ✅ Valid credentials login
- ✅ Navigation to dashboard after successful login
- ✅ User data persistence in localStorage
- ✅ Token persistence in localStorage
- ✅ Loading state during login
- ✅ User name display in dashboard

### Failed Login Scenarios
- ✅ Invalid credentials handling
- ✅ Empty form validation
- ✅ Invalid email format validation
- ✅ Network error handling

### UI Interactions
- ✅ Password visibility toggle
- ✅ Navigation to register page
- ✅ Loading state display

### Authentication State Management
- ✅ Redirect to dashboard if already logged in
- ✅ Logout functionality
- ✅ Session clearing on logout

## Configuration

The Cypress configuration is in `cypress.config.js`:

- Base URL: `http://localhost:4200`
- Default viewport: 1280x720
- Command timeout: 10 seconds
- Video recording: disabled
- Screenshots on failure: enabled

## API Mocking

Tests use Cypress intercepts to mock API responses:

```javascript
// Mock successful login
cy.intercept('POST', '**/auth/login', {
  statusCode: 200,
  body: { /* login response */ }
}).as('loginRequest');

// Mock failed login
cy.intercept('POST', '**/auth/login', {
  statusCode: 401,
  body: { /* error response */ }
}).as('loginError');
```

## Test Data

Test data is stored in `cypress/fixtures/login.json`:

```json
{
  "validUser": {
    "email": "test@medisupply.com",
    "password": "TestPassword123!",
    "name": "Test User",
    "role": "cliente"
  },
  "invalidUser": {
    "email": "invalid@medisupply.com",
    "password": "WrongPassword123!"
  }
}
```

## Troubleshooting

### Common Issues

1. **Tests fail with "Cannot find module"**
   - Make sure to run `npm install` to install dependencies

2. **Application not loading**
   - Ensure the Angular dev server is running on `http://localhost:4200`

3. **API calls not mocked**
   - Check that the intercept patterns match your actual API endpoints
   - Verify the API base URL in your application

4. **Elements not found**
   - Check that the selectors match your actual HTML structure
   - Ensure the application is fully loaded before assertions

### Debug Mode

Run tests in debug mode to see detailed logs:

```bash
npx cypress run --headed --no-exit
```

## Adding New Tests

1. Create new test files in `cypress/e2e/` with `.cy.js` extension
2. Use existing custom commands when possible
3. Add new test data to fixtures if needed
4. Follow the existing naming conventions

## Best Practices

1. Use custom commands for reusable actions
2. Mock API responses to ensure test reliability
3. Clear state between tests using `beforeEach` hooks
4. Use descriptive test names and organize tests logically
5. Keep tests independent and avoid dependencies between tests
