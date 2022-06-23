import loading from 'loading-cli'

export default class Loading {
  constructor(msg: string) {
    this.handler = loading({
      text: msg,
      frames: ['🕐 ', '🕑 ', '🕒 ', '🕓 ', '🕔 ', '🕕 ', '🕖 ', '🕗 ', '🕘 ', '🕙 ', '🕚 '],
    })
  }

  handler: loading.Loading | null

  start() {
    this.handler?.start()
    return this
  }

  stop() {
    this.handler?.stop()
    this.handler = null
  }
}
