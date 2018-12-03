import { route, GET, POST, DELETE } from 'awilix-koa' // or `awilix-router-core`

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

  @route('/:id')
  @GET()
  async get(ctx) {
    ctx.body = await this.clientController.get(ctx.params.id)
  }

  @route('')
  @POST()
  async create(ctx) {
    ctx.body = await this.clientController.create(ctx.request.body)
  }

  @route('/:id')
  @DELETE()
  async remove(ctx) {
    ctx.body = await this.clientController.deleteById(ctx.params.id)
  }
}
