const User = require('../models/User')
const errResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

module.exports = {
  register: asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body

    const user = await User.create({
      name,
      email,
      password, //hash in mongooose
      role
    })

    sendTokenCookie(user, 201, res)
  }),

  login: asyncHandler(async (req, res, next) => {
    const { email, password } = req.body

    // if email pwd exists
    if (!email || !password) {
      throw new errResponse(`email or password cannot be empty`, 400)
    }
    // email exists in DB
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      throw new errResponse(`No user found`, 404)
    }
    // validate password
    const match = await user.validatePWD(password)
    if (!match) {
      throw new errResponse(`email or pwd is incorrect`, 401)
    }

    sendTokenCookie(user, 200, res)
  }),

  logout: asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    })

    res.status(200).json({ success: true, data: {} })
  }),

  getCurrentUser: asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({ success: true, data: user })
  }),

  updateUser: asyncHandler(async (req, res, next) => {
    const updateFields = {
      name: req.body.name,
      email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
      runValidators: true
    })

    res.status(200).json({ success: true, data: user })
  }),

  updatePassword: asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

    if (!(await user.validatePWD(req.body.currentPassword))) {
      throw new errResponse(`Password is incorrect`, 401)
    }

    user.password = req.body.newPassword
    //save
    await user.save()
    //res
    sendTokenCookie(user, 200, res)
  }),

  forgotPassword: asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    // if user not exists
    if (!user) {
      throw new errResponse(`No user found with email ${req.body.email}`, 404)
    }

    // new reset token
    const token = user.genResetToken()
    await user.save({ validateBeforeSave: false })

    // create reset url
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/reset-password/${token}`

    // message
    const message = `You requested reset of password of your account, To finish resetting your password please make a 'PUT' request to ${resetURL}`

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset',
        message
      })

      res.status(200).json({ success: true, data: 'Email sent' })
    } catch (err) {
      console.log(err)
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined

      await user.save({ validateBeforeSave: false })
      throw new errResponse(`Email couldnt be sent`, 500)
    }
  }),

  resetPassword: asyncHandler(async (req, res, next) => {
    const token = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
      throw new errResponse(`Invalid token`, 400)
    }

    // set new password from body
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    //res
    sendTokenCookie(user, 200, res)
  })
}

function sendTokenCookie(user, code, res) {
  //create jwt token
  const token = user.genJWT()

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  res
    .status(code)
    .cookie('token', token, options)
    .json({ success: true, token })
}
