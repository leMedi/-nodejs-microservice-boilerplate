import { createController } from 'awilix-router-core' // or `awilix-router-core`

const api = ({ todoController }) => ({
  // index: async ctx => (ctx.body = await todoController.all()),
  // get: async ctx => (ctx.body = await todoController.get(ctx.params.id)),
  // new: async ctx => (ctx.body = await todoController.add(ctx.request.body))

  index: async ctx => ctx.ok(await todoController.all()),
  get: async ctx => ctx.ok(await todoController.get(ctx.params.id)),
  new: async ctx => ctx.created(await todoController.add(ctx.request.body))
})

export default createController(api)
  .prefix('/todos') // Prefix all endpoints with `/todo`
  .get('', 'index')
  .get('/:id', 'get')
  .post('', 'new')
