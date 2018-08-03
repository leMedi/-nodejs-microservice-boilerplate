import { route, GET } from 'awilix-koa' // or `awilix-router-core`

@route('/tickertape')
export default class tickersAPI {
  constructor({ tickerTapeController }) {
    this.tickerTapeController = tickerTapeController
  }

  @route('/eods')
  @GET()
  async eods(ctx) {
    const tickers = ctx.request.query['tickers']
      ? ctx.request.query['tickers'].split(',')
      : []
    ctx.body = await this.tickerTapeController.eods(tickers, {
      limit: ctx.request.query['limit'],
      schema: ctx.request.query['schema'],
      from: ctx.request.query['from'],
      to: ctx.request.query['to']
    })
    // ctx.body = await this.tickerTapeController.eods(['Msft', 'aapl'])
  }
}
