import { ZZFX, zzfx } from 'zzfx'

type ZZFxData = Array<number | undefined>

let data = {
  'drum': [,,129,.01,,.15,,,,,,,,5]
}

class Sound {

  static make = () => {
    let res = new Sound()

    res._fxs = data

    return res
  }

  private _fxs!: Record<string, ZZFxData>

  fx(name: string) {
    zzfx(...this._fxs[name])
  }
}

export default Sound.make()
