const express = require("express");
const router = express.Router();
const path = require("path");
const sqlite3 = require("sqlite3");
const db = require("../db.js");
const MAX_DESCRIPTION_LENGTH = 255;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_TITLE_LENGTH = 30;
const MIN_TITLE_LENGTH = 4;

const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg"];

const multer = require("multer");
const storage = multer.diskStorage({
	destination: (request, file, cb) => {
		cb(null, "public/uploads");
	},

	filename: (request, file, cb) => {
		const fileName = Date.now() + path.extname(file.originalname);

		request.filePath = fileName;
		cb(null, fileName);
	},
});

const upload = multer({
	storage: storage,

	fileFilter: (req, file, cb) => {
		if (allowedFileTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			req.isUploadError = true;

			cb(null, false);
		}
	},
});

router.get("/projects", function (request, response) {
	db.getAllProjects(function (error, projects) {
		const errorMessages = [];

		if (error) {
			errorMessages.push("Internal server error");

			const model = {
				errorMessages,
				projects,
			};

			response.render("projects.hbs", model);
		} else {
			const model = {
				projects,
			};

			response.render("projects.hbs", model);
		}
	});
});

router.get("/projects/:projectID", function (request, response) {
	const projectID = request.params.projectID;
	const errorMessages = [];

	db.getProjectByID(projectID, function (projectError, project) {
		if (projectError) {
			errorMessages.push("projectError");

			const model = {
				errorMessages,
				project,
				projectID,
			};

			response.render("project.hbs", model);
		} else {
			db.getAllCommentsForProjectByID(
				projectID,
				function (commentError, comments) {
					if (commentError) {
						errorMessages.push("commentError");
						const model = {
							errorMessages,
							comments,
							projectID,
						};

						response.render("project.hbs", model);
					} else {
						const model = {
							errorMessages,
							project,
							comments,
							projectID,
						};

						response.render("project.hbs", model);
					}
				}
			);
		}
	});
});

router.get("/add-project", function (request, response) {
	if (request.session.isLoggedIn) {
		response.render("add-project.hbs");
	} else {
		response.redirect("/login");
	}
});

router.post(
	"/add-project",
	upload.single("image"),
	function (request, response) {
		const image = request.filePath;
		const title = request.body.title;
		const description = request.body.description;
		const errorMessages = [];

		if (title.length == 0) {
			errorMessages.push("Title can't be null");
		} else if (MAX_TITLE_LENGTH < title.length) {
			errorMessages.push(
				"Title can't be more than " + MAX_TITLE_LENGTH + " characters long."
			);
		} else if (title.length < MIN_TITLE_LENGTH) {
			errorMessages.push(
				"Title can't be less than " + MIN_TITLE_LENGTH + " characters long."
			);
		}

		if (description.length == 0) {
			errorMessages.push("Description can't be null");
		} else if (MAX_DESCRIPTION_LENGTH < description.length) {
			errorMessages.push(
				"Description can't be more than " +
				MAX_DESCRIPTION_LENGTH +
				" characters long."
			);
		} else if (description.length < MIN_DESCRIPTION_LENGTH) {
			errorMessages.push(
				"Description can't be less than " +
				MIN_DESCRIPTION_LENGTH +
				" characters long."
			);
		}

		if (!request.session.isLoggedIn) {
			errorMessages.push("Not logged in.");
		}
		if (request.isUploadError) {
			errorMessages.push("Invalid Filetype");
		}

		if (errorMessages.length == 0) {
			db.addProject(title, description, image, function (error) {
				if (error) {
					errorMessages.push("Internal server error");

					const model = {
						errorMessages,
						title,
						description,
						image,
					};

					response.render("add-project.hbs", model);
				} else {
					response.redirect("/projects");
				}
			});
		} else {
			const model = {
				errorMessages,
				title,
				description,
				image,
			};

			response.render("add-project.hbs", model);
		}
	}
);

router.get("/update-project/:projectID", function (request, response) {
	if (request.session.isLoggedIn) {
		const projectID = request.params.projectID;

		const query = `SELECT * FROM projects WHERE projectID = ?`;
		const values = [projectID];

		db.getProjectByID(projectID, function (error, project) {
			const model = {
				project,
			};

			response.render("update-project.hbs", model);
		});
	} else {
		response.redirect("/login");
	}
});

router.post(
	"/update-project/:projectID",
	upload.single("image"),
	function (request, response) {
		const projectID = request.params.projectID;
		const title = request.body.title;
		const description = request.body.description;
		const image = request.filePath;
		const errorMessages = [];

		if (!request.session.isLoggedIn) {
			errorMessages.push("Not logged in.");
		}
		if (title.length == 0) {
			errorMessages.push("Title can't be null");
		} else if (MAX_TITLE_LENGTH < title.length) {
			errorMessages.push(
				"Title can't be more than " + MAX_TITLE_LENGTH + " characters long."
			);
		} else if (title.length < MIN_TITLE_LENGTH) {
			errorMessages.push(
				"Title can't be less than " + MIN_TITLE_LENGTH + " characters long."
			);
		}

		if (description.length == 0) {
			errorMessages.push("Description can't be null");
		} else if (MAX_DESCRIPTION_LENGTH < description.length) {
			errorMessages.push(
				"Description can't be more than " +
				MAX_DESCRIPTION_LENGTH +
				"characters long."
			);
		} else if (description.length < MIN_DESCRIPTION_LENGTH) {
			errorMessages.push(
				"Description can't be less than " +
				MIN_DESCRIPTION_LENGTH +
				" characters long."
			);
		}
		if (image.length == 0) {
			errorMessages.push("You need to select an image.");
		}

		if (errorMessages.length == 0) {
			db.updateProjectByID(
				title,
				description,
				image,
				projectID,
				function (error) {
					if (error) {
						errorMessages.push("Internal Server Error");

						const model = {
							errorMessages,
							title,
							image,
							description,
						};

						response.render("update-project.hbs", model);
					} else {
						response.redirect("/projects");
					}
				}
			);
		} else {
			if (request.session.isLoggedIn) {
				const projectID = request.params.projectID;

				db.getProjectByID(projectID, function (error, project) {
					const model = {
						errorMessages,
						project,
					};

					response.render("update-project.hbs", model);
				});
			} else {
				response.redirect("/login");
			}
		}
	}
);

router.post("/delete-project/:projectID", function (request, response) {
	const projectID = request.params.projectID;
	const errorMessages = [];

	if (!request.session.isLoggedIn) {
		errorMessages.push("Not logged in.");
	}

	if (errorMessages == 0) {
		db.deleteProjectByID(projectID, function (error) {
			if (error) {
				errorMessages.push("Internal Server Error");
				response.redirect("/login");
			} else {
				response.redirect("/projects");
			}
		});
	} else {
		response.redirect("/login");
	}
});

module.exports = router;
