const { Router } = require('express')

const { getAll, getOne, post, put, del } = require('../controllers/courses')
const advQuery = require('../middlewares/advanced_queries')
const { authenticate, authorize } = require('../middlewares/auth')

const router = Router({ mergeParams: true })

router
  .route('/')
  .get(
    advQuery({
      path: 'bootcamp',
      select: 'name description'
    }),
    getAll
  )
  .post(authenticate, authorize('publisher', 'admin'), post)
router
  .route('/:id')
  .get(getOne)
  .put(authenticate, authorize('publisher', 'admin'), put)
  .delete(authenticate, authorize('publisher', 'admin'), del)

module.exports = router
