import * as Sentry from '@sentry/node'
import { environment } from '@whu-court/env'
import { EventKey } from './type'

function getEventMapKey(measureId: string, event: EventKey) {
  return [event, measureId].join('_')
}

class Measure {
  constructor(measureId: string, event: EventKey) {
    this.measureId = measureId
    this.eventKey = event
    Measure.eventMap[this.eventTag] = this
  }

  static eventMap: Record<string, Measure> = {}

  static shared(measureId: string, event: EventKey) {
    const existedInstance = Measure.eventMap[getEventMapKey(measureId, event)]
    return existedInstance || new Measure(measureId, event)
  }

  private measureId: string
  private eventKey: EventKey
  private transaction?: ReturnType<Sentry.Hub['startTransaction']>

  get eventTag() {
    return getEventMapKey(this.measureId, this.eventKey)
  }

  get transactionEventTag() {
    return this.eventTag.replace(/\(.*\)/, '')
  }

  start() {
    if (environment === 'local') {
      return this
    }
    this.transaction = Sentry.startTransaction({ name: this.transactionEventTag })
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
