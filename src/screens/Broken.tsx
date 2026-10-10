import { useEffect, useRef } from 'preact/hooks'
import {
  brokenDate,
  brokenNumber,
  canLightCandle,
  isBroken,
  lightCandle,
  litToday,
  recordOpened,
  sentenceText,
  usePromises,
} from '../promises'
import type { PromiseRecord } from '../promises'
import { formatFullDate, timesLabel } from '../format'
import { useNow } from '../useNow'
import type { RouteProps } from '../router'
import { NotFound } from './NotFound'
import { BackIcon, CandleFlame, DesktopNav, useHallTheme } from './shared'

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div class="broken-meta__item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

/**
 * The broken-promise detail. The screen records one view per visit (the `opened`
 * counter), lets the visitor light one candle per day, and offers to make the
 * same promise again with its text prefilled.
 */
export function Broken({ params }: RouteProps) {
  const id = params.id ?? ''
  const promises = usePromises()
  const now = useNow()
  const promise = promises.find((record) => record.id === id)
  const broken = promise !== undefined && isBroken(promise, now)

  // Record the view once per visit, not on every re-render: the ref guards
  // against effect double-runs, and the effect only depends on the id.
  const recorded = useRef<string | null>(null)
  useEffect(() => {
    if (!broken || recorded.current === id) return
    recorded.current = id
    recordOpened(id)
  }, [broken, id])

  useHallTheme(broken)

  if (!broken || promise === undefined) return <NotFound />
  const number = brokenNumber(promises, id, now)
  if (number === undefined) return <NotFound />
  return <BrokenView promise={promise} now={now} number={number} />
}

function BrokenView({
  promise,
  now,
  number,
}: {
  promise: PromiseRecord
  now: Date
  number: number
}) {
  const lit = litToday(promise, now)
  const canLight = canLightCandle(promise, now)

  return (
    <div class={lit ? 'screen broken-screen is-lit' : 'screen broken-screen'}>
      <DesktopNav active="hall" />

      <main class="broken-main">
        <a class="broken-back" href="#/hall">
          <BackIcon />
          The hall
        </a>

        <article class="broken-article">
          <span class="broken-kicker">BROKEN PROMISE NO. {number}</span>
          <h1 class="broken-title">I promised to {sentenceText(promise.text)}</h1>
          <div class="broken-rule" />
          <dl class="broken-meta">
            <MetaItem label="Promised" value={formatFullDate(new Date(promise.createdAt))} />
            <MetaItem label="Broken" value={formatFullDate(brokenDate(promise))} />
            <MetaItem label="Opened" value={timesLabel(promise.opened)} />
            <MetaItem label="Candles" value={String(promise.candleDays.length)} />
          </dl>
        </article>

        <div class="broken-actions">
          <div class="broken-actions__buttons">
            <button
              type="button"
              class={lit ? 'broken-candle is-lit' : 'broken-candle'}
              aria-pressed={lit}
              disabled={!canLight}
              onClick={() => lightCandle(promise.id)}
            >
              <CandleFlame width={14} height={19} className="broken-candle__flame" />
              <span class="broken-candle__label broken-candle__label--mobile">
                {lit ? 'You lit a candle' : 'Light a candle'}
              </span>
              <span class="broken-candle__label broken-candle__label--desktop">
                {lit ? 'You lit a candle today' : 'Light a candle'}
              </span>
            </button>
            <a
              class="broken-again"
              href={`#/make?text=${encodeURIComponent(promise.text)}`}
            >
              Promise it again
            </a>
          </div>
          <p class="broken-note">This promise cannot be removed.</p>
        </div>
      </main>
    </div>
  )
}
