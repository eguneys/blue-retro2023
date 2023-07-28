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

  clear(color = Color.background) {
    this.rect(color, 0, 0, 320, 180)
  }

  rect(color = Color.red, x: number, y: number, w: number, h: number) {
    let { ctx } = this
    ctx.fillStyle = color
    ctx.fillRect(x, y, w, h)
  }

  srect(color = Color.red, x: number, y: number, w: number, h: number) {
    let { ctx } = this
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2)
  }

  anim(anim: Anim, x: number, y: number, scale_x = 1, scale_y = 1) {
    let {
      fx, fy, sx, sy, sw, sh
    } = anim.current_frame

    let { origin_x, origin_y } = anim

    let dx = x - fx - origin_x
    let dy = y - fy - origin_y

    this.spr(dx, dy, sx, sy, sw, sh, scale_x, scale_y)
  }


  private spr(dx: number, dy: number, sx: number, sy: number, sw: number, sh: number,
     scale_x: number, scale_y: number) {

       let { ctx } = this
       let { image } = Content

       ctx.save()

       let sWidth = sw
       let sHeight = sh



       let dWidth = sWidth * Math.abs(scale_x)
       let dHeight = sHeight * Math.abs(scale_y)


       ctx.scale(scale_x, scale_y)
       if (scale_x < 0) {
         dx *= -1
         dx -= dWidth
       }
       if (scale_y < 0) {
         dy *= -1
         dy -= dHeight
       }

       ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

       ctx.restore()
  }
}
