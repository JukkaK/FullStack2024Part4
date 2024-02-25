const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const logger = require('../utils/logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const loginRouter = require('./login')

blogRouter.get('/', async (request, response) => {
    logger.info('hitting get all in router')    
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
  })

blogRouter.get('/:id', async (request, response, next) => {
  logger.info('request.params.id', request.params.id)
  await Blog.findById(request.params.id)
    .then(Blog => {
      if (Blog) {
        response.json(Blog)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

blogRouter.post('/', async (request, response, next) => {    
  logger.info('entering blogRouter.post')
  const body = request.body
  logger.info('this is request.token from request body', request.token)
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  logger.info('this is decoded token after jwt.verify', decodedToken)
  if (!decodedToken.id) {
    console.log('We are in blogRouter.post and the token id is invalid. 401 status returned.')
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,    
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id 
  })

  logger.info('attempting to save this post: ', blog)
  await blog.save()
    .then(savedBlog => {
      response.json(savedBlog)
    })
    .catch(error => next(error))
  logger.info('attempting to save the user reference to the blog.')
  user.blogs = user.blogs.concat(blog._id)
  await user.save()
    .then(() => {
      response.status(201).end()
    })
    .catch(error => next(error))
    
})

blogRouter.delete('/:id', async (request, response, next) => {
  
  const blog = await Blog.findById(request.params.id)
  logger.info('blog', blog)
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  const user = await User.findById(decodedToken.id)
  logger.info('blog.user', blog.user)
  if (blog.user.toString() === user._id.toString()) {      
      await Blog.findByIdAndDelete(request.params.id)
      response.status(204).end()
  } else {
      response.status(401).json({ error: 'only the creator can delete a post' })
  }
})

blogRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  await Blog
    .findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedBlog => {
      response.json(updatedBlog)
    })
    .catch(error => next(error))
}
)

module.exports = blogRouter