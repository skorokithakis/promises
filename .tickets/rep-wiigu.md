---
id: rep-wiigu
status: closed
deps: [rep-bssmv]
links: []
created: 2026-10-10T14:19:24Z
type: task
priority: 1
assignee: Stavros Korokithakis
---
# Promise model, rules and localStorage store

Objective: one module that owns all promise data and every derived rule, so screens only render. Later this module is the only place that changes when sync arrives.

Stored per promise: id, text (as typed), createdAt, keptAt (optional), candle days (list of local dates when a candle was lit), opened count.
Storage: a JSON array in localStorage under one versioned key. Listen to the 'storage' event so other open tabs re-render on change.

Derived rules (pure functions taking an explicit 'now', so they are testable):
- Days left = 30 - full local calendar days since createdAt. Made today = 30.
- Broken = not kept and days left <= 0. Broken date = createdAt + 30 days.
- Ink fraction = days left / 30 (1 when kept). Visual fade rules (alpha, blur, letter spacing) are in design/mobile-list.html logic; put them here or in the list screen, developer's choice.
- Kept promises stay visible in the open list only until local midnight of the day they were kept; after that they only count.
- Counts: open, kept, broken.
- Kept number and broken number ('No. N') = 1-based position when sorted by keptAt / broken date (ties by createdAt). Do NOT store a counter (it would conflict with sync later).
- Undo keep: clears keptAt.
- Light a candle: at most once per local day per broken promise. Expose 'lit today'.
- Opened: increment when the broken-promise detail screen is viewed.
- Text display helpers: list form = first letter upper-cased; sentence form = first letter lower-cased plus a full stop if the text does not end in punctuation ('I promised to write the blog post.').
- Number words: numbers below 13 as words (zero..twelve), 13 and up as digits. Used by the hall subtitle (see screens ticket).

Tests (Vitest): the date rules around day boundaries and day 30, midnight disappearance of kept items, numbering order, candle once-per-day, text helpers, number words.

Non-goals: UI, sync, Yjs, migrations beyond the version in the key, editing or deleting promises (deliberately not supported).


## Notes

**2026-10-10T14:21:44Z**

ready for implementation
