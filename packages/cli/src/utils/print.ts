// @ts-ignore
import cfonts from 'cfonts'

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
