// Session management commands

Cypress.Commands.add('setUserSession', (userData) => {
  cy.window().then((win) => {
    win.localStorage.setItem('meddiSupply-user', JSON.stringify({
      id: '123',
      name: userData.name,
      email: userData.email,
      legalId: '12345678',
      phone: '+1234567890',
      address: 'Test Address',
      role: userData.role || 'cliente'
    }));
    win.localStorage.setItem('meddiSupply-token', 'existing-token');
  });
});

Cypress.Commands.add('clearUserSession', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('meddiSupply-user');
    win.localStorage.removeItem('meddiSupply-token');
  });
});

Cypress.Commands.add('verifyUserInSession', (expectedUser) => {
  cy.window().then((win) => {
    const userData = JSON.parse(win.localStorage.getItem('meddiSupply-user'));
    expect(userData.email).to.equal(expectedUser.email);
    expect(userData.name).to.equal(expectedUser.name);
  });
});

Cypress.Commands.add('verifyTokenInSession', (expectedToken) => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('meddiSupply-token');
    expect(token).to.equal(expectedToken);
  });
});

Cypress.Commands.add('verifySessionCleared', () => {
  cy.window().then((win) => {
    expect(win.localStorage.getItem('meddiSupply-user')).to.be.null;
    expect(win.localStorage.getItem('meddiSupply-token')).to.be.null;
  });
});
