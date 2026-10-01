import { describe, expect, it } from 'vitest'
import { getPoliticalLabel } from '../getPoliticalLabel'

describe('getPoliticalLabel', () => {
  it('maps the score bands to English labels, inclusive at the documented boundaries', () => {
    expect(getPoliticalLabel(-1, 'english')).toBe('Left')
    expect(getPoliticalLabel(-0.7, 'english')).toBe('Left')
    expect(getPoliticalLabel(-0.69, 'english')).toBe('Center Left')
    expect(getPoliticalLabel(-0.3, 'english')).toBe('Center Left')
    expect(getPoliticalLabel(0, 'english')).toBe('Center')
    expect(getPoliticalLabel(0.3, 'english')).toBe('Center')
    expect(getPoliticalLabel(0.7, 'english')).toBe('Center Right')
    expect(getPoliticalLabel(0.71, 'english')).toBe('Right')
    expect(getPoliticalLabel(1, 'english')).toBe('Right')
  })

  it('uses the Spanish translations for the same bands', () => {
    expect(getPoliticalLabel(-0.9, 'spanish')).toBe('Izquierda')
    expect(getPoliticalLabel(0, 'spanish')).toBe('Centro')
    expect(getPoliticalLabel(0.9, 'spanish')).toBe('Derecha')
  })
})
