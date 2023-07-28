import Play, { Anim, AnimData } from './play'
import Color from './color'
import Time from './time'
import Input from './input'
import Graphics from './graphics'
import Sound from './sound'
import { PhCollider } from './collider'

abstract class LevelP extends Play {

  world!: PhWorld
  solid!: PhCollider

  init() {

    this.world = this.make(PhWorld)
    this.solid = this.make(PhCollider)

    this._init()

    return this
  }


  _update() {

    let { grid } = this.solid
    let { bodies } = this.world

    // 2 pixel perfect collision detection
    bodies.forEach(body => {

      let nb = 3

      for (let i = 0; i < nb; i++) {
        let dx = Math.abs(body.dx)
        let sign = Math.sign(body.dx)

        for (let di = 1/nb; di <= dx; di+= 1/nb) {
          if (grid.is_solid_xywh(body, sign * di * Time.delta, 0)) {
            body.dx = 0
            break
          } else {
            body.x += sign * di * Time.delta
          }
        }

        let dy = Math.abs(body.dy)
        sign = Math.sign(body.dy)

        for (let di = 1/nb; di <= dy; di+= 1/nb) {
          if (grid.is_solid_xywh(body, 0, sign * di * Time.delta)) {
            body.dy = 0
            break
          } else {
            body.y += sign * di * Time.delta
          }
        }
      }
    })
  }

}



type PhBodyData = {
  x?: number,
  y?: number,
  w: number,
  h: number
}

abstract class PhBody extends Play {

  get data() {
    return this._data as PhBodyData
  }

  private _w!: number
  private _h!: number

  x!: number
  y!: number

  dx!: number
  dy!: number

  get w() {
    return this._w
  }

  get h() {
    return this._h
  }

  init() {
    this.x = this.data.x ?? 0
    this.y = this.data.y ?? 0

    this._w = this.data.w
    this._h = this.data.h

    this.dx = 0
    this.dy = 0

    return super.init()
  }
}

class PhWorld extends Play {

  get bodies() {
    return this.objects as PhBody[]
  }

  body<T extends PhBody>(ctor: { new (): T }, data: any = {}) {
    return this.make(ctor, data)
  }

  _update() {
  }
}

type PhBodyAnimData = AnimData & PhBodyData

abstract class PhBodyAnim extends PhBody {

  get data() {
    return this._data as PhBodyAnimData
  }

  anim!: Anim

  init() {

    this.anim = this.make(Anim, this.data)

    return super.init()
  }

  update() {
    this.anim.x = this.x
    this.anim.y = this.y

    super.update()
  }
}

const max_dx = 3.6912

class Player extends PhBodyAnim {

  _update() {

    if (Input.btn('left')) {
      this.anim.scale_x = -1
      this.dx = -max_dx
    } else if (Input.btn('right')) {
      this.anim.scale_x = 1
      this.dx = max_dx
    } else {
      this.dx = 0
    }

  }

}

type RectPlayData = {
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
}

class SRectPlay extends Play {

  get data() {
    return this._data as RectPlayData
  }

  _draw(g: Graphics) {
    let { color, x, y, w, h } = this.data

    g.srect(color, x, y, w, h)
  }
}

class RectPlay extends Play {

  get data() {
    return this._data as RectPlayData
  }

  _draw(g: Graphics) {
    let { color, x, y, w, h } = this.data

    g.rect(color, x, y, w, h)
  }
}

type PosPlay = Play & { x: number, y: number, width: number, height: number }

type Align = {
  margin?: number,
  h?: PosPlay[],
  v?: PosPlay[]
}

class Hud extends Play {

  align!: Align[]

  blue_text!: Text
  retro_text!: Text

  _init() {

    this.align = []

    this.make(RectPlay, { color: Color.background, x: 0, y: 0, w: 320, h: 180 })
    this.make(RectPlay, { color: Color.darkblue, x: 3, y: 2, w: 84, h: 42 })
    this.make(SRectPlay, { color: Color.lightblue, x: 3, y: 2, w: 84, h: 42 })
    this.make(SRectPlay, { color: Color.red, x: 2, y: 1, w: 86, h: 44 })

    this.blue_text = 
      this.make(Text, { x: 50, y: 100, size: 74, text: 'blue' })
    this.retro_text = 
      this.make(Text, { x: 50, y: 100, size: 74, text: 'retro' })

    this.align.push({
      margin: 33,
      h: [this.blue_text, this.retro_text]
    })
  }

  _update() {

    this.align.forEach(align => {
      let margin = align.margin ?? 0

      align.h?.reduce((pre, next) => {
        next.x = pre.x + pre.width + margin
        return next
      })
    })
  }
}



abstract class Scene extends Play {


  parent?: Scene

  add_scene<T extends Scene>(ctor: { new (): T }, data: any = {}) {
    let scene = this.make(ctor, data)
    scene.parent = this
    return scene
  }


  switch_scene<T extends Scene>(ctor: { new (): T }, data: any = {}) {
    this.parent?.remove(this)
    this.parent?.add_scene(ctor, data)
  }
}

class GamePlayScene extends Scene {
  _init() {
    this.make(Hud)
    this.make(Level1)
  }
}

class StartScene1 extends Scene {

  _first_update() {
    this.switch_scene(GamePlayScene)
  }

  _update() {
    if (Input.btnp('jump')) {
      Sound.fx('start')
      this.switch_scene(GamePlayScene)
    }
  }
}

export default class Scene1 extends Scene {
  static make = () => {
    return new Scene1().init()
  }

  _init() {
    this.add_scene(StartScene1)
  }

  _pre_draw(g: Graphics, t: Graphics) {
    g.clear()
    t.clear()
  }
}

type TextData = {
  x: number,
  y: number,
  size: number,
  text: string
}

class Text extends Play {

  get data() {
    return this._data as TextData
  }

  _width = 0

  get width() {
    return this._width
  }

  get height() {
    return this.size
  }

  x!: number
  y!: number
  size!: number
  text!: string

  _init() {
    this.text = this.data.text
    this.x = this.data.x
    this.y = this.data.y
    this.size = this.data.size ?? 64
  }

  _draw(_: Graphics, t: Graphics) {
    this._width = t.str(this.text, this.x, this.y, this.size)
  }
}

class Level1 extends LevelP {

  _init() {
    let p1 = this.world.body(Player, {
      name: `player`,
      x: 8,
      y: 8,
      s_origin: 'bc'
    })

    p1.dy = 4


  }

}


