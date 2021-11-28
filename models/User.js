const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add a email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// JsonWebToken generate
UserSchema.methods.genJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

UserSchema.methods.validatePWD = async function (stringPWD) {
  return await bcrypt.compare(stringPWD, this.password)
}

// New Reset token generation
UserSchema.methods.genResetToken = function () {
  const token = crypto.randomBytes(20).toString('hex')
  // hash token & set resetToken
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
  // set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000 // 10 min
  //console.log(this.resetPasswordExpire.toString())
  return token
}

module.exports = mongoose.model('User', UserSchema)