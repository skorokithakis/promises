import { describe, expect, it } from 'vitest'
import { matchRoute, normalizeHash, queryFromHash, registerRoute, type RouteProps } from './router'

function Dummy(_props: RouteProps) {
  return null
}

registerRoute('/', Dummy)
registerRoute('/hall', Dummy)
registerRoute('/kept/:id', Dummy)

describe('normalizeHash', () => {
  it('treats an empty or bare hash as the root route', () => {
    expect(normalizeHash('')).toBe('/')
    expect(normalizeHash('#')).toBe('/')
    expect(normalizeHash('#/')).toBe('/')
  })

  it('strips the hash and ensures a leading slash', () => {
    expect(normalizeHash('#/make')).toBe('/make')
    expect(normalizeHash('#make')).toBe('/make')
  })

  it('drops the query string so it does not affect matching', () => {
    expect(normalizeHash('#/make?text=call%20mum')).toBe('/make')
    expect(normalizeHash('#/kept/abc?x=1')).toBe('/kept/abc')
  })
})

describe('queryFromHash', () => {
  it('reads the query string from a raw hash', () => {
    expect(queryFromHash('#/make?text=call%20mum').get('text')).toBe('call mum')
  })

  it('is empty when there is no query', () => {
    expect(queryFromHash('#/make').toString()).toBe('')
    expect(queryFromHash('').toString()).toBe('')
  })
})

describe('matchRoute', () => {
  it('matches static routes with no params', () => {
    const match = matchRoute('/hall')
    expect(match).toBeDefined()
    expect(match?.params).toEqual({})
  })

  it('captures :param segments', () => {
    expect(matchRoute('/kept/abc')?.params).toEqual({ id: 'abc' })
  })

  it('decodes captured params', () => {
    expect(matchRoute('/kept/a%20b')?.params).toEqual({ id: 'a b' })
  })

  it('returns undefined for unknown paths', () => {
    expect(matchRoute('/nope')).toBeUndefined()
    expect(matchRoute('/kept/abc/extra')).toBeUndefined()
  })

  it('treats malformed percent-encoding as no match instead of throwing', () => {
    expect(matchRoute(normalizeHash('#/kept/%'))).toBeUndefined()
    expect(matchRoute(normalizeHash('#/hall/%E0%A4'))).toBeUndefined()
  })
})
