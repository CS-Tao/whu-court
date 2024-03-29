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
   * 白名单 github id or github name or court account
   *
   * 如果配置了白名单，黑名单将被忽略
   */
  whiteList = 'whiteList',

  /**
   * 统计密钥，随机生成，可自行配置
   *
   * 用于加密用户数据，反馈 bug 时如有必要可提供此 key 用于帮助管理员过滤数据
   */
  statsKey = 'statsKey',

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
   * 预约系统 UA
   */
  courtUserAgent = 'courtUserAgent',
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
   * 预约的场地 id 列表
   */
  fields = 'fields',
  /**
   * 备用预约的场地 id 列表
   */
  backupFields = 'backupFields',

  /**
   * 公告 hash
   */
  informHash = 'informHash',

  apiCacheMap = 'apiCacheMap',
}

export interface ConfigTypes {
  [ConfigKey.available]: boolean
  [ConfigKey.prohibitMsg]: string
  [ConfigKey.announcement]: string
  [ConfigKey.blackList]: string[]
  [ConfigKey.whiteList]: string[]

  [ConfigKey.statsKey]: string

  [ConfigKey.githubId]: number
  [ConfigKey.githubUserName]: string
  [ConfigKey.githubNickName]: string
  [ConfigKey.githubToken]: string
  [ConfigKey.githubAvatar]: string

  [ConfigKey.courtAccount]: string
  [ConfigKey.courtToken]: string
  [ConfigKey.courtSid]: string
  [ConfigKey.courtUserAgent]: string
  [ConfigKey.loginTime]: number

  [ConfigKey.openTime]: string
  [ConfigKey.checkOpenInterval]: number
  [ConfigKey.time]: string
  [ConfigKey.courts]: string[]
  [ConfigKey.fields]: string[]
  [ConfigKey.backupFields]: string[]

  [ConfigKey.informHash]: string

  [ConfigKey.apiCacheMap]: Record<string, unknown>
}
