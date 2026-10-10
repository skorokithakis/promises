import { useEffect, useState } from 'preact/hooks'
import { keptNumber, listText, undoKeep, usePromises } from '../promises'
import { clearJustKept, isJustKept } from '../justKept'
import { formatSealDate, formatSealLabel, keptSummary } from '../format'
import { navigate } from '../router'
import type { RouteProps } from '../router'
import { NotFound } from './NotFound'
import { DesktopNav } from './shared'

/**
 * Whether this visit is the one immediately after keeping. Reads the in-memory
 * marker for the current id and clears it on unmount, so reloading or returning
 * to the screen later offers no Undo.
 */
function useJustKept(id: string): boolean {
  const [justKept, setJustKept] = useState(() => isJustKept(id))
  useEffect(() => {
    setJustKept(isJustKept(id))
    return () => clearJustKept(id)
  }, [id])
  return justKept
}

function KeptActions({
  id,
  className,
  showUndo,
}: {
  id: string
  className: string
  showUndo: boolean
}) {
  return (
    <div class={className}>
      <a class="pill pill--outline" href="#/">
        Back to my promises
      </a>
      {showUndo && (
        <button
          type="button"
          class="undo"
          onClick={() => {
            undoKeep(id)
            navigate('/')
          }}
        >
          Undo
        </button>
      )}
    </div>
  )
}

/**
 * The sealed record of a kept promise. Undo lives only here, and only on the
 * visit right after keeping: the marker set when the ring is clicked (and
 * cleared when this screen unmounts) gates it.
 */
export function Kept({ params }: RouteProps) {
  const promises = usePromises()
  const justKept = useJustKept(params.id ?? '')
  const promise = promises.find((record) => record.id === params.id)
  if (!promise || promise.keptAt === undefined) return <NotFound />

  const keptAt = new Date(promise.keptAt)
  const number = keptNumber(promises, promise.id)

  return (
    <div class="screen kept-screen">
      <DesktopNav />

      <main class="kept-main">
        <div class="kept-block">
          <div class="seal" role="img" aria-label={`Seal: kept, ${formatSealLabel(keptAt)}`}>
            <div class="seal__inner">
              <span class="seal__date">{formatSealDate(keptAt)}</span>
              <span class="seal__kept">Kept</span>
              <span class="seal__no">No. {number}</span>
            </div>
          </div>

          <div class="kept-body">
            <p class="kept-text">{listText(promise.text)}</p>
            <p class="kept-summary">{keptSummary(promise)}</p>
            <p class="kept-quote">A kept promise needs no memorial.</p>
            <KeptActions
              id={promise.id}
              className="kept-actions kept-actions--desktop"
              showUndo={justKept}
            />
          </div>
        </div>

        <KeptActions
          id={promise.id}
          className="kept-actions kept-actions--mobile"
          showUndo={justKept}
        />
      </main>
    </div>
  )
}
