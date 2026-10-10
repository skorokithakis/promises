import { registerRoute } from './router'
import { List } from './screens/List'
import { Make } from './screens/Make'
import { Made } from './screens/Made'
import { Kept } from './screens/Kept'
import { Hall } from './screens/Hall'
import { Broken } from './screens/Broken'

registerRoute('/', List)
registerRoute('/make', Make)
registerRoute('/made/:id', Made)
registerRoute('/kept/:id', Kept)
registerRoute('/hall/:id', Broken)
registerRoute('/hall', Hall)
