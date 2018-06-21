import dotenv from 'dotenv'
import { logger } from './logger'
import { keyblade } from 'keyblade'

const result = dotenv.config()

/**
 * We just export what `dotenv` returns.
 * `keyblade` will make sure we don't rely on undefined values.
 */
export const env = keyblade(result.parsed, {
  message: key => `[yenv] ${key} not found in the loaded environment`,
  logBeforeThrow: message => logger.error(message)
})
