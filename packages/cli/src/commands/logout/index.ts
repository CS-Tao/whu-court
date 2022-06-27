import { Command } from '@oclif/core'
import http from '@whu-court/http'
import { AuthManager } from '@whu-court/runtime'

export default class Logout extends Command {
  static description = 'Logout from court'

  static examples = ['$ wcr logout']

  async run(): Promise<void> {
    await new AuthManager(http).logout()
  }
}
