import { createController } from 'awilix-router-core' // or `awilix-router-core`

const api = ({ todoController }) => ({
  index: async ctx => (ctx.body = await todoController.all()),
  hello: async ctx => (ctx.body = 'hello world'),
  get: async ctx => (ctx.body = await todoController.get(ctx.params.id)),
  new: async ctx => (ctx.body = await todoController.add(ctx.request.body))
})

export default createController(api)
  .prefix('/todos') // Prefix all endpoints with `/todo`
  .get('', 'index')
  .get('/hello', 'hello')
  .get('/:id', 'get')
  .post('', 'new')
