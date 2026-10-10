---
id: rep-fadce
status: closed
deps: [rep-wiigu]
links: []
created: 2026-10-10T14:19:24Z
type: feature
priority: 1
assignee: Stavros Korokithakis
---
# Light screens: list, make, made, kept (+undo), mobile and desktop

Objective: build the light-theme screens to match the design references, responsive with one breakpoint between the mobile and desktop layouts.

Design references in design/: mobile-* and desktop-* for list, make, made, kept. Follow their layout, type sizes, spacing, copy and animations (keyframes soak/rise/seg on 'made', inkin on 'kept'). Replace the sample data with real data from the store.

Screens:
- List: header with title and counts line; hall icon button + bottom 'N broken promises rest in the hall' link (singular copy: 'Your first broken promise rests in the hall'), both hidden when there are no broken promises. Each item: ring button (keeps it and goes to Kept screen), faded text, ink meter, meta line. Kept-today items show the filled check and 'kept today'. Desktop: top nav (Open / The hall (N)), inline 'I promise to ___' form, side panel 'Recently broken' with the last 3 broken (hidden when none) and the 30-days explainer.
- Make: 'I promise to' textarea, 30-segment ink strip, explainer, 'I promise' button, Cancel. Empty or whitespace text cannot be submitted. Supports a prefilled draft (used by 'Promise it again' in the dark-screens ticket).
- Made: shows the new promise, 'You have 30 days to keep it.', promised and ink-runs-out dates, 'Back to my promises'.
- Kept: seal with date (day · Roman month · year) and 'No. N', text, 'Promised X. Kept Y, with N days of ink to spare.', 'A kept promise needs no memorial.', 'Back to my promises'. Add a small 'Undo' link that un-keeps the promise and returns to the list. Undo is only available on this screen, right after keeping; it is not reachable later.
- Desktop nav 'The hall (N)' links to the hall route even though that screen is built in the next ticket.

Non-goals: hall and broken-promise screens, edit/delete, dark mode for light screens, settings.


## Notes

**2026-10-10T14:21:44Z**

ready for implementation

**2026-10-10T14:31:10Z**

Also: make the screens re-evaluate time-based rules while the app stays open (e.g. the usePromises hook or a small useNow hook re-renders once a minute and on visibilitychange), so kept-today items vanish after midnight and ink fades without a reload.
