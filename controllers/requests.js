require("dotenv").config();
const bcrypt = require("bcryptjs");
const Fuse = require("fuse.js");

const AdminRequest = require("../models/adminRequest");
const Admin = require("../models/admin");
const sendMail = require("../utils/sendMail");

const ITEM_PER_PAGE = 5;

exports.getRequests = (req, res, next) => {
	const searchInput = req.query.search ? req.query.search.trim() : "";
	const page = +req.query.page || 1;
	let requestCount;

	return AdminRequest.find()
		.then((requests) => {
			const fuse = new Fuse(requests, { keys: ["name"], threshold: 0.3 });
			if (searchInput !== "") {
				const requestsNames = fuse
					.search(searchInput)
					.map((request) => request.item.name);
				requestCount = requestsNames.length;
				return AdminRequest.find({ name: { $in: requestsNames } })
					.skip((page - 1) * ITEM_PER_PAGE)
					.limit(ITEM_PER_PAGE);
			}
			requestCount = requests.length;
			return AdminRequest.find()
				.skip((page - 1) * ITEM_PER_PAGE)
				.limit(ITEM_PER_PAGE);
		})
		.then((requests) => {
			res.render("admin/requests/requests", {
				path: "/requests",
				requests: requests,
				beforePreviousPage: page - 2,
				hasBeforePreviousPage: page > 2,
				previousPage: page - 1,
				hasPreviousPage: page > 1,
				currentPage: page,
				nextPage: page + 1,
				hasNextPage: page < Math.ceil(requestCount / ITEM_PER_PAGE),
				afterNextPage: page + 2,
				hasAfterNextPage:
					page + 1 < Math.ceil(requestCount / ITEM_PER_PAGE),
				lastPage: Math.ceil(requestCount / ITEM_PER_PAGE),
			});
		})
		.catch((err) => next(err));
};

exports.getRequestDetails = (req, res, next) => {
	const requestId = req.params.requestId;
	return AdminRequest.findById(requestId)
		.then((request) => {
			if (!request) {
				const err = new Error("Request not found");
				err.statusCode = 404;
				throw err;
			}
			res.render("admin/requests/request-details", {
				path: "/requests/details",
				request: request,
			});
		})
		.catch((err) => next(err));
};

exports.getAcceptRequest = (req, res, next) => {
	const requestId = req.params.requestId;
	let requestObj;
	AdminRequest.findById(requestId)
		.then((request) => {
			if (!request) {
				const err = new Error("Request not found");
				err.statusCode = 404;
				throw err;
			}
			requestObj = request;
			return bcrypt.hash(requestObj.password, 12);
		})
		.then((hashedPassword) => {
			return new Admin({
				name: requestObj.name,
				email: requestObj.email,
				password: hashedPassword,
			}).save();
		})
		.then((newAdmin) => {
			console.log("*** new Admin signed up ***");
			return requestObj.remove();
		})
		.then((result) => {
			res.redirect("/requests");
			console.log("*** request deleted ***");
			return sendMail({
				to: requestObj.email,
				from: `${process.env.EMAIL}`,
				subject: "Congratulations Admin!",
				html: `<h1>Welcome to our team, ${requestObj.name}!</h1>
				<p>We got your request and decieded you are a good choice for making this team and website better</p>
				<br><br>
				<h2>Here is your registration informations:</h2>
				<p><b>Email: </b>${requestObj.email}</p>
				<p><b>Password: </b>${requestObj.password}</p>
				<p><b>Admin Login Page: </b>http://localhost:3000/auth/login</p>
				`,
			});
		})
		.then((result) => {
			console.log("*** email sent ***");
		})
		.catch((err) => next(err));
};

exports.getRejectRequest = (req, res, next) => {
	const requestId = req.params.requestId;
	AdminRequest.findByIdAndRemove(requestId)
		.then((requestObj) => {
			if (!requestObj) {
				const err = new Error("Request not found");
				err.statusCode = 404;
				throw err;
			}
			console.log("*** admin request deleted ***");
			res.redirect("/requests");
			return sendMail({
				to: requestObj.email,
				from: `${process.env.EMAIL}`,
				subject: "Request Rejected!",
				html: `<h1>Sorry but we can not accept you for now, dear ${requestObj.name}!</h1>
						<p>But you can improve your skills and then we\'ll be happy to have you!</p>
						<br><br>
						<p>Or you make us happy joining our users and help us with comments</p>
						<p><b>Our website: </b>http://localhost:3000/</p>
					`,
			});
		})
		.then((result) => {
			console.log("*** reject email sent ***");
		})
		.catch((err) => next(err));
};
