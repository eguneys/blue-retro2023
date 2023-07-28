class Mouse {

  bounds!: ClientRect
  _click?: [number, number]

  _click_check = true

  get click() {
    return this._click
  }

  on_click(p: [number, number]) {
    let { bounds } = this
    p[0] -= bounds.left
    p[1] -= bounds.top
    p[0] /= bounds.width
    p[1] /= bounds.height

    this._click = p
  }

  listen(element: HTMLElement) {
    element.addEventListener('click', e => this.on_click([e.clientX, e.clientY]))

    const on_resize = () => {
      this.bounds = element.getBoundingClientRect()
    }

    document.addEventListener('scroll', on_resize)
    window.addEventListener('resize', on_resize)
    on_resize()
  }

  update() {
    if (this._click_check) {
      if (this._click) {
        this._click_check = false
      }
    } else {
      if (this._click) {
        this._click_check = true
        this._click = undefined
      }
    }
  }
}

export default new Mouse()
