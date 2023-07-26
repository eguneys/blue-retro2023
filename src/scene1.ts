import Play, { Anim } from './play'
import Graphics from './graphics'


export default class Scene1 extends Play {
  static make = () => {
    return new Scene1().init()
  }

  _init() {

    let anim = this.make(Anim, {
      name: `player`
    })
    anim.xy(0, 0)
  }

  _draw(g: Graphics) {
  }
}
