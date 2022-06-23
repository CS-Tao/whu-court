import { Command, Flags } from '@oclif/core'
import http from '@whu-court/http'
import { ReserveManager } from '@whu-court/runtime'
import Reporter from '@whu-court/reporter'
import UpdateManager from '@whu-court/auto-update'

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

    require('@whu-court/mock').mockAxios(http)

    const manager = new ReserveManager(http)

    const measure = Reporter.Measure.getMeasure('getBookingDay').start()
    const data = await manager.getBookingDay()
    measure.end()

    // eslint-disable-next-line no-console
    console.log('data', data)

    Reporter.report(new Error('test error: ' + data))

    this.log(`hello ${args.person} from ${flags.from}! (./src/commands/hello/index.ts)`)
    new UpdateManager().notify()
  }
}