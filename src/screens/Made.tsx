import { listText, usePromises } from '../promises'
import { madeDetail } from '../format'
import type { RouteProps } from '../router'
import { NotFound } from './NotFound'
import { DesktopNav, Segments } from './shared'

/** The confirmation shown right after a promise is made. */
export function Made({ params }: RouteProps) {
  const promises = usePromises()
  const promise = promises.find((record) => record.id === params.id)
  if (!promise) return <NotFound />

  return (
    <div class="screen made-screen">
      <DesktopNav />

      <main class="made-main">
        <div class="made-block">
          <div class="made-heading">
            <span class="made-label">I promise to</span>
            <p class="made-text">{listText(promise.text)}</p>
          </div>

          <Segments animated />

          <div class="made-foot">
            <div class="made-detail">
              <p class="made-detail__headline">You have 30 days to keep it.</p>
              <p class="made-detail__meta">{madeDetail(promise)}</p>
            </div>
            <a class="pill pill--outline made-back made-back--desktop" href="#/">
              Back to my promises
            </a>
          </div>
        </div>

        <a class="pill pill--outline made-back made-back--mobile" href="#/">
          Back to my promises
        </a>
      </main>
    </div>
  )
}
