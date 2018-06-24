import mongoose from 'mongoose'
import { env } from '../lib/env'
import { logger } from '../lib/logger'

const connectToDB = async () => {
  try {
    mongoose.connect(
      `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_DB_NAME}`
    )
    logger.info('Connected to mongo!!!')
  } catch (err) {
    console.log(err)
    logger.error('Could not connect to MongoDB')
  }
}

export default connectToDB
