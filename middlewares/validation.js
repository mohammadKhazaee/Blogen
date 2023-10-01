const { body } = require("express-validator");
const bcrypt = require("bcryptjs");

const Admin = require("../models/admin");
const User = require("../models/user");

exports.postLogin = [
	body("email", "Please enter a valid email address")
		.notEmpty()
		.normalizeEmail({ gmail_remove_dots: false })
		.custom((value, { req }) => {
			return Admin.findOne({ email: value }).then((admin) => {
				if (!admin) return Promise.reject("Email not found");
				req.admin = admin;
			});
		}),
	body("password").custom((value, { req }) => {
		// return true // for test
		if (!req.admin) return true;
		return bcrypt.compare(value, req.admin.password).then((isMatch) => {
			if (!isMatch) return Promise.reject("Wrong password");
		});
	}),
];

exports.postSignup = [
	body("email", "Please enter a valid email address")
		.notEmpty()
		.normalizeEmail({ gmail_remove_dots: false })
		.custom((value, { req }) => {
			return Admin.findOne({ email: value }).then((admin) => {
				if (admin)
					return Promise.reject(
						"This email address is already taken"
					);
			});
		}),
	body(
		"password",
		"Password should be at least 8 and less than 32 characters"
	)
		.notEmpty()
		.isLength({ min: 8, max: 32 }),
	body("firstName", "Please fill out the field")
		.notEmpty()
		.trim()
		.isAlpha()
		.withMessage("Only a-z, A-Z characters are allowed")
		.isLength({ min: 3, max: 32 })
		.withMessage("Must be longer than 3 and less than 32 characters"),
	body("lastName", "Please fill out the field")
		.notEmpty()
		.trim()
		.isAlpha()
		.withMessage("Only a-z, A-Z characters are allowed")
		.isLength({ min: 3, max: 32 })
		.withMessage("Must be longer than 3 and less than 32 characters"),
	body("description", "Please fill out the field").notEmpty().trim(),
];

exports.postAddPost = [
	body("title", "Please fill out the field").notEmpty().trim(),
	body("image").custom((value, { req }) => {
		if (req.fileProvided)
			return Promise.reject("Image format should be jpg, png or jpeg");
		if (req.file === undefined) return true;
		if (req.file.size > 3145728)
			return Promise.reject("Image size must be less than 3Mb");
		return true;
	}),
	body("editor1", "Please fill out the field")
		.notEmpty()
		.trim()
		.custom((value, { req }) => {
			return true;
		}),
];

exports.postEditPost = [
	body("title", "Please fill out the field").notEmpty().trim(),
	body("image").custom((value, { req }) => {
		if (req.fileProvided)
			return Promise.reject("Image format should be jpg, png or jpeg");
		if (req.file === undefined) return true;
		if (req.file.size > 3145728)
			return Promise.reject("Image size must be less than 3Mb");
		return true;
	}),
	body("editor1", "Please fill out the field").notEmpty(),
];

exports.postEditProfile = [
	body("name", "Please fill out the field").notEmpty().trim(),
	body("image").custom((value, { req }) => {
		if (req.fileProvided)
			return Promise.reject("Image format should be jpg, png or jpeg");
		if (req.file === undefined) return true;
		if (req.file.size > 3145728)
			return Promise.reject("Image size must be less than 3Mb");
		return true;
	}),
	body("email", "Please enter a valid email address")
		.notEmpty()
		.normalizeEmail({ gmail_remove_dots: false })
		.custom((value, { req }) => {
			return Admin.findOne({ email: value }).then((admin) => {
				if (admin && value !== req.admin.email)
					return Promise.reject(
						"This email address is already taken"
					);
			});
		}),
];

exports.postAddCategory = [
	body("title", "Please fill out the field").notEmpty().trim(),
];

exports.postAddUser = [
	body("name", "Please fill out the field")
		.notEmpty()
		.trim()
		.isAlpha()
		.withMessage("Only a-z, A-Z characters are allowed")
		.isLength({ min: 3, max: 32 }),
	body("email", "Please enter a valid email address")
		.notEmpty()
		.normalizeEmail({ gmail_remove_dots: false })
		.custom((value, { req }) => {
			return User.findOne({ email: value }).then((admin) => {
				if (admin)
					return Promise.reject(
						"This email address is already taken"
					);
			});
		}),
	body(
		"password",
		"Password should be at least 8 and less than 32 characters"
	)
		.notEmpty()
		.isLength({ min: 8, max: 32 }),
	body("confirmPassword").custom((value, { req }) => {
		if (value !== req.body.password)
			throw new Error("Confirm password is not match");
		return true;
	}),
];

exports.postChangePassword = [
	body(
		"password",
		"Password should be at least 8 and less than 32 characters"
	)
		.notEmpty()
		.isLength({ min: 8, max: 32 })
		.custom((value, { req }) => {
			return bcrypt.compare(value, req.admin.password).then((isMatch) => {
				if (isMatch)
					return Promise.reject("Please choose a new password");
			});
		}),
	body("confirmPassword").custom((value, { req }) => {
		if (value !== req.body.password)
			throw new Error("Confirm password is not match");
		return true;
	}),
];

exports.postDeleteAccount = [
	body("delPassword").custom((value, { req }) => {
		return bcrypt.compare(value, req.admin.password).then((isMatch) => {
			if (!isMatch) return Promise.reject("Password is not correct");
		});
	}),
];

exports.postResetPassword = [
	body("email", "Please enter a valid email address")
		.notEmpty()
		.normalizeEmail({ gmail_remove_dots: false })
		.custom((value, { req }) => {
			return Admin.findOne({ email: value }).then((admin) => {
				if (!admin)
					return Promise.reject("Please check your email address");
			});
		}),
];

exports.postNewPassword = [
	body(
		"password",
		"Password should be at least 8 and less than 32 characters"
	)
		.notEmpty()
		.isLength({ min: 8, max: 32 }),
];
