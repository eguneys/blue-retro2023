import Time from './time'
import Color from './color'
import Play, { Anim } from './play'
import Graphics from './graphics'
import { rnd_int } from './random'

const sum = (a: number[]) => a.reduce((a, b) => a + b, 0)

const tile_size = 16

class Tile {

  static empty = () => new Tile('empty', 0, 0, false)
  static make = (name: string, x1: number, x2: number, y1: number, y2: number, solid: boolean) => new Tile(name, x1 + rnd_int(x2-x1 + 1), y1 + rnd_int(y2 - y1 + 1), solid)

  get sx() {
    return this.x * tile_size
  }

  get sy() {
    return this.y * tile_size
  }

  get sw() {
    return tile_size
  }

  get sh() {
    return tile_size
  }

  get empty() {
    return this.name === 'empty'
  }

  constructor(readonly name: string, 
              readonly x: number, 
              readonly y: number, 
              readonly solid: boolean) {}
}

export class Collider {

  static hlines = (x: number, y: number, w: number) => {
    let h = 1
    return [
      new Collider(x, y, tile_size, h, Tile.make('sun', 0, 0, 0, 0, true)),
      ...[...Array((w-tile_size)/tile_size).keys()].map(i =>
        new Collider(x + tile_size * (i+1), y, tile_size, h, 
                     Tile.make('sun', 1, 4, 0, 0, true))),
      new Collider(x+w-tile_size, y, tile_size, h, Tile.make('sun', 5, 5, 0, 0, true))
    ]
  }

  private constructor(
    readonly x: number,
    readonly y: number,
    readonly w: number,
    readonly h: number,
    readonly value: Tile) {}

}

export const cell_size = 16
export const grid_width = 40 // Math.ceil(320 / cell_size)
export const grid_height = 23 // Math.ceil(180 / cell_size)

type XYWH = { x: number, y: number, w: number, h: number }

export class GridCollider {

  static make = () => {
    let grid = []
    for (let x = 0; x < grid_width; x++) {
      grid.push(new Array(grid_height).fill(Tile.empty()))
    }
    let res = new GridCollider(grid)

    Collider.platform(0, 180 - cell_size, 320)
    .forEach(cld => res.add_collider(cld))


    return res
  }

  private constructor(readonly grid: Tile[][]) {}


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
        if (!this.grid[x][y].empty) {
          return true
        }
      }
    }
    return false
  }

  get tiles(): [number, number, Tile][] {
    let res = []
    for (let x = 0; x < grid_width; x++) {
      for (let y = 0; y < grid_height; y++) {
        res.push([x * cell_size, y * cell_size, this.grid[x][y]] as [number, number, Tile])
      }
    }
    return res
  }
}

type TilePlayData = {
  x: number,
  y: number,
  tile: Tile
}
class TilePlay extends Play {

  get data() {
    return this._data as TilePlayData
  }

  anim!: Anim

  _init() {
    let { x, y } = this.data
    this.anim = this.make(Anim, {
      x, y, name
    })
  }
}

let d_colors = [Color.red, Color.darkred]
export class PhCollider extends Play {
  grid!: GridCollider

  _anims_by_tile!: Map<Tile, TilePlay>

  debug = false

  _init() {
    this.grid = GridCollider.make()
    this._anims_by_tile = new Map()
  }


  _update() {
    if (Time.on_interval(0.86543)) {
      [d_colors[1], d_colors[0]] = [d_colors[0], d_colors[1]]
    }
  }

  _draw(g: Graphics) {
    this.grid.tiles.forEach(([x, y, tile]) => {
      if (this.debug) {
        if (tile.solid) {
          g.srect(d_colors[(x + y) / cell_size % 2], x, y, cell_size, cell_size)
        }
      } else {
        if (!tile.empty) {
          let dx = x, dy = y
          let { sx, sy, sw, sh } = tile
          g.spr(dx, dy, sx, sy, sw, sh)
        }
      }
    })
  }
}
