import { render } from 'preact'
import { registerSW } from 'virtual:pwa-register'
import './fonts'
import './styles/tokens.css'
import './styles/global.css'
import './styles/light.css'
import './styles/hall.css'
// Registers the app's routes as a side effect.
import './routes'
import { App } from './app'

const root = document.getElementById('app')
if (!root) {
  throw new Error('Missing #app root element')
}

render(<App />, root)

// Register the service worker so the app works offline. `autoUpdate` handles
// refreshing to a new version; `immediate` registers on load rather than on the
// window `load` event.
registerSW({ immediate: true })

// Ask the browser to keep our localStorage from being evicted. Best effort only:
// the result (and any failure) is deliberately ignored.
const storage = navigator.storage
if (storage && typeof storage.persist === 'function') {
  storage.persist().catch(() => {})
}
