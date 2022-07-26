/* eslint-disable no-console */
const fs = require('fs')
const chalk = require('chalk')
const get = require('lodash/get')
const set = require('lodash/set')

let fields = ['main']
const typesField = 'types'

function replacePublishFields({ cwd }) {
  const pkg = require(`${cwd}/package.json`)
  const publishDist = (pkg.wcrt && pkg.wcrt.publishDist) || []
  fields = [...fields, ...publishDist]

  if (pkg[typesField] === 'src/index.ts') {
    pkg[typesField] = 'dist/index.d.ts'
  }

  fields.forEach((each) => {
    const field = get(pkg, each)
    if (field) {
      if (typeof field === 'string') {
        set(pkg, each, field.replace('src', 'dist'))
      } else {
        set(
          pkg,
          each,
          field.map((each) => each.replace('src', 'dist')),
        )
      }
    } else {
      console.log(chalk.red(`No field ${each} in package.json`))
      process.exit(1)
    }
  })

  fs.writeFileSync(`${cwd}/package.json`, JSON.stringify(pkg, null, 2) + '\n')
}

module.exports = replacePublishFields
