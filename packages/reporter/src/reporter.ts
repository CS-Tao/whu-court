import address from 'address'
import { parse } from 'semver'
import md5 from 'md5'
import * as Sentry from '@sentry/node'
import '@sentry/tracing'
import Measure from './measure'

const currentVersion = process.env.npm_package_version
const semverVersion = parse(currentVersion, {
  includePrerelease: true,
  loose: true,
})

const prerelease = semverVersion?.prerelease[0]
let environment = 'local'

if (process.env.NODE_ENV === 'production') {
  if (prerelease) {
    // 预发布
    environment = prerelease === 'beta' ? 'gray' : 'staging'
  } else {
    // 线上
    environment = 'production'
  }
}

interface User {
  id: string
  username: string
}

interface Scope {
  user: User
}

const testUser: User = {
  id: 'test_id',
  username: 'cs-tao',
}

class Reporter {
  static Measure = Measure

  static init(scope: Scope) {
    Sentry.init({
      dsn: 'https://9f5715bdde344fbd8ee3fb3696edfd86@o1268975.ingest.sentry.io/6505233',
      tracesSampleRate: 1.0,
      integrations: [new Sentry.Integrations.Http({ tracing: true })], // TODO:
      release: `whu-court@v${currentVersion}`,
      environment,
      sendClientReports: false,
    })
    const user = {
      ...(process.env.NODE_ENV === 'development' && testUser),
      ...scope.user,
      ip_address: address.ip(),
    }
    Sentry.configureScope((_scope) => {
      _scope.setUser({
        id: md5(user.id),
        username: md5(user.username),
        ip_address: user.ip_address,
      })
    })
  }

  static report(error: Error, context?: Record<string, unknown>) {
    Sentry.captureException(error, context)
  }
}

export default Reporter
