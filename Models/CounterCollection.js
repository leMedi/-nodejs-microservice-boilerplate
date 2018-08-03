import mongoose from 'mongoose'

let CountersScheme = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  sequence_value: {
    type: Number,
    default: 0
  }
})

CountersScheme.statics.getNext = async name => {
  const sequenceDocument = await Counters.findOneAndUpdate(
    { _id: name },
    {
      _id: name,
      $inc: { sequence_value: 1 }
    },
    {
      new: true,
      upsert: true
    }
  )
  return sequenceDocument.sequence_value
}

export const Counters = mongoose.model('Counters', CountersScheme)
