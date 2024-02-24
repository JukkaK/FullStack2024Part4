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

test('identifier property of blogs is named id', async () => {
    const blogs = await Blog.find({})
    blogs.map(blog => blog.toJSON())  
    const ids = blogs.map(b => b.id)
    assert.notEqual(ids.length, 0)
})

test('new post is created', async () => {

  const blogs = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const amountStart = blogs.body.length

  const newPost = {
    title: "My Nth post", 
    author: "Edsger W. Dijkstra", 
    url: "http://www.nomore.com", 
    likes: 1
  }

  const response = await api
  .post('/api/blogs')
  .send(newPost)
  .expect(200)
  .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await api
  .get('/api/blogs')
  .expect(200)
  .expect('Content-Type', /application\/json/)
  
  const amountEnd = blogsAtEnd.body.length

  assert.equal(amountEnd, amountStart + 1)

})

test('Update a post', async () => {
  const blogs = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogToUpdate = blogs.body[3]

  const updatedBlog = {
    title: "I changed this title",
    author: "Edsger W. Dijkstra",
    url: "http://www.nomore.com",
    likes: 1
  }

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const updatedBlogs = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

assert.equal(updatedBlogs.body[3].title, updatedBlog.title)

})

test('Delete a post', async () => {
  const blogs = await api
  .get('/api/blogs')
  .expect(200)
  .expect('Content-Type', /application\/json/)

  const blogToDelete = blogs.body[1]

  await api
  .delete(`/api/blogs/${blogToDelete.id}`)
  .expect(204)

  const blogsAtEnd = await api
  .get('/api/blogs')
  .expect(200)
  .expect('Content-Type', /application\/json/)

  const ids = blogsAtEnd.body.map(b => b.id)

  assert.equal(ids.includes(blogToDelete.id), false)

})

//TODO: Why doesn't the test suite end with this?
after(async () => {
  await mongoose.connection.close()  
})