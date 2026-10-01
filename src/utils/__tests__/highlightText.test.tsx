import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { highlightText } from '../highlightText'

describe('highlightText', () => {
  it('returns the text untouched for empty or single-character search terms', () => {
    expect(highlightText('hello world', '')).toBe('hello world')
    expect(highlightText('hello world', 'h')).toBe('hello world')
  })

  it('wraps every case-insensitive match in a <mark>', () => {
    render(<p>{highlightText('Vote early, VOTE often', 'vote')}</p>)

    const marks = screen.getAllByText(/vote/i, { selector: 'mark' })
    expect(marks).toHaveLength(2)
    expect(marks.map(m => m.textContent)).toEqual(['Vote', 'VOTE'])
  })

  it('falls back to the plain text when the term is not a valid regular expression', () => {
    expect(highlightText('a (b', '(b')).toBe('a (b')
  })
})
