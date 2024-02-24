const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const e = require('express')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

    if (username === undefined || password === undefined || username.length < 3 || password.length < 3) {
        return response.status(400).json({
            error: 'invalid username or password'
        })
    }

    const usernames = (await User.find({})).map(u => u.username)

    if (usernames.includes(username)) {
        return response.status(400).json({
            error: 'expected `username` to be unique'
        })
    }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

try {    
    const savedUser = await user.save()
    response.status(201).json(savedUser)
    } catch (error) {
        response.status(400).json({ error: error.message })
    }  

})

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
  response.json(users)
})

module.exports = usersRouter