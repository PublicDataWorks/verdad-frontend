// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import '@testing-library/cypress/add-commands'

Cypress.Commands.add('login', email => {
  const testEmail = email || Cypress.env('ACCOUNT_TEST_EMAIL')
  cy.log('testEmail', testEmail)
  const baseUrl = Cypress.env('API_BASE_URL') || 'https://0.0.0.0:9000'
  cy.log('baseUrl', baseUrl)
  cy.exec(`./scripts/vend_jwt.sh ${testEmail}`).then(() => {
    cy.readFile('./.jwt').then(jwt => {
      cy.log('jwt', jwt)
      cy.setCookie('app.at_exp', `${Date.now() + 1000000}`)
      cy.intercept(`${baseUrl}/**`, req => {
        req.headers['authorization'] = jwt
      }).as('headers')
    })
  })
})

Cypress.Commands.add('loginFA', (email, password) => {
  // Use provided credentials or default to environment variables
  const testEmail = email || Cypress.env('ACCOUNT_TEST_EMAIL')
  const testPassword = password || Cypress.env('ACCOUNT_TEST_PASSWORD')

  // Register the handler for expected uncaught exceptions
  cy.on('uncaught:exception', (err, runnable) => {
    if (err.message.includes('PublicKeyCredential is not defined')) {
      return false
    }
    return true
  })

  // Visit the base URL
  cy.visit('/')
  cy.findByRole('button', { name: /Sign in/i }).click()

  // Perform login in the specific origin
  cy.origin(
    Cypress.env('FUSIONAUTH_HOST'),
    { args: { email: testEmail, password: testPassword } },
    ({ email, password }) => {
      // Register the handler again for the specific origin
      cy.on('uncaught:exception', (err, runnable) => {
        if (err.message.includes('PublicKeyCredential is not defined')) {
          return false
        }
        return true
      })

      // Clear and type in the login and password inputs
      cy.get('input[name="loginId"]').type(email)
      cy.get('input[name="password"]').type(password)

      // Click the sign-in button
      cy.get('button')
        .contains(/^Sign in$/)
        .click()
    }
  )
})
