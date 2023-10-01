const mongoose = require('mongoose')
const moment = require('moment')

const Schema = mongoose.Schema

const categorySchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	createdAt: {
		type: String,
		default: moment().format('MMM DD, YYYY'),
	},
})

module.exports = mongoose.model('Category', categorySchema)
