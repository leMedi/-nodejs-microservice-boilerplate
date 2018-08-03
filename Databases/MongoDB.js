import mongoose from 'mongoose'
import { env } from '../lib/env'
import { logger } from '../lib/logger'

export const connectToDB = async () => {
  try {
    mongoose
      .connect(`mongodb://${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`)
      .then(logger.info('Connected to mongo!!!'))
      .catch(err =>
        logger.error('Could not connect to MongoDB', {
          errorName: err.name,
          errorMessage: err.message
        })
      )
  } catch (err) {
    logger.error('Could not connect to MongoDB')
  }
}

export const closeDB = () => {
  mongoose.connection.close()
  logger.info('MongoDB connection closed!!!')
}
