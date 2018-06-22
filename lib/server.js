import * as http from 'http'
import Koa from 'koa'
import { loadControllers, scopePerRequest } from 'awilix-koa'

import { logger } from './logger'
import { configureContainer } from './container'

/**
 * Creates and returns a new Koa application.
 * Does *NOT* call `listen`!
 *
 * @return {Promise<http.Server>} The configured app.
 */
export async function createServer() {
  const app = new Koa()

  const container = configureContainer()

  app
    .use(scopePerRequest(container))
    .use(loadControllers('../api/*.js', { cwd: __dirname }))

  // Creates a http server ready to listen.
  const server = http.createServer(app.callback())

  // Add a `close` event listener so we can clean up resources.
  server.on('close', () => {
    // You should tear down database connections, TCP connections, etc
    // here to make sure Jest's watch-mode some process management
    // tool does not release resources.
    logger.debug('Server exited!')
  })

  logger.debug('Server created, ready to listen')
  return server
}
