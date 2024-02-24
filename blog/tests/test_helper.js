const Blog = require('../models/blog')
const User = require('../models/user')

const initialPosts = [
    {
        "title": "My First post",
        "author": "Teppo Testi",
        "url": "http://www.example.com",
        "likes": 2
      },
      {
        "title": "My Second post",
        "author": "Albert Kesti",
        "url": "http://www.example.com",
        "likes": 1
      }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', author: 'will', url: 'http://www.example.com', likes: 1})
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}


const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const postsInDb = async () => {
  const posts = await Blog.find({})
  return posts.map(blog => blog.toJSON())
}

module.exports = {
    initialPosts, nonExistingId, postsInDb, usersInDb
}