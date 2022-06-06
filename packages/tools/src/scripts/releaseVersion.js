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
  const commands = [
    `yarn lerna version ${bump} --preid ${preid} ${options} --yes`,
    'yarn build',
    `yarn lerna publish from-git ${publishOptions} --no-git-tag-version --no-push --yes`,
  ]
  const cwd = process.argv[2] || __dirname
  console.log(chalk.green('cwd', cwd))
  commands.forEach((command) => {
    console.log(chalk.green('command', command))
    const { code, stdout, stderr } = shell.exec(command, {
      fatal: true,
      cwd,
      env: process.env,
    })
    if (code === 0) {
      console.log(chalk.white('command stdout', stdout))
    } else {
      console.log(chalk.red('command exited with code', code, '\n', stderr))
      process.exit(code)
    }
  })
}

releaseVersion(process.env.MANUAL_RELEASE_TYPE)
