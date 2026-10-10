---
id: rep-iydxn
status: closed
deps: [rep-fadce]
links: []
created: 2026-10-10T14:19:24Z
type: feature
priority: 1
assignee: Stavros Korokithakis
---
# Dark screens: hall and broken promise, mobile and desktop

Objective: build the hall of broken promises and the broken-promise detail screen, matching design/mobile-hall, mobile-broken, desktop-hall, desktop-broken.

Hall: back link, flame icon (flicker animation), 'THE HALL OF' / 'Broken promises', subtitle, plaques newest first with No., candle count, text, 'Promised X · broken Y'. Desktop uses a grid and a footer line 'The first broken promise was No. 1, on <date>.'.
Subtitle copy: '<N> things I said I would do. I thought I was better than I am.' Numbers below 13 are words with a capital at sentence start ('Three things ...'). Singular: 'One thing I said I would do. ...'.

Broken detail: 'BROKEN PROMISE NO. N', sentence form of the text ('I promised to ...'), Promised / Broken / Opened / Candles. Viewing the screen increments Opened once per visit. 'Light a candle' button lights at most once per day; after lighting it shows 'You lit a candle' (mobile) / 'You lit a candle today' (desktop) and the glow increases, as in the design. 'Promise it again' opens Make with the text prefilled. 'This promise cannot be removed.'

Non-goals: removing or editing broken promises, sharing.


## Notes

**2026-10-10T14:21:45Z**

ready for implementation

**2026-10-10T14:44:20Z**

Bundled fix from rep-fadce: Undo on the Kept screen is currently shown on any visit to #/kept/:id (for example via the Back button later). Restrict it to the visit right after keeping: e.g. an in-memory 'just kept id' set when the ring is clicked and cleared when the Kept screen unmounts. Reloading or returning later shows no Undo.
