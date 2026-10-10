/**
 * Ephemeral marker for the promise that was just kept.
 *
 * The Kept screen offers Undo only on the visit immediately after keeping. This
 * set is deliberately in-memory and never persisted, so a reload, or returning
 * to the screen later, shows no Undo. The Kept screen clears its entry when it
 * unmounts.
 */
const justKept = new Set<string>()

/** Remember that `id` was kept just now, before navigating to its Kept screen. */
export function markJustKept(id: string): void {
  justKept.add(id)
}

/** Whether `id` is the promise kept immediately before this visit. */
export function isJustKept(id: string): boolean {
  return justKept.has(id)
}

/** Forget `id`, called when the Kept screen that consumed the marker unmounts. */
export function clearJustKept(id: string): void {
  justKept.delete(id)
}
