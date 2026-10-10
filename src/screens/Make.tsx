import { useState } from 'preact/hooks'
import { addPromise } from '../promises'
import { currentQuery, navigate } from '../router'
import { DesktopNav, Segments } from './shared'

/**
 * The make screen. The draft can be prefilled through the hash query, e.g.
 * `#/make?text=call%20mum`, which the broken-promise screen uses for "Promise
 * it again". Whitespace-only text cannot be submitted.
 */
export function Make() {
  const [draft, setDraft] = useState(() => currentQuery().get('text') ?? '')
  const canSubmit = draft.trim() !== ''

  function submit(event: Event): void {
    event.preventDefault()
    if (!canSubmit) return
    const record = addPromise(draft.trim())
    if (!record) return
    navigate(`/made/${record.id}`)
  }

  return (
    <div class="screen make-screen">
      <DesktopNav />

      <div class="make-cancel">
        <a class="cancel-link" href="#/">
          Cancel
        </a>
      </div>

      <form class="make-form" onSubmit={submit}>
        <label class="make-label" for="promise">
          I promise to
        </label>
        <textarea
          id="promise"
          class="make-input"
          rows={4}
          placeholder="finally fix that tap"
          value={draft}
          onInput={(event) => setDraft(event.currentTarget.value)}
        />

        <div class="make-ink">
          <Segments />
          <p class="explainer">
            This promise has 30 days of ink. Each day it fades a little. Keep it, or it goes to the
            hall of broken promises, forever.
          </p>
        </div>

        <div class="make-actions">
          <button class="pill make-submit" type="submit" disabled={!canSubmit}>
            I promise
          </button>
          <a class="cancel-link cancel-link--desktop" href="#/">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
