const { get } = require('micro-fork')

const date = async () => new Date().toLocaleString('en-GB', { timeZone: 'UTC' })

module.exports = {
  date
}
