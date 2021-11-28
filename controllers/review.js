const asyncHandler = require('../middlewares/async')
const errResponse = require('../utils/errorResponse')
const Review = require('../models/Review')
const Bootcamp = require('../models/Bootcamp')

module.exports = {
  getAll: asyncHandler(async (req, res, next) => {
    let { q_str, populate, selection, sortBy, skip, limit } = req.advQueries
    // `/:bootcampId/courses`
    if (req.params.bootcampId) {
      q_str.bootcamp = req.params.bootcampId
      populate = ''
    }
    // sending query to mongodb
    const r = await Review.find(q_str)
      .populate(populate)
      .select(selection)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
    // res
    res.status(200).json({ success: true, count: r.length, data: r })
  }),

  getOne: asyncHandler(async (req, res, next) => {
    const r = await Review.findById(req.params.id).populate({
      path: 'bootcamp',
      select: 'name descritption'
    })
    // correctly formatted ObjId with no doc in DB
    if (!r) {
      throw new errResponse(`No Review found for ID: ${req.params.id}`, 404)
    }
    // res
    res.status(200).json({ success: true, data: r })
  }),

  // POST /bootcamps/:bid/reviews
  // authenticate
  post: asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const b = await Bootcamp.findOne(req.params.bootcampId)
    if (!b) {
      throw new errResponse(`No Bootcamp found for ID: ${req.params.id}`, 404)
    }

    const r = await Review.create(req.body)
    // res
    res.status(201).json({ success: true, data: r })
  }),

  put: asyncHandler(async (req, res, next) => {
    let r = await Review.findById(req.params.id)
    if (!r) {
      throw new errResponse(`No Review found for ID: ${req.params.id}`, 404)
    }
    // check if loggedin user id == review.user or admin true
    if (r.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new errResponse(`You are not authorized to edit this review`, 401)
    }
    // update
    r = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    // res
    res.status(200).json({ success: true, data: r })
  }),

  del: asyncHandler(async (req, res, next) => {
    let r = await Review.findById(req.params.id)
    if (!r) {
      throw new errResponse(`No Review found for ID: ${req.params.id}`, 404)
    }
    // check if loggedin user id == review.user or admin true
    if (r.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new errResponse(`You are not authorized to delete this review`, 401)
    }
    // delete
    await r.remove()
    // res
    res.status(200).json({ success: true, data: {} })
  })
}
