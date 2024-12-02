import './commands'
import './auth'
import '@cypress/code-coverage/support'

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      login(): void
    }
  }
}

export {}
