const Course = require('../models/Course')
const errResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
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
    const c = await Course.find(q_str)
      .populate(populate)
      .select(selection)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
    // res
    res.status(200).json({ success: true, count: c.length, data: c })
  }),

  getOne: asyncHandler(async (req, res, next) => {
    const c = await Course.findById(req.params.id).populate({
      path: 'bootcamp',
      select: 'name description'
    })
    // correctly formatted ObjId with no doc in DB
    if (!c) {
      throw new errResponse(`No Course found for ID: ${req.params.id}`, 404)
    }
    // res
    res.status(200).json({ success: true, data: c })
  }),

  // POST bootcamps/:bootcampId/courses
  // authenticate
  post: asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id
    // bootcamp exists
    const b = Bootcamp.findById(req.params.bootcampId)
    if (!b) {
      throw new errResponse(`No Bootcamp found for ID: ${req.params.id}`, 404)
    }
    // bootcamp.user is same as loggedin user
    if (b.user !== req.user.id && req.user.role !== 'admin') {
      throw new errResponse(`Not authorized to add courses to ${b.id}`, 401)
    }
    const c = await Course.create(req.body)
    //res
    res.status(201).json({ success: true, data: c })
  }),

  put: asyncHandler(async (req, res, next) => {
    let c = await Course.findById(req.params.id)
    // correctly formatted ObjId with no doc in DB
    if (!c) {
      throw new errResponse(`No Course found for ID: ${req.params.id}`, 404)
    }
    // bootcamp.user is same as loggedin user
    if (c.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new errResponse(`Not authorized to update`, 401)
    }
    //update
    c = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'bootcamp',
      select: 'name description'
    })
    // res
    res.status(200).json({ success: true, data: c })
  }),

  del: asyncHandler(async (req, res, next) => {
    const c = await Course.findById(req.params.id)
    // correctly formatted ObjId with no doc in DB
    if (!c) {
      throw new errResponse(`No Course found for ID: ${req.params.id}`, 404)
    }
    // bootcamp.user is same as loggedin user
    if (c.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new errResponse(`Not authorized to delete`, 401)
    }
    // delete
    await c.remove()
    // res
    res.status(200).json({ success: true, data: {} })
  })
}
