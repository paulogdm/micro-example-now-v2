const fs = require('fs')
const { promisify } = require('util')
const { router, get, post, del } = require('micro-fork')
const micro = require('micro')

const open = promisify(fs.open)
const write = promisify(fs.write)
const close = promisify(fs.close)
const readFile = promisify(fs.readFile)
const unlink = promisify(fs.unlink)
const readdir = promisify(fs.readdir)

const WRITABLE_ROOT = '/tmp'

const getPath = (name) => `${WRITABLE_ROOT}/${name}`

const postFile = async (req, res) => {
  const bloob = await micro.buffer(req)
  const { name } = req.params
  const path = getPath(name)

  const file = await open(path, 'w')
  await write(file, bloob, 0, bloob.length, null)
  await close(file)

  return `File created at ${path}`
}

const getFile = async (req, res) => {
  const { name } = req.params
  const path = getPath(name)

  return readFile(path, { encoding: 'binary' })
}

const delFile = async (req, res) => {
  const { name } = req.params
  const path = getPath(name)
  await unlink(path)

  return `File ${path} deleted`
}

const ls = async (req, res) => {
  const files = await readdir(WRITABLE_ROOT)
  const json = {total: files.length, files: []}

  files.map(f => json.files.push(f))

  return json
}


const handler = router()(
  post('/fs/:name', postFile),
  get('/fs/:name', getFile),
  get('/fs', ls),
  del('/fs/:name', delFile),
  get('/*', () => '404'),
  post('/*', () => '404')
)

const server = micro(handler)

server.listen()
