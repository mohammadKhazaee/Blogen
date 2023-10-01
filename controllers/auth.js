const crypto = require("crypto");

require("dotenv").config();
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const AdminRequest = require("../models/adminRequest");
const Admin = require("../models/admin");
const sendMail = require("../utils/sendMail");

exports.getLogin = (req, res, next) => {
	res.render("admin/auth/login", {
		path: "/auth/login",
		oldInput: null,
		isEmailValid: true,
		isPasswordValid: true,
	});
};

exports.postLogin = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	const errors = validationResult(req).array();
	if (errors.length > 0) {
		const oldInput = { email: email, password: password };
		const emailError = errors.find((error) => error.param === "email");
		const passError = errors.find((error) => error.param === "password");
		let emailMessage, passMessage;
		if (emailError) emailMessage = emailError.msg;
		if (passError) passMessage = passError.msg;

		return res.status(422).render("admin/auth/login", {
			path: "/auth/login",
			oldInput: oldInput,
			isEmailValid: !emailError,
			emailMessage: emailMessage,
			isPasswordValid: !passError,
			passwordMessage: passMessage,
		});
	}
	req.session.admin = req.admin;
	req.session.isLoggedIn = true;
	res.redirect("/");
};

exports.postLogout = (req, res, next) => {
	req.session.destroy((err) => {
		if (err) return next(err);
		res.redirect("/auth/login");
	});
};

exports.getSignup = (req, res, next) => {
	res.render("admin/auth/signup", {
		path: "/auth/signup",
		oldInput: null,
		isEmailValid: true,
		isPasswordValid: true,
		isFirstNameValid: true,
		isLastNameValid: true,
		isDescriptionValid: true,
	});
};

exports.postSignup = (req, res, next) => {
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	const email = req.body.email;
	const password = req.body.password;
	const description = req.body.description;

	const errors = validationResult(req).array();
	if (errors.length > 0) {
		const oldInput = {
			email: email,
			password: password,
			firstName: firstName,
			lastName: lastName,
			description: description,
		};
		const emailError = errors.find((error) => error.param === "email");
		const passError = errors.find((error) => error.param === "password");
		const firstNameError = errors.find(
			(error) => error.param === "firstName"
		);
		const lastNameError = errors.find(
			(error) => error.param === "lastName"
		);
		const descriptionError = errors.find(
			(error) => error.param === "description"
		);
		let emailMessage,
			passMessage,
			firstNameMessage,
			lastNameMessage,
			descriptionMessage;
		if (emailError) emailMessage = emailError.msg;
		if (passError) passMessage = passError.msg;
		if (firstNameError) firstNameMessage = firstNameError.msg;
		if (lastNameError) lastNameMessage = lastNameError.msg;
		if (descriptionError) descriptionMessage = descriptionError.msg;

		return res.status(422).render("admin/auth/signup", {
			path: "/auth/signup",
			oldInput: oldInput,
			isEmailValid: !emailError,
			emailMessage: emailMessage,
			isPasswordValid: !passError,
			passwordMessage: passMessage,
			isFirstNameValid: !firstNameError,
			firstNameMessage: firstNameMessage,
			isLastNameValid: !lastNameError,
			lastNameMessage: lastNameMessage,
			isDescriptionValid: !descriptionError,
			descriptionMessage: descriptionMessage,
		});
	}

	new AdminRequest({
		name: `${firstName} ${lastName}`,
		email: email,
		password: password,
		description: description,
	})
		.save()
		.then((result) => {
			console.log("*** request added ***");
			req.flash(
				"success",
				"Your reques submited and we'll respond you with an email back."
			);
			res.redirect("/");
		})
		.catch((err) => next(err));
};

exports.getResetPassword = (req, res, next) => {
	res.render("admin/auth/reset-password", {
		path: "/auth/reset-password",
		isEmailValid: true,
	});
};

exports.postResetPassword = (req, res, next) => {
	const email = req.body.email;

	const errors = validationResult(req).array();
	if (errors.length > 0) {
		const oldInput = { email: email };
		const emailError = errors.find((error) => error.param === "email");
		if (emailError) emailMessage = emailError.msg;

		return res.status(422).render("admin/auth/reset-password", {
			path: "/auth/reset-password",
			oldInput: oldInput,
			isEmailValid: !emailError,
			emailMessage: emailMessage,
		});
	}

	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			req.flash("error", "Something went wrong. Please try again");
			res.redirect("/auth/reset-password");
			throw err;
		}
		const token = buffer.toString("hex");
		Admin.findOne({ email: email })
			.then((admin) => {
				if (!admin) {
					req.flash(
						"error",
						"Can't find your email. Maybe you deleted your account."
					);
					res.redirect("/auth/login");
					throw new Error("no email found");
				}
				admin.resetToken = token;
				admin.resetTokenExpiry = Date.now() + 3600000;
				return admin.save();
			})
			.then((admin) => {
				req.flash(
					"success",
					`an email contains information sent to ${email} .`
				);
				res.redirect("/auth/login");
				return sendMail({
					to: email,
					from: `${process.env.EMAIL}`,
					subject: "Password reset",
					html: `
							<p>You requested a password reset</p>
							<p>Click this <a href="http://localhost:3000/auth/new-password/${token}">link</a> to set a new password</p>
						`,
				});
			})
			.then((result) => {
				console.log("*** reset password email sent ***");
			})
			.catch((err) => next(err));
	});
};

exports.getNewPassword = (req, res, next) => {
	const token = req.params.token;
	Admin.findOne({ resetToken: token })
		.then((admin) => {
			if (!admin) {
				req.flash(
					"error",
					"invalid link! please generate new reset link."
				);
				res.redirect("/auth/reset-password");
				throw "bad token";
			}
			if (admin.resetTokenExpiry < Date.now()) {
				req.flash("error", "reset password link is expired.");
				res.redirect("/auth/reset-password");
				throw "expired link";
			}
			res.render("admin/auth/new-password", {
				path: "/auth/new-password",
				resetToken: token,
				adminId: admin._id.toString(),
				isPasswordValid: true,
			});
		})
		.catch((err) => next(err));
};

exports.postNewPassword = (req, res, next) => {
	const resetToken = req.body.resetToken;
	const adminId = req.body.adminId;
	const newPassword = req.body.password;

	bcrypt
		.hash(newPassword, 12)
		.then((hashedPassword) => {
			return Admin.updateOne(
				{
					_id: adminId,
					resetToken: resetToken,
					resetTokenExpiry: { $gt: Date.now() },
				},
				{
					$set: {
						password: hashedPassword,
						resetToken: null,
						resetTokenExpiry: null,
					},
				}
			);
		})
		.then((admin) => {
			if (!admin) {
				req.flash(
					"error",
					"Your reset link is invalid or expired, please generate a new one."
				);
				res.redirect("/auth/reset-password");
			}
			req.flash("success", "password changed successfully.");
			res.redirect("/auth/login");
		})
		.catch((err) => next(err));
};
