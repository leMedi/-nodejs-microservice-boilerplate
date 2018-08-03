import { logger } from '../lib/logger'
import { env } from '../lib/env'
import { ZagTrader } from '../Services/zagTrader'
import { ZagClientError, ZagStructuredProductError } from '../lib/ZagTrader'
import fs from 'fs'

// TIP: if you have more than a handful of tests here
// in can be beneficial to split them into multiple files for
// test speed.
let zagTrader = new ZagTrader({ logger })
describe('Session API', () => {
  beforeAll(() => {
    // remove cookie jar
    // start fresh
    fs.unlinkSync(env.ZAG_COOKIE_FILE)
  })

  it('Access Block', async () => {
    let isConnected = await zagTrader.checkSession()
    expect(isConnected).toBe(false)
  })

  it('Initialize Session', async () => {
    let isConnected = await zagTrader.initSession()
    expect(isConnected).toBe(true)
  })

  it('Access Authorized', async () => {
    let isConnected = await zagTrader.checkSession()
    expect(isConnected).toBe(true)
  })
})

describe('Client API', () => {
  const client = {
    id: 789,
    name: 'mehdi',
    email: 'jest@finamaze.test',
    mobile: 6584,
    birthDay: '01-01-1995'
  }

  it('initialize Session', async () => {
    let isConnected = await zagTrader.checkSession()

    if (!isConnected) isConnected = await zagTrader.initSession()

    expect(isConnected).toBe(true)
  })

  it('Add Client', async () => {
    const isAdded = await zagTrader.createClient(client)
    expect(isAdded).toBe(true)
  })

  it('Check client is added', async () => {
    let _client = await zagTrader.getClientById(client.id)

    expect(_client.hasOwnProperty('id')).toBe(true)
    expect(_client.hasOwnProperty('name')).toBe(true)

    expect(_client.id).toBe(client.id)
    expect(_client.name).toBe(client.name)
  })

  it('Add Existing Client', async () => {
    expect(zagTrader.createClient(client)).rejects.toEqual(
      new ZagClientError('Client with id aleady Exists', 409)
    )
  })

  it('Delete Client', async () => {
    let isDeleted = await zagTrader.deleteClient(client.id)
    expect(isDeleted).toBe(true)
  })

  it('Check client is deleted', async () => {
    expect(zagTrader.getClientById(client.id)).rejects.toEqual(
      new ZagClientError('Client with id doesnt exist', 404)
    )
  })

  it('Deleted none Existing Client ', async () => {
    expect(zagTrader.deleteClient(client.id)).rejects.toEqual(
      new ZagClientError('Client with id doesnt exist', 404)
    )
  })
})

describe('Structured Product API', () => {
  const now = new Date()
  const structuredProduct = {
    marketId: 2226,
    week: 2018,
    tickers: [318531, 318532, 318533],
    weights: [23, 57, 20],
    symbol: `TEST_${now.getTime()}`
  }

  it('Create Structured Product - ' + structuredProduct.symbol, async () => {
    const structuredProductId = await zagTrader.createStructredProduct(
      structuredProduct
    )
    console.log(structuredProductId)
    expect(Number.isInteger(structuredProductId)).toBe(true)

    structuredProduct.id = structuredProductId
  })

  it('Check Structured Product is created', async () => {
    const _structuredProduct = await zagTrader.getStructredProduct(
      structuredProduct.marketId,
      structuredProduct.id
    )

    expect(_structuredProduct.hasOwnProperty('id')).toBe(true)
    expect(_structuredProduct.hasOwnProperty('lastPrice')).toBe(true)

    expect(_structuredProduct.id).toBe(structuredProduct.id)
    expect(Number.isFinite(_structuredProduct.lastPrice)).toBe(true)
  })

  it('Create an Existing Structured Product', async () => {
    expect(zagTrader.createStructredProduct(structuredProduct)).rejects.toEqual(
      new ZagStructuredProductError('Symbol already Exist', 409)
    )
  })
})

describe('Order API', () => {
  const order = {
    clientId: 1,
    structuredProductId: 312333,
    orderType: 'LONG',
    value: 7.0,
    stopLoss: 0,
    takeProfit: 0
  }

  it('Place Order', async () => {
    const _order = await zagTrader.placeOrder(order)
    console.log(_order)
  })

  it('Cancel Order', async () => {
    const _order = await zagTrader.cancelOrder(23617)
    console.log(_order)
  })
})
