const moment = require('moment')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	category: {
		type: Object,
		required: true,
		ref: 'category',
	},
	imageUrl: {
		type: String,
	},
	body: {
		type: String,
		required: true,
	},
	createdAt: {
		type: String,
		default: moment().format('MMM DD, YYYY'),
	},
})

postSchema.index({ title: 'text' })

module.exports = mongoose.model('Post', postSchema)
