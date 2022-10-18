/* eslint-disable no-console */
const { describeRefSync } = require('@lerna/describe-ref')

function getLastTagName({ cwd, silent }) {
  const { lastTagName } = describeRefSync({ cwd })
  !silent && console.log(lastTagName)
  return lastTagName
}

module.exports = getLastTagName
