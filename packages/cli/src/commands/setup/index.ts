import { Command, Flags } from '@oclif/core'
import { Logger } from '@whu-court/logger'
import githubAuthManager from '@whu-court/github-auth'
import { askGitHubToken } from '../../utils/ask'

const logger = Logger.getLogger()

export default class Setup extends Command {
  static description = '初始化应用'

  static examples = ['$ wcr setup', '$ wcr setup --github-token=<***>']

  static flags = {
    'github-token': Flags.string({
      char: 't',
      description: 'GitHub token',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Setup)

    const githubToken = flags['github-token'] || (await askGitHubToken())
    try {
      if (!(await githubAuthManager.checkIfStared(githubToken))) {
        this.error('你还没有 star 应用，请先 star 应用')
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message)
        return
      }
    }

    this.log(`GitHub token is ${githubToken}`)
  }
}
