const express = require('express')

const controller = require('../controllers/users')
const validator = require('../middlewares/validation')

const Router = express.Router()

Router.get('/', controller.getUsers)

Router.post('/add', validator.postAddUser, controller.postAddUser)

module.exports = Router
