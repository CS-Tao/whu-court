// @ts-expect-error
import cfonts from 'cfonts'
import chalk from 'chalk'
import githubAuthManager from '@whu-court/github-auth'
import logger from '@whu-court/logger'

export const printLogo = (enableColor: boolean) => {
  cfonts.say('WCR', {
    font: 'block',
    align: 'left',
    colors: ['system'],
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: '0',
    gradient: enableColor ? ['#006bb6', '#00a850'] : false,
    transitionGradient: true,
  })
}

export const printNotAvailableInfo = (noLog = false) => {
  const prohibitMsg = githubAuthManager.appConfig.prohibitMsg
  const msgs = [
    '🚫',
    chalk.red('软件暂不可用'),
    prohibitMsg ? `${chalk.gray(githubAuthManager.appConfig.prohibitMsg)}` : '',
  ]
  !noLog && logger.info(...msgs)
  return msgs.join(' ')
}

export const printInBlackListInfo = (noLog = false) => {
  const msgs = ['🚫', chalk.red(`你在 wcr 软件黑名单中，请运行 ${chalk.green('wcr feedback')} 联系管理员`)]
  !noLog && logger.info(...msgs)
  return msgs.join(' ')
}

export const printNotInWhiteListInfo = (noLog = false) => {
  const msgs = ['🚫', chalk.red(`你未在 wcr 软件白名单中，请运行 ${chalk.green('wcr feedback')} 联系管理员`)]
  !noLog && logger.info(...msgs)
  return msgs.join(' ')
}

export const printNotAuthedInfo = (noLog = false) => {
  const msgs = [chalk.gray(`你尚未完成授权，运行 ${chalk.green('wcr setup')} 以继续`)]
  !noLog && logger.info(...msgs)
  return msgs.join(' ')
}

export const printServiceItem = () => {
  logger.info()
  logger.info('📑 版权声明')
  logger.info()
  logger.info(
    chalk.gray(
      '本软件开源，但没有向开发者提供任何源码许可证，作者本人保留源代码的所有权利，任何组织和个人不得将本软件或源码用于商业活动',
    ),
  )
  logger.info()
  logger.info('📑 免责声明')
  logger.info()
  logger.info(
    chalk.gray(
      '本软件和软件源代码仅用于学习研究和技术交流，使用本软件或软件源代码造成的任何不良影响由使用者自行承担，与软件开发人员无关',
    ),
  )
  logger.info()
  logger.info('📑 隐私协议')
  logger.info()
  logger.info(
    chalk.gray(
      `本软件会统计使用数据，包括软件错误日志、软件性能指标、每日使用量等
其中所有个人信息均经过加密，加密密钥🔑随机生成，你可以运行 ${chalk.green('wcr config statsKey [new-key]')} 自定义密钥🔑
如需查询软件日志，可将此密钥🔑提供给管理员查询，详情请运行 ${chalk.green('wcr feedback')} 查看`,
    ),
  )
  logger.info()
}
