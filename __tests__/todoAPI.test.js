import { apiHelper } from './apiHelper'

// TIP: if you have more than a handful of tests here
// in can be beneficial to split them into multiple files for
// test speed.
describe('todos API', () => {
  it('can create todo', async () => {
    const api = await apiHelper()
    const todo = await api.todo.create({
      name: 'Hello',
      nonexistent: 'nope'
    })

    expect(todo._id).toBeDefined()
    expect(todo.nonexistent).not.toBeDefined()
    expect(todo).toEqual(
      expect.objectContaining({
        name: 'Hello'
      })
    )
  })

  it('can get todo', async () => {
    const api = await apiHelper()
    const created = await api.todo.create({
      name: 'Hello'
    })

    const gotten = await api.todo.get(created._id)
    expect(gotten).toEqual(created)
  })

  //   it('can remove todo', async () => {
  //     const api = await apiHelper()
  //     const created = await api.createTodo({
  //       title: 'Hello'
  //     })

  //     await api.removeTodo(created.id)

  //     const { response } = await throws(api.getTodo(created.id))
  //     expect(response.status).toBe(404)
  //   })
})
