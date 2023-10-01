const Fuse = require('fuse.js')
const { validationResult } = require('express-validator')

const User = require('../models/user')
const Post = require('../models/post')
const Category = require('../models/category')

const ITEM_PER_PAGE = 5

exports.getCategories = (req, res, next) => {
	const searchInput = req.query.search ? req.query.search.trim() : ''
	const page = +req.query.page || 1
	let categoryCount

	Category.find()
		.then(categories => {
			const fuse = new Fuse(categories, { keys: ['title'], threshold: 0.3 })
			if (searchInput !== '') {
				const categoriesTitles = fuse.search(searchInput).map(category => category.item.title)
				categoryCount = categoriesTitles.length
				return Category.find({ title: { $in: categoriesTitles } })
					.skip((page - 1) * ITEM_PER_PAGE)
					.limit(ITEM_PER_PAGE)
			}
			categoryCount = categories.length
			return Category.find()
				.skip((page - 1) * ITEM_PER_PAGE)
				.limit(ITEM_PER_PAGE)
		})
		.then(categories => {
			res.render('admin/categories', {
				path: '/categories',
				categories: categories,
				beforePreviousPage: page - 2,
				hasBeforePreviousPage: page > 2,
				previousPage: page - 1,
				hasPreviousPage: page > 1,
				currentPage: page,
				nextPage: page + 1,
				hasNextPage: page < Math.ceil(categoryCount / ITEM_PER_PAGE),
				afterNextPage: page + 2,
				hasAfterNextPage: page + 1 < Math.ceil(categoryCount / ITEM_PER_PAGE),
				lastPage: Math.ceil(categoryCount / ITEM_PER_PAGE),
			})
		})
		.catch(err => next(err))
}

exports.postAddCategory = (req, res, next) => {
	const title = req.body.title

	const errors = validationResult(req).array()
	if (errors.length > 0) {
		const oldInput = { title: title }
		const titleError = errors.find(error => error.param === 'title')
		let titleMessage
		if (titleError) titleMessage = titleError.msg

		let userCount, posts, categories
		return User.countDocuments()
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
				return res.status(422).render('admin/index', {
					path: '/',
					posts: posts,
					categories: categories,
					userCount: userCount,
					oldInput: oldInput,
					wrongInput: 'Category',
					isTitleValid: !titleError,
					titleMessage: titleMessage,
					isImageValid: true,
					isBodyValid: true,
					postCount: postCount,
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
	Category({ title: title })
		.save()
		.then(result => {
			console.log('*** category added ***')
			res.redirect('/')
		})
		.catch(err => next(err))
}
