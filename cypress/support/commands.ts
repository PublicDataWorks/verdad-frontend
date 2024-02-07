import '@testing-library/cypress/add-commands'

Cypress.Commands.add('seed', () => {
  cy.intercept('GET', '**/broadcasts', {
    fixture: 'broadcasts.json'
  }).as('seed')
  cy.visit('/')
  cy.wait('@seed')
})
