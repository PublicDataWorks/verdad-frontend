describe('VERDAD Landing Page', () => {
  beforeEach(() => {
    cy.visit('/') // Visit the landing page before each test
  })

  it('should display the main heading and description', () => {
    cy.get('h1').should('contain', 'VERDAD detects and tracks coordinated mis/disinformation on the radio')

    cy.get('p').should('contain', 'VERDAD gives journalists powerful tools to investigate content')
  })

  it('should have working authentication buttons', () => {
    cy.get('a').contains('Create Account').should('be.visible')

    cy.get('a').contains('Log In').should('be.visible')
  })

  it('should display snippets with proper content in the carousel', () => {
    // Wait for the landing page content to load
    cy.get('#landing-page').should('be.visible')

    // Check if the carousel component exists and contains snippets
    cy.get('[data-testid="landing-carousel"]').within(() => {
      // Test first snippet
      cy.get('[data-testid="snippet-card"]')
        .first()
        .within(() => {
          // Check if title exists
          cy.get('[data-testid="snippet-title"]').should('be.visible').should('not.be.empty')

          // Check if labels exist and are not empty
          cy.get('[data-testid="snippet-labels"]')
            .should('be.visible')
            .within(() => {
              cy.get('[data-testid="label"]')
                .should('have.length.at.least', 1)
                .each($label => {
                  cy.wrap($label).should('be.visible').should('not.be.empty')
                })
            })
        })
    })
  })

  it('should have working navigation links', () => {
    cy.get('a[href="/"]').should('contain', 'VERDAD').and('be.visible')
  })

  it('should display footer information', () => {
    cy.get('footer')
      .should('contain', 'Verifying and Exposing Radio Disinformation and Discourse (VERDAD)')
      .and('contain', 'Wayne State University Law School')
      .and('contain', 'Public Data Works (PDW)')
  })
})
