const express = require('express')
const dotenv = require('dotenv')
dotenv.config({ path: './config/config.env' })
const connectDB = require('./config/db')
const morgan = require('morgan')
const chalk = require('chalk')
const helmet = require('helmet')
const xss = require('xss-clean')
const erl = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const fileupload = require('express-fileupload')
const path = require('path')
const cookie_parser = require('cookie-parser')
const mongo_sanitize = require('express-mongo-sanitize')

connectDB()

const routes = require('./api-routes/routes')

const app = express()

// middleware
app.use(express.json())
app.use(cookie_parser())
app.use(fileupload())
app.use(mongo_sanitize())
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"]
      },
      reportOnly: true
    }
  })
)
app.use(xss())

// limit requests
const limiter = erl({
  windowMs: 10 * 60 * 1000,
  max: 100
})
app.use(limiter)
app.use(hpp())
app.use(cors())

// log req
if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'))
}

// static
app.use(express.static(path.join(__dirname, 'public')))
// routes
routes(app)

const PORT = process.env.PORT || 8080
const server = app.listen(PORT, () => {
  console.log(
    chalk.underline.yellow(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
  )
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(chalk.bgRed(`Error: ${err.message}`))
  // call close on server and exit
  server.close(() => process.exit(1))
})
