import content_page0 from '../content/out_0.png'
//import content_json0 from '../content/out_0.json'
import content_con0 from '../content/out_0.con?raw'


function load_image(path: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    let res = new Image()
    res.onload = () => resolve(res)
    res.src = path
  })
}

function decon(con: string) {
  return con.split('\n\n\n').map(ntp => {
    let [ name, _tags, _packs ] = ntp.split('\n\n')

    let tags = _tags.split('\n').map(_ => {
      let [from, to, name] = _.split('*')
      return { from: parseInt(from), to: parseInt(to), name }
    })

    let packs = _packs.split('\n').map(_ => {
      let [x, y, w, h, sx, sy, sw, sh, duration] = _.split('*').map(_ => parseInt(_))
      return { x, y, w, h, sx, sy, sw, sh, duration }
    })

    return {
      name,
      tags,
      packs
    }
  })
}

type ContentTag = {
  name: string,
  from: number,
  to: number
}

type ContentPack = {
  x: number,
  y: number,
  w: number,
  h: number,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  duration: number
}

type ContentInfo = {
  name: string,
  tags: ContentTag[],
  packs: ContentPack[]
}

class Content {

  image!: HTMLImageElement
  info!: ContentInfo[]

  async load() {
    this.image = await load_image(content_page0)
    this.info = decon(content_con0)
  }
}

export default new Content()
