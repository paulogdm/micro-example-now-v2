const mongoose = require('mongoose')

const Cat = mongoose.model('Cat', {
  name: {
    type: String,
    unique: true,
    index: true
  }
})

module.exports = Cat
