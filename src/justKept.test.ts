import { afterEach, describe, expect, it } from 'vitest'
import { clearJustKept, isJustKept, markJustKept } from './justKept'

afterEach(() => {
  clearJustKept('a')
  clearJustKept('b')
})

describe('justKept', () => {
  it('marks an id until it is cleared', () => {
    expect(isJustKept('a')).toBe(false)
    markJustKept('a')
    expect(isJustKept('a')).toBe(true)
    clearJustKept('a')
    expect(isJustKept('a')).toBe(false)
  })

  it('tracks ids independently', () => {
    markJustKept('a')
    expect(isJustKept('a')).toBe(true)
    expect(isJustKept('b')).toBe(false)
  })
})
