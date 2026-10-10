import { brokenDate, brokenOrder, listText, usePromises } from '../promises'
import { brokenDates, hallFooter, hallSubtitle } from '../format'
import { useNow } from '../useNow'
import { BackIcon, CandleFlame, DesktopNav, HallFlame, useHallTheme } from './shared'

/**
 * The hall of broken promises: every broken promise as a plaque, newest first,
 * keeping the number it earned when it broke. Desktop adds a footer naming the
 * first promise to break.
 */
export function Hall() {
  useHallTheme()
  const promises = usePromises()
  const now = useNow()

  // `brokenOrder` is earliest break first, so its index + 1 is the plaque
  // number; the hall shows the newest first.
  const broken = brokenOrder(promises, now)
  const newestFirst = [...broken].reverse()
  const first = broken[0]

  return (
    <div class="screen hall-screen">
      <DesktopNav active="hall" />

      <header class="hall-header">
        <a class="hall-back" href="#/">
          <BackIcon />
          Promises
        </a>
        <div class="hall-hero">
          <HallFlame className="hall-flame" />
          <span class="hall-kicker">THE HALL OF</span>
          <h1 class="hall-title">Broken promises</h1>
          <p class="hall-subtitle">{hallSubtitle(broken.length)}</p>
        </div>
      </header>

      <main class="hall-main">
        <ol class="hall-list">
          {newestFirst.map((promise, index) => (
            <li key={promise.id} class="hall-place">
              <a class="hall-plaque" href={`#/hall/${promise.id}`}>
                <span class="hall-plaque__top">
                  <span>NO. {broken.length - index}</span>
                  <span class="hall-plaque__candles">
                    <CandleFlame />
                    {promise.candleDays.length}
                  </span>
                </span>
                <span class="hall-plaque__text">{listText(promise.text)}</span>
                <span class="hall-plaque__dates">{brokenDates(promise)}</span>
              </a>
            </li>
          ))}
        </ol>

        {first && <p class="hall-footer">{hallFooter(brokenDate(first))}</p>}
      </main>
    </div>
  )
}
