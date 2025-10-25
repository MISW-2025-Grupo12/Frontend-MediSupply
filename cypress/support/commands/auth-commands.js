// Authentication-related commands

Cypress.Commands.add('login', (email, password) => {
  cy.get('input[formControlName="email"]').type(email);
  cy.get('input[formControlName="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('mockSuccessfulLogin', (userData) => {
  cy.intercept('POST', '**/auth/login', {
    statusCode: 200,
    body: {
      access_token: 'mock-access-token-123',
      token_type: 'Bearer',
      expires_in: 3600,
      user_info: {
        id: '123',
        nombre: userData.name,
        email: userData.email,
        identificacion: '12345678',
        telefono: '+1234567890',
        direccion: 'Test Address',
        tipo_usuario: userData.role || 'cliente'
      }
    }
  }).as('loginRequest');
});

Cypress.Commands.add('mockFailedLogin', (statusCode = 401) => {
  cy.intercept('POST', '**/auth/login', {
    statusCode: statusCode,
    body: {
      error: 'Authentication failed',
      message: 'Invalid credentials'
    }
  }).as('loginError');
});

Cypress.Commands.add('mockNetworkError', () => {
  cy.intercept('POST', '**/auth/login', {
    forceNetworkError: true
  }).as('networkError');
});

Cypress.Commands.add('logout', () => {
  cy.get('.logout-button').click();
});
