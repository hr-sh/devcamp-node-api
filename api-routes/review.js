const { Router } = require('express')

const { getAll, getOne, post, put, del } = require('../controllers/review')
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
  .post(authenticate, authorize('user', 'admin'), post)
router
  .route('/:id')
  .get(getOne)
  .put(authenticate, authorize('user', 'admin'), put)
  .delete(authenticate, authorize('user', 'admin'), del)

module.exports = router
