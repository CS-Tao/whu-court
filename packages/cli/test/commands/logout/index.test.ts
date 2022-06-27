import { expect, test } from '@oclif/test'

describe('logout', () => {
  test
    .stdout()
    .command(['logout'])
    .it('runs logout cmd', (ctx) => {
      expect(ctx.stdout).to.contain('成功')
    })
})
