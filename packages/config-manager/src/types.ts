export enum ConfigKey {
  /**
   * GitHub 用户名
   */
  githubUserName = 'githubUserName',
  /**
   * GitHub 昵称
   */
  githubNickName = 'githubNickName',
  /**
   * GitHub Token
   */
  githubToken = 'githubToken',
  /**
   * GitHub 头像
   */
  githubAvatar = 'githubAvatar',

  /**
   * 预约系统账号
   */
  courtAccount = 'courtAccount',
  /**
   * 预约系统 Token
   */
  courtToken = 'courtToken',

  /**
   * 开始抢场地的时间。
   * @default '18:00:00'
   */
  openTime = 'openTime',
  /**
   * 检查是否可以开始抢场地的时间间隔 ms。
   * @default 400
   */
  checkOpenInterval = 'checkOpenInterval',
  /**
   * 希望预约的时间，加!的时间段不考虑。
   * @default '08-21'
   */
  time = 'time',
  /**
   * 预约时按顺序考虑的场馆列表。
   * ze 卓尔
   * xb 信部
   * fy 风雨
   * gr 国软
   * gt 工体
   * yxb 医学部
   * sq 宋卿
   * @default ['ze','xb','fy','gr','gt','yxb','sq']
   */
  courts = 'courts',
}

export interface ConfigTypes {
  [ConfigKey.githubUserName]: string
  [ConfigKey.githubNickName]: string
  [ConfigKey.githubToken]: string
  [ConfigKey.githubAvatar]: string

  [ConfigKey.courtAccount]: string
  [ConfigKey.courtToken]: string

  [ConfigKey.openTime]: string
  [ConfigKey.checkOpenInterval]: number
  [ConfigKey.time]: string
  [ConfigKey.courts]: string[]
}
