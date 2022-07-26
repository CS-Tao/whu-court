/* eslint-disable no-console */
const fs = require('fs')
const chalk = require('chalk')

function prefixCommitMsg(type, msg) {
  const prefixMap = {
    WIP: '🚧',
    feat: '🎸',
    fix: '🐛',
    chore: '📦',
    refactor: '🧰',
    docs: '📚',
    test: '🏁',
    style: '🎨',
    revert: '⏪',
  }
  return prefixMap[type] ? `${prefixMap[type]} ${msg}` : msg
}

function processCommitMsg({ cwd, commitFilePathInRoot }) {
  const root = cwd
  if (!root || !commitFilePathInRoot) {
    console.log(chalk.red('Commit msg file path is required.', chalk.gray('e.g. .git/COMMIT_EDITMSG')))
    process.exit(1)
  }
  const commitFilePath = `${root}/${commitFilePathInRoot}`
  const commitFile = fs.readFileSync(commitFilePath, 'utf8')
  const [commitMsg, ...restContent] = commitFile.split('\n')
  const type = commitMsg.split(': ')[0]
  const newMsg = prefixCommitMsg(type, commitMsg) + '\n' + restContent.join('\n')
  fs.writeFileSync(commitFilePath, newMsg)
}

module.exports = processCommitMsg
