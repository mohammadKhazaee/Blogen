const mongoose = require('mongoose')
const moment = require('moment')

const Schema = mongoose.Schema

const requestSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	createdAt: {
		type: String,
		default: moment().format('MMM DD, YYYY'),
	},
})

module.exports = mongoose.model('AdminRequest', requestSchema)
