const Fuse = require('fuse.js')
const { validationResult } = require('express-validator')

const User = require('../models/user')
const Post = require('../models/post')
const Category = require('../models/category')

const ITEM_PER_PAGE = 5

exports.getUsers = (req, res, next) => {
	const searchInput = req.query.search ? req.query.search.trim() : ''
	const page = +req.query.page || 1
	let userCount

	return User.find()
		.then(users => {
			const fuse = new Fuse(users, { keys: ['name', 'email'], threshold: 0.3 })
			if (searchInput !== '') {
				const usersEmails = fuse.search(searchInput).map(user => user.item.email)
				userCount = usersEmails.length
				return User.find({ email: { $in: usersEmails } })
					.skip((page - 1) * ITEM_PER_PAGE)
					.limit(ITEM_PER_PAGE)
			}
			userCount = users.length
			return User.find()
				.skip((page - 1) * ITEM_PER_PAGE)
				.limit(ITEM_PER_PAGE)
		})
		.then(users => {
			res.render('admin/users', {
				path: '/users',
				users: users,
				beforePreviousPage: page - 2,
				hasBeforePreviousPage: page > 2,
				previousPage: page - 1,
				hasPreviousPage: page > 1,
				currentPage: page,
				nextPage: page + 1,
				hasNextPage: page < Math.ceil(userCount / ITEM_PER_PAGE),
				afterNextPage: page + 2,
				hasAfterNextPage: page + 1 < Math.ceil(userCount / ITEM_PER_PAGE),
				lastPage: Math.ceil(userCount / ITEM_PER_PAGE),
			})
		})
		.catch(err => next(err))
}

exports.postAddUser = (req, res, next) => {
	const name = req.body.name
	const email = req.body.email
	const password = req.body.password
	const confirmPassword = req.body.confirmPassword

	const errors = validationResult(req).array()
	if (errors.length > 0) {
		const oldInput = {
			name: name,
			email: email,
			password: password,
			confirmPassword: confirmPassword,
		}
		const nameError = errors.find(error => error.param === 'name')
		const emailError = errors.find(error => error.param === 'email')
		const passwordError = errors.find(error => error.param === 'password')
		const confirmPasswordError = errors.find(error => error.param === 'confirmPassword')
		let nameMessage, emailMessage, passwordMessage, confirmPasswordMessage
		if (nameError) nameMessage = nameError.msg
		if (emailError) emailMessage = emailError.msg
		if (passwordError) passwordMessage = passwordError.msg
		if (confirmPasswordError) confirmPasswordMessage = confirmPasswordError.msg

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
					wrongInput: 'User',
					isNameValid: !nameError,
					nameMessage: nameMessage,
					isEmailValid: !emailError,
					emailMessage: emailMessage,
					isPasswordValid: !passwordError,
					passwordMessage: passwordMessage,
					isConfirmPasswordValid: !confirmPasswordError,
					confirmPasswordMessage: confirmPasswordMessage,
					isTitleValid: true,
					isBodyValid: true,
					isImageValid: true,
					postCount: postCount,
				})
			})
			.catch(err => next(err))
	}
	new User({
		name: name,
		email: email,
		password: password,
	})
		.save()
		.then(result => {
			console.log('*** user added ***')
			res.redirect('/')
		})
		.catch(err => next(err))
}
