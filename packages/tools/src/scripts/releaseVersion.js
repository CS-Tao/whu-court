const shell = require('shelljs')

const currentBranch = process.env.CI_COMMIT_REF_NAME
const currentCommitHash = process.env.CI_COMMIT_SHA
const mainBranch = 'master'

module.exports = function releaseVersion(bumpType) {
  let preid
  let options
  let bump
  let publishOptions
  if (currentBranch === mainBranch) {
    preid = 'beta'
    options = '--no-commit-hooks'
    bump = bumpType || 'prerelease'
    publishOptions = ['major', 'minor', 'patch'].includes(bumpType) ? '--dist-tag=beta' : '--dist-tag=latest'
  } else {
    preid = currentCommitHash.slice(0, 8)
    options = '--no-commit-hooks --no-git-tag-version --no-push'
    bump = 'prepatch'
    publishOptions = '--dist-tag=alpha'
  }
  shell.exec(`yarn lerna version ${bump} --preid ${preid} ${options} --yes`)
  shell.exec('yarn build')
  shell.exec(`yarn lerna publish from-git ${publishOptions} --skip-git --yes`)
}
