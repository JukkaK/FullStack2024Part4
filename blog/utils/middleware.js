const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  console.log('authorization', authorization)
  if (authorization && authorization.startsWith('bearer ')) {
      request.token = authorization.replace('bearer ', '')
      console.log('this is request.token that tokenExtractor creates', request.token)
  }

  next()
}

//So yeah, token extractor and user extractor have duplicate logic that makes tokenExtractor redundant. All this because forgotting that the order in which middleware is referenced in the app.js file matters.
//Why do people create these kind of things in programming languages? It's like they are trying to make it as hard as possible to understand.
const userExtractor = async (request, response, next) => {
  let token = null
  const authorization = request.get('authorization')
    console.log('user extractor authorization', authorization)
    if (authorization && authorization.startsWith('bearer ')) {
        request.token = authorization.replace('bearer ', '')
    }
  console.log('this is request.token after bearer has been cleared', request.token)

  if (!request.token) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  console.log('we are in userExtractor, decodedToken', decodedToken) 

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)
  console.log('user', user)
  request.user = user

  next()
}

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    } else if (error.name ===  'JsonWebTokenError') {
      console.log('we are in error handler with JsonWebTokenError')
      return response.status(400).json({ error: 'token missing or invalid' })
    }
    next(error)
  }
  
  module.exports = {  requestLogger, unknownEndpoint, errorHandler, tokenExtractor, userExtractor }