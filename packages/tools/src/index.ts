import chalk from 'chalk'
import minimist from 'minimist'
import path from 'path'

function run() {
  const argv = minimist(process.argv.slice(2))
  const args = argv._
  const command = args[0]

  process.env.FORCE_COLOR = '1'

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
  }
}

exports.run = run
