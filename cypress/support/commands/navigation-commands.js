// Navigation commands

Cypress.Commands.add('visitLoginPage', () => {
  cy.visit('/es/login');
});

Cypress.Commands.add('visitRegisterPage', () => {
  cy.visit('/es/registrarse');
});

Cypress.Commands.add('visitDashboard', () => {
  cy.visit('/es/panel');
});

Cypress.Commands.add('verifyOnLoginPage', () => {
  cy.url().should('include', '/es/login');
});

Cypress.Commands.add('verifyOnRegisterPage', () => {
  cy.url().should('include', '/es/registrarse');
});

Cypress.Commands.add('verifyOnDashboard', () => {
  cy.url().should('include', '/es/panel');
});

Cypress.Commands.add('waitForNavigation', (expectedUrl) => {
  cy.url().should('include', expectedUrl);
});

Cypress.Commands.add('waitForDashboardNavigation', () => {
  cy.url().should('include', '/es/panel');
  cy.get('.dashboard-container').should('be.visible');
});

Cypress.Commands.add('waitForLoginNavigation', () => {
  cy.url().should('include', '/es/login');
  cy.get('app-login-form').should('be.visible');
});
