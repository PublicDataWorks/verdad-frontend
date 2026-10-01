import { describe, expect, it } from 'vitest'
import { cn } from '../utils'

describe('cn', () => {
  it('joins class names and drops falsy values', () => {
    expect(cn('a', undefined, false, null, 'b')).toBe('a b')
  })

  it('lets the last conflicting Tailwind utility win', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    expect(cn('text-red-500', { 'text-blue-500': true })).toBe('text-blue-500')
  })
})
