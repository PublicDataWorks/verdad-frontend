import { mockSupabaseAuth } from '../mocks/supabase'

declare global {
  namespace Cypress {
    interface Chainable {
      login(): void
    }
  }
}

Cypress.Commands.add('login', () => {
  cy.intercept('POST', '/api/login', {
    statusCode: 200,
    body: {
      user: {
        email: 'test@example.com'
      }
    }
  }).as('loginRequest')

  mockSupabaseAuth.setup()

  cy.intercept('http://localhost:8000/functions/v1/backend/api/liveblocks-auth', {
    statusCode: 200,
    body: {}
  }).as('functions')

  cy.visit('/login')

  cy.get('input[type="email"]').type('test@example.com')
  cy.get('input[type="password"]').type('password123')
  cy.contains('button', 'Submit').click()

  cy.url().should('include', '/search')
})

export {}
