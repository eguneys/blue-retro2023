import Play, { Anim, AnimData } from './play'
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

class Player extends PhBodyAnim {

  _update() {

    if (Input.btn('left')) {
      this.anim.scale_x = -1
      this.dx = -3.6912
    } else if (Input.btn('right')) {
      this.anim.scale_x = 1
      this.dx = 3.6912
    } else {
      this.dx = 0
    }

  }

}

class StartScene1 extends Play {

  _init() {
    this.make(Level1)
  }

  _update() {
    if (Input.btnp('jump')) {
      Sound.fx('start')
    }
  }
}

export default class Scene1 extends Play {
  static make = () => {
    return new Scene1().init()
  }

  _init() {
    this.make(StartScene1)
  }

  _pre_draw(g: Graphics) {
    g.clear()
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


