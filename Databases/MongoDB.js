import mongoose from 'mongoose'
import { env } from '../lib/env'
import { logger } from '../lib/logger'

const connectToDB = async () => {
  try {
    mongoose.connect(`mongodb://${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`)
    logger.info('Connected to mongo!!!')
  } catch (err) {
    console.log(err)
    logger.error('Could not connect to MongoDB')
  }
}

export default connectToDB
