const path = require("path");

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const flash = require("connect-flash");
const helmet = require("helmet");
const compression = require("compression");
const bcrypt = require("bcryptjs");

const Admin = require("./models/admin");
const AdminRequest = require("./models/adminRequest");

const router = require("./routes/routes");

const PORT = process.env.PORT;
const DATABASE_URI = process.env.DATABASE_URI;

const app = express();
// The store that sessions will be store there
const store = new MongoDBStore({
	uri: process.env.DATABASE_URI,
	collection: "sessions",
	expires: 1000 * 60 * 60 * 2,
});
const csrfProtection = csrf();

const multerStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "images");
	},
	filename: (req, file, cb) => {
		cb(null, `${uuidv4()} - ${file.originalname}`);
	},
});

const multerFilter = (req, file, cb) => {
	if (
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg"
	)
		return cb(null, true);
	req.fileProvided = true;
	cb(null, false);
};

const getMessage = (req, type) => {
	const message = req.flash(type);
	if (message.length > 0) return message[0];
	return null;
};

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
	multer({ storage: multerStorage, fileFilter: multerFilter }).single("image")
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

//  Initialize session for users authentication
app.use(
	session({
		secret: process.env.MONGO_CONNECT_SECRET,
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);
// CSRF protection for routes
app.use(csrfProtection);

app.use(flash());
// Default parameters for render templates
app.use((req, res, next) => {
	res.locals.errorMessage = getMessage(req, "error");
	res.locals.successMessage = getMessage(req, "success");
	res.locals.isLoggedIn = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
	res.locals.prevAddress = req.headers.referer;
	next();
});

// Creating test admin if there is none in db
app.use(async (req, res, next) => {
	const admin = await Admin.findOne({ email: "test@test.com" });
	if (!admin) {
		const hashedpass = bcrypt.hashSync("12345678", 12);
		const newAdmin = new Admin({
			name: "test admin",
			email: "test@test.com",
			password: hashedpass,
		});
		await newAdmin.save();
	}
	return next();
});

// Chain user from previous request to current request with session
app.use((req, res, next) => {
	if (!req.session.admin) return next();
	AdminRequest.countDocuments()
		.then((requestCount) => {
			res.locals.requestCount = requestCount;
			return Admin.findById(req.session.admin._id);
		})
		.then((admin) => {
			res.locals.adminName = admin.name;
			req.admin = admin;
			return next();
		})
		.catch((err) => next(err));
});

app.use(router);

// Setup detabase and start app
mongoose
	.connect(DATABASE_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then((result) => {
		app.listen(PORT || 3000);
	})
	.catch((err) => console.log(err));
