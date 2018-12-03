import { BadRequest, NotFound } from 'fejl'

import { Client } from '../Models/ClientModel'

/**
 * Client Controller.
 */
export default class clientController {
  constructor({ logger }) {
    this.logger = logger
  }

  async all() {
    return Client.find({})
  }

  async get(id) {
    BadRequest.assert(id)

    this.logger.debug(`Get Client by id=${id}`)

    return Client.findById(id).then(
      NotFound.makeAssert(`Client with id "${id}" not found`)
    )
  }

  async create({ name, email }) {
    // validate info
    BadRequest.assert(name, 'name is required')
    BadRequest.assert(email, 'email is required')

    try {
      this.logger.debug('New Client', {
        name,
        email
      })

      // save to db
      let client = new Client({
        name,
        email
      })

      await client.save()

      this.logger.info('Client Created', client.toObject())

      return client
    } catch (error) {
      // TODO: report failure

      this.logger.error('New Client Error', {
        client: { name, email },
        message: error.message
      })

      throw error
    }
  }

  async deleteById(id) {
    BadRequest.assert(id)
    return Client.findByIdAndDelete(id).then(
      NotFound.makeAssert(`Client with id "${id}" not found`)
    )
  }
}
