import * as Sentry from '@sentry/node'
import { environment } from '@whu-court/env'

type EventKey = 'test' | string

class Measure {
  constructor(event: EventKey) {
    this.eventKey = event
  }

  static getMeasure(event: EventKey) {
    return new Measure(event)
  }

  eventKey: EventKey
  transaction?: ReturnType<Sentry.Hub['startTransaction']>

  start() {
    if (environment === 'local') {
      return this
    }
    this.transaction = Sentry.startTransaction({ name: this.eventKey })
    return this
  }

  end() {
    if (environment === 'local') {
      return
    }
    if (this.transaction) {
      this.transaction.finish()
    }
  }
}

export default Measure
