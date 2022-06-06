import { expect, test } from '@oclif/test'

describe('login', () => {
  test
    .stdout()
    .command(['login', 'friend', '--from=oclif'])
    .it('runs login cmd', (ctx) => {
      expect(ctx.stdout).to.contain('hello friend from oclif!')
    })
})
