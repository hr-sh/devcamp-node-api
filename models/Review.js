const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'please add a title'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'please add text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'please add rating 1-5']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

// single review per bootcamp per user
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true })

// static method on Review model
ReviewSchema.statics.get_average_rating = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: '$bootcampId',
        averageRating: { $avg: '$rating' }
      }
    }
  ])

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating
    })
  } catch (err) {
    console.error(err)
  }
}

// Average cost after saving
ReviewSchema.post('save', function (next) {
  this.constructor.get_average_rating(this.bootcamp)
})

// Average cost after removing
ReviewSchema.post('remove', function (next) {
  this.constructor.get_average_rating(this.bootcamp)
})

module.exports = mongoose.model('Review', ReviewSchema)
