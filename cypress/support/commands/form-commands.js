// Form interaction commands

Cypress.Commands.add('fillLoginForm', (email, password) => {
  cy.get('input[formControlName="email"]').clear().type(email);
  cy.get('input[formControlName="password"]').clear().type(password);
});

Cypress.Commands.add('submitLoginForm', () => {
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('fillEmailField', (email) => {
  cy.get('input[formControlName="email"]').clear().type(email);
});

Cypress.Commands.add('fillPasswordField', (password) => {
  cy.get('input[formControlName="password"]').clear().type(password);
});

Cypress.Commands.add('verifyEmailField', (expectedEmail) => {
  cy.get('input[formControlName="email"]').should('have.value', expectedEmail);
});

Cypress.Commands.add('verifyPasswordField', (expectedPassword) => {
  cy.get('input[formControlName="password"]').should('have.value', expectedPassword);
});

Cypress.Commands.add('clearLoginForm', () => {
  cy.get('input[formControlName="email"]').clear();
  cy.get('input[formControlName="password"]').clear();
});

Cypress.Commands.add('verifySubmitButtonDisabled', () => {
  cy.get('button[type="submit"]').should('be.disabled');
});

Cypress.Commands.add('verifySubmitButtonEnabled', () => {
  cy.get('button[type="submit"]').should('not.be.disabled');
});
