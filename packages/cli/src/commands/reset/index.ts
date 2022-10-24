import { Command } from '@oclif/core'
import chalk from 'chalk'
import inquirer from 'inquirer'
import configManager from '@whu-court/config-manager'
import { mainPkg } from '@whu-court/env'
import { printLogo } from '../../utils/print'

export default class Reset extends Command {
  static description = 'Reset app.'

  static examples = ['$ wcr reset']

  async run(): Promise<void> {
    const { confirm } = await inquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message: '确认要重置软件吗？',
      default: false,
    })

    if (!confirm) {
      this.log(chalk.yellow('取消重置'))
      return
    }

    configManager.reset()

    printLogo(false)
    this.log(chalk.green('✔'), '重置完成\n')
    this.log(chalk.gray(`如需卸载本软件，请运行: ${chalk.green('npm uninstall -g ' + mainPkg.name)}`))
  }
}
