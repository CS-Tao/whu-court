/* eslint-disable no-console */
const shell = require('shelljs')
const chalk = require('chalk')

const currentBranch = process.env.GITHUB_REF_NAME
const currentCommitHash = process.env.GITHUB_SHA
const mainBranch = 'master'

function releaseVersion(bumpType) {
  if ([currentBranch, currentCommitHash].some((each) => !each)) {
    console.log(chalk.red('releaseVersion: currentBranch or currentCommitHash is missing'))
    process.exit(1)
  }
  let preid
  let options
  let bump
  let publishOptions
  if (currentBranch === mainBranch) {
    preid = 'beta'
    options = '--no-commit-hooks'
    bump = bumpType || 'prerelease'
    publishOptions = ['major', 'minor', 'patch'].includes(bumpType) ? '--dist-tag=latest' : '--dist-tag=beta'
  } else {
    preid = currentCommitHash.slice(0, 8)
    options = '--no-commit-hooks --no-git-tag-version --no-push'
    bump = 'prepatch'
    publishOptions = '--dist-tag=alpha'
  }
  const cwdOptions = `--cwd ${process.argv[2]}`
  shell.exec(`yarn ${cwdOptions} lerna version ${bump} --preid ${preid} ${options} --yes`, {
    fatal: true,
  })
  shell.exec(`yarn ${cwdOptions} build`, {
    fatal: true,
  })
  shell.exec(`yarn ${cwdOptions} lerna publish from-git ${publishOptions} --skip-git --yes`, {
    fatal: true,
  })
}

releaseVersion(process.env.MANUAL_RELEASE_TYPE)
