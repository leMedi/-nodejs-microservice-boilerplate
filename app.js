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
    console.log(err)
    logger.error('Error while starting up server', err)
    process.exit(1)
  }
)
