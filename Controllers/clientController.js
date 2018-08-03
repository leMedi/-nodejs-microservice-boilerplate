import { NotFound, BadRequest } from 'fejl'

import { Client } from '../Models/ClientModel'
import { Counters } from '../Models/CounterCollection'

/**
 * Client Controller.
 */
export default class clientController {
  constructor({ zagTrader }) {
    this.zagTrader = zagTrader
  }

  async all() {
    return Client.find({}, 'name')
  }

  async get(id) {
    BadRequest.assert(id)
    return Client.findById(id).then(
      NotFound.makeAssert(`Client with id "${id}" not found`)
    )
  }

  async create({ id, name, email, mobile, birthDay }) {
    // validate info
    BadRequest.assert(id, 'id is required')
    BadRequest.assert(name, 'name is required')
    BadRequest.assert(email, 'email is required')
    BadRequest.assert(mobile, 'mobile is required')
    BadRequest.assert(birthDay, 'birthDay is required')

    try {
      // generate id
      const _id = await Counters.getNext('clientid')

      // talk to zagtrader
      await this.zagTrader.createClient({
        id: _id,
        name,
        email,
        mobile,
        birthDay
      })

      // save to db
      let client = new Client({
        _id: id,
        name,
        email,
        mobile,
        birthDay,
        zagId: _id
      })

      await client.save()

      return client
    } catch (error) {
      // TODO: report failure
      // if(error instanceof ZagValidationError){

      // }else if(error instanceof ZagValidationError) {

      // }
      throw error
    }
  }

  async deposit(id, amount) {
    // validate info
    BadRequest.assert(id, 'id is required')
    BadRequest.assert(amount, 'amount is required')

    // find client
    let client = await Client.findById(id).then(
      NotFound.makeAssert(`Client with id "${id}" not found`)
    )

    try {
      // talk to zagtrader
      await this.zagTrader.clientCashDeposit(client.zagId, amount)

      return {
        message: 'done'
      }
    } catch (error) {
      // TODO: report failure
      // if(error instanceof ZagValidationError){

      // }else if(error instanceof ZagValidationError) {

      // }
      throw error
    }
  }
}
