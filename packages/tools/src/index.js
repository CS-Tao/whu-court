const chalk = require('chalk')
const minimist = require('minimist')
const path = require('path')

function run() {
  const argv = minimist(process.argv.slice(2))
  const args = argv._
  const command = args[0]

  if (!command) {
    console.error(chalk.red('No command specified'))
    process.exit(1)
  }

  const scriptsDir = path.resolve(__dirname, 'scripts')

  switch (command) {
    case 'process-commit-msg': {
      require(path.join(scriptsDir, 'processCommitMsg'))({ cwd: argv.c || process.cwd(), commitFilePathInRoot: argv.f })
      break
    }
    case 'release-version': {
      require(path.join(scriptsDir, 'releaseVersion'))({ cwd: argv.c || process.cwd() })
      break
    }
    case 'replace-publish-fields': {
      require(path.join(scriptsDir, 'replacePublishFields'))({ cwd: argv.c || process.cwd() })
      break
    }
    case 'get-last-tag-name': {
      return require(path.join(scriptsDir, 'getLastTagName'))({ cwd: argv.c || process.cwd() })
    }
    default: {
      throw Error('No command match')
    }
  }
}

exports.run = run
