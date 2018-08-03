import { EOD } from '../Models/EODModel'

/**
 * Ticker Controller.
 */
export default class tickerTapeController {
  async eods(tickers, options) {
    let data = {}

    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i].toString().toUpperCase()
      data[ticker] = await this._eods(ticker, options)
    }
    return data
  }

  async _eods(ticker, options) {
    // limit
    const limit = options.limit ? Number.parseInt(options.limit, 10) : 100

    // schema
    const schema = [
      '_id',
      'date',
      'open',
      'high',
      'low',
      'close',
      'volume',
      'dividend',
      'split',
      'adj_open',
      'adj_high',
      'adj_low',
      'adj_close',
      'adj_volume'
    ]
    let Outschema = null

    if (options.schema) {
      Outschema = []
      let schemaAttr = options.schema.split(',')
      for (let i = 0; i < schemaAttr.length; i++)
        if (schema.includes(schemaAttr[i])) Outschema.push(schemaAttr[i])
      Outschema = Outschema.join(' ')
    }

    let query = {
      _id: new RegExp('^' + ticker)
    }

    // from
    if (options.from || options.to) query.date = {}

    if (options.from) query.date.$gte = options.from

    if (options.to) query.date.$lte = options.to

    console.log(query)

    return EOD.find(query, Outschema)
      .sort({
        date: -1
      })
      .limit(limit)
  }
}
