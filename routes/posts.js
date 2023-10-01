const express = require('express')

const controller = require('../controllers/posts')
const validator = require('../middlewares/validation')

const Router = express.Router()

Router.get('/', controller.getPosts)

Router.post('/add', validator.postAddPost, controller.postAddPost)

Router.get('/details/:postId', controller.getPostDetails)

Router.get('/delete/:postId', controller.getDeletePost)

Router.post('/edit/:postId', validator.postEditPost, controller.postEditPost)

module.exports = Router
