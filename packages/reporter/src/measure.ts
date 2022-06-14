import * as Sentry from '@sentry/node'

type EventKey = 'test'

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
    this.transaction = Sentry.startTransaction({ name: this.eventKey })
    return this
  }

  end() {
    if (this.transaction) {
      this.transaction.finish()
    }
  }
}

export default Measure
