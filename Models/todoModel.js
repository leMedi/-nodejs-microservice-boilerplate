import mongoose from 'mongoose'

export const Todo = mongoose.model('todo', {
  name: String
})
