import { Command, Flags } from '@oclif/core'
import Reporter from '@whu-court/reporter'
import { ReserveManager } from '@whu-court/runtime'

Reporter.init({
  user: {
    id: 'test_id',
    username: 'test_name',
  },
})

export default class Config extends Command {
  static description = 'Say hello'

  static examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ]

  static flags = {
    from: Flags.string({
      char: 'f',
      description: 'Whom is saying hello',
      required: true,
    }),
  }

  static args = [{ name: 'person', description: 'Person to say hello to', required: true }]

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Config)

    const manager = new ReserveManager()

    const data = await manager.getBookingDay()

    // eslint-disable-next-line no-console
    console.log('data', data)

    Reporter.report(new Error('test error: ' + data))

    this.log(`hello ${args.person} from ${flags.from}! (./src/commands/hello/index.ts)`)
  }
}
