import Play, { Anim, AnimData } from './play'
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

      let dx = body.dx

      for (let di = 0; di < dx; di+= 2) {
        if (grid.is_solid(body.x, body.y, di, 0)) {
          body.dx = 0
          break
        } else {
          body.x += di
        }
      }

      let dy = body.dy

      for (let di = 0; di < dy; di+= 2) {
        if (grid.is_solid(body.x, body.y, 0, di)) {
          /*
             console.log(body.x, body.y, di)
             debugger
             grid.is_solid(body.x, body.y, 0, di)
          */
          body.dy = 0
          break
        } else {
          body.y += di
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
      x: 0,
      y: 0
    })

    //p1.dy = 4
  }

}


