import type { ComponentType } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { NotFound } from './screens/NotFound'

export interface RouteProps {
  /** Values captured from `:name` segments in the matched route pattern. */
  params: Record<string, string>
  /** The full path that matched, e.g. `/kept/abc`. */
  path: string
}

export interface RouteMatch {
  path: string
  params: Record<string, string>
  component: ComponentType<RouteProps>
}

interface RouteEntry {
  segments: string[]
  component: ComponentType<RouteProps>
}

const routes: RouteEntry[] = []

/**
 * Register a screen for a path pattern. Patterns are made of literal segments
 * and `:name` placeholders, e.g. `registerRoute('/kept/:id', Kept)`.
 * First registered match wins, so register specific patterns before catch-alls.
 */
export function registerRoute(pattern: string, component: ComponentType<RouteProps>): void {
  routes.push({ segments: split(pattern), component })
}

function split(path: string): string[] {
  return path.split('/').filter((segment) => segment.length > 0)
}

/** Resolve a path to a registered route, or `undefined` when nothing matches. */
export function matchRoute(path: string): RouteMatch | undefined {
  const parts = split(path)
  for (const entry of routes) {
    if (entry.segments.length !== parts.length) continue
    const params: Record<string, string> = {}
    let matched = true
    for (let i = 0; i < entry.segments.length; i += 1) {
      const segment = entry.segments[i] ?? ''
      const part = parts[i] ?? ''
      if (segment.startsWith(':')) {
        try {
          params[segment.slice(1)] = decodeURIComponent(part)
        } catch {
          matched = false
          break
        }
      } else if (segment !== part) {
        matched = false
        break
      }
    }
    if (matched) return { path, params, component: entry.component }
  }
  return undefined
}

/**
 * Normalise a raw `location.hash` into an app path like `/kept/abc`, dropping
 * any `?query` so it does not interfere with route matching.
 */
export function normalizeHash(hash: string): string {
  const raw = hash.replace(/^#/, '').split('?')[0] ?? ''
  if (raw === '' || raw === '/') return '/'
  return raw.startsWith('/') ? raw : `/${raw}`
}

/** Parse the `?query` part of a raw hash, ignoring the path. */
export function queryFromHash(hash: string): URLSearchParams {
  const question = hash.indexOf('?')
  return new URLSearchParams(question === -1 ? '' : hash.slice(question + 1))
}

/** The path for the current URL, defaulting to `/` when no hash is present. */
export function currentPath(): string {
  return normalizeHash(window.location.hash)
}

/** Query parameters from the current hash, e.g. the make screen's draft. */
export function currentQuery(): URLSearchParams {
  return queryFromHash(window.location.hash)
}

/**
 * Navigate programmatically. Prefer plain `<a href="#/make">` links where
 * possible; use this when navigation follows an action (e.g. keeping a promise).
 */
export function navigate(to: string, options: { replace?: boolean } = {}): void {
  const path = to.startsWith('/') ? to : `/${to}`
  if (currentPath() === path) return
  if (options.replace) {
    window.location.replace(`${window.location.pathname}${window.location.search}#${path}`)
  } else {
    window.location.hash = path
  }
}

/** Current matched route, re-rendering when the hash changes. */
export function useRoute(): RouteMatch | undefined {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const onHashChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  return matchRoute(path)
}

/** Renders the screen registered for the current hash route. */
export function Router() {
  const match = useRoute()
  if (!match) return <NotFound />
  const Screen = match.component
  return <Screen params={match.params} path={match.path} />
}
