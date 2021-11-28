const { Router } = require('express')
const { getAll, getOne, post, put, del } = require('../controllers/user')
const advQuery = require('../middlewares/advanced_queries')
const { authenticate, authorize } = require('../middlewares/auth')

const router = Router()

router.use(authenticate)
router.use(authorize('admin'))
router.route('/').get(advQuery(), getAll).post(post)
router.route('/:id').get(getOne).put(put).delete(del)

module.exports = router
