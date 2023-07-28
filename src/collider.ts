import Time from './time'
import Color from './color'
import Play from './play'
import Graphics from './graphics'

export class Collider {

  static rect = (x: number, y: number, w: number, h: number) => {
    return new Collider(x, y, w, h)
  }

  static hline = (x: number, y: number, w: number) => {
    let h = 1
    return new Collider(x, y, w, h)
  }
  static vline = (x: number, y: number, h: number) => {
    let w = 1
    return new Collider(x, y, w, h)
  }

  private constructor(
    readonly x: number,
    readonly y: number,
    readonly w: number,
    readonly h: number,
    readonly value = true) {}

}

export const cell_size = 8
export const grid_width = 40 // Math.ceil(320 / cell_size)
export const grid_height = 23 // Math.ceil(180 / cell_size)

type XYWH = { x: number, y: number, w: number, h: number }

export class GridCollider {

  static make = () => {
    let grid = []
    for (let x = 0; x < grid_width; x++) {
      grid.push(new Array(grid_height).fill(false))
    }
    let res = new GridCollider(grid)

    res.add_collider(Collider.hline(0, 180 - cell_size, 320))


    return res
  }

  private constructor(readonly grid: boolean[][]) {}


  add_collider(collider: Collider) {

    let x_start = Math.floor(collider.x / cell_size)
    let y_start = Math.floor(collider.y / cell_size)
    let x_end = Math.floor((collider.x + collider.w - 1) / cell_size)
    let y_end = Math.floor((collider.y + collider.h - 1) / cell_size)

    for (let x = x_start; x <= x_end; x++) {
      for (let y = y_start; y <= y_end; y++) {
        this.grid[x][y] = collider.value
      }
    }
  }

  is_solid_xywh(xywh: XYWH, dx: number, dy: number) {
    let { x, y, w, h } = xywh

    return this.is_solid_rect(x + dx, y + dy, w, h)
  }

  is_solid_rect(x: number, y: number, w = 1, h = 1) {

    let grid_x = Math.floor(x / cell_size)
    let grid_y = Math.floor(y / cell_size)
    let grid_end_x = Math.floor((x + w - 1) / cell_size)
    let grid_end_y = Math.floor((y + h - 1) / cell_size)

    if (grid_x < 0 || grid_end_x >= grid_width || grid_y < 0 || grid_end_y >= grid_height) {
      throw `outbounds ${x} ${y}`
    }

    // overuse x y
    for (x = grid_x; x <= grid_end_x; x++) {
      for (y = grid_y; y <= grid_end_y; y++) {
        if (this.grid[x][y]) {
          return true
        }
      }
    }
    return false
  }
}


let d_colors = [Color.red, Color.darkred]
export class PhCollider extends Play {
  grid!: GridCollider

  _init() {
    this.grid = GridCollider.make()
  }

  _update() {
    if (Time.on_interval(0.86543)) {
      [d_colors[1], d_colors[0]] = [d_colors[0], d_colors[1]]
    }
  }

  _draw(g: Graphics) {
    for (let x = 0; x < 320; x+= cell_size) {
      for (let y = 0; y < 180; y += cell_size) {
        if (this.grid.is_solid_rect(x, y)) {
          g.srect(d_colors[(x + y) / cell_size % 2], x, y, cell_size, cell_size)
        }
      }
    }
  }
}
