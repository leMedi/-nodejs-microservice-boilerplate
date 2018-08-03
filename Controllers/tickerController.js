import { NotFound, BadRequest } from 'fejl'

import { Ticker } from '../Models/TickerModel'

/**
 * Ticker Controller.
 */
export default class tickerController {
  async all() {
    return Ticker.find({}, 'name')
  }

  async getByName(name) {
    BadRequest.assert(name)
    return Ticker.findOne({ name }).then(
      NotFound.makeAssert(`Todo with id "${name}" not found`)
    )
  }
}
