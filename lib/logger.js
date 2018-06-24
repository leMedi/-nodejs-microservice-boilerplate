import { createLogger, format, transports } from 'winston'
import path from 'path'
import process from 'process'
import mkdirp from 'mkdirp'

import { env } from './env'

export const logger = createLogger({
  level: env.LOG_LEVEL // default log level
})

if (env.NODE_ENV !== 'production') {
  //
  // - Pring log to console.
  //
  logger.add(
    new transports.Console({
      handleExceptions: true,
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp(),
        format.align(),
        format.printf(info => {
          const { timestamp, level, message, ...args } = info
          const ts = timestamp.slice(11, 19)
          return `${ts} [${level}] ${message} ${
            Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
          }`
        })
      )
    })
  )
}

if (env.LOG_TO_FILE === true) {
  // create 'logs' folder if does not exists
  mkdirp.sync(path.join(process.cwd(), 'logs'))

  // - Write to all logs to `app.log`
  logger.add(
    new transports.File({
      filename: 'logs/app.log',
      json: true,
      format: format.combine(format.timestamp()),
      maxsize: 5242880, // 5MB
      maxFiles: 1
    })
  )

  // - Write to error logs to `app.err.log`
  logger.add(
    new transports.File({
      level: 'error',
      filename: 'logs/app.err.log',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false
    })
  )
}
