import Play, { Anim } from './play'
import Input from './input'
import Graphics from './graphics'
import Sound from './sound'


class StartScene1 extends Play {
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

  _update() {
  }

  _pre_draw(g: Graphics) {
    g.clear()
  }
}
