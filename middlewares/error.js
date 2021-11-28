const chalk = require('chalk')
const ErrorResponse = require('../utils/errorResponse')

module.exports = (err, req, res, next) => {
  // Log to console for developer
  console.log(err)

  // Bad Id
  if (err.name === 'CastError') {
    err = new ErrorResponse(`Invalid Resource ID`, 400)
  }

  // Duplicate value
  if (err.code === 11000) {
    err = new ErrorResponse(
      `${Object.keys(err.keyValue)[0]} already exists, please enter a new one`,
      400
    )
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message)
    err = new ErrorResponse(message, 400)
  }

  sendError(res, err)
}

function sendError(res, { code = 500, message = 'Server error' }) {
  res.status(code).json({
    success: false,
    error: message
  })
}
