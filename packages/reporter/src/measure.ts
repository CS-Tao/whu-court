import * as Sentry from '@sentry/node'
import { environment } from '@whu-court/env'
import { EventKey } from './type'

function getEventMapKey(command: string, event: EventKey) {
  return [command, event].join('_')
}

class Measure {
  constructor(command: string, event: EventKey) {
    this.command = command
    this.eventKey = event
    Measure.eventMap[this.eventTag] = this
  }

  static eventMap: Record<string, Measure> = {}

  static shared(command: string, event: EventKey) {
    const existedInstance = Measure.eventMap[getEventMapKey(command, event)]
    return existedInstance || new Measure(command, event)
  }

  private command: string
  private eventKey: EventKey
  private transaction?: ReturnType<Sentry.Hub['startTransaction']>

  get eventTag() {
    return getEventMapKey(this.command, this.eventKey)
  }

  start() {
    if (environment === 'local') {
      return this
    }
    this.transaction = Sentry.startTransaction({ name: this.eventTag })
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
