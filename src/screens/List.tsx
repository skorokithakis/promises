import { useState } from 'preact/hooks'
import {
  addPromise,
  brokenOrder,
  counts,
  isVisibleInList,
  usePromises,
} from '../promises'
import type { PromiseRecord } from '../promises'
import { countsLine, hallLine } from '../format'
import { useNow } from '../useNow'
import { navigate } from '../router'
import { ArrowIcon, BrandMark, DesktopNav, HallIcon, PromiseItem, RecentlyBroken } from './shared'

function byNewest(a: PromiseRecord, b: PromiseRecord): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

/** The promise list: the app's home screen on both layouts. */
export function List() {
  const promises = usePromises()
  const now = useNow()
  const [draft, setDraft] = useState('')

  const totals = counts(promises, now)
  const items = promises.filter((promise) => isVisibleInList(promise, now)).sort(byNewest)
  const recentBroken = brokenOrder(promises, now).slice(-3).reverse()
  const hasHall = totals.broken > 0

  function makePromise(text: string): void {
    const trimmed = text.trim()
    if (trimmed.length === 0) return
    const record = addPromise(trimmed)
    if (!record) return
    setDraft('')
    navigate(`/made/${record.id}`)
  }

  return (
    <div class="screen list-screen">
      <DesktopNav active="open" />

      <header class="list-header">
        <div class="list-header__row">
          <h1 class="list-header__title brand">
            <BrandMark />
            Promises
          </h1>
          {hasHall && (
            <a class="icon-button" href="#/hall" aria-label="Hall of broken promises">
              <HallIcon />
            </a>
          )}
        </div>
        <p class="counts">{countsLine(totals)}</p>
      </header>

      <main class="list-main">
        <section class="list-col">
          <form
            class="quick-add"
            onSubmit={(event) => {
              event.preventDefault()
              makePromise(draft)
            }}
          >
            <label class="quick-add__label" for="new-promise">
              I promise to
            </label>
            <input
              id="new-promise"
              class="quick-add__input"
              type="text"
              placeholder="finally fix that tap"
              value={draft}
              onInput={(event) => setDraft(event.currentTarget.value)}
            />
            <button class="pill quick-add__button" type="submit" disabled={draft.trim() === ''}>
              I promise
            </button>
          </form>

          <div class="list-block">
            <p class="counts counts--desktop">{countsLine(totals)}</p>
            <ul class="promise-list">
              {items.length === 0 && (
                <li class="list-empty">Don't make promises you can't keep.</li>
              )}
              {items.map((promise) => (
                <PromiseItem key={promise.id} promise={promise} now={now} />
              ))}
              {hasHall && (
                <li class="hall-row">
                  <a class="hall-link" href="#/hall">
                    {hallLine(totals.broken)}
                    <ArrowIcon />
                  </a>
                </li>
              )}
            </ul>
          </div>
        </section>

        <aside class="list-aside">
          {hasHall && <RecentlyBroken promises={recentBroken} />}
          <p class="explainer">You'd better keep your promises.</p>
        </aside>
      </main>

      <div class="list-cta">
        <a class="pill" href="#/make">
          Make a promise
        </a>
      </div>
    </div>
  )
}
