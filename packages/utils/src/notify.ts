import notifier from 'node-notifier'
import path from 'path'

const logo = path.join(__dirname, '../assets/icon/logo.png')

export default class Notify {
  public static notify(title: string, message: string, sound = false) {
    notifier.notify({
      title,
      message,
      icon: logo,
      contentImage: logo,
      wait: false,
      timeout: false,
      sound,
    })
  }
}
