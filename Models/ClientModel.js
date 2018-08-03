import mongoose from 'mongoose'

export const Client = mongoose.model('Client', {
  _id: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true
  },
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  mobile: String,
  birthDay: String,
  zagId: {
    type: Number,
    required: true
  }
})
