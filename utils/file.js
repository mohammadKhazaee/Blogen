const fs = require("fs");

exports.deleteFile = (path) => {
	path = path.substring(1);
	if (process.platform === "win32") {
		path = path.replace("/", "\\");
	}
	fs.unlink(path, (err) => {
		if (err) console.log(err);
		console.log("*** image deleted ***");
	});
};
