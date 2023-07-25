import content_page0 from '../content/out_0.png'


function load_image(path: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    let res = new Image()
    res.onload = () => resolve(res)
    res.src = path
  })
}


class Content {
  async load() {
    let image = await load_image(content_page0)

    console.log(image)
  }
}

export default new Content()
