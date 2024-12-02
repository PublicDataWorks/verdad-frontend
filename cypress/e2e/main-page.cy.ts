// cypress/e2e/search-interface.cy.ts

describe('SearchInterface', () => {
  beforeEach(() => {
    cy.login()

    // Mock API responses
    cy.intercept('POST', '**/rpc/get_snippets', {
      statusCode: 200,
      fixture: 'snippets.json'
    }).as('getSnippets')

    cy.intercept('POST', '**/rpc/get_filtering_options', {
      fixture: 'filterOptions.json'
    }).as('getFilterOptions')

    cy.visit('/search')
  })

  it('should render main components correctly', () => {
    cy.get('[data-testid="search-interface"]').should('be.visible')
    cy.get('[data-testid="sort-dropdown"]').should('be.visible')
  })

  it('should display snippet card elements correctly', () => {
    // Wait for data to load
    cy.wait('@getSnippets')
    cy.wait('@getFilterOptions')

    // Get the first snippet card
    cy.get('[data-testid="snippet-card"]')
      .should('exist')
      .first()
      .within(() => {
        // Check each element individually with better error messages
        cy.get('[data-testid="snippet-title"]')
          .should('exist')
          .should('be.visible')
          .then($el => {
            cy.log('Found title:', $el.text())
          })

        cy.get('[data-testid="snippet-summary"]')
          .should('exist')
          .should('be.visible')
          .then($el => {
            cy.log('Found summary:', $el.text())
          })

        cy.get('[data-testid="snippet-actions"]')
          .should('exist')
          .should('be.visible')
          .then($el => {
            cy.log('Found actions:', $el.html())
          })
      })
  })

  it('should display correct snippet content', () => {
    cy.wait('@getSnippets')

    // Assuming your fixture has a snippet with this title
    cy.contains('h3', 'Stem Cells: A Magical Solution?').should('be.visible')
  })

  // Test sorting functionality
  it('should handle sorting options', () => {
    cy.get('[data-testid="sort-dropdown"]').click()
    cy.contains('Most upvotes').click()
    cy.wait('@getSnippets')
    // Add assertions for sorted content
  })
})

describe('Snippet Like/Dislike Interactions', () => {
  beforeEach(() => {
    cy.login()

    // Mock API responses
    cy.intercept('POST', '**/rpc/get_snippets', {
      statusCode: 200,
      fixture: 'snippets.json'
    }).as('getSnippets')

    cy.intercept('POST', '**/rpc/like_snippet', {
      statusCode: 200,
      body: {
        like_count: 11,
        dislike_count: 6
      }
    }).as('likeSnippet')

    cy.visit('/search')
    cy.wait('@getSnippets')
  })

  it('should handle thumbs up interaction correctly', () => {
    cy.get('[data-testid="snippet-card"]')
      .first()
      .within(() => {
        // Initial state
        cy.get('button').contains('10').should('exist') // Assuming initial like count is 10

        // Click thumbs up
        cy.get('button').find('[data-testid="thumbs-up"]').click()

        // Verify optimistic update
        cy.get('button').contains('11').should('exist')

        // Wait for API response
        cy.wait('@likeSnippet')

        // Verify final state
        cy.get('button').contains('11').should('exist')
      })
  })

  it('should handle thumbs down interaction correctly', () => {
    cy.get('[data-testid="snippet-card"]')
      .first()
      .within(() => {
        // Initial state
        cy.get('button').contains('5').should('exist') // Assuming initial dislike count is 5

        // Click thumbs down
        cy.get('button').find('[data-testid="thumbs-down"]').click()

        // Verify optimistic update
        cy.get('button').contains('6').should('exist')

        // Wait for API response
        cy.wait('@likeSnippet')
      })
  })

  it('should toggle like status when clicking multiple times', () => {
    cy.get('[data-testid="snippet-card"]')
      .first()
      .within(() => {
        // Click thumbs up twice
        cy.get('button').find('[data-testid="thumbs-up"]').click()
        cy.wait('@likeSnippet')

        cy.get('button').find('[data-testid="thumbs-up"]').click()
        cy.wait('@likeSnippet')
      })
  })

  it('should handle switching between like and dislike', () => {
    cy.get('[data-testid="snippet-card"]')
      .first()
      .within(() => {
        // Click thumbs up
        cy.get('button').find('[data-testid="thumbs-up"]').click()
        cy.wait('@likeSnippet')

        // Then click thumbs down
        cy.get('button').find('[data-testid="thumbs-down"]').click()
        cy.wait('@likeSnippet')
      })
  })

  it('should handle API errors gracefully', () => {
    // Mock API error
    cy.intercept('POST', '**/rpc/like_snippet', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('likeSnippetError')

    cy.get('[data-testid="snippet-card"]')
      .first()
      .within(() => {
        const initialLikeCount = 10

        // Click thumbs up
        cy.get('button').find('[data-testid="thumbs-up"]').click()

        // Wait for failed API call
        cy.wait('@likeSnippetError')

        // Verify count reverted to initial state
        cy.get('button').contains(initialLikeCount.toString()).should('exist')
      })
  })
})

describe('Sidebar functionality', () => {
  beforeEach(() => {
    cy.login()
    cy.intercept('POST', '**/rpc/get_snippets', {
      statusCode: 200,
      fixture: 'snippets.json'
    }).as('getSnippets')
    cy.intercept('POST', '**/rpc/get_filtering_options', {
      fixture: 'filterOptions.json'
    }).as('getFilterOptions')
    cy.visit('/search')
  })

  const selectOption = (name: string, option: string) => {
    cy.get(`[name="${name}"]`).click()
    cy.contains(option).click()
    cy.get('[data-testid="sidebar"]').click(0, 0)
  }

  // Helper to check if URL has specific filter parameter
  const checkUrlParam = (filterName: string) => {
    cy.url().should('include', `${filterName}=`)
  }

  it('should have correct parameter name for source language', () => {
    selectOption('sourceLanguage', 'English')
    checkUrlParam('languages')
  })

  it('should have correct parameter name for state', () => {
    selectOption('state', 'Florida')
    checkUrlParam('states')
  })

  it('should have correct parameter name for source', () => {
    selectOption('source', 'Radio Mambi - WAQI - 710 AM')
    checkUrlParam('sources')
  })

  it('should have correct parameter name for labels', () => {
    selectOption('label', 'Misinformation')
    checkUrlParam('labels')
  })

  it('should have correct parameter names for multiple filters', () => {
    selectOption('sourceLanguage', 'English')
    selectOption('state', 'Florida')

    cy.url().should(url => {
      expect(url).to.include('languages=')
      expect(url).to.include('states=')
    })
  })

  it('should have correct parameter name for labeled by', () => {
    cy.contains('by Me').eq(0).click()
    checkUrlParam('labeledBy')
  })

  it('should update URL when selecting different positions', () => {
    cy.get('#political-spectrum').click(25, 0) // Simulate clicking different positions
    // Verify URL updates
    cy.url().should('include', `politicalSpectrum=left`)
  })

  it('should clear political spectrum filter', () => {
    cy.get('#political-spectrum').click(0, 0) // Click left position
    cy.url().should('include', 'politicalSpectrum=left')

    // Click clear button
    cy.contains('button', 'Clear').click()

    // Verify URL parameter is removed
    cy.url().should('not.include', 'politicalSpectrum')
  })

  it('should remove all filter parameters on reset', () => {
    // Apply filters
    selectOption('sourceLanguage', 'English')
    selectOption('state', 'Florida')

    // Clear filters
    cy.contains('Reset').eq(0).click({ force: true })

    // Verify no filter parameters exist
    cy.url().should(url => {
      expect(url).to.not.include('languages=')
      expect(url).to.not.include('states=')
      expect(url).to.not.include('sources=')
      expect(url).to.not.include('labels=')
      expect(url).to.not.include('labeledBy=')
      expect(url).to.not.include('starredBy=')
      expect(url).to.not.include('politicalSpectrum=')
    })
  })
})
