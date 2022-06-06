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
  let afterVersionCommands = []
  const isMainBranch = currentBranch === mainBranch
  if (isMainBranch) {
    preid = 'beta'
    options = '--no-commit-hooks'
    afterVersionCommands = []
    bump = bumpType || 'prerelease'
    publishOptions = ['major', 'minor', 'patch'].includes(bumpType) ? '--dist-tag=latest' : '--dist-tag=beta'
  } else {
    preid = currentCommitHash.slice(0, 8)
    options = '--no-commit-hooks --no-git-tag-version --no-push'
    afterVersionCommands = [
      'git add .',
      'git commit -m "📦 chore: release version (will not be pushed)"',
      'git tag -a v$(awk \'/version/{gsub(/("|",)/,"",$2);print $2}\' lerna.json) -m v$(awk \'/version/{gsub(/("|",)/,"",$2);print $2}\' lerna.json)',
    ]
    bump = 'prepatch'
    publishOptions = '--dist-tag=alpha'
  }
  const commands = [
    `yarn lerna version ${bump} --preid ${preid} ${options} --yes`,
    ...afterVersionCommands,
    'yarn build',
    `yarn lerna publish from-git --registry https://registry.npmjs.org/ ${publishOptions} --no-git-tag-version --no-push --no-verify-access --yes`,
  ]
  const cwd = process.argv[2] || __dirname
  console.log(chalk.green('cwd', cwd))
  commands.forEach((command) => {
    console.log(chalk.green('[exec command]', command))
    const { code, stdout, stderr } = shell.exec(command, {
      silent: true,
      fatal: true,
      cwd,
      env: process.env,
    })
    if (code === 0) {
      stdout && console.log(chalk.gray('stdout:\n', stdout))
      stderr && console.log(chalk.gray('stderr:', `\n${stderr}`))
    } else {
      console.log(chalk.red('exited with code', code))
      stderr && console.log(chalk.red('stder:', `\n${stderr}`))
      process.exit(code)
    }
  })
}

releaseVersion(process.env.MANUAL_RELEASE_TYPE)
