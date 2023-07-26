import Color from './color'
import Content from './content'
import { Anim } from './play'

export default class Graphics {
  static make = () => {

    let canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 180

    return new Graphics(canvas)
  }

  ctx: CanvasRenderingContext2D

  constructor(readonly canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
    this.ctx.imageSmoothingEnabled = false
  }

  clear() {
    let { ctx } = this
    ctx.fillStyle = Color.background
    ctx.fillRect(0, 0, 320, 180)
  }

  anim(anim: Anim, x: number, y: number, scale_x = 1, scale_y = 1) {
    let {
      sx, sy, sw, sh
    } = anim.current_frame

    let dx = x
    let dy = y

    this.spr(dx, dy, sx, sy, sw, sh, scale_x, scale_y)
  }


  private spr(dx: number, dy: number, sx: number, sy: number, sw: number, sh: number,
     scale_x: number, scale_y: number) {

       let { ctx } = this
       let { image } = Content

       let sWidth = sw
       let sHeight = sh

       let dWidth = sWidth * scale_x
       let dHeight = sHeight * scale_y

       ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

  }
}
