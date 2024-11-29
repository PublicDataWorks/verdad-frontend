import { mockSupabaseAuth } from '../mocks/supabase'

describe('Signup Page', () => {
  beforeEach(() => {
    mockSupabaseAuth.setup()
    cy.visit('/signup')
  })

  it('should display signup form elements', () => {
    cy.contains('h2', 'Create your account').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('have.length', 2)
    cy.contains('button', 'Sign up').should('be.visible')
    cy.contains('button', 'Already have an account?').should('be.visible')
    cy.contains('button', 'Sign up with Google').should('be.visible')
  })

  it('should show validation errors for empty form submission', () => {
    cy.contains('button', 'Sign up').click()

    cy.contains('Email is required').should('be.visible')
    cy.contains('Password is required').should('be.visible')
    cy.contains('Please confirm your password').should('be.visible')
  })

  it('should validate password length', () => {
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').first().type('12345')
    cy.get('input[type="password"]').last().type('12345')
    cy.contains('button', 'Sign up').click()

    cy.contains('Password must be at least 6 characters').should('be.visible')
  })

  it('should validate password match', () => {
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').first().type('password123')
    cy.get('input[type="password"]').last().type('password456')
    cy.contains('button', 'Sign up').click()

    cy.contains('Passwords do not match').should('be.visible')
  })

  it('should handle successful signup', () => {
    const testEmail = 'newuser@example.com'
    const testPassword = 'password123'

    cy.get('input[type="email"]').type(testEmail)
    cy.get('input[type="password"]').first().type(testPassword)
    cy.get('input[type="password"]').last().type(testPassword)
    cy.contains('button', 'Sign up').click()

    // Verify verification message
    cy.contains('Verify Your Email').should('be.visible')
    cy.contains(testEmail).should('be.visible')
    cy.get('.lucide-mail').should('be.visible')
  })

  it('should navigate to login page', () => {
    cy.contains('button', 'Already have an account?').click()
    cy.url().should('include', '/login')
  })

  it('should show loading state during submission', () => {
    const testEmail = 'test@example.com'
    const testPassword = 'password123'

    // Mock slow signup response
    cy.intercept('POST', 'https://*.supabase.co/auth/v1/signup', req => {
      req.reply({
        delay: 1000,
        statusCode: 200,
        body: {
          user: {
            id: 'new-user-id',
            email: testEmail
          },
          session: null
        }
      })
    }).as('slowSignup')

    cy.get('input[type="email"]').type(testEmail)
    cy.get('input[type="password"]').first().type(testPassword)
    cy.get('input[type="password"]').last().type(testPassword)
    cy.contains('button', 'Sign up').click()

    cy.contains('Creating account...').should('be.visible')
    cy.contains('Creating account...').should('be.disabled')
  })

  it('should close verification message and redirect to login', () => {
    const testEmail = 'test@example.com'
    const testPassword = 'password123'

    // Complete signup first
    cy.get('input[type="email"]').type(testEmail)
    cy.get('input[type="password"]').first().type(testPassword)
    cy.get('input[type="password"]').last().type(testPassword)
    cy.contains('button', 'Sign up').click()

    // Verify verification message appears
    cy.contains('Verify Your Email').should('be.visible')

    // Click close button
    cy.contains('button', 'Close').click()

    // Verify redirect to login page
    cy.url().should('include', '/login')
  })
})
