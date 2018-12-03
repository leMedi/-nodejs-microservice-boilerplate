import { logger } from '../lib/logger'
import ClientController from '../Controllers/clientController'

// TIP: if you have more than a handful of tests here
// in can be beneficial to split them into multiple files for
// test speed.
let clientController = new ClientController({ logger })

describe('Client API', () => {
  const client = {
    name: 'mehdi',
    email: 'mehdi@elhaij.test'
  }

  it('Add Client', async () => {
    const _client = await clientController.create(client)
    expect(_client.name).toBe(client.name)
    expect(_client.email).toBe(client.email)
    expect(_client.hasOwnProperty('id')).toBe(true)
  })
})
