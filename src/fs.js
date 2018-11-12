const fs = require('fs')
const { promisify } = require('util')
const { router, get, post, del } = require('micro-fork')
const micro = require('micro')

// promisifying functions that expect callbacks
const open = promisify(fs.open)
const write = promisify(fs.write)
const close = promisify(fs.close)
const readFile = promisify(fs.readFile)
const unlink = promisify(fs.unlink)
const readdir = promisify(fs.readdir)

// Only `/tmp` is writable
const WRITABLE_ROOT = '/tmp'

// Simple helper. Maybe we need the path lib.
const getPath = (name) => `${WRITABLE_ROOT}/${name}`

// Creating files from buffer.
const postFile = async (req, res) => {
  const bloob = await micro.buffer(req)
  const { name } = req.params
  const path = getPath(name)

  const file = await open(path, 'w')
  await write(file, bloob, 0, bloob.length, null)
  await close(file)

  return `File created at ${path}`
}

// Returning a file. Notice that we are returning as a binary.
const getFile = async (req, res) => {
  const { name } = req.params
  const path = getPath(name)

  return readFile(path, { encoding: 'binary' })
}

// It is possible to also delete a file
const delFile = async (req, res) => {
  const { name } = req.params
  const path = getPath(name)
  await unlink(path)

  return `File ${path} deleted`
}

// Listing all files in `/tmp`
const ls = async (req, res) => {
  const files = await readdir(WRITABLE_ROOT)
  return {files}
}

// handles 404 requests
const notFound = (req, res) => micro.send(res, 404, 'Not found route')

const handler = router()(
  post('/fs/:name', postFile),
  get('/fs/:name', getFile),
  get('/fs', ls),
  del('/fs/:name', delFile),
  get('/*', notFound),
  post('/*', notFound),
  del('/*', notFound)
)

const server = micro(handler)

server.listen()
