// cypress/e2e/login.cy.ts

import { mockSupabaseAuth } from '../mocks/supabase'

describe('Login Page', () => {
  beforeEach(() => {
    // Visit the login page before each test
    mockSupabaseAuth.setup()
    cy.visit('/login')
  })

  it('should display login form elements', () => {
    // Check if main elements are visible
    cy.contains('h2', 'Login to VERDAD').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.contains('button', 'Submit').should('be.visible')
    cy.contains('button', "Don't have an account?").should('be.visible')
    cy.contains('button', 'Forgot password?').should('be.visible')
    cy.contains('button', 'Sign in with Google').should('be.visible')
  })

  it('should show validation errors for empty form submission', () => {
    // Try to submit empty form
    cy.contains('button', 'Submit').click()

    // Check for validation error messages
    cy.contains('Email is required').should('be.visible')
    cy.contains('Password is required').should('be.visible')
  })

  it('should show error for short password', () => {
    // Type valid email but short password
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('12345')
    cy.contains('button', 'Submit').click()

    // Check for password length error
    cy.contains('Password must be at least 6 characters').should('be.visible')
  })

  it('should navigate to signup page', () => {
    cy.contains('button', "Don't have an account?").click()
    // Assuming SIGNUP_PATH is '/signup'
    cy.url().should('include', '/signup')
  })

  it('should navigate to forgot password page', () => {
    cy.contains('button', 'Forgot password?').click()
    cy.url().should('include', '/forget-password')
  })

  it('should handle successful login', () => {
    // Mock successful login
    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: {
        user: {
          email: 'test@example.com'
        }
      }
    }).as('loginRequest')

    // Fill form with valid credentials
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.contains('button', 'Submit').click()

    // Wait for login request and verify navigation
    cy.url().should('include', '/search')
  })

  it('should handle failed login', () => {
    // Mock failed login
    cy.intercept('POST', '/api/login', {
      statusCode: 401,
      body: {
        error: {
          message: 'Invalid credentials'
        }
      }
    }).as('loginRequest')

    // Fill form with invalid credentials
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.contains('button', 'Submit').click()

    // Wait for login request and verify error message
    cy.contains('Invalid login credentials').should('be.visible')
  })
})
