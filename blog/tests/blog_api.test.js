const { test, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const assert = require('node:assert')


const api = supertest(app)

//Blogs have posts, goddammit. Anyone refererring multiple posts as blogs should be sent to a penal colony. 
//And no, not going to refactor the api over that.
test('blog posts are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

after(async () => {
  await mongoose.connection.close()
})

test('identifier property of blogs is named id', async () => {
    const blogs = await await Blog.find({})
    blogs.map(blog => blog.toJSON())  
    const ids = blogs.map(b => b.id)
    assert.equal(ids.length, 2)
  })


after(async () => {
  await mongoose.connection.close()
})
