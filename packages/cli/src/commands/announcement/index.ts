import { Command, Flags } from '@oclif/core'
import inquirer from 'inquirer'
import { openAnnouncement, printAnnouncementUrl } from '../../utils/announcement'

export default class Announcement extends Command {
  static description = 'Open app announcements.'

  static examples = ['$ wcr announcement']

  static flags = {
    'no-open': Flags.boolean({
      char: 'n',
      description: 'Do not open the announcements page',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Announcement)

    printAnnouncementUrl()

    if (flags['no-open']) return

    const { open } = await inquirer.prompt({
      type: 'confirm',
      name: 'open',
      message: '打开公告页面？',
      default: true,
    })

    open && (await openAnnouncement())
  }
}
