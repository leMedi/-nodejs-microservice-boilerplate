import mongoose from 'mongoose'

export const Client = mongoose.model('Client', {
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
})
