import { createLogger, format, transports } from 'winston'

import { env } from './env'

export const logger = createLogger({
  level: 'debug',
  transports: [
    //
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.Console({
      level: 'debug',
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
  ]
})

if (process.env.NODE_ENV === 'PRODUCTION' || env.NODE_ENV === 'PRODUCTION') {
  // - Write to all logs with level `info` and below to `combined.log`
  logger.add(
    new transports.File({
      level: 'info',
      filename: 'logs/app.log',
      handleExceptions: true,
      json: true,
      format: format.combine(format.timestamp()),
      maxsize: 5242880, // 5MB
      maxFiles: 1
    })
  )

  logger.add(
    new transports.File({
      level: 'error',
      filename: 'logs/error.err.log',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false
    })
  )
}
