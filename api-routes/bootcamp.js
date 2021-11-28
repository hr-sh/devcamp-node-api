const { Router } = require('express')
const {
  getAll,
  post,
  getOne,
  put,
  del,
  getALl_withinRadius,
  uploadFile
} = require('../controllers/bootcamp')
const advQuery = require('../middlewares/advanced_queries')
const { authenticate, authorize } = require('../middlewares/auth')

const router = Router()

router
  .route('/')
  .get(advQuery({ path: 'courses' }), getAll)
  .post(authenticate, authorize('publisher', 'admin'), post)

router
  .route('/:id')
  .get(getOne)
  .put(authenticate, authorize('publisher', 'admin'), put)
  .delete(authenticate, authorize('publisher', 'admin'), del)

// api/v1/bootcamps.router()./:bootcampId/courses.router()
router.use('/:bootcampId/courses', require('./course'))
router.use('/:bootcampId/reviews', require('./review'))

router.route('/radius/:zipcode/:distance').get(getALl_withinRadius)

router
  .route('/:id/photo')
  .put(authenticate, authorize('publisher', 'admin'), uploadFile)

module.exports = router
