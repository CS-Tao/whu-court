import chalk from 'chalk'
import open from 'open'
import logger from '@whu-court/logger'

const FEEDBACK_URL = 'https://github.com/CS-Tao/whu-court/discussions/18'

export const openFeedback = async () => {
  await open(FEEDBACK_URL)
}

export const printFeedbackUrl = () => {
  logger.info(`📬 反馈链接: ${chalk.gray(FEEDBACK_URL)}`)
}
