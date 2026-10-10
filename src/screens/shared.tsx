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
import { keptMeta, openMeta } from '../format'
import { navigate } from '../router'
import { useNow } from '../useNow'

/**
 * The one flame shape used everywhere: hall, candles, brand mark, and (copied)
 * public/favicon.svg, from which the app icon PNGs are exported. In a 22x30
 * viewBox, bounding box x 5..17, y 1..18.5, leaving room for a candle below.
 * If you change it, update favicon.svg and re-export the PNGs.
 */
const FLAME_PATH =
  'M11 18.5C7.7 18.5 5 15.8 5 12.6C5 9.4 7.4 7.6 8.6 4.6C9 6.6 9.9 7.8 10.9 8.4C10.9 5.6 12.1 3 14.2 1C14 3.8 14.9 5.6 15.8 7.4C16.6 9 17 10.6 17 12.6C17 15.8 14.3 18.5 11 18.5Z'

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
      {/* The shared flame at half size, tip at y=3, base at the wick (y=11.75).
          The stroke is doubled to cancel the scale and match the other strokes. */}
      <path
        d={FLAME_PATH}
        transform="translate(12 3) scale(0.5) translate(-11 -1)"
        strokeWidth="3"
      />
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
      <path d={FLAME_PATH} fill="#E3A857" />
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
      <path d={FLAME_PATH} fill="#E3A857" />
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
      <path d={FLAME_PATH} fill="#E3A857" />
    </svg>
  )
}

const THEME_COLOR_LIGHT = '#f3f3f0'
const THEME_COLOR_HALL = '#0f0f10'

function setThemeColor(color: string): void {
  const meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) return
  meta.setAttribute('content', color)
}

/**
 * Applies the dark hall theme to the document root while a hall screen is
 * mounted, restoring the light theme on unmount. `enabled` lets a screen that
 * falls back to `NotFound` (an unknown id) keep the light theme.
 *
 * The browser/OS chrome colour (the `theme-color` meta tag) follows the screen,
 * so the installed app's status bar matches the hall's dark background.
 */
export function useHallTheme(enabled = true): void {
  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    root.setAttribute('data-theme', 'hall')
    setThemeColor(THEME_COLOR_HALL)
    return () => {
      root.setAttribute('data-theme', 'light')
      setThemeColor(THEME_COLOR_LIGHT)
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

/**
 * The app icon (public/favicon.svg) shown next to the "Promises" wordmark.
 * Sized in `em` by the `.brand-mark` CSS so it tracks the wordmark's font size.
 */
export function BrandMark() {
  return (
    <svg class="brand-mark" viewBox="0 0 512 512" aria-hidden="true">
      <rect width="512" height="512" fill="#0f0f10" />
      <g transform="translate(256 256) scale(16.5) translate(-11 -9.75)">
        <path d={FLAME_PATH} fill="#E3A857" />
      </g>
    </svg>
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
        <a class="desk-nav__brand brand" href="#/">
          <BrandMark />
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
  const meta = kept ? keptMeta(promise) : openMeta(promise)

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
        <span class="promise__meta">{meta}</span>
      </div>
    </li>
  )
}

export { HallIcon, ArrowIcon, BackIcon, HallFlame, CandleFlame }
