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
  return con
}


class Content {
  async load() {
    let image = await load_image(content_page0)

    console.log(decon(content_con0))
  }
}

export default new Content()
