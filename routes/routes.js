const express = require("express");

const controller = require("../controllers/controller");

const authRoute = require("./auth");
const usersRoute = require("./users");
const postsRoute = require("./posts");
const categoriesRoute = require("./categories");
const requestsRoute = require("./requests");
const profileRoute = require("./profile");

const isAuth = require("../middlewares/isAuth");

const Router = express.Router();

// Non-Reletive Routes
Router.get("/", isAuth, controller.getIndex);

Router.get("/settings", isAuth, controller.getSettings);

// Reletive routes
Router.use("/auth", authRoute);
Router.use("/posts", isAuth, postsRoute);
Router.use("/profile", isAuth, profileRoute);
Router.use("/users", isAuth, usersRoute);
Router.use("/categories", isAuth, categoriesRoute);
Router.use("/requests", isAuth, requestsRoute);

// Handle not found routes
Router.use((req, res, next) => {
	res.render("404", {
		path: "",
		adminName: !res.locals.adminName ? res.locals.adminName : "",
	});
});

Router.use((error, req, res, next) => {
	console.log(error);
	const statusCode = error.statusCode || 500;
	res.render(`${statusCode}`, {
		path: "",
		adminName: !res.locals.adminName ? res.locals.adminName : "",
		requestCount: 0,
	});
});

module.exports = Router;
