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
    gradient: enableColor ? ['red', 'blue'] : false,
    independentGradient: false,
    transitionGradient: false,
    env: 'node',
  })
}
