const { send } = require('micro')
const { router, get, post, del } = require('micro-fork')

const {
  postFile,
  getFile,
  delFile,
  ls
} = require('./fs.js')

const { date } = require('./date.js')

const notfound = (req, res) => send(res, 200, 'Not found')

module.exports = router()(
  post('/file/:name', postFile),
  get('/file/:name', getFile),
  get('/file', ls),
  del('/file/:name', delFile),
  get('/date', date),
  post('/*', notfound)
)
