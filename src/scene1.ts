import Play, { Anim, AnimData } from './play'
import Color from './color'
import Time from './time'
import Input from './input'
import Graphics from './graphics'
import Sound from './sound'
import { PhCollider } from './collider'
import { arr_rnd } from './random'
import { rect_vs_point } from './rect'

const l2h_x = (x: number) => x / 320 * 1920
const l2h_y = (y: number) => y / 180 * 1080
const h2l_x = (x: number) => x / 1920 * 320
const h2l_y = (y: number) => y / 1080 * 180



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
  color: Color
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


  _lerp_to?: Color
  _lerp_t = 0


  lerp(c: Color, duration = 0.142) {
    this._lerp_to = c
    this._lerp_t = duration
  }

  _update() {
    if (this._lerp_t > 0) {
      let t = 1 - this._lerp_t / 0.2
      this.data.color = Color.lerp(this.data.color, this._lerp_to!, t)

      this._lerp_t -= Time.delta

      if (this._lerp_t < 0) {
        this._lerp_t = 0
      }
    }
  }

  _draw(g: Graphics) {
    let { color, x, y, w, h } = this.data

    g.rect(color, x, y, w, h)
  }
}

type ButtonData = {
  x: number,
  y: number,
  text: string
}

class Button extends Play {

  get data() {
    return this._data as ButtonData
  }

  hovering = false
  click_t = 0

  readonly w = 60
  readonly h = 22

  get x() {
    return this.data.x
  }

  get y() {
    return this.data.y
  }

  bg!: RectPlay

  _init() {

    let { w, h } = this

    this.bg = this.make(RectPlay, { color: Color.darkblue, x: 3, y: 2, w, h })
    this.make(SRectPlay, { color: Color.lightblue, x: 3, y: 2, w, h })


    this.make(Text, { x: l2h_x(w / 2 - 2), y: l2h_y(h / 2 + 2), size: 74, text: this.data.text, align: 'c' })

    let self = this
    this.add_mouse(this.x, this.y, this.w, this.h, {
      on_click() {
        Sound.fx('click')
        self.click_t = 0.073454
        self.bg.lerp(Color.red, self.click_t)
      },

      on_hover_begin() {
        self.bg.lerp(Color.lightblue)
      },
      on_hover_end() {
        self.bg.lerp(Color.darkblue)
      }
    })

  }

  _update() {

    if (this.click_t > 0) {
      this.click_t -= Time.delta

      if (this.click_t <= 0) {
        this.click_t = 0

        this.bg.lerp(Color.lightblue, 0.345)
      }
    }

  }

  _pre_draw(g: Graphics, t: Graphics) {
    g.push_xy(this.data.x, this.data.y)
    t.push_xy(l2h_x(this.data.x), l2h_y(this.data.y))
  }

  _draw(g: Graphics, t: Graphics) {
    g.pop()
    t.pop()
  }
}

type PosPlay = Play & { x: number, y: number, width: number, height: number }

type Align = {
  margin?: number,
  h?: PosPlay[],
  v?: PosPlay[]
}

type HudData = {
  on_credits: () => void
}

class Hud extends Play {

  get data() {
    return this._data as HudData
  }

  align!: Align[]

  blue_text!: Text
  retro_text!: Text

  music_text!: Text
  music_ontext!: Text

  _init() {

    this.align = []

    this.make(RectPlay, { color: Color.background, x: 0, y: 0, w: 320, h: 180 })
    this.make(RectPlay, { color: Color.darkblue, x: 3, y: 2, w: 84, h: 42 })
    this.make(SRectPlay, { color: Color.lightblue, x: 3, y: 2, w: 84, h: 42 })
    this.make(SRectPlay, { color: Color.red, x: 2, y: 1, w: 86, h: 44 })


    this.blue_text = 
      this.make(Text, { x: 50, y: 100, size: 74, text: 'blue' })
    this.retro_text = 
      this.make(Text, { x: 150, y: 100, size: 74, text: 'retro' })

    let self = this
    this.add_mouse(h2l_x(50), h2l_y(100 - 74), h2l_x(500), h2l_y(74), {
      on_click() {
        self.data.on_credits()
      },
      on_hover_begin() {
        self.blue_text.color = Color.lightblue
        self.retro_text.color = Color.purple
      },
      on_hover_end() {
        self.blue_text.color = Color.light
        self.retro_text.color = Color.light
      }
    })

    this.align.push({
      margin: 89,
      h: [this.blue_text, this.retro_text]
    })


    this.make(CText, { x: 50, y: 170, size: 54, text: '1 undescent' })
    this.music_text = this.make(Text, { x: 50, y: 228, size: 54, text: 'music' })
    this.music_ontext = this.make(Text, { x: 280, y: 228, size: 54, text: 'on' })

    this.add_mouse(h2l_x(50), h2l_y(228-54), h2l_x(280), h2l_y(54), {
      on_click() {
        Sound.music_onoff = !Sound.music_onoff
        self.update_sound_text()
      },
      on_hover_begin() {
        self.music_ontext.color = Color.red
      },
      on_hover_end() {
        self.music_ontext.color = Color.light
      }
    })

    this.make(Button, { x: 250, y: 4, text: 'Right' })
    this.make(Button, { x: 180, y: 4, text: 'Left' })
    this.make(Button, { x: 220, y: 30, text: 'Jump' })

    self.update_sound_text()
  }

  update_sound_text() {
    if (Sound.music_onoff) {
      this.music_ontext.text = 'on'
    } else {
      this.music_ontext.text = 'off'
    }
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

    Sound.music('intro')

    let self = this
    this.make(Hud, {
      on_credits() {
        self.switch_scene(CreditsScene)
      }
    })
    this.make(Level1)
  }
}

class CreditsScene extends Scene {

  texts!: Text[]

  _init() {
    Sound.music_onoff = false

    this.make(RectPlay, { color: Color.green, x: 0, y: 0, w: 320, h: 180 })

    this.make(Text, { color: Color.lightpurple, x: -1070, y: 1020, size: 9000, text: 'E' })

    let x = 1920 / 4

    this.texts = [
      this.make(Text, { color: Color.darkpurple, x, y: 100, size: 90, text: 'thanks for playing' }),
      this.make(Text, { color: Color.darkpurple, x, y: 1000, size: 90, text: 'music github.com/arikwex' }),
      this.make(Text, { color: Color.darkpurple, x, y: 1000, size: 90, text: 'author twitter.com/eguneys' }),
      this.make(Text, { color: Color.darkpurple, x, y: 1000, size: 120, text: 'Mucho Gracias <3' }),
      this.make(Text, { color: Color.darkpurple, x, y: 1000, size: 120, text: 'bb' }),
    ]

    let self = this
    this.add_mouse(0, 0, 320, 180, {
      on_click() {
        self.switch_scene(StartScene1)
      }
    })
  }

  _update() {
    this.texts[0].y += Time.delta * 200
    this.texts[0].y %= this.texts.length * 1080 - 100
    this.texts.reduce((pre, next) => { 
      next.y = pre.y - pre.height - 777
      return next
    })
  }

}

class StartScene1 extends Scene {

  begin_text1!: Text
  begin_text2!: Text

  _first_update() {
    //this.switch_scene(GamePlayScene)
    //this.switch_scene(CreditsScene)
  }

  _init() {


    this.make(RectPlay, { color: Color.darkblue, x: 0, y: 0, w: 320, h: 180 })

    this.make(Text, { color: Color.lightblue, x: -250, y: 1020, size: 6000, text: 'V' })

    this.make(Text, { x: 50, y: 170, size: 112, text: '2 minute ssir..', color: Color.light })
    this.make(Text, { x: 1920/2, y: 1080/2, size: 112, text: 'blue', color: Color.light })
    this.make(Text, { x: 1920/2 + 320, y: 1080/2, size: 112, text: 'retro', color: Color.light })
    this.make(Text, { x: 1920/3, y: 900, size: 112, text: 'by', color: Color.light })
    this.make(CText, { x: 1920/3 + 200, y: 900, size: 112, text: 'eguneys', color: Color.light })
    this.begin_text1 = this.make(Text, { x: 0, y: 1030, size: 62, text: 'click to begin', color: Color.light })
    this.begin_text2 = this.make(Text, { x: 0, y: 1030, size: 62, text: 'click to begin', color: Color.light })

    Sound.load(p => { 
      let text = p === 1 ? `click to begin` : `loading sounds ${p * 100}%`
      this.begin_text1.text = text
      this.begin_text2.text = text
      console.log(text)
    })

    let self = this
    this.add_mouse(0, 0, 320, 180, {
      on_click() {
        if (Sound.loaded) {
          self.switch_scene(GamePlayScene)
        }
      }
    })
  }

  _update() {

    let dt = 300
    this.begin_text1.x += dt * Time.delta
    this.begin_text2.x += dt * Time.delta
    if (this.begin_text1.x + this.begin_text1.width > 1920) {
      this.begin_text2.x = this.begin_text1.x - 1920
    }
    if (this.begin_text2.x + this.begin_text2.width > 1920) {
      this.begin_text1.x = this.begin_text2.x - 1920
    }
  }
}

export default class Scene1 extends Scene {
  static make = () => {
    return new Scene1().init()
  }

  _init() {
    //this.add_scene(StartScene1)
    this.add_scene(GamePlayScene)
  }

  _pre_draw(g: Graphics, t: Graphics) {
    g.clear()
    t.clear()
  }
}

type TextAlign = 'c'

type TextData = {
  x: number,
  y: number,
  size: number,
  color: Color,
  text: string,
  align?: TextAlign
}



class CText extends Play {

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
  color!: Color

  lc!: [string, Color][]

  _init() {
    this.text = this.data.text
    this.x = this.data.x
    this.y = this.data.y
    this.size = this.data.size ?? 64
    this.color = this.data.color ?? Color.light

    this.lc = []
  }

  _update() {
    if (Time.on_interval(0.2)) {
      this.lc = this.text.split('').map(_ => [_, arr_rnd(Color.all)])
    }
  }

  _draw(_: Graphics, t: Graphics) {
    this._width = 0
    this.lc.map(([letter, color]) => {
      let w = t.str(letter, this.x + this._width, this.y, this.size, color)
      this._width += w
    })
  }
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
  color!: Color

  _init() {
    this.text = this.data.text
    this.x = this.data.x
    this.y = this.data.y
    this.size = this.data.size ?? 64
    this.color = this.data.color ?? Color.light
  }

  _draw(_: Graphics, t: Graphics) {
    this._width = t.str(this.text, this.x, this.y, this.size, this.color, this.data.align)
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


