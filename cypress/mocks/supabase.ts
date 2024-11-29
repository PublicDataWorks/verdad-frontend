export const mockSupabaseAuth = {
  setup() {
    // Mock sign in with password
    cy.intercept('POST', 'https://*.supabase.co/auth/v1/token?grant_type=password', req => {
      const { email, password } = req.body

      // Test credentials
      if (email === 'test@example.com' && password === 'password123') {
        req.reply({
          statusCode: 200,
          body: {
            access_token: 'fake-access-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'fake-refresh-token',
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              role: 'authenticated'
            }
          }
        })
      } else {
        req.reply({
          statusCode: 400,
          body: {
            error: 'Invalid login credentials',
            error_description: 'Invalid login credentials'
          }
        })
      }
    }).as('signInRequest')

    // Mock get session
    cy.intercept('GET', 'https://*.supabase.co/auth/v1/session', {
      statusCode: 200,
      body: {
        data: {
          session: null
        }
      }
    }).as('getSession')

    // Mock Google OAuth
    cy.intercept('POST', 'https://*.supabase.co/auth/v1/authorize', {
      statusCode: 200,
      body: {
        provider: 'google',
        url: 'https://accounts.google.com/o/oauth2/auth'
      }
    }).as('googleAuth')

    // Mock sign out
    cy.intercept('POST', 'https://*.supabase.co/auth/v1/logout', {
      statusCode: 200,
      body: {}
    }).as('signOut')

    // Mock sign up
    cy.intercept('POST', 'https://*.supabase.co/auth/v1/signup', req => {
      const { email } = req.body

      if (email === 'existing@example.com') {
        req.reply({
          statusCode: 400,
          body: {
            error: 'User already registered',
            error_description: 'User already registered'
          }
        })
      } else {
        req.reply({
          statusCode: 200,
          body: {
            user: {
              id: 'new-user-id',
              email: email
            },
            session: null
          }
        })
      }
    }).as('signUpRequest')
  }
}
