import App from './app'
import Input from './input'
import Content from './content'
import Graphics from './graphics'
import Scene1 from './scene1'

function start(element: HTMLElement) {

  let texts = Graphics.make(1920, 1080, false)
  let graphics = Graphics.make(320, 180)
  let scene = Scene1.make()

  App.run({
    on_update() {
      Input.update()
      scene.update()
    },
    on_render() {
      scene.draw(graphics, texts)
    }
  })

  element.appendChild(graphics.canvas)
  element.appendChild(texts.canvas)

}

async function app(element: HTMLElement) {
  await Content.load()
  start(element)
}

app(document.getElementById('app')!)
