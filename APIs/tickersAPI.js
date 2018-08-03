import { route, GET } from 'awilix-koa' // or `awilix-router-core`

@route('/tickers')
export default class tickersAPI {
  constructor({ zagTrader }) {
    this.zagTrader = zagTrader
  }

  @route('')
  @GET()
  async index(ctx) {
    ctx.body = await this.tickerController.all()
  }

  @route('/:name')
  @GET()
  async get(ctx) {
    ctx.body = await this.tickerController.getByName(ctx.params.name)
  }
}
