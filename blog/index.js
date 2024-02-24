const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')
//const http = require('http')

//const server = http.createServer(app)

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

