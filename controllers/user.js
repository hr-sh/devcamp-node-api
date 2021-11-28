const User = require('../models/User')
const errResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')

module.exports = {
  getAll: asyncHandler(async (req, res, next) => {
    const { q_str, selection, sortBy, skip, limit } = req.advQueries
    // sending query to mongodb
    const u = await User.find(q_str)
      .select(selection)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
    // send {count, data}
    res.status(200).json({ success: true, count: u.length, data: u })
  }),

  getOne: asyncHandler(async (req, res, next) => {
    const u = await User.findById(req.params.id)
    // correctly formatted ObjId with no doc in DB
    if (!u) {
      throw new errResponse(`No User found for ID: ${req.params.id}`, 404)
    }
    res.status(200).json({ success: true, data: u })
  }),

  post: asyncHandler(async (req, res, next) => {
    const u = await User.create(req.body)

    res.status(201).json({ success: true, data: u })
  }),

  put: asyncHandler(async (req, res, next) => {
    const u = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    res.status(200).json({ success: true, data: u })
  }),

  del: asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({ success: true, data: {} })
  })
}
