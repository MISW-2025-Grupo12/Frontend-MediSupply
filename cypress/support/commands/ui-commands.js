// UI interaction commands

Cypress.Commands.add('verifyDashboardElements', (userName) => {
  cy.url().should('include', '/es/panel');
  cy.get('.dashboard-container').should('be.visible');
  cy.get('.dashboard-title').should('contain', userName);
  cy.get('.logout-button').should('be.visible');
});

Cypress.Commands.add('verifyLoginPage', () => {
  cy.url().should('include', '/es/login');
  cy.get('app-login-form').should('be.visible');
});

Cypress.Commands.add('verifyRegisterPage', () => {
  cy.url().should('include', '/es/registrarse');
});

Cypress.Commands.add('togglePasswordVisibility', () => {
  cy.get('button[matSuffix]').click();
});

Cypress.Commands.add('verifyPasswordVisible', () => {
  cy.get('input[formControlName="password"]').should('have.attr', 'type', 'text');
});

Cypress.Commands.add('verifyPasswordHidden', () => {
  cy.get('input[formControlName="password"]').should('have.attr', 'type', 'password');
});

Cypress.Commands.add('verifyLoadingState', () => {
  cy.get('mat-spinner').should('be.visible');
  cy.get('button[type="submit"]').should('be.disabled');
});

Cypress.Commands.add('verifyFormValidationErrors', () => {
  cy.get('mat-error').should('be.visible');
  cy.get('input[formControlName="email"]').should('have.class', 'ng-invalid');
  cy.get('input[formControlName="password"]').should('have.class', 'ng-invalid');
});

Cypress.Commands.add('navigateToRegister', () => {
  cy.get('button').contains('Registrarse').click();
});

Cypress.Commands.add('navigateToLogin', () => {
  cy.visit('/es/login');
});
