let data = {
  start: 'hello start'
}

type FxData = string

function fx(data: FxData) {
  console.log(data)
}

class Sound {

  static make = () => {
    let res = new Sound()

    res._fxs = data

    return res
  }

  private _fxs!: Record<string, FxData>

  fx(name: string) {
    let res = this._fxs[name]
    if (!res) {
      throw `nosound ${name}`
    }
    fx(res)
  }
}

export default Sound.make()
