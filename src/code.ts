import Time from './time'

export class Progress {

  static make = () => new Progress()

  static from_code = (code: string) => {
    let res = new Progress()
    return res
  }

  get code() {
    return 'hello'
  }

  get rank() {
    return 0
  }


  time_left = 30
  time_begin = false

  get last_ten() {
    return this.time_left <= 13
  }

  get times_up() {
    return this.time_left === 0
  }

  update() {
    if (this.time_begin) {
      this.time_left -= Time.delta
      if (this.time_left < 0) {
        this.time_left = 0
      }
    }
  }
}

function test() {
  let ps = [
    new Progress(),
    new Progress()
  ]

  if (ps.every(s => (Progress.from_code(s.code).code === s.code))) {
    console.log('codes ok')
  } else {
    console.log('codes wrong')
  }
}

test()
