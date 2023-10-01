const mongoose = require('mongoose')

const Schema = mongoose.Schema

const adminSchema = new Schema({
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
	avatarUrl: {
		type: String,
	},
	bio: {
		type: String,
	},
	resetToken: String,
	resetTokenExpiry: Date,
})

module.exports = mongoose.model('Admin', adminSchema)
