const Bootcamp = require('../models/Bootcamp')
const errResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
const geocoder = require('../utils/geo-code')
const path = require('path')
//const chalk = require('chalk')

module.exports = {
  getAll: asyncHandler(async (req, res, next) => {
    const { q_str, populate, selection, sortBy, skip, limit } = req.advQueries
    // sending query to mongodb
    const b = await Bootcamp.find(q_str)
      .populate(populate)
      .select(selection)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
    // send {count, data}
    res.status(200).json({ success: true, count: b.length, data: b })
  }),

  getOne: asyncHandler(async (req, res, next) => {
    const b = await Bootcamp.findById(req.params.id).populate('courses')
    // correctly formatted ObjId with no doc in DB
    if (!b) {
      throw new errResponse(`No Bootcamp found for ID: ${req.params.id}`, 404)
    }
    res.status(200).json({ success: true, data: b })
  }),

  post: asyncHandler(async (req, res, next) => {
    // append loggedin user id to body
    req.body.user = req.user.id
    // check if user has active bootcamp
    const p = await Bootcamp.findOne({ user: req.user.id })
    // check if admin
    if (p && req.user.role !== 'admin') {
      throw new errResponse(`You cannot have more than 1 active bootcamp`, 401)
    }
    // save
    const b = await Bootcamp.create(req.body)
    res.status(201).json({
      success: true,
      data: b
    })
  }),

  put: asyncHandler(async (req, res, next) => {
    let b = await Bootcamp.findById(req.params.id)
    // null return
    if (!b) {
      throw new errResponse(`No Bootcamp found for ID: ${req.params.id}`, 404)
    }
    // bootcamp.user is same as loggedin user
    if (b.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new errResponse(`Not authorized to update`, 401)
    }
    b = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    res.status(200).json({ success: true, data: b })
  }),

  del: asyncHandler(async (req, res, next) => {
    // not a findbyidanddelete because of cascade delete courses
    const b = await Bootcamp.findById(req.params.id)
    // b doesnot exists in DB
    if (!b) {
      throw new errResponse(`No Bootcamp found for ID: ${req.params.id}`, 404)
    }
    // bootcamp.user is same as loggedin user
    if (b.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new errResponse(`Not authorized to delete`, 401)
    }
    await b.remove()
    res.status(200).json({ success: true, data: {} })
  }),

  getALl_withinRadius: asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params
    // lat, long
    const loc = await geocoder.geocode(zipcode)
    //console.log(chalk.bgBlue(loc))
    const { latitude, longitude } = loc[0]
    // radius in radians
    // Divided distance by radius of earth
    // earth radius = 3,958.8 mi , 6 378.1 kilometers
    const radius = distance / 6378
    const b = await Bootcamp.find({
      location: {
        $geoWithin: { $centerSphere: [[longitude, latitude], radius] }
      }
    })
    res.status(200).json({ success: true, count: b.length, data: b })
  }),

  uploadFile: asyncHandler(async (req, res, next) => {
    // not a findbyidanddelete because of cascade delete courses
    const b = await Bootcamp.findById(req.params.id)
    // b doesnot exists in DB
    if (!b) {
      throw new errResponse(`No Bootcamp found for ID: ${req.params.id}`, 404)
    }
    // bootcamp.user is same as loggedin user
    if (b.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new errResponse(`Not authorized to update`, 401)
    }
    if (!req.files) {
      throw new errResponse(`Please upload file`, 400)
    }
    const file = req.files.file
    if (!file.mimetype.startsWith('image')) {
      throw new errResponse(`Please upload an image`, 400)
    }
    if (file.size > process.env.MAX_FILE_UPLOAD_SIZE) {
      throw new errResponse(
        `Please upload an image of size within ${process.env.MAX_FILE_UPLOAD_SIZE}`,
        400
      )
    }

    file.name = `photo-${b._id}${path.parse(file.name).ext}`
    // move
    file.mv(
      path.join(process.env.UPLOAD_FOLDER_PATH, file.name),
      async (err) => {
        if (err) {
          console.error(err)
          throw new errResponse(`File upload failed`, 400)
        }
        // update filename in bootcamp
        await Bootcamp.findByIdAndUpdate(b._id, { photo: file.name })
        // res
        res.status(200).json({ success: true, data: file.name })
      }
    )
  })
}
