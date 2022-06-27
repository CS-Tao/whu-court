import inquirer from 'inquirer'
import configManager, { ConfigKey } from '@whu-court/config-manager'

export const askGitHubToken = async (): Promise<string> => {
  const answers = await inquirer.prompt<{
    githubToken: string
  }>([
    {
      type: 'password',
      name: 'githubToken',
      message: '请输入 GitHub token',
      validate: (value) => {
        return configManager.validate(ConfigKey.githubToken, value) || true
      },
      mask: '*',
    },
  ])
  return answers.githubToken
}

export const askCourtToken = async (): Promise<string> => {
  const answers = await inquirer.prompt<{
    token: string
  }>([
    {
      type: 'password',
      name: 'token',
      message: '请输入场馆 token',
      validate: () => true,
      mask: '*',
    },
  ])
  return answers.token
}

export const askCourtSid = async (): Promise<string> => {
  const answers = await inquirer.prompt<{
    sid: string
  }>([
    {
      type: 'password',
      name: 'sid',
      message: '请输入场馆 sid',
      validate: () => true,
      mask: '*',
    },
  ])
  return answers.sid
}
