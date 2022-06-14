import address from 'address'
import * as Sentry from '@sentry/node'
import '@sentry/tracing'
import Measure from './measure'

interface User {
  id: string
  email?: string
  username: string
}

interface Scope {
  user: User
}

class Reporter {
  static Measure = Measure

  static init(scope: Scope) {
    Sentry.init({
      dsn: 'https://9f5715bdde344fbd8ee3fb3696edfd86@o1268975.ingest.sentry.io/6505233',
      tracesSampleRate: 1.0,
      integrations: [new Sentry.Integrations.Http({ tracing: true })],
    })
    Sentry.configureScope((_scope) => {
      _scope.setUser({
        ...scope.user,
        ip_address: address.ip(),
      })
      _scope.setTag('environment', 'development')
    })
  }

  static report(error: Error, context?: Record<string, unknown>) {
    Sentry.captureException(error, context)
  }
}

export default Reporter
