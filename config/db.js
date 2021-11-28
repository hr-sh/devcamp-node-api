const mongoose = require('mongoose')
const chalk = require('chalk')

module.exports = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI)

  console.log(
    chalk.underline.yellow(`Connected to mongodb ${conn.connection.host}`)
  )
}
