export default function createTodoStore({ logger }) {
  let _todos = []

  return {
    async all() {
      logger.debug(`Getting all todos`)
      return _todos
    },

    async get(id) {
      logger.debug(`Getting todo with id ${id}`)
      if (id >= _todos.length) return null

      return _todos[id]
    },

    async add(data) {
      logger.debug(`Adding a todo with name ${data.name}`)
      return _todos.push(data)
    }
  }
}
