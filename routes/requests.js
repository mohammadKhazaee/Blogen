const express = require('express')

const controller = require('../controllers/requests')

const Router = express.Router()

Router.get('/', controller.getRequests)

Router.get('/details/:requestId', controller.getRequestDetails)

Router.get('/accept/:requestId', controller.getAcceptRequest)

Router.get('/reject/:requestId', controller.getRejectRequest)

module.exports = Router
