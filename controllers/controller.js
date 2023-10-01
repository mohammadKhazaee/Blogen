const Post = require('../models/post')
const Category = require('../models/category')
const User = require('../models/user')

exports.getIndex = (req, res, next) => {
	let userCount, posts, categories
	User.countDocuments()
		.then(count => {
			userCount = count
			return Post.find().sort({ createdAt: -1 }).limit(5)
		})
		.then(postRes => {
			posts = postRes
			return Category.find()
		})
		.then(categoryRes => {
			categories = categoryRes
			return Post.countDocuments()
		})
		.then(postCount => {
			res.render('admin/index', {
				path: '/',
				posts: posts,
				categories: categories,
				userCount: userCount,
				postCount: postCount,
				wrongInput: null,
				isTitleValid: true,
				isBodyValid: true,
				isImageValid: true,
				isNameValid: true,
				isEmailValid: true,
				isPasswordValid: true,
				isConfirmPasswordValid: true,
			})
		})
		.catch(err => next(err))
}

exports.getSettings = (req, res, next) => {
	res.render('admin/settings', {
		path: '/settings',
	})
}
