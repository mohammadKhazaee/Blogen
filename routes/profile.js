const express = require('express')

const controller = require('../controllers/profile')

const validator = require('../middlewares/validation')

const Router = express.Router()

Router.get('/', controller.getProfile)

Router.post('/edit', validator.postEditProfile, controller.postEditProfile)

Router.post('/change-password', validator.postChangePassword, controller.postChangePassword)

Router.get('/delete-avatar', controller.getDeleteAvatar)

Router.post('/delete-account', validator.postDeleteAccount, controller.postDeleteAccount)

module.exports = Router
