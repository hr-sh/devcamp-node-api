module.exports = (populateWith) => (req, res, next) => {
  let q_str = { ...req.query }
  const parameters = ['page', 'limit', 'select', 'sort']
  parameters.forEach((q) => {
    delete q_str[q]
  })
  // page-eee-nation
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 50
  // skip 9 pages * limit amount for 10th page
  const skip = (page - 1) * limit
  // select
  let selection = ''
  let populate = populateWith || ''
  if (req.query.select) {
    selection = req.query.select.split(',').join(' ')
    if (populate) {
      if (
        selection.indexOf('courses') == -1 &&
        populateWith.path === 'courses'
      ) {
        populate = ''
      } else if (
        selection.indexOf('bootcamp') == -1 &&
        populateWith.path === 'bootcamp'
      ) {
        populate = ''
      }
    }
  }
  // sort
  let sortBy = 'createdAt'
  if (req.query.sort) {
    sortBy = req.query.sort.split(',').join(' ')
  }
  // lt (or) gt -> $lt (or) $gt
  q_str = JSON.stringify(q_str)
    .toString()
    .replaceAll(/(gt|gte|lt|lte|in)/g, (match) => `$${match}`)
  q_str = JSON.parse(q_str)
  req.advQueries = {
    q_str,
    populate,
    selection,
    sortBy,
    skip,
    limit
  }
  next()
}
