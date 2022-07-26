/* eslint-disable no-console */
import chalk from 'chalk'
import fs from 'fs'

function prefixCommitMsg(type: string, msg: string) {
  const prefixMap: Record<string, string> = {
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

function processCommitMsg({ cwd, commitFilePathInRoot }: { cwd: string; commitFilePathInRoot: string }) {
  const root = cwd
  if (!root || !commitFilePathInRoot || typeof commitFilePathInRoot !== 'string') {
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
