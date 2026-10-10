---
id: rep-hnuql
status: closed
deps: []
links: []
created: 2026-10-10T15:16:43Z
type: feature
priority: 1
assignee: Stavros Korokithakis
---
# Make Promises an installable, offline PWA

Ready for implementation.

Objective: the app installs to the home screen on iOS Safari and Android Chrome, opens standalone, and works fully offline after the first visit. Hosted on Cloudflare Pages (HTTPS, static).

Scope:
- Add vite-plugin-pwa (dev dep). Configure in vite.config.ts: generateSW, registerType 'autoUpdate', precache all build output (JS, CSS, HTML, fonts incl. woff2, icons). Manifest: name/short_name 'Promises', display standalone, start_url './', scope './', background_color and theme_color '#f3f3f0'. Keep base './' working under any sub-path.
- Register the service worker from src/main.tsx (virtual:pwa-register or injectRegister, whichever is simplest; add the type reference so tsc passes).
- Icons: one SVG source (the hall flame path from src/screens/shared.tsx, fill #E3A857, on a solid #0f0f10 background, flame centred and reasonably sized). Commit exported PNGs: 192, 512, 512 maskable (flame inside the safe zone, about 80% centre circle), 180 apple-touch-icon. Plus an SVG favicon. Put them in public/. A one-off export is fine; do not add a build-time icon generator dependency.
- index.html: favicon link, apple-touch-icon link, meta theme-color '#f3f3f0', apple-mobile-web-app-title 'Promises'. Keep default iOS status bar style; do not set viewport-fit=cover.
- theme-color follows the screen: useHallTheme in src/screens/shared.tsx sets meta theme-color to '#0f0f10' with the hall theme and back to '#f3f3f0' on cleanup.
- Call navigator.storage.persist() once at startup when available; ignore the result and errors.
- README: short 'Install on your phone' note (Safari: Share > Add to Home Screen; Chrome: menu > Install app), and that on iPhone the installed app has storage separate from Safari, so promises made in one do not appear in the other.

Non-goals: push notifications, in-app install prompt, update prompt UI, data export/import, Cloudflare _headers file (Pages default Cache-Control is max-age=0, must-revalidate; confirm in Cloudflare docs, and only add _headers if that is wrong).

Caveats: dev server should not need the service worker (leave devOptions off). Existing tests and typecheck must still pass.

## Acceptance Criteria

pnpm build emits manifest, service worker and icons in dist/. In pnpm preview the manifest is valid with no install errors, the service worker controls the page, and after going offline a reload still shows the app with its data. Hall screens switch theme-color to dark and back.

