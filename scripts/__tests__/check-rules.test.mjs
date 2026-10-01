import { describe, expect, it } from 'vitest'
import { globToRegExp } from '../check-rules.mjs'

const matches = (glob, path) => globToRegExp(glob).some(pattern => pattern.test(path))

describe('globToRegExp', () => {
  it('matches `**/` at any depth, including none', () => {
    expect(matches('**/__tests__/**', 'src/apis/__tests__/x.test.ts')).toBe(true)
    expect(matches('**/__tests__/**', '__tests__/x.ts')).toBe(true)
  })

  it('only matches `**/` at a path boundary', () => {
    expect(matches('**/__tests__/**', 'src/foo__tests__/bar.ts')).toBe(false)
  })

  it('keeps a single `*` inside one path segment', () => {
    expect(matches('src/*.ts', 'src/main.ts')).toBe(true)
    expect(matches('src/*.ts', 'src/lib/main.ts')).toBe(false)
  })

  it('expands brace groups', () => {
    expect(matches('src/**/*.{ts,tsx}', 'src/components/App.tsx')).toBe(true)
    expect(matches('src/**/*.{ts,tsx}', 'src/main.ts')).toBe(true)
    expect(matches('src/**/*.{ts,tsx}', 'src/styles.css')).toBe(false)
  })
})
