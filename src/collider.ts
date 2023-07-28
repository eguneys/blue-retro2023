import Color from './color'
import Play from './play'
import Graphics from './graphics'

export class Collider {

  static rect = (x: number, y: number, w: number, h: number) => {
    return new Collider(x, y, w, h)
  }

  static hline = (x: number, y: number, w: number) => {
    let h = cell_size
    return new Collider(x, y, w, h)
  }
  static vline = (x: number, y: number, h: number) => {
    let w = cell_size
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
export const grid_width = 320
export const grid_height = 180

export class GridCollider {

  static make = () => {
    let grid = []
    for (let x = 0; x < grid_width; x++) {
      grid.push(new Array(grid_height).fill(false))
    }
    let res = new GridCollider(grid)

    res.add_collider(Collider.hline(0, grid_height - cell_size, grid_width))


    return res
  }

  private constructor(readonly grid: boolean[][]) {}


  add_collider(collider: Collider) {

    let x_start = Math.floor(collider.x / cell_size)
    let y_start = Math.floor(collider.y / cell_size)
    let x_end = Math.floor((collider.x + collider.w) / cell_size)
    let y_end = Math.floor((collider.y + collider.h) / cell_size)

    for (let x = x_start; x < x_end; x++) {
      for (let y = y_start; y < y_end; y++) {
        this.grid[x][y] = collider.value
      }
    }
  }

  is_solid(x: number, y: number, w = cell_size, h = cell_size) {

    let grid_x = Math.floor(x / cell_size)
    let grid_y = Math.floor(y / cell_size)
    let grid_end_x = Math.floor((x + w) / cell_size)
    let grid_end_y = Math.floor((y + h) / cell_size)

    if (grid_x < 0 || grid_end_x >= grid_width || grid_y < 0 || grid_end_y >= grid_height) {
      throw "outbounds"
    }

    for (x = grid_x; x < grid_end_x; x++) {
      for (y = grid_y; y < grid_end_y; y++) {
        if (this.grid[grid_x][grid_y]) {
          return true
        }
      }
    }
    return false
  }
}


export class PhCollider extends Play {
  grid!: GridCollider

  _init() {
    this.grid = GridCollider.make()
  }

  _draw(g: Graphics) {
    for (let x = 0; x < grid_width; x+= cell_size) {
      for (let y = 0; y < grid_height; y += cell_size) {
        if (this.grid.is_solid(x, y)) {
          g.rect(Color.red, x, y, cell_size, cell_size)
        }
      }
    }
  }
}
