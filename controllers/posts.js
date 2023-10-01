const Fuse = require("fuse.js");
const { validationResult } = require("express-validator");

const Post = require("../models/post");
const Category = require("../models/category");
const User = require("../models/user");
const fileHelper = require("../utils/file");

const ITEM_PER_PAGE = 5;

exports.getPosts = (req, res, next) => {
	const searchInput = req.query.search ? req.query.search.trim() : "";
	const page = +req.query.page || 1;
	let postCount;

	return Post.find()
		.then((posts) => {
			const fuse = new Fuse(posts, { keys: ["title"], threshold: 0.3 });
			if (searchInput !== "") {
				const postsTitles = fuse
					.search(searchInput)
					.map((post) => post.item.title);
				postCount = postsTitles.length;
				return Post.find({ title: { $in: postsTitles } })
					.skip((page - 1) * ITEM_PER_PAGE)
					.limit(ITEM_PER_PAGE);
			}
			postCount = posts.length;
			return Post.find()
				.skip((page - 1) * ITEM_PER_PAGE)
				.limit(ITEM_PER_PAGE);
		})
		.then((posts) => {
			res.render("admin/posts/posts", {
				path: "/posts",
				posts: posts,
				beforePreviousPage: page - 2,
				hasBeforePreviousPage: page > 2,
				previousPage: page - 1,
				hasPreviousPage: page > 1,
				currentPage: page,
				nextPage: page + 1,
				hasNextPage: page < Math.ceil(postCount / ITEM_PER_PAGE),
				afterNextPage: page + 2,
				hasAfterNextPage:
					page + 1 < Math.ceil(postCount / ITEM_PER_PAGE),
				lastPage: Math.ceil(postCount / ITEM_PER_PAGE),
			});
		})
		.catch((err) => next(err));
};

exports.postAddPost = (req, res, next) => {
	const title = req.body.title;
	const category = req.body.category;
	const imageUrl = req.file ? "/" + req.file.path.replace("\\", "/") : null;
	const postBody = req.body.editor1;

	const errors = validationResult(req).array();
	// console.log(errors);
	if (errors.length > 0) {
		const oldInput = { title: title, body: postBody };
		const titleError = errors.find((error) => error.param === "title");
		const bodyError = errors.find((error) => error.param === "editor1");
		const imageError = errors.find((error) => error.param === "image");
		let titleMessage, bodyMessage, imageMessage;
		if (titleError) titleMessage = titleError.msg;
		if (bodyError) bodyMessage = bodyError.msg;
		if (imageError) imageMessage = imageError.msg;

		let userCount, posts, categories;
		return User.countDocuments()
			.then((count) => {
				userCount = count;
				return User.countDocuments();
			})
			.then((count) => {
				userCount = count;
				return Post.find().sort({ createdAt: -1 }).limit(5);
			})
			.then((postRes) => {
				posts = postRes;
				return Category.find();
			})
			.then((categoryRes) => {
				categories = categoryRes;
				return Post.countDocuments();
			})
			.then((postCount) => {
				return res.status(422).render("admin/index", {
					path: "/",
					posts: posts,
					postCount: postCount,
					categories: categories,
					userCount: userCount,
					oldInput: oldInput,
					wrongInput: "Post",
					isTitleValid: !titleError,
					titleMessage: titleMessage,
					isBodyValid: !bodyError,
					bodyMessage: bodyMessage,
					isImageValid: !imageError,
					imageMessage: imageMessage,
					isNameValid: true,
					isEmailValid: true,
					isPasswordValid: true,
					isConfirmPasswordValid: true,
				});
			})
			.catch((err) => next(err));
	}
	new Post({
		title: title,
		category: category,
		imageUrl: imageUrl,
		body: postBody,
	})
		.save()
		.then((result) => {
			console.log("*** post added ***");
			res.redirect("/");
		})
		.catch((err) => next(err));
};

exports.getPostDetails = (req, res, next) => {
	const postId = req.params.postId;
	let post;
	return Post.findById(postId)
		.then((postRes) => {
			if (!postRes) {
				const err = new Error("Post not found");
				err.statusCode = 404;
				throw err;
			}
			post = postRes;
			return Category.find();
		})
		.then((categories) => {
			res.render("admin/posts/post-details", {
				path: "/post/details",
				post: post,
				categories: categories,
				isTitleValid: true,
				isBodyValid: true,
				isImageValid: true,
			});
		})
		.catch((err) => next(err));
};

exports.getDeletePost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findByIdAndRemove(postId).then((post) => {
		if (post.imageUrl) fileHelper.deleteFile(post.imageUrl);
		console.log("*** Post deleted ***");
		res.redirect("/posts");
	});
};

exports.postEditPost = (req, res, next) => {
	const postId = req.params.postId;
	const title = req.body.title;
	const category = req.body.category;
	const imageUrl = req.file ? "/" + req.file.path.replace("\\", "/") : null;
	const postBody = req.body.editor1;
	const errors = validationResult(req).array();

	if (errors.length > 0) {
		const oldInput = { _id: postId, title: title, body: postBody };
		const titleError = errors.find((error) => error.param === "title");
		const bodyError = errors.find((error) => error.param === "editor1");
		const imageError = errors.find((error) => error.param === "image");
		let titleMessage, bodyMessage, imageMessage;
		if (titleError) titleMessage = titleError.msg;
		if (bodyError) bodyMessage = bodyError.msg;
		if (imageError) imageMessage = imageError.msg;

		return Category.find()
			.then((categories) => {
				res.status(422).render("admin/posts/post-details", {
					path: "/post/details",
					post: oldInput,
					categories: categories,
					isTitleValid: !titleError,
					titleMessage: titleMessage,
					isBodyValid: !bodyError,
					bodyMessage: bodyMessage,
					isImageValid: !imageError,
					imageMessage: imageMessage,
				});
			})
			.catch((err) => next(err));
	}
	Post.findById(postId)
		.then((post) => {
			post.title = title;
			post.category = category !== "No change" ? category : post.category;
			if (imageUrl && post.imageUrl) fileHelper.deleteFile(post.imageUrl);
			post.imageUrl = imageUrl ? imageUrl : post.imageUrl;
			post.body = postBody;
			return post.save();
		})
		.then((result) => {
			console.log("*** post updated ***");
			res.redirect("/posts");
		})
		.catch((err) => next(err));
};
