---
id: rep-oztnf
status: closed
deps: []
links: []
created: 2026-10-10T16:15:30Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Add OG tags and a 1200x630 social banner

Ready for implementation.

Objective: link previews (Slack, WhatsApp, iMessage, X) show title 'Promises', description 'Keep your promises', and a large banner image.

Scope:
1. New static file public/og-image.png, 1200x630 PNG. Style: the dark hall theme. Background #0f0f10. The flame from public/favicon.svg (fill #E3A857, path is FLAME_PATH in src/screens/shared.tsx). Wordmark 'Promises' in Newsreader (the app serif, from @fontsource/newsreader), colour #d8d1c3. Tagline 'Keep your promises' smaller, muted #9a9488. Keep content inside the centre area, previewers crop edges. Generate it any way that works (e.g. an HTML/SVG source rendered to PNG with headless Chromium or ImageMagick). Commit only the PNG, not a generator script. Keep file size reasonable (well under 1 MB).
2. index.html head, add:
   <meta name="description" content="Keep your promises" />
   og:type website, og:site_name Promises, og:title Promises, og:description 'Keep your promises',
   og:url https://promises.stavros.io/,
   og:image https://promises.stavros.io/og-image.png, og:image:width 1200, og:image:height 630, og:image:alt,
   twitter:card summary_large_image.
   URLs must be absolute (base is './', so Vite will not rewrite them).

Non-goals: do not change the PWA manifest description. Do not add og-image.png to the service worker precache (includeAssets / globPatterns); the app never shows it. No per-route tags (hash routes, single page).

