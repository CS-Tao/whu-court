/* eslint-disable no-console */
const semver = require('semver')
const chalk = require('chalk')
const { engines } = require(`${process.argv[2]}/package`)

if (!engines) {
  process.exit(0)
}

const version = engines.node

if (!semver.satisfies(process.version, version)) {
  console.log(
    chalk.red(`The current node version ${process.version} does not satisfy the required version ${version} .`),
  )
  process.exit(1)
}
