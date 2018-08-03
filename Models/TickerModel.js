import mongoose from 'mongoose'

export const Ticker = mongoose.model('Ticker', {
  name: {
    type: String,
    required: true,
    unique: true
  },
  zagTrader: {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    marketId: {
      type: Number,
      required: true,
      unique: true
    }
  }
})
