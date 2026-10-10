import { render } from 'preact'
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
