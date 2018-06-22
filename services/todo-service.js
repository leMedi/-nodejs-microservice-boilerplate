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
    return this.todoStore.get(id)
  }

  async add(name) {
    return this.todoStore.add({
      name
    })
  }
}
