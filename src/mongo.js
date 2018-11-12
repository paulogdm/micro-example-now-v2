// libs
const { router, get, post, del, patch } = require('micro-fork')
const micro = require('micro')
const mongoose = require('mongoose')

//models
const Cat = require('../models/Cat')

// https://zeit.co/docs/v2/deployments/environment-variables-and-secrets#from-the-cli
const dbuser = process.env.mongo_cat_user
const dbpassword = process.env.mongo_cat_pass

// connecting to mongo
mongoose.connect(`mongodb://${dbuser}:${dbpassword}@ds043170.mlab.com:43170/catdb`, {
  useNewUrlParser: true,
  bufferCommands: false,
  bufferMaxEntries: 0
})

// List all kittens
const getAll = async (req, res) => {
  return Cat.find({}, 'name _id', {limit: 50}).exec()
}

// Get kitten by exact match
const getByName = async (req, res) => {
  // micro-fork allows us to take params
  const { name } = req.params
  const result = await Cat.findOne({ name }, 'name _id').exec()
  return result || 'Kitty is missing!'
}

// Creating kitty by name
const create = async (req, res) => {
  // parsing body
  const body = await micro.json(req)
  // creating a kitty
  const kitty = new Cat(body)

  // saving in the document
  await kitty.save()

  return `Your little ${body.name} has been created!`
}

// Function that updates a kitty
const update = async (req, res) => {
  // micro-fork allows us to take params
  const from = req.params.name
  // body from request
  const body = await micro.json(req)
  const to = body.name

  // updating kitty
  await Cat.updateOne({ name: from }, { name: to}).exec()

  return `Name change from ${from} to ${to}!`
}

// Here we can kill a kitty by his name
const kill = async (req, res) => {
  // micro-fork allows us to take params
  const { name } = req.params
  // deleting from document
  await Cat.deleteOne( { name }).exec()

  return `You killed one cat! 😭`
}

// handles 404 requests
const notFound = (req, res) => micro.send(res, 404, 'Not found route')

const handler = router()(
  get('/cat', getAll),
  get('/cat/:name', getByName),
  post('/cat', create),
  patch('/cat/:name', update),
  del('/cat/:name', kill),
  get('/*', notFound),
  post('/*', notFound),
  patch('/*', notFound),
  del('/*', notFound)
)

const server = micro(handler)

server.listen()
