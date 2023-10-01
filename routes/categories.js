const express = require('express')

const controller = require('../controllers/categories')
const validator = require('../middlewares/validation')

const Router = express.Router()

Router.get('/', controller.getCategories)

Router.post('/add', validator.postAddCategory, controller.postAddCategory)

module.exports = Router
