import { useEffect } from 'preact/hooks'
import type { PromiseRecord } from '../promises'
import {
  LIFESPAN_DAYS,
  counts,
  fade,
  inkFraction,
  keepPromise,
  listText,
  usePromises,
} from '../promises'
import { markJustKept } from '../justKept'
import { keptMeta, openMetaDesktop, openMetaMobile } from '../format'
import { navigate } from '../router'
import { useNow } from '../useNow'

/** Flame in an arch, the hall's mark on the list icon button. */
function HallIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3c2 2.5 3 4.2 3 5.8A3 3 0 0 1 9 8.8C9 7.2 10 5.5 12 3z" />
      <path d="M9 14h6v7H9z" />
      <path d="M12 11.8V14" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 22 30" aria-hidden="true">
      <path d="M11 1c4 5 6 8.5 6 11.5a6 6 0 0 1-12 0C5 9.5 7 6 11 1z" fill="#E3A857" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F3F3F0"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

/** Back arrow used by the hall screens. */
function BackIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  )
}

/** The hall's flame resting in its arch, as shown at the top of the hall. */
function HallFlame({ className }: { className?: string }) {
  return (
    <svg class={className} viewBox="0 0 22 30" aria-hidden="true">
      <path d="M11 1c4 5 6 8.5 6 11.5a6 6 0 0 1-12 0C5 9.5 7 6 11 1z" fill="#E3A857" />
      <rect x="7" y="20" width="8" height="10" fill="#3A3833" />
    </svg>
  )
}

/** The small flame on a plaque's candle count and on the candle button. */
function CandleFlame({
  width = 9,
  height = 12,
  className,
}: {
  width?: number
  height?: number
  className?: string
}) {
  return (
    <svg class={className} width={width} height={height} viewBox="0 0 22 30" aria-hidden="true">
      <path d="M11 1c4 5 6 8.5 6 11.5a6 6 0 0 1-12 0C5 9.5 7 6 11 1z" fill="#E3A857" />
    </svg>
  )
}

/**
 * Applies the dark hall theme to the document root while a hall screen is
 * mounted, restoring the light theme on unmount. `enabled` lets a screen that
 * falls back to `NotFound` (an unknown id) keep the light theme.
 */
export function useHallTheme(enabled = true): void {
  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    root.setAttribute('data-theme', 'hall')
    return () => {
      root.setAttribute('data-theme', 'light')
    }
  }, [enabled])
}

/**
 * The 30 day-segments strip. In the make screen the segments are static; in the
 * made screen they rise in one by one (the `seg` keyframe, staggered by 28ms).
 */
export function Segments({ animated = false }: { animated?: boolean }) {
  return (
    <div class="segments" aria-hidden="true">
      {Array.from({ length: LIFESPAN_DAYS }, (_, index) => {
        const alpha = (1 - index / LIFESPAN_DAYS) * 0.88 + 0.12
        return (
          <span
            key={index}
            class={animated ? 'segment segment--animated' : 'segment'}
            style={{
              backgroundColor: `rgba(24,25,27,${alpha.toFixed(3)})`,
              animationDelay: animated ? `${1100 + index * 28}ms` : undefined,
            }}
          />
        )
      })}
    </div>
  )
}

/** Top navigation shown on wide screens. `active` underlines the current link. */
export function DesktopNav({ active }: { active?: 'open' | 'hall' }) {
  const promises = usePromises()
  const now = useNow()
  const broken = counts(promises, now).broken
  const openActive = active === 'open'
  const hallActive = active === 'hall'
  return (
    <header class="desk-nav">
      <nav aria-label="Main">
        <a class="desk-nav__brand" href="#/">
          Promises
        </a>
        <div class="desk-nav__links">
          <a
            class={openActive ? 'desk-nav__link is-active' : 'desk-nav__link'}
            href="#/"
            aria-current={openActive ? 'page' : undefined}
          >
            Open
          </a>
          {broken > 0 && (
            <a
              class={hallActive ? 'desk-nav__link is-active' : 'desk-nav__link'}
              href="#/hall"
              aria-current={hallActive ? 'page' : undefined}
            >
              The hall ({broken})
            </a>
          )}
        </div>
      </nav>
    </header>
  )
}

/** The dark "Recently broken" card on the desktop list. */
export function RecentlyBroken({ promises }: { promises: PromiseRecord[] }) {
  return (
    <a class="broken-panel" href="#/hall">
      <span class="broken-panel__label">
        <FlameIcon />
        RECENTLY BROKEN
      </span>
      <ol class="broken-panel__list">
        {promises.map((promise) => (
          <li key={promise.id} class="broken-panel__item">
            {listText(promise.text)}
          </li>
        ))}
      </ol>
      <span class="broken-panel__visit">Visit the hall</span>
    </a>
  )
}

/**
 * A single row of the promise list. Kept promises show the filled check and are
 * inert; open ones show the ink ring and, when clicked, are kept before the
 * browser follows the link to the kept screen.
 */
export function PromiseItem({ promise, now }: { promise: PromiseRecord; now: Date }) {
  const kept = promise.keptAt !== undefined
  const ink = inkFraction(promise, now)
  const style = fade(promise, now)
  const alpha = style.alpha.toFixed(3)
  const textStyle = {
    color: `rgba(24,25,27,${alpha})`,
    filter: `blur(${style.blur}px)`,
    letterSpacing: `${style.letterSpacing.toFixed(3)}em`,
  }
  const ringStyle = { borderColor: `rgba(24,25,27,${alpha})` }
  const meterStyle = {
    width: `${(ink * 100).toFixed(1)}%`,
    backgroundColor: kept ? '#18191B' : `rgba(24,25,27,${alpha})`,
  }
  const label = `${kept ? 'Kept: ' : 'Keep this promise: '}${promise.text}`
  const meta = kept
    ? keptMeta(promise)
    : { mobile: openMetaMobile(promise, now), desktop: openMetaDesktop(promise, now) }

  return (
    <li class="promise">
      {kept ? (
        <button type="button" class="promise__mark promise__mark--kept" aria-label={label} disabled>
          <span class="promise__check">
            <CheckIcon />
          </span>
        </button>
      ) : (
        <button
          type="button"
          class="promise__mark"
          aria-label={label}
          onClick={() => {
            if (!keepPromise(promise.id)) return
            markJustKept(promise.id)
            navigate(`/kept/${promise.id}`)
          }}
        >
          <span class="promise__ring" style={ringStyle} />
        </button>
      )}
      <div class="promise__body">
        <span class="promise__text" style={textStyle}>
          {listText(promise.text)}
        </span>
        <div class="promise__meter">
          <div class="promise__meter-fill" style={meterStyle} />
        </div>
        <span class="promise__meta promise__meta--mobile">
          {typeof meta === 'string' ? meta : meta.mobile}
        </span>
        <span class="promise__meta promise__meta--desktop">
          {typeof meta === 'string' ? meta : meta.desktop}
        </span>
      </div>
    </li>
  )
}

export { HallIcon, ArrowIcon, BackIcon, HallFlame, CandleFlame }
