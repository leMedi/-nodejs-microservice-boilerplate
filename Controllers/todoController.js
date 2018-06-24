import { NotFound, BadRequest } from 'fejl'

import { Todo } from '../Models/todoModel'

const assertId = BadRequest.makeAssert('No id given')

/**
 * Todo Service.
 * Gets a todo store injected.
 */
export default class TodoService {
  async all() {
    return Todo.find({})
  }

  async get(id) {
    assertId(id)
    return Todo.findById(id).then(
      NotFound.makeAssert(`Todo with id "${id}" not found`)
    )
  }

  async add(data) {
    BadRequest.assert(data, 'No todo payload given')
    BadRequest.assert(data.name, 'name is required')
    BadRequest.assert(data.name.length < 100, 'name is too long')
    let car = new Todo({ name: data.name })
    await car.save()
    return car
  }
}
