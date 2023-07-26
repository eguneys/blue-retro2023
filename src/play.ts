import Time from './time'
import Content from './content'
import Graphics from './graphics'

export default abstract class Play {

  _data: any

  _set_data(data: any) {
    this._data = data
    return this
  }

  objects: Play[]

  constructor() {
    this.objects = []
  }

  _make<T extends Play>(ctor: { new (): T }, data: any) {
    let res = new ctor()._set_data(data).init()
    return res
  }

  make<T extends Play>(ctor: { new (): T }, data: any = {}) {
    let res = this._make(ctor, data)
    this.objects.push(res)
    return res
  }

  init() {
    this._init()
    return this
  }

  update() {
    this.objects.forEach(_ => _.update())
    this._update()
  }

  draw(graphics: Graphics) {
    this._pre_draw(graphics)
    this.objects.forEach(_ => _.draw(graphics))
    this._draw(graphics)
  }


  _init() {}
  _update() {}
  _draw(graphics: Graphics) {}
  _pre_draw(graphics: Graphics) {}
}

type AnimData = {
  name: string,
  tag?: string
}

export class Anim extends Play {

  get data() {
    return this._data as AnimData
  }

  private get info() {
    let res = Content.info.find(_ => _.name)
    if (!res) {
      throw `nosprite ${this._name}`
    }
    return res
  }

  private get tag() {
    let res = this.info.tags.find(_ => _.name === this._tag)
    if (!res) {
      throw `notag ${this._name} ${this._tag}`
    }
    return res
  }

  private get _name() {
    return this.data.name
  }

  private get _tag() {
    return this.data.tag || 'idle'
  }

  x = 0
  y = 0
  scale_x = 1
  scale_y = 1

  xy(x: number, y: number) {
    this.x = x
    this.y = y
  }

  _current_frame = 0

  get current_frame() {
    let { from } = this.tag
    return this.info.packs[this._current_frame + from]
  }

  play_tag(tag: string) {
    this.data.tag = tag
    this._current_frame = 0

    this.__elapsed = 0
  }

  __elapsed = 0

  _update() {
    let { from, to } = this.tag
    let { duration } = this.current_frame

    let d_from_to = to - from

    this.__elapsed += Time.delta * 1000

    if (this.__elapsed >= duration) {
      this.__elapsed -= duration

      if (this._current_frame === d_from_to) {
        this._current_frame = 0
      } else {
        this._current_frame += 1
      }
    }

  }

  _draw(graphics: Graphics) {
    let { x, y, scale_x, scale_y } = this

    graphics.anim(this, x, y, scale_x, scale_y)
  }

}
