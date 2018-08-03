import { route, GET, POST } from 'awilix-koa' // or `awilix-router-core`

@route('/clients')
export default class tickersAPI {
  constructor({ clientController }) {
    this.clientController = clientController
  }

  @route('')
  @GET()
  async index(ctx) {
    ctx.body = await this.clientController.all()
  }

  @route('')
  @POST()
  async create(ctx) {
    ctx.body = await this.clientController.create(ctx.request.body)
  }

  @route('/:id/deposit')
  @POST()
  async deposit(ctx) {
    ctx.body = await this.clientController.deposit(
      ctx.params.id,
      ctx.request.body.amount || null
    )
  }

  @route('/:id')
  @GET()
  async get(ctx) {
    ctx.body = await this.clientController.get(ctx.params.id)
  }
}
