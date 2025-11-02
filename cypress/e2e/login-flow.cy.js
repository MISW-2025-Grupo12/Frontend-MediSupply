describe('Login Flow E2E Tests', () => {
  beforeEach(() => {
    // Clear any existing session
    cy.clearUserSession();
    
    // Visit the login page
    cy.visitLoginPage();
    cy.verifyLoginPage();
  });

  describe('Successful Login Flow', () => {
    it('should successfully login and navigate to dashboard', () => {
      cy.fixture('login').then((loginData) => {
        const { validUser } = loginData;

        // Mock successful login API response
        cy.mockSuccessfulLogin(validUser);

        // Fill and submit login form
        cy.fillLoginForm(validUser.email, validUser.password);
        cy.submitLoginForm();

        // Wait for API call and verify navigation
        cy.wait('@loginRequest');
        cy.waitForDashboardNavigation();
        cy.verifyDashboardElements(validUser.name);

        // Verify session persistence
        cy.verifyUserInSession(validUser);
        cy.verifyTokenInSession('mock-access-token-123');
      });
    });

    it('should show loading state during login', () => {
      cy.fixture('login').then((loginData) => {
        const { validUser } = loginData;

        // Mock delayed response to test loading state
        cy.intercept('POST', '**/auth/login', {
          statusCode: 200,
          body: {
            access_token: 'mock-token',
            token_type: 'Bearer',
            expires_in: 3600,
            user_info: {
              id: '123',
              nombre: validUser.name,
              email: validUser.email,
              identificacion: '12345678',
              telefono: '+1234567890',
              direccion: 'Test Address',
              tipo_usuario: validUser.role
            }
          },
          delay: 1000
        }).as('delayedLogin');

        cy.fillLoginForm(validUser.email, validUser.password);
        cy.submitLoginForm();

        // Verify loading state
        cy.verifyLoadingState();
        cy.wait('@delayedLogin');
      });
    });
  });

  describe('Failed Login Scenarios', () => {
    it('should handle invalid credentials', () => {
      cy.fixture('login').then((loginData) => {
        const { invalidUser } = loginData;

        // Mock failed login
        cy.mockFailedLogin(401);

        cy.fillLoginForm(invalidUser.email, invalidUser.password);
        cy.submitLoginForm();
        cy.wait('@loginError');

        // Should stay on login page
        cy.verifyOnLoginPage();
      });
    });

    it('should show validation errors for empty fields', () => {
      cy.submitLoginForm();

      // Verify validation errors
      cy.verifyFormValidationErrors();
      cy.verifySubmitButtonDisabled();
    });

    it('should handle network errors gracefully', () => {
      cy.fixture('login').then((loginData) => {
        const { validUser } = loginData;

        // Mock network error
        cy.mockNetworkError();

        cy.fillLoginForm(validUser.email, validUser.password);
        cy.submitLoginForm();
        cy.wait('@networkError');

        // Should stay on login page
        cy.verifyOnLoginPage();
      });
    });
  });

  describe('UI Interactions', () => {
    it('should toggle password visibility', () => {
      cy.fixture('login').then((loginData) => {
        const { validUser } = loginData;

        cy.fillPasswordField(validUser.password);
        cy.verifyPasswordHidden();

        // Toggle visibility
        cy.togglePasswordVisibility();
        cy.verifyPasswordVisible();

        // Toggle back
        cy.togglePasswordVisibility();
        cy.verifyPasswordHidden();
      });
    });

    it('should navigate to register page', () => {
      cy.navigateToRegister();
      cy.verifyOnRegisterPage();
    });
  });

  describe('Authentication State Management', () => {
    it('should redirect to dashboard if already logged in', () => {
      cy.fixture('login').then((loginData) => {
        const { validUser } = loginData;

        // Set existing session
        cy.setUserSession(validUser);

        // Visit login page
        cy.visitLoginPage();

        // Should redirect to dashboard
        cy.waitForDashboardNavigation();
        cy.verifyDashboardElements(validUser.name);
      });
    });

    it('should logout and clear session', () => {
      cy.fixture('login').then((loginData) => {
        const { validUser } = loginData;

        // Login first
        cy.mockSuccessfulLogin(validUser);
        cy.fillLoginForm(validUser.email, validUser.password);
        cy.submitLoginForm();
        cy.wait('@loginRequest');
        cy.waitForDashboardNavigation();

        // Logout
        cy.logout();

        // Should redirect to login and clear session
        cy.waitForLoginNavigation();
        cy.verifySessionCleared();
      });
    });
  });
});
