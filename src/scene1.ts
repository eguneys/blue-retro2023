import Play, { Anim } from './play'
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

}



type PhBodyData = {
  x?: number,
  w: number,
  h: number
}

abstract class PhBody extends Play {

  get data() {
    return this._data as PhBodyData
  }

  private _w!: number
  private _h!: number

  private _x!: number

  vx!: number

  get x() {
    return this._x
  }

  get w() {
    return this._w
  }

  get h() {
    return this._h
  }

  _init() {
    this._x = this.data.x ?? 0

    this._w = this.data.w
    this._h = this.data.h

    this.vx = 0
  }
}


class PhWorld extends Play {

  get bodies() {
    return this.objects as PhBody[]
  }

  body<T extends PhBody>(ctor: { new (): T }, data: any = {}) {
    this.make(ctor, data)
  }

  _update() {
  }
}

class Player extends PhBody {
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

    let anim = this.make(Anim, {
      name: `player`
    })
    anim.xy(0, 0)

    this.make(StartScene1)
  }

  _pre_draw(g: Graphics) {
    g.clear()
  }
}

class Level1 extends LevelP {

  _init() {
    this.world.body(Player)
  }

}


