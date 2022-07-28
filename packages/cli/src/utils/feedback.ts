import chalk from 'chalk'
import Table from 'cli-table3'
import open from 'open'
import path from 'path'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import envs, { detailVersion } from '@whu-court/env'
import logger from '@whu-court/logger'
import Reporter from '@whu-court/report'

const FEEDBACK_URL = 'https://github.com/CS-Tao/whu-court/discussions/18'

const table = new Table({
  wordWrap: true,
  wrapOnWordBoundary: false,
  style: {
    head: ['green', 'bold'],
  },
})

export const openFeedback = async () => {
  await open(FEEDBACK_URL)
}

export const printFeedbackUrl = () => {
  table.push(['🏸', '版本信息', chalk.gray(detailVersion)])
  table.push(['📉', '软件运行日志', chalk.gray(path.join(envs.loggerDir, 'access.log'))])
  table.push(['📈', '软件错误日志', chalk.gray(path.join(envs.loggerDir, 'error.log'))])
  table.push([
    '💻',
    'GitHub ID',
    chalk.gray(configManager.get(ConfigKey.githubId) + ' (' + configManager.get(ConfigKey.githubUserName) + ')'),
  ])
  table.push(['🔑', '随机数据密钥', chalk.gray(Reporter.statsKey)])
  table.push(['📬', '反馈链接', chalk.gray(FEEDBACK_URL)])
  logger.info(table.toString())
  logger.info(
    chalk.yellow(`如管理员需要查询 🔎 服务端日志，可将 GitHub ID 和密钥发至邮箱: ${chalk.gray(envs.adminEmail)}`),
  )
}
