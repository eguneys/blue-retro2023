import Color from './color'
import Content from './content'
import { Anim } from './play'

export default class Graphics {
  static make = (width: number, height: number, pixelated = true) => {

    let canvas = document.createElement('canvas')
    if (pixelated) {
      canvas.classList.add('pixelated')
    }

    let ctx = canvas.getContext('2d')!
    const on_resize = () => {
      canvas.width = width
      canvas.height = height
      ctx.imageSmoothingEnabled = pixelated
    }

    document.addEventListener('resize', on_resize)
    on_resize()
 
    return new Graphics(canvas, ctx)
  }

  get width() {
    return this.canvas.width
  }

  get height() {
    return this.canvas.height
  }

  constructor(readonly canvas: HTMLCanvasElement, 
              readonly ctx: CanvasRenderingContext2D) {}

  clear(color = Color.background) {
    let { ctx } = this
    ctx.clearRect(0, 0, this.width, this.height)
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

  str(text: string, x: number, y: number, size = 64, color = Color.light) {
    let { ctx } = this
    let width = ctx.measureText(text).width

    ctx.font = `${size}px 'Courier New', monospace`
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
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

       ctx.drawImage(image, sx, sy, sWidth, sHeight, Math.round(dx), Math.round(dy), dWidth, dHeight)

       ctx.restore()
  }
}
