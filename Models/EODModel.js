import mongoose from 'mongoose'

export const EOD = mongoose.model('EOD', {
  _id: {
    type: String,
    required: true
  },
  date: {
    type: mongoose.Schema.Types.Date,
    required: true
  },

  open: {
    type: String,
    required: true
  },
  high: {
    type: String,
    required: true
  },
  low: {
    type: String,
    required: true
  },
  close: {
    type: String,
    required: true
  },
  volume: {
    type: String,
    required: true
  },

  dividend: {
    type: String,
    required: true
  },
  split: {
    type: String,
    required: true
  },

  adj_open: {
    type: String,
    required: true
  },
  adj_high: {
    type: String,
    required: true
  },
  adj_low: {
    type: String,
    required: true
  },
  adj_close: {
    type: String,
    required: true
  },
  adj_volume: {
    type: String,
    required: true
  }
})
