---
id: rep-bssmv
status: closed
deps: []
links: []
created: 2026-10-10T14:19:24Z
type: task
priority: 1
assignee: Stavros Korokithakis
---
# Scaffold Promises app (Vite + TS + Preact)

Objective: replace the static coming-soon index.html with a Vite + TypeScript + Preact app, managed with pnpm.

Scope:
- pnpm project, Vite with Preact preset, TypeScript strict, Vitest configured (no tests yet beyond a trivial one if needed for the runner).
- Vite base set to './' so the build works under any sub-path on any static host.
- Fonts bundled locally via @fontsource packages: Newsreader (normal + italic, weights 300-600) and Geist Mono (400, 500). No Google Fonts requests.
- Global CSS with the design tokens (colours, font stacks) taken from the design files. Light theme: bg #F3F3F0, ink #18191B, muted #5E6064, rule #E2E2DE. Dark (hall) theme: bg #0F0F10, text #D8D1C3, muted #9A9488, border #2E2D2A, flame #E3A857.
- Minimal hash router (#/ style routes). An empty placeholder screen for '#/' is enough; real screens come in later tickets.
- Copy the extracted design references into design/ in the repo with readable names. Sources are /tmp/opencode/design/t00.html .. t11.html. Order: 00 list, 01 make, 02 made, 03 kept, 04 hall, 05 broken, then 06-11 are the desktop versions of the same six. Suggested names: design/mobile-list.html, design/desktop-list.html, and so on. These are reference markup from a design tool (custom sc-if / sc-for tags and a small logic class); they are not runnable and must not be imported by the app.
- README: what the app is (one paragraph), dev/build/test commands, and a short 'Future: sync' section saying v1 is localStorage-only and the intent is a later self-hosted Yjs sync server (y-websocket client + Hocuspocus with SQLite).
- .gitignore for node_modules, dist, .playwright-mcp.

Non-goals: any screen UI, data model, storage, routing beyond a skeleton, CI, Docker, deployment config.


## Notes

**2026-10-10T14:21:44Z**

ready for implementation
