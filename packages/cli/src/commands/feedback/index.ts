import { Command, Flags } from '@oclif/core'
import inquirer from 'inquirer'
import { openFeedback, printFeedbackUrl } from '../../utils/feedback'

export default class Feedback extends Command {
  static description = 'Feedback for the app.'

  static examples = ['$ wcr feedback']

  static flags = {
    'no-open': Flags.boolean({
      char: 'n',
      description: 'Do not open the feedback page',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Feedback)

    printFeedbackUrl()

    if (flags['no-open']) return

    const { open } = await inquirer.prompt({
      type: 'confirm',
      name: 'open',
      message: '打开反馈页面？',
      default: true,
    })

    open && (await openFeedback())
  }
}
