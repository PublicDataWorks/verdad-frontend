// cypress/e2e/snippet-detail.cy.ts

describe('SnippetDetail', () => {
  beforeEach(() => {
    cy.login()

    // Mock the get_snippet API call
    cy.intercept('POST', '**/rpc/get_snippet', {
      fixture: 'snippet.json'
    }).as('getSnippet')

    cy.intercept('POST', '**/rpc/get_public_snippet', {
      fixture: 'snippet.json'
    }).as('getPublicSnippet')

    // Mock the like_snippet API call
    cy.intercept('POST', '**/rpc/like_snippet', {
      statusCode: 200,
      body: {
        like_count: 11,
        dislike_count: 6
      }
    }).as('likeSnippet')

    cy.intercept('POST', '**/rpc/toggle_star_snippet', {
      statusCode: 200,
      body: {
        snippet_starred: true,
        message: 'Snippet added to favorites'
      }
    }).as('toggleStar')

    cy.intercept('POST', '**/rpc/search_related_snippets_public', {
      fixture: 'relatedSnippets.json'
    }).as('getRelatedSnippets')
    cy.intercept('POST', '**/rpc/is_admin', {
      statusCode: 200,
      body: {
        is_admin: false
      }
    }).as('isAdmin')

    cy.visit('/snippet/123') // Use a valid snippet ID
  })

  it('should render the snippet details correctly', () => {
    cy.get('div.bg-background-gray-light').should('be.visible')
    cy.get('div.space-y-4').should('be.visible')
    cy.get('h2.text-2xl').should('be.visible').contains('Stem Cells: A Magical Solution?')
    cy.get('p.text-sm').should('be.visible').contains('Summary of the snippet.')
  })

  it('should navigate back when the back button is clicked', () => {
    cy.get('button').contains('Back').click()
    cy.url().should('include', '/search')
  })

  it('should display the download menu correctly', () => {
    cy.get('button').contains('Download').click()
    cy.get('div[role="menu"]').should('be.visible')
    cy.contains('Original Transcript').should('be.visible')
    cy.contains('Translated Transcript').should('be.visible')
    cy.contains('Audio').should('be.visible')
  })

  it('should handle like interaction correctly', () => {
    cy.get('button').contains('10').should('exist')
    cy.get('button').find('[data-testid="thumbs-up"]').click()
    cy.wait('@likeSnippet')
    cy.get('button').contains('11').should('exist')
  })

  it('should handle dislike interaction correctly', () => {
    cy.get('button').contains('5').should('exist')
    cy.get('button').find('[data-testid="thumbs-down"]').click()
    cy.wait('@likeSnippet')
    cy.get('button').contains('6').should('exist')
  })

  it('should display the language tabs correctly', () => {
    cy.get('[data-testid="language-tabs"]')
      .should('be.visible')
      .within(() => {
        cy.get('button').first().should('have.text', 'spanish')
        cy.get('button').last().should('have.text', 'english')
      })
  })

  it('should display the related snippets correctly', () => {
    cy.get('[data-testid="related-snippets-container"]').should('be.visible')
    cy.get('[data-testid="related-snippet-card"]').should('have.length', 2)
  })

  it('should not show admin tools if the user is not an admin', () => {
    cy.get('[data-testid="snippet-visibility-toggle"]').should('not.exist')
  })

  it('should show admin tools if the user is an admin', () => {
    cy.intercept('POST', '**/rpc/get_roles', {
      body: ['admin', 'user']
    }).as('getRoles')

    cy.reload()
    cy.wait('@getRoles')
    cy.get('[data-testid="snippet-visibility-toggle"]').should('be.visible')
  })

  it('should display the share button correctly', () => {
    cy.get('[data-testid="share-button"]').should('be.visible')
  })
})
