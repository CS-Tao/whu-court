import { expect, test } from '@oclif/test'

describe('login', () => {
  test
    .stdout()
    .command(['login', '--token=mock-token', '--sid=mock-sid', '--user-agent=mock-ua'])
    .it('runs login cmd', (ctx) => {
      expect(ctx.stdout).to.contain('🎉 登录成功 账号 20180410-520')
    })
})
