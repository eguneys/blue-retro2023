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
