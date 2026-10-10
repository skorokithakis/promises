import { useEffect, useState } from 'preact/hooks'

const ONE_MINUTE = 60_000

/**
 * A `Date` that refreshes on an interval and whenever the tab becomes visible.
 *
 * Time-derived rules (ink fading, kept-today visibility) are computed from
 * `now`, so screens must re-render as the clock moves; this hook keeps them
 * current while the app stays open without a reload.
 */
export function useNow(intervalMs: number = ONE_MINUTE): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') setNow(new Date())
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [intervalMs])
  return now
}
