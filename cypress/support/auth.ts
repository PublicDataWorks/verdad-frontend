declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      mockLoginSuccess(): Chainable<void>
      mockLoginFailure(): Chainable<void>
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.contains('button', 'Submit').click()
})

// Mock successful login
Cypress.Commands.add('mockLoginSuccess', () => {
  cy.intercept('POST', '/api/login', {
    statusCode: 200,
    body: {
      user: {
        email: 'test@example.com'
      }
    }
  }).as('loginRequest')
})

// Mock failed login
Cypress.Commands.add('mockLoginFailure', () => {
  cy.intercept('POST', '/api/login', {
    statusCode: 401,
    body: {
      error: {
        message: 'Invalid credentials'
      }
    }
  }).as('loginRequest')
})

export {}
