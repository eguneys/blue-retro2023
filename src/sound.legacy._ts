import { ZZFX, zzfx } from 'zzfx'

type ZZFxData = Array<number | undefined>

let data = {
  'start': [,,129,.01,,.15,,,,,,,,5]
}

class Sound {

  static make = () => {
    let res = new Sound()

    res._fxs = data

    return res
  }

  private _fxs!: Record<string, ZZFxData>

  fx(name: string) {
    let res = this._fxs[name]
    if (!res) {
      throw `nosound ${name}`
    }
    zzfx(...res)
  }
}

export default Sound.make()
