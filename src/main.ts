import App from './app'
import Input from './input'
import Content from './content'
import Graphics from './graphics'
import Scene1 from './scene1'

function start(element: HTMLElement) {

  let graphics = Graphics.make()
  let scene = Scene1.make()

  App.run({
    on_update() {
      Input.update()
      scene.update()
    },
    on_render() {
      scene.draw(graphics)
    }
  })

  element.appendChild(graphics.canvas)

}

async function app(element: HTMLElement) {
  await Content.load()
  start(element)
}

app(document.getElementById('app')!)
