const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const errResponse = require('../utils/errorResponse')
const User = require('../models/User')

module.exports.authenticate = asyncHandler(async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }
  //  else if (req.cookies.token) {
  //   token = req.cookies.token
  // }

  if (!token) {
    throw new errResponse(`Not authorized to access`, 401)
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    console.log(decoded)

    req.user = await User.findById(decoded.id)
    next()
  } catch (err) {
    throw new errResponse(`Not authorized to access`, 401)
  }
})

module.exports.authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new errResponse(`User role ${req.user.role} is not authorized`, 403)
    }
    next()
  }
