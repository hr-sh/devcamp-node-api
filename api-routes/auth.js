const { Router } = require('express')
const {
  register,
  login,
  logout,
  getCurrentUser,
  updateUser,
  updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/auth')
const { authenticate } = require('../middlewares/auth')

const router = Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/me').get(authenticate, getCurrentUser)
router.route('/update-user').put(authenticate, updateUser)
router.route('/update-password').put(authenticate, updatePassword)
router.route('/forgot-password').get(forgotPassword)
router.route('/reset-password/:token').get(resetPassword)

module.exports = router
