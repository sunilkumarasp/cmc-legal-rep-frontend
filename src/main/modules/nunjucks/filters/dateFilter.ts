import { MomentFormatter } from 'utils/momentFormatter'
import * as moment from 'moment'
import { Logger } from '@hmcts/nodejs-logging'

const logger = Logger.getLogger('modules/nunjucks/dateFilter')

export function dateFilter (value: moment.Moment | string): string {
  try {
    if (!value || !(typeof value === 'string' || value instanceof moment)) {
      throw new Error('Input should be moment or string, cannot be empty')
    }

    const date: moment.Moment = typeof value === 'string' ? moment(value) : value
    if (!date.isValid()) {
      throw new Error('Invalid date')
    }
    return MomentFormatter.formatLongDate(date)
  } catch (err) {
    logger.error(err)
    throw err
  }
}
