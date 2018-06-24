import { createServer } from './lib/server'
import { logger } from './lib/logger'
import { env } from './lib/env'

createServer().then(
  app =>
    app.listen(env.PORT, () => {
      const mode = env.NODE_ENV
      logger.info(`Server listening on ${env.PORT} in ${mode} mode`)
    }),
  err => {
    logger.error('Error while starting up server', {
      name: err.name,
      message: err.message,
      stack: err.stack
    })
    process.exit(1)
  }
)
