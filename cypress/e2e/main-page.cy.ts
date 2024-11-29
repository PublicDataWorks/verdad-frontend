import { mockLoggedIn } from '../support/auth'
import { mockSupabaseAuth } from '../mocks/supabase'
import { mockResponses } from '../support/mock'

describe('SearchInterface', () => {
  beforeEach(() => {
    cy.mockLoginSuccess()
    cy.intercept('POST', '**/rpc/get_snippets', {
      statusCode: 200,
      body: mockResponses.success
    }).as('getSnippets')

    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: {
        user: {
          email: 'test@example.com'
        }
      }
    }).as('loginRequest')
    cy.intercept('https://dzujjhzgzguciwryzwlx.supabase.co/rest/v1/rpc/get_users')

    cy.intercept('http://localhost:8000/functions/v1/backend/api/liveblocks-auth', {
      statusCode: 200,
      body: {}
    }).as('functions')
    cy.visit('/login')

    // Fill form with valid credentials
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.contains('button', 'Submit').click()

    // Wait for login request and verify navigation
    cy.url().should('include', '/search')

    // Setup login intercepts

    // Mock API responses that will be needed after login
    cy.intercept('POST', '**/rpc/get_snippets', {
      fixture: 'snippets.json'
    }).as('getSnippets')

    cy.intercept('POST', '**/rpc/get_filtering_options', {
      fixture: 'filterOptions.json'
    }).as('getFilterOptions')
  })

  // Test authenticated user specific features
  it('should show user-specific features when logged in', () => {
    // Verify user menu is visible
    cy.get('[data-testid="user-menu"]').should('be.visible')

    // Verify user can like snippets
    cy.get('[data-testid="snippet-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="like-button"]').should('be.enabled')
      })
  })

  // it('should allow user to like a snippet', () => {
  //   // Mock like endpoint
  //   cy.intercept('POST', '**/rpc/like_snippet', {
  //     statusCode: 200,
  //     body: {
  //       like_count: 1,
  //       dislike_count: 0
  //     }
  //   }).as('likeSnippet')

  //   cy.get('[data-testid="snippet-card"]')
  //     .first()
  //     .within(() => {
  //       cy.get('[data-testid="like-button"]').click()
  //       cy.wait('@likeSnippet')
  //       cy.get('[data-testid="like-count"]').should('contain', '1')
  //     })
  // })

  // it('should allow user to hide a snippet', () => {
  //   // Mock hide endpoint
  //   cy.intercept('POST', '**/rpc/hide_snippet', {
  //     statusCode: 200,
  //     body: { hidden: true }
  //   }).as('hideSnippet')

  //   cy.get('[data-testid="snippet-card"]')
  //     .first()
  //     .within(() => {
  //       cy.get('[data-testid="more-options"]').click()
  //       cy.get('[data-testid="hide-option"]').click()
  //     })
  //   cy.wait('@hideSnippet')
  // })

  // it('should show welcome card based on user preferences', () => {
  //   // Test with welcome card not dismissed
  //   cy.intercept('GET', 'https://*.supabase.co/auth/v1/user', {
  //     statusCode: 200,
  //     body: {
  //       ...mockUsers.standard,
  //       user_metadata: {
  //         ...mockUsers.standard.user_metadata,
  //         dismiss_welcome_card: false
  //       }
  //     }
  //   }).as('getUserWithWelcome')

  //   cy.visit('/search')
  //   cy.get('[data-testid="welcome-card"]').should('be.visible')
  // })
})
