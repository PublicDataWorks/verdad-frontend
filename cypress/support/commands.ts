import '@testing-library/cypress/add-commands'
import { BROADCAST_PATH } from '../../src/constants/routes'

Cypress.Commands.add('seed', () => {
  cy.intercept('GET', BROADCAST_PATH, {
    fixture: 'broadcasts.json'
  }).as('seed')
  cy.visit('/')
  cy.wait('@seed')
})
