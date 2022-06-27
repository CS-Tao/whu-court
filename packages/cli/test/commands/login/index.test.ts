import { expect, test } from '@oclif/test'

describe('login', () => {
  test
    .stdout()
    .command(['login', '--token=foo', '--sid=bar'])
    .it('runs login cmd', (ctx) => {
      expect(ctx.stdout).to.contain('🎉 登录成功 账号 520')
    })
})
