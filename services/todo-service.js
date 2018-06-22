import { NotFound, BadRequest } from 'fejl'

const assertId = BadRequest.makeAssert('No id given')

/**
 * Todo Service.
 * Gets a todo store injected.
 */
export default class TodoService {
  constructor({ todoStore }) {
    this.todoStore = todoStore
  }

  async all() {
    return this.todoStore.all()
  }

  async get(id) {
    assertId(id)
    return this.todoStore
      .get(id)
      .then(NotFound.makeAssert(`Todo with id "${id}" not found`))
  }

  async add(data) {
    BadRequest.assert(data, 'No todo payload given')
    BadRequest.assert(data.name, 'name is required')
    BadRequest.assert(data.name.length < 100, 'name is too long')
    return this.todoStore.add(data)
  }
}
