const bootcamp = require('./bootcamp')
const course = require('./course')
const auth = require('./auth')
const user = require('./user')
const review = require('./review')
const errorHandler = require('../middlewares/error')

module.exports = (app) => {
  app.use('/api/v1/auth', auth)
  app.use('/api/v1/bootcamps', bootcamp)
  app.use('/api/v1/courses', course)
  app.use('/api/v1/users', user)
  app.use('/api/v1/reviews', review)
  app.use(errorHandler)
}
