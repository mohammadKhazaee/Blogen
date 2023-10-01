const express = require("express");

const controller = require("../controllers/auth");

const validator = require("../middlewares/validation");
const notAuth = require("../middlewares/isNotAuth");

const Router = express.Router();

Router.get("/login", notAuth, controller.getLogin);

Router.post("/login", notAuth, validator.postLogin, controller.postLogin);

Router.post("/logout", controller.postLogout);

Router.get("/signup", notAuth, controller.getSignup);

Router.post("/signup", notAuth, validator.postSignup, controller.postSignup);

Router.get("/reset-password", notAuth, controller.getResetPassword);

Router.post(
	"/reset-password",
	notAuth,
	validator.postResetPassword,
	controller.postResetPassword
);

Router.get("/getNewPassword", notAuth, controller.getNewPassword);

module.exports = Router;
