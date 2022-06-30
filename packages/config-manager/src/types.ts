export enum ConfigKey {
  /**
   * 软件是否可用
   */
  available = 'available',
  /**
   * 软件停用原因
   */
  prohibitMsg = 'prohibitMsg',
  /**
   * 软件内公告
   */
  announcement = 'announcement',
  /**
   * 黑名单 github id or github name or court account
   */
  blackList = 'blackList',

  /**
   * GitHub id
   */
  githubId = 'githubId',
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
   * 预约系统 Sid
   */
  courtSid = 'courtSid',
  /**
   * 登录时间
   */
  loginTime = 'loginTime',

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
   * @default ['ze','xb','fy','gr','gt','yxb']
   */
  courts = 'courts',

  /**
   * 卓尔场地顺序
   */
  zeOrder = 'zeOrder',
  /**
   * 信部场地顺序
   */
  xbOrder = 'xbOrder',
  /**
   * 风雨场地顺序
   */
  fyOrder = 'fyOrder',
  /**
   * 国软场地顺序
   */
  grOrder = 'grOrder',
  /**
   * 工体场地顺序
   */
  gtOrder = 'gtOrder',
  /**
   * 医学部场地顺序
   */
  yxbOrder = 'yxbOrder',
}

export interface ConfigTypes {
  [ConfigKey.available]: boolean
  [ConfigKey.prohibitMsg]: string
  [ConfigKey.announcement]: string
  [ConfigKey.blackList]: string[]

  [ConfigKey.githubId]: number
  [ConfigKey.githubUserName]: string
  [ConfigKey.githubNickName]: string
  [ConfigKey.githubToken]: string
  [ConfigKey.githubAvatar]: string

  [ConfigKey.courtAccount]: string
  [ConfigKey.courtToken]: string
  [ConfigKey.courtSid]: string
  [ConfigKey.loginTime]: number

  [ConfigKey.openTime]: string
  [ConfigKey.checkOpenInterval]: number
  [ConfigKey.time]: string
  [ConfigKey.courts]: string[]

  [ConfigKey.zeOrder]: string[]
  [ConfigKey.xbOrder]: string[]
  [ConfigKey.fyOrder]: string[]
  [ConfigKey.grOrder]: string[]
  [ConfigKey.gtOrder]: string[]
  [ConfigKey.yxbOrder]: string[]
}
