import { route, GET, POST } from 'awilix-koa' // or `awilix-router-core`

@route('/todosDecorator')
export default class todosAPI {
  constructor({ todoService }) {
    this.todoService = todoService
  }

  @route('/')
  @GET()
  async listTodos(ctx) {
    ctx.body = await this.todoService.all()
  }

  @route('/:id')
  @GET()
  async getTodo(ctx) {
    ctx.body = await this.todoService.get(ctx.params.id)
  }

  @POST()
  async createTodo(ctx) {
    ctx.body = await this.todoService.add(ctx.request.body)
  }
}
