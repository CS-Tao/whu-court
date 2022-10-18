/* eslint-disable no-console */
const chalk = require('chalk')
const { exec } = require('shelljs')
const getLastTagName = require('./getLastTagName')

const currentBranch = process.env.GITHUB_REF_NAME
const normalizedCurrentBranch = (currentBranch || '').replace(/\//g, '-')
const currentCommitHash = process.env.GITHUB_SHA || ''
const mainBranch = 'master'

const getCurrentWorkspaceVersionCommand =
  '$(awk \'/version/{gsub(/("|",)/,"",$2);print $2}\' packages/cli/package.json)'

function releaseVersion(cwd, bumpType, isManual) {
  const lastTagName = getLastTagName({ cwd, silent: true })
  if ([currentBranch, currentCommitHash].some((each) => !each)) {
    console.log(chalk.red('releaseVersion: currentBranch or currentCommitHash is missing'))
    process.exit(1)
  }
  console.log(chalk.gray('releaseVersion start with params:', 'bumpType', bumpType, 'isManual', isManual))
  let preid
  let options
  let bump
  let publishOptions
  let environment
  let afterVersionCommands = []
  const isMainBranch = currentBranch === mainBranch
  if (isMainBranch) {
    const isLatest = bumpType && ['major', 'minor', 'patch'].includes(bumpType)
    preid = isLatest ? '' : 'beta'
    options = '--no-commit-hooks --exact' + (isManual ? ' --force-publish=.' : '')
    bump = bumpType || 'prerelease'
    publishOptions = isLatest ? '--dist-tag=latest' : '--dist-tag=beta'
    environment = isLatest ? 'production' : 'gray'

    afterVersionCommands = []
  } else {
    if (normalizedCurrentBranch === 'beta' || currentBranch === 'beta') {
      console.log(chalk.red('branch name can not be `beta`'))
      process.exit(1)
    }
    if (bumpType) {
      console.log(chalk.yellow(`release-type will be 'prepatch' in non-main branch, ignore the param: ${bumpType}`))
    }
    preid = `${normalizedCurrentBranch}-${currentCommitHash.slice(0, 8)}`
    options = '--no-commit-hooks --no-git-tag-version --no-push --exact'
    bump = 'prepatch'
    publishOptions = '--dist-tag=alpha'
    environment = 'staging'

    afterVersionCommands = [
      'git add .',
      'git commit -m "📦 chore: release version (will not be pushed)"',
      `git tag -a v${getCurrentWorkspaceVersionCommand} -m v${getCurrentWorkspaceVersionCommand}`,
    ]
  }

  const mainPackage = '@whu-court/cli'

  const releaseSentryCommands = [
    `sentry-cli releases new "whu-court@v${getCurrentWorkspaceVersionCommand}" --org cs-tao --project whu-court`,
    `yarn lerna exec --since ${lastTagName} --ignore ${mainPackage} sentry-cli -- releases --org cs-tao --project whu-court files "whu-court@v${getCurrentWorkspaceVersionCommand}" upload-sourcemaps ./dist/ --url-prefix '\\~/node_modules/$LERNA_PACKAGE_NAME/dist'`,
    `yarn lerna exec --since ${lastTagName} --scope ${mainPackage} sentry-cli -- releases --org cs-tao --project whu-court files "whu-court@v${getCurrentWorkspaceVersionCommand}" upload-sourcemaps ./dist/ --url-prefix '\\~/dist'`,
    `sentry-cli releases --org cs-tao deploys whu-court@v${getCurrentWorkspaceVersionCommand} new -e ${environment}`,
  ]

  const preidOptions = preid ? `--preid ${preid} ` : ''

  const commands = [
    `yarn lerna version ${bump} ${preidOptions}${options} --yes`,
    ...afterVersionCommands,
    `yarn lerna publish from-git --registry https://registry.npmjs.org/ ${publishOptions} --no-git-tag-version --no-push --no-verify-access --yes`,
    ...releaseSentryCommands,
  ]

  console.log(chalk.green('cwd', cwd))
  commands.forEach((command) => {
    console.log(chalk.green('[exec command]', command))
    const { code, stdout, stderr } = exec(command, {
      silent: true,
      fatal: true,
      cwd,
      env: process.env,
    })
    if (code === 0) {
      stdout && console.log(chalk.gray('stdout:\n', stdout))
      stderr && console.log(chalk.gray('stderr:', `\n${stderr}`))
    } else {
      stdout && console.log(chalk.gray('stdout:\n', stdout))
      console.log(chalk.red('exited with code', code))
      stderr && console.log(chalk.red('stder:', `\n${stderr}`))
      process.exit(code)
    }
  })
}

module.exports = ({ cwd }) => releaseVersion(cwd, process.env.MANUAL_RELEASE_TYPE, !!process.env.MANUAL_RELEASE_TYPE)
