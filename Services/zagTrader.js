import axios from 'axios'
import validator from 'validator'
import qs from 'qs'
import tough from 'tough-cookie'
import FileCookieStore from 'file-cookie-store'

import { env } from '../lib/env'
import {
  ZagEndPoints,
  ZagResponses,
  ZagError,
  ZagValidationError,
  ZagClientError,
  ZagStructuredProductError,
  ZagOrderError,
  ZagSessionError
} from '../lib/ZagTrader'
const axiosCookieJarSupport = require('axios-cookiejar-support').default

axiosCookieJarSupport(axios)

export class ZagTrader {
  constructor({ logger }) {
    this.logger = logger

    const cookiesStore = new FileCookieStore(env.ZAG_COOKIE_FILE, {
      lockfile: true, // allow parallel access to the cookies file
      auto_sync: true // auto write changes to file
    })

    // create cookie jar
    this.cookieJar = new tough.CookieJar(cookiesStore)

    // initiate zagtrader
    this.httpClient = axios.create({
      baseURL: env.ZAG_HOST,
      // baseURL: 'http://postb.in',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },

      jar: this.cookieJar,
      withCredentials: true // send cookie stored in jar
    })
  }

  // #region Session

  /**
   * Initialize Session
   *
   * initilize a seesion with Zag
   * if the authentification successeded fill in the 'COOKIE_JAR'
   *
   * @returns {boolean} - confirmation of the login request
   */
  async initSession() {
    try {
      let data = {
        username: env.ZAG_USERNAME,
        password: env.ZAG_PASSWORD
      }

      this.logger.debug('ZagTrader initSession', {
        username: data['username']
      })

      // sending connection request to ZagAPI
      let response = await this.httpClient.post(
        ZagEndPoints.LOGIN,
        qs.stringify(data)
      )

      if (response.data === ZagResponses.AUTHENTIFICATION_SUCCESS) {
        this.logger.info('ZagTrader initSession', {
          response: response.data
        })

        return true
      }

      this.logger.error('ZagTrader initSession', {
        username: data['username'],
        response: response.data
      })

      return false
    } catch (error) {
      this.logger.error('ZagTrader initSession', {
        error: error.message
      })
      return false
    }
  }

  /**
   * Check Session
   * Check if session cookie has expired
   * @returns {boolean} - true if session is still valid, false otherwise
   */
  async checkSession() {
    try {
      // this endpoint will return 200 if session is valid otherwise 401 or 500
      await this.httpClient.get(ZagEndPoints.CHECK_SESSION)
      return true
    } catch (error) {
      // TODO: log this step
      return false
    }
  }
  // #endregion

  // #region Helper Functions
  /**
   * make a GET request
   *
   * @throws {ZagSessionError} session is invalid
   * @throws {ZagError} other errors
   *
   * @param {string} endpoint - api path.
   * @param {object} data - request params.
   *
   * @returns {string} - response body
   */
  async _get(endpoint, data) {
    try {
      let response = await this.httpClient.get(endpoint, { ...data })
      return response.data
    } catch (error) {
      if (error.hasOwnProperty('response') && error.response.status === 403) {
        this.logger.error('ZagTrader API', {
          methode: 'GET',
          endpoint: endpoint,
          error: 'Invalid Session'
        })
        throw new ZagSessionError('Invalid Session', 403)
      }
      this.logger.error('ZagTrader API', {
        methode: 'GET',
        endpoint: endpoint,
        error: 'Unknown Error'
      })
      throw new ZagError(error.message)
    }
  }

  /**
   * try to make a GET request
   * make the request, refresh session if invalid
   *
   * @throws {ZagSessionError} session is invalid
   * @throws {ZagError} other errors
   *
   * @param {string} endpoint - api path.
   * @param {object} data - request params.
   *
   * @returns {string} - response body
   */
  async get(endpoint, data) {
    try {
      return this._get(endpoint, { params: data })
    } catch (error) {
      if (error instanceof ZagSessionError && error.status === 403) {
        // session is expired
        // refresh session
        await this.initSession()
        // do request again
        return this._get(endpoint, { params: data })
      }
      throw error
    }
  }
  // #endregion

  // #region Clients
  /**
   * Create a new Client
   *
   * @throws {ZagSessionError} session is invalid
   * @throws {ZagError} other errors
   * @throws {ZagValidationError}
   * @throws {ZagClientError} client with id already exists
   *
   * @param {number} id - client id.
   * @param {string} name - client full name.
   * @param {string} email - client number
   * @param {string} mobile - client mobile number
   * @param {string} birthDay - ex: 05-05-1982
   *
   * @returns {boolean} - true if user created
   */
  async createClient({ id, name, email, mobile, birthDay }) {
    if (!validator.isInt(id.toString(), { min: 0 }))
      throw new ZagValidationError('id must be an int')

    if (!name.toString().length >= 5)
      throw new ZagValidationError('name is not valid')

    if (!validator.isEmail(email))
      throw new ZagValidationError('email is not valid')

    if (!mobile.toString().length >= 9)
      // TODO: validate
      throw new ZagValidationError('mobile is not valid')

    if (!birthDay.toString() >= 8)
      // TODO: validate
      throw new ZagValidationError('birthDay not valid')

    this.logger.info('ZagTrader API [CreateClient]', {
      client: { id, name, email }
    })

    let response = await this.get(ZagEndPoints.CREATE_USER, {
      userId: id,
      fullName: name,
      emailAddress: email,
      mobileNumber: mobile,
      dateOfBirth: birthDay
    })

    if (response[0] === '1') {
      // eslint-disable-lint
      this.logger.info('ZagTrader API [CreateClient]', {
        client: { id, name, email },
        response
      })
      return true
    }

    if (response.includes(ZagResponses.$USER_ALREADY_EXISTS_ERROR)) {
      this.logger.error('ZagTrader API [CreateClient]', {
        client: { id, name, email },
        error: 'ZAG_TRADER_CLIENT_EXISTS',
        message: response
      })
      throw new ZagClientError('Client with id aleady Exists', 409)
    }

    this.logger.error('ZagTrader API [CreateClient]', {
      client: { id, name, email },
      error: 'ZAG_TRADER_API_ERROR',
      message: response
    })
    throw new ZagError('Client Error', 500)
  }

  /**
   * Delete a Client
   *
   * @throws {ZagSessionError} session is invalid
   * @throws {ZagError} other errors
   * @throws {ZagValidationError}
   *
   * @param {number} id - client id.
   *
   * @returns {boolean}  - true if client is deleted.
   */
  async deleteClient(id) {
    if (!validator.isInt(id.toString(), { min: 0 }))
      throw new ZagValidationError('id must be an int')

    this.logger.debug('ZagTrader API [DeleteClient]', {
      client: { id }
    })

    let response = await this.get(ZagEndPoints.DELETE_USER, {
      userId: id
    })

    if (response[0] === '1') {
      // eslint-disable-lint
      this.logger.info('ZagTrader API [DeleteClient]', {
        client: { id },
        message: response
      })
      return true
    }

    if (response.includes(ZagResponses.$USER_DOES_NOT_EXIST_ERROR)) {
      this.logger.error('ZagTrader API [DeleteClient]', {
        client: { id },
        error: 'ZAG_TRADER_CLIENT_DOSNT_EXIST',
        message: response
      })
      throw new ZagClientError('Client with id doesnt exist', 404)
    }

    this.logger.error('ZagTrader API [DeleteClient]', {
      client: { id },
      error: 'ZAG_TRADER_API_ERROR',
      message: response
    })

    throw new ZagError('Client Error', 500)
  }

  /**
   * List Clients
   * Note: no idea what's this api useful for, no search criterias can be submited
   *
   * @throws {ZagSessionError} session is invalid
   * @throws {ZagError} other errors
   *
   * @param {number} [9999] limit - max number of clients to fetch.
   *
   * @returns {array} - Clients list
   */
  async listClients(limit) {
    limit = limit || 9999 // default value

    this.logger.debug('ZagTrader API [ListClients]', {
      limit
    })

    let response = await this.get(ZagEndPoints.USER_INQUIRY, { usersNo: limit })

    this.logger.info('ZagTrader API [ListClients]', {
      limit
    })

    if (!Array.isArray(response))
      // response is an Array
      throw new ZagError('Client Error', 500)

    return response
  }

  /**
   * get Client by id
   * Note: no idea what's this api useful for, no search criterias can be submited
   *
   * @throws {ZagSessionError} session is invalid
   * @throws {ZagError} other errors
   * @throws {ZagValidationError}
   * @throws {ZagClientError} client with id doesn't exist
   *
   * @param {number} id - Client id
   *
   * @param {Object} - Client object
   */
  async getClientById(id) {
    if (!validator.isInt(id.toString(), { min: 0 }))
      throw new ZagValidationError('id must be an int')

    let clients = await this.listClients()

    for (let i = 0; i < clients.length; i++) {
      if (clients[i].userId === id)
        return {
          // format client object
          id: validator.toInt(clients[i].userId),
          name: clients[i].fullName
        }
    }

    throw new ZagClientError('Client with id doesnt exist', 404)
  }

  /**
   * Cash Deposit
   *
   * @throws {ZagSessionError} session is invalid
   * @throws {ZagError} other errors
   * @throws {ZagValidationError}
   * @throws {ZagClientError} client with id doesn't exist
   *
   * @param {number} id - Client id
   *
   * @param {boolean} - true if everything went well
   */
  async clientCashDeposit(id, amount) {
    if (!validator.isInt(id.toString(), { min: 0 }))
      throw new ZagValidationError('id must be an int')

    if (!validator.isFloat(amount.toString(), { min: 0 }))
      throw new ZagValidationError('amount must be a decimal')
    amount = validator.toFloat(amount.toString())

    this.logger.debug('ZagTrader API [ClientCashDeposit]', {
      client: { id },
      amount
    })

    let response = await this.get(ZagEndPoints.DEPOSIT, {
      userId: id,
      amount,
      debitAccountID: '1101', // why 1101 ???

      // Fixed
      currencySymbol: 'USD'
    })

    if (response[0] === '1') {
      this.logger.info('ZagTrader API [ClientCashDeposit]', {
        client: { id },
        amount,
        message: response
      })
      return true
    }

    if (response[0] === '0') {
      this.logger.error('ZagTrader API [ClientCashDeposit]', {
        client: { id },
        amount,
        message: response
      })
      throw new ZagClientError(response.split('|')[1], 400)
    }

    this.logger.error('ZagTrader API [ClientCashDeposit]', {
      client: { id },
      amount,
      message: response
    })

    throw new ZagClientError('Deposit Error', 500)
  }
  // #endregion

  // #region Structred Product
  /**
   * Create Structured Product
   *
   * @throws {ZagSessionError} session is invalid
   * @throws {ZagError} other errors
   * @throws {ZagValidationError}
   * @throws {ZagStructuredProductError}
   *
   * @param {number} id - market to create the sp in (market ids are given by Zag).
   * @param {string} week - 4 digits week number ex: 1801 (2018, week one)
   * @param {string} weights - three perctages that add up to a 100%, ex: 65,20,15
   * @param {(number|Array.)} tickers - ticker ids
   * @param {string} symbol - a *unique* name for the sp (any string is acceptable)
   *
   * @returns {number} - id of the newly created SP
   */
  async createStructredProduct({ marketId, week, weights, tickers, symbol }) {
    if (!validator.isInt(marketId.toString(), { min: 0 }))
      throw new ZagValidationError('marketId must be an int')

    if (!validator.isInt(week.toString(), { min: 0 }))
      // need more stuff
      throw new ZagValidationError('week must be an int')

    if (!Array.isArray(weights))
      throw new ZagValidationError('weights must be an Array')

    if (!Array.isArray(tickers))
      throw new ZagValidationError('tickers must be an Array')

    if (tickers.length !== weights.length)
      // compare lengths
      throw new ZagValidationError(
        'tickers & weights arrays must be of the same length'
      )

    if (!tickers.every(Number.isInteger))
      throw new ZagValidationError('tickers must be integers')

    // check if weights add up to a 100%
    let _some = 0
    for (let i = 0; i < weights.length; i++) {
      if (!Number.isInteger(weights[i]))
        throw new ZagValidationError('weights must be integers')

      _some += weights[i]
    }

    if (_some !== 100)
      throw new ZagValidationError('weights must add up to a 100%')

    let data = {
      marketId: marketId,
      week: week,
      percentAllocation: weights.join(','),
      tickerAllocation: tickers.join(','),
      baseSymbol: symbol,

      // fixed values
      mode: 'AllocationPercent',
      currencySymbol: 'USD'
    }

    let response = await this.get(ZagEndPoints.CREATE_STRUCTURED_PRODUCT, data)

    const _res = response.split('|')

    if (
      _res.length !== 2 ||
      response.includes(ZagClientError.$CREATE_SP_ERROR)
    ) {
      this.logger.error('ZagTrader API [createSP]', {
        SP: { marketId, tickers, weights, week },
        error: 'ZAG_TRADER_SP_ERROR',
        message: response
      })
      throw new ZagStructuredProductError('Error creating SP', 400)
    }

    if (_res[0] === '0')
      // eslint-disable-lint
      // Error: response = "0|some error message"
      throw new ZagStructuredProductError(response.split('|')[1], 409)

    // SP created: response = "idOfSP|Success"
    if (_res[1] === 'Success' && validator.isInt(_res[0], { min: 1 }))
      return Number.parseInt(_res[0])

    throw new ZagStructuredProductError('Error creating SP', 500)
  }

  /**
   * List Structured Products in specific market
   * if the market id is incorrect the output will an empty array
   * Note: no search criterias can be submited
   *
   * @throws {ZagSessionError} session is invalid
   * @throws {ZagError} other errors
   * @throws {ZagValidationError}
   * @throws {ZagStructuredProductError}
   *
   * @param {number} marketId - Market id.
   *
   * @returns {array} - array of SPs
   */
  async listStructredProducts(marketId) {
    if (!validator.isInt(marketId.toString(), { min: 0 }))
      throw new ZagValidationError('marketId must be an int')
    marketId = validator.toInt(marketId.toString())

    this.logger.debug('ZagTrader API [ListStructredProducts]', {
      marketId
    })

    let response = await this.get(ZagEndPoints.LIST_STRUCTURED_PRODUCTS, {
      marketId
    })

    this.logger.info('ZagTrader API [ListStructredProducts]', {
      marketId
    })

    if (!Array.isArray(response)) {
      // response is an Array
      this.logger.error('ZagTrader API [ListStructredProducts]', {
        marketId,
        error: 'ZAG_TRADER_SP_ERROR',
        response
      })
      throw new ZagStructuredProductError('response is not an array', 500)
    }
    return response
  }

  /**
   * get sp in a market by id
   * Note: no idea what's this api useful for, no search criterias can be submited
   *
   * @throws {ZagSessionError} session is invalid
   * @throws {ZagError} other errors
   * @throws {ZagValidationError}
   * @throws {ZagStructuredProductError}
   *
   * @param {number} marketId - Market id
   * @param {number} spId - Structred Product id
   *
   * @param {Object} - Client object
   */
  async getStructredProduct(marketId, spId) {
    if (!validator.isInt(spId.toString(), { min: 0 }))
      throw new ZagValidationError('Structred Product id must be an int')
    spId = validator.toInt(spId.toString())

    let SPs = await this.listStructredProducts(marketId)

    for (let i = 0; i < SPs.length; i++) {
      if (SPs[i].TickerID === spId)
        return {
          // format sp object
          id: validator.toInt(SPs[i].TickerID),
          SymbolAlias: SPs[i].SymbolAlias,
          description: SPs[i].Description,
          lastPrice: validator.toFloat(SPs[i].LastPrice)
        }
    }

    this.logger.error('ZagTrader API [GetStructredProduct]', {
      marketId,
      spId,
      error: 'ZAG_TRADER_SP_ERROR',
      message: 'SP not found'
    })

    throw new ZagStructuredProductError(
      'Structured Product with id doesnt exist in market'
    )
  }
  // #endregion

  // #region Orders
  /**
   * Place Order
   *
   * @throws {ZagSessionError} session is invalid
   * @throws {ZagError} other errors
   * @throws {ZagValidationError}
   * @throws {ZagOrderError}
   *
   * @param {('LONG'|'SHORT')} orderType - sell or buy.
   * @param {number} clientId - client id.
   * @param {string} tickeId - 4 digits week number ex: 1801 (2018, week one)
   * @param {number} value - three perctages that add up to a 100%, ex: 65,20,15
   * @param {boolean} orderType - three perctages that add up to a 100%, ex: 65,20,15
   * @param {number} takeProfit - the name of the sp (any string is acceptable)
   * @param {number} stoPLoss - ticker ids
   */
  async placeOrder({
    clientId,
    structuredProductId,
    orderType,
    value,
    stopLoss,
    takeProfit
  }) {
    if (!validator.isInt(clientId.toString(), { min: 0 }))
      throw new ZagValidationError('clientId must be an int')
    clientId = validator.toInt(clientId.toString())

    if (!validator.isInt(structuredProductId.toString(), { min: 0 }))
      throw new ZagValidationError('structuredProductId must be an int')
    structuredProductId = validator.toInt(structuredProductId.toString())

    if (typeof orderType === 'string')
      throw new ZagValidationError('structuredProductId must be an int')

    orderType = orderType.toUpperCase()
    let _orderType = 0
    if (orderType === 'SHORT') _orderType = 0
    else if (orderType === 'LONG') _orderType = 1
    else throw new ZagValidationError("orderType should be 'SHORT' or 'LONG'")

    if (!validator.isInt(value.toString(), { min: 0 }))
      throw new ZagValidationError('value must be an int')
    value = validator.toInt(value.toString())

    if (!validator.isInt(stopLoss.toString(), { min: 0, max: value }))
      // TODO: fix max here
      throw new ZagValidationError('stopLoss must be an int')
    stopLoss = validator.toInt(stopLoss.toString())

    if (!validator.isInt(takeProfit.toString(), { min: 0 }))
      // TODO: add max here
      throw new ZagValidationError('takeProfit must be an int')
    takeProfit = validator.toInt(takeProfit.toString())

    let data = {
      // "apiOrderType":             _orderType,     // short/long
      apiOrderType: _orderType, // short/long
      apiUserId: clientId, // ex 1
      apiTickerId: structuredProductId, // ex 312333
      apiOrderValue: value, // ex 7000
      apiPrice: value,
      // "apiTriggerStopLossPx":     stopLoss,      // ex 4
      // "apiTriggerTakeProfitPx":   takeProfit,    // ex 8

      // not our concern
      apiRegularTrading: 1,
      apiPlacedFrom: 'ZagTrader Microservice',
      apiSubUserId: 0,
      apiCustodianId: 0,
      apiMarketValue: 1,
      // "apiByQuantity":        1,
      // "apiQuantity":          1,
      apiInstructionId: -1,
      apiExpiryId: 0,
      apiExpiryDays: 1,
      apiExpiryTime: '',
      apiOrderSource: 0,
      apiMinQuantity: '',
      apiMaxFloor: '',
      apiStopPrice: '',
      apiBasketOrder: 0,
      apiBasketRelease: ''
    }

    this.logger.debug('ZagTrader API [PlaceOrder]', {
      order: {
        clientId,
        structuredProductId,
        orderType,
        value,
        stopLoss,
        takeProfit
      }
    })

    let order = await this.get(ZagEndPoints.PLACE_ORDER, data)

    if (order.hasOwnProperty('orderId')) {
      if (order.orderId !== 0) {
        this.logger.info('ZagTrader API [PlaceOrder]', {
          order: {
            id: order.orderId,
            clientId,
            structuredProductId,
            orderType,
            value,
            stopLoss,
            takeProfit
          }
        })
        return validator.toInt(order.orderId)
      } else {
        // TODO: check what this means
        this.logger.error('ZagTrader API [PlaceOrder]', {
          order: {
            clientId,
            structuredProductId,
            orderType,
            value,
            stopLoss,
            takeProfit
          },
          error: 'ZAG_TRADER_ORDER_ERROR',
          message: order.message
        })
        throw new ZagOrderError(order.message)
      }
    }

    this.logger.error('ZagTrader API [PlaceOrder]', {
      order: {
        clientId,
        structuredProductId,
        orderType,
        value,
        stopLoss,
        takeProfit
      },
      error: 'ZAG_TRADER_ORDER_ERROR',
      message: order
    })
    throw new ZagOrderError(order)
  }

  /**
   * Cancel order by id
   *
   * @throws {ZagSessionError} session is invalid
   * @throws {ZagError} other errors
   * @throws {ZagValidationError}
   * @throws {ZagOrderError}
   *
   * @param {number} id - Order id
   *
   * @param {boolean} - true if the operation is executed successfully, false otherwise
   */
  async cancelOrder(id) {
    if (!validator.isInt(id.toString(), { min: 0 }))
      throw new ZagValidationError('id must be an int')

    this.logger.debug('ZagTrader API [CancelOrder]', {
      order: { id }
    })

    let response = await this.get(ZagEndPoints.CHANGE_ORDER_STATUS, {
      orderId: id,
      mode: 'cancel'
    })

    if (response.hasOwnProperty('success') && response.success === 'true') {
      // eslint-disable-lint
      this.logger.info('ZagTrader API [CancelOrder]', {
        order: { id },
        message: response
      })
      return true
    }

    if (response.hasOwnProperty('message')) {
      this.logger.error('ZagTrader API [CancelOrder]', {
        order: { id },
        error: 'ZAG_TRADER_CLIENT_DOSNT_EXIST',
        message: response.message
      })
      throw new ZagOrderError('order with id doesnt exist', 404)
    }
  }
  // #endregion
}
