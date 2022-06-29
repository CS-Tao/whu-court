import chalk from 'chalk'
import open from 'open'
import logger from '@whu-court/logger'

const ANNOUNCEMENT_URL = 'https://github.com/CS-Tao/whu-court/discussions/categories/announcements'

export const openAnnouncement = async () => {
  await open(ANNOUNCEMENT_URL)
}

export const printAnnouncementUrl = () => {
  logger.info(`📢 公告链接: ${chalk.gray(ANNOUNCEMENT_URL)}`)
}
