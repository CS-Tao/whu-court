import loading from 'loading-cli'

export default class Loading {
  constructor(msg: string) {
    this.handler = loading({
      text: msg,
      frames: Loading.frames,
    })
  }

  static frames = ['◰', '◳', '◲', '◱']

  handler: loading.Loading | null

  start() {
    this.handler?.start()
    return this
  }

  setText(msg: string) {
    if (this.handler) {
      this.handler.text = msg
    }
    return this
  }

  succeed(msg: string) {
    if (this.handler) {
      this.handler.succeed(msg)
    }
    return this
  }

  fail(msg: string) {
    if (this.handler) {
      this.handler.fail(msg)
    }
    return this
  }

  warn(msg: string) {
    if (this.handler) {
      this.handler.warn(msg)
    }
    return this
  }

  stop() {
    this.handler?.stop()
    this.handler = null
  }
}
