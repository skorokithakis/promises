# Promises

A todo app, except you don't add tasks. You make promises.

Every promise comes with a deadline you can't move. Keep it, or find out what
happens when you don't.

Everything stays in your browser: no accounts, no backend, nothing leaves your
device. Sync between devices may come later.

## Running it

```sh
pnpm install
pnpm dev     # http://localhost:5173
pnpm build   # static site in dist/
pnpm test
```

## Install on your phone

Promises is an installable, offline-capable app. After the first visit it works
without a network connection.

- **iPhone (Safari):** tap Share, then **Add to Home Screen**.
- **Android (Chrome):** open the menu, then **Install app**.

Note: on iPhone the installed app has its own storage, separate from Safari. A
promise made in the installed app will not appear in Safari, and vice versa.

## License

[GNU AGPLv3](LICENSE).
