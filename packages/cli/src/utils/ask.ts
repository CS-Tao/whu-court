import inquirer from 'inquirer'
import configManager, { ConfigKey } from '@whu-court/config-manager'

export const askGitHubToken = async (): Promise<string> => {
  const answers = await inquirer.prompt<{
    token: string
  }>([
    {
      type: 'password',
      name: 'token',
      message: '请输入 GitHub token',
      validate: (value) => {
        return configManager.validate(ConfigKey.githubToken, value) || true
      },
      mask: '*',
    },
  ])
  return answers.token
}
