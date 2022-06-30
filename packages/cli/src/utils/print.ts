// @ts-ignore
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
  !noLog && logger.log(...msgs)
  return msgs.join(' ')
}

export const printInBlackListInfo = (noLog = false) => {
  const msgs = ['🚫', chalk.red(`你在 wcr 软件黑名单中，请运行 ${chalk.green('wcr feedback')} 联系管理员`)]
  !noLog && logger.log(...msgs)
  return msgs.join(' ')
}

export const printNotAuthedInfo = (noLog = false) => {
  const msgs = [chalk.gray(`尚未完成授权. 运行 ${chalk.green('wcr setup')} 以继续`)]
  !noLog && logger.log(...msgs)
  return msgs.join(' ')
}
