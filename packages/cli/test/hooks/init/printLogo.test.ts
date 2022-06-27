import { expect, test } from '@oclif/test'

describe('hooks', () => {
  test
    .stdout()
    .hook('init')
    .do((output) => expect(output.stdout).to.contain('██'))
    .it('print logo')
})
