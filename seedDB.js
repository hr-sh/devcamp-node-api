const fs = require('fs')
const mongoose = require('mongoose')
const chalk = require('chalk')
const dotenv = require('dotenv')

dotenv.config({ path: './config/config.env' })

const BootcampModel = require('./models/Bootcamp')
const CourseModel = require('./models/Course')
const UserModel = require('./models/User')
const ReviewModel = require('./models/Review')

mongoose.connect(process.env.MONGO_URI)

const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
)
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
)
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
)
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
)

// Save to DB
const save = async () => {
  try {
    await BootcampModel.create(bootcamps)
    await CourseModel.create(courses)
    await UserModel.create(users)
    await ReviewModel.create(reviews)
    console.log(chalk.green('>>> Data imported to db'))
    process.exit()
  } catch (err) {
    console.log(chalk.red(err))
  }
}

// Remove data from DB
const removedata = async () => {
  try {
    await BootcampModel.deleteMany({})
    await CourseModel.deleteMany({})
    await UserModel.deleteMany({})
    await ReviewModel.deleteMany({})
    console.log(chalk.green('>>> All collections deleted'))
    process.exit()
  } catch (err) {
    console.log(chalk.red(err))
  }
}

if (process.argv[2] === '--import') {
  save()
} else if (process.argv[2] === '--delete') {
  removedata()
}
