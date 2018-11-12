const handler = async (req, res) => {
  const date = new Date().toLocaleString('en-GB', { timeZone: 'UTC' })
  res.end(`${date}`)
}

module.exports = handler
