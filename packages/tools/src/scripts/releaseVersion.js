const shell = require('shelljs')

const currentBranch = process.env.CI_COMMIT_REF_NAME
const currentCommitHash = process.env.CI_COMMIT_SHA
const mainBranch = 'master'

module.exports = function releaseVersion(bumpType) {
  let preid
  let options
  let bump
  if (currentBranch === mainBranch) {
    preid = 'beta'
    options = '--no-commit-hooks'
    bump = bumpType || 'prepatch'
  } else {
    preid = currentCommitHash.slice(0, 8)
    options = '--no-commit-hooks --no-git-tag-version --no-push'
  }
  shell.exec(`yarn lerna version ${bump} --preid ${preid} ${options} --yes`)
}
