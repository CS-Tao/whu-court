import chalk from 'chalk'
import open from 'open'
import configManager, { ConfigKey } from '@whu-court/config-manager'
import envs from '@whu-court/env'
import logger from '@whu-court/logger'
import Reporter from '@whu-court/reporter'

const FEEDBACK_URL = 'https://github.com/CS-Tao/whu-court/discussions/18'

export const openFeedback = async () => {
  await open(FEEDBACK_URL)
}

export const printFeedbackUrl = () => {
  logger.info(`📬 反馈链接: ${chalk.gray(FEEDBACK_URL)}`)
  logger.info(`💻 GitHub ID: ${chalk.gray(configManager.get(ConfigKey.githubId))}`)
  logger.info(`🔑 随机数据密钥: ${chalk.gray(Reporter.statsKey)}`)
  logger.info(chalk.yellow(`如管理员需要查询软件日志，可将 GitHub ID 和密钥发至邮箱: ${chalk.gray(envs.adminEmail)}`))
}
