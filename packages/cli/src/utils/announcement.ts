import chalk from 'chalk'
import Table from 'cli-table3'
import open from 'open'
import logger from '@whu-court/logger'

const ANNOUNCEMENT_URL = 'https://github.com/CS-Tao/whu-court/discussions/categories/announcements'

const table = new Table({
  wordWrap: true,
  wrapOnWordBoundary: false,
  style: {
    head: ['green', 'bold'],
  },
})

export const openAnnouncement = async () => {
  await open(ANNOUNCEMENT_URL)
}

export const printAnnouncementUrl = () => {
  table.push(['📢', '公告链接', chalk.gray(ANNOUNCEMENT_URL)])
  logger.info(table.toString())
}
