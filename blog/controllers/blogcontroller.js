const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const logger = require('../utils/logger')
const User = require('../models/user')

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
  const body = request.body
  
  const user = await User.findOne({})
  //const user = await User.findById(body.userId)

  const blog = new Blog({
    title: body.title,    
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id 
  })

  await blog.save()
    .then(savedBlog => {
      response.json(savedBlog)
    })
    .catch(error => next(error))

  user.blogs = user.blogs.concat(blog._id)
  await user.save()
    .then(() => {
      response.status(201).end()
    })
    .catch(error => next(error))
    
})

blogRouter.delete('/:id', async (request, response, next) => {
  await Blog.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
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