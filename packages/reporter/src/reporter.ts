import { RewriteFrames } from '@sentry/integrations'
import * as Sentry from '@sentry/node'
import '@sentry/tracing'
import address from 'address'
import md5 from 'md5'
import { appRoot, environment, version } from '@whu-court/env'
import Measure from './measure'

interface User {
  id: number | string
  username: string
  account?: string
}

interface Scope {
  user: User
}

const testUser: User = {
  id: 12345,
  username: 'cs-tao',
  account: '12345',
}

class Reporter {
  static Measure = Measure

  static init(scope: Scope) {
    Sentry.init({
      dsn: 'https://9f5715bdde344fbd8ee3fb3696edfd86@o1268975.ingest.sentry.io/6505233',
      tracesSampleRate: 1.0,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }), // TODO:
        new RewriteFrames({
          root: appRoot,
        }),
      ],
      release: `whu-court@v${version}`,
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
        id: md5(String(user.id)),
        username: md5(user.username),
        account: user.account && md5(user.account),
        ip_address: user.ip_address,
      })
    })
  }

  static report(error: Error, context?: Record<string, unknown>) {
    if (environment === 'local') {
      return
    }
    Sentry.captureException(error, context)
  }
}

export default Reporter
