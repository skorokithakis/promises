# Promises

Promises is a small personal web app for making promises to yourself and then
either keeping them or letting them lapse: every promise gets 30 days of ink,
kept promises are sealed away, and broken promises take up residence in the
Hall of broken promises. It is a static, client-side app built with Vite,
TypeScript and Preact, styled to match the design references in `design/`.

## Commands

This project uses [pnpm](https://pnpm.io/) and Node.js 24.

```sh
pnpm install    # install dependencies
pnpm dev        # start the dev server (http://localhost:5173)
pnpm build      # typecheck and produce a production build in dist/
pnpm preview    # serve the production build locally
pnpm test       # run the Vitest suite once
pnpm test:watch # run Vitest in watch mode
pnpm typecheck  # run the TypeScript compiler without emitting
```

## Layout

- `src/main.tsx` – app entry point, mounts the Preact app.
- `src/router.tsx` – minimal hash router and the API screens use to register
  routes and navigate.
- `src/routes.ts` – route table; register new screens here.
- `src/screens/` – one module per screen.
- `src/styles/` – design tokens (`tokens.css`) and global styles.
- `src/fonts.ts` – locally bundled @fontsource imports (no Google Fonts).
- `design/` – reference markup exported from the design tool. These files are
  not runnable and are not imported by the app.

## Future: sync

Version 1 is localStorage-only: all data lives in the browser and never leaves
the device. The intent is to add optional self-hosted sync later, using a
[Yjs](https://yjs.dev/) document shared through the `y-websocket` client, with
[Hocuspocus](https://tiptap.dev/hocuspocus) on the server persisting to SQLite.
The store is deliberately the only module that touches persistence so that this
change stays contained.
