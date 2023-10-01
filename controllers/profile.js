const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')

const Admin = require('../models/admin')
const fileHelper = require('../utils/file')
const admin = require('../models/admin')

exports.getProfile = (req, res, next) => {
	res.render('admin/profile', {
		path: '/profile',
		admin: req.admin,
		isInfoWrong: false,
		isEmailValid: true,
		isNameValid: true,
		isBioValid: true,
		isDelPasswordValid: true,
		isPasswordValid: true,
		isConfirmPasswordValid: true,
	})
}

exports.postEditProfile = (req, res, next) => {
	const name = req.body.name
	const email = req.body.email
	const bio = req.body.editor1
	const avatarUrl = req.file ? '/' + req.file.path.replace('\\', '/') : null

	const errors = validationResult(req).array()
	if (errors.length > 0) {
		const oldInput = { email: email, name: name, bio: bio }
		const emailError = errors.find(error => error.param === 'email')
		const nameError = errors.find(error => error.param === 'name')
		const bioError = errors.find(error => error.param === 'editor1')
		let emailMessage, nameMessage, bioMessage
		if (emailError) emailMessage = emailError.msg
		if (nameError) nameMessage = nameError.msg
		if (bioError) bioMessage = bioError.msg

		return res.status(422).render('admin/profile', {
			path: '/profile',
			oldInput: oldInput,
			admin: req.admin,
			isInfoWrong: true,
			isDelPasswordValid: true,
			isPasswordValid: true,
			isConfirmPasswordValid: true,
			isEmailValid: !emailError,
			emailMessage: emailMessage,
			isNameValid: !nameError,
			nameMessage: nameMessage,
			isBioValid: !bioError,
			bioMessage: bioMessage,
		})
	}
	Admin.findById(req.admin._id)
		.then(admin => {
			admin.name = name
			if (avatarUrl && admin.avatarUrl) fileHelper.deleteFile(admin.avatarUrl)
			admin.avatarUrl = avatarUrl ? avatarUrl : admin.avatarUrl
			admin.email = email
			admin.bio = bio
			return admin.save()
		})
		.then(result => {
			console.log('*** informations saved***')
			res.redirect('/profile')
		})
		.catch(err => next(err))
}

exports.getDeleteAvatar = (req, res, next) => {
	Admin.findById(req.admin._id)
		.then(admin => {
			fileHelper.deleteFile(admin.avatarUrl)
			admin.avatarUrl = null
			return admin.save()
		})
		.then(result => {
			console.log('*** admin avatar deleted ***')
			res.redirect('/profile')
		})
		.catch(err => next(err))
}

exports.postChangePassword = (req, res, next) => {
	const password = req.body.password

	const errors = validationResult(req).array()
	if (errors.length > 0) {
		const passwordError = errors.find(error => error.param === 'password')
		const confirmPasswordError = errors.find(error => error.param === 'confirmPassword')
		let passwordMessage, confirmPasswordMessage
		if (passwordError) passwordMessage = passwordError.msg
		if (confirmPasswordError) confirmPasswordMessage = confirmPasswordError.msg

		return res.status(422).render('admin/profile', {
			path: '/profile',
			admin: req.admin,
			isInfoWrong: false,
			isEmailValid: true,
			isNameValid: true,
			isBioValid: true,
			isDelPasswordValid: true,
			isPasswordValid: !passwordError,
			passwordMessage: passwordMessage,
			isConfirmPasswordValid: !confirmPasswordError,
			confirmPasswordMessage: confirmPasswordMessage,
		})
	}
	bcrypt
		.hash(password, 12)
		.then(hash => {
			req.admin.password = hash
			req.admin.save()
		})
		.then(result => {
			console.log('*** password changed ***')
			res.redirect('/profile')
		})
		.catch(err => next(err))
}

exports.postDeleteAccount = (req, res, next) => {
	const errors = validationResult(req).array()
	if (errors.length > 0) {
		const delPasswordError = errors.find(error => error.param === 'delPassword')
		let delPasswordMessage
		if (delPasswordError) delPasswordMessage = delPasswordError.msg
		return res.status(422).render('admin/profile', {
			path: '/profile',
			admin: req.admin,
			isDelPasswordValid: !delPasswordError,
			delPasswordMessage: delPasswordMessage,
			isInfoWrong: false,
			isEmailValid: true,
			isNameValid: true,
			isBioValid: true,
			isPasswordValid: true,
			isConfirmPasswordValid: true,
		})
	}
	req.admin
		.remove()
		.then(admin => {
			fileHelper.deleteFile(admin.avatarUrl)
			return req.session.destroy(err => {
				if (err) return next(err)
				console.log('*** admin account deleted ***')
				res.redirect('/auth/login')
			})
		})
		.catch(err => next(err))
}
