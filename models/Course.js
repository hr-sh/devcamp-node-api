const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'please add a title']
  },
  description: {
    type: String,
    required: [true, 'please add a desc']
  },
  weeks: {
    type: String,
    required: [true, 'please no of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'please add a tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarship: {
    type: Boolean,
    default: false
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

// static method on Course model
CourseSchema.statics.get_average_cost = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: '$bootcampId',
        averageCost: { $avg: '$tuition' }
      }
    }
  ])

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10 // to make the number end in zero or 10s
    })
  } catch (err) {
    console.error(err)
  }
}

// Average cost after saving
CourseSchema.post('save', function (next) {
  this.constructor.get_average_cost(this.bootcamp)
})

// Average cost after removing
CourseSchema.post('remove', function (next) {
  this.constructor.get_average_cost(this.bootcamp)
})

module.exports = mongoose.model('Course', CourseSchema)
