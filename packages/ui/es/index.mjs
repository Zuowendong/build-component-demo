import Button from './button/index.mjs'
import Tree from './tree/index.mjs'

export * from './button/index.mjs'
export * from './tree/index.mjs'


function install(app) {
  Button.install && app.use(Button)
  Tree.install && app.use(Tree)
}

export {
  version,
  install,
  Button,
  Tree
}

export default {
  version,
  install,
  Button,
  Tree
}
