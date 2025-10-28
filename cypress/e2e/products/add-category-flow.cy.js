describe('Add Category Flow E2E Tests', () => {
  beforeEach(() => {
    cy.clearUserSession();
    cy.visitLoginPage();
    cy.verifyLoginPage();
  });

  describe('Successful Add Category Flow', () => {
    it('should successfully add a category', () => {
      cy.fixture('add-category').then((addCategoryData) => {
        const { email, password } = addCategoryData;

        cy.fillLoginForm(email, password);
        cy.submitLoginForm();
        cy.waitForDashboardNavigation();
      });
    });
  });
});