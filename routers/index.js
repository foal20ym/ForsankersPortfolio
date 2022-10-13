const express = require("express");
const mainRouter = express.Router();

mainRouter.get("/", function (request, response) {
	const model = {
		session: request.session,
	};

	response.render("home.hbs", model);
});

mainRouter.get("/about", function (request, response) {
	response.render("about.hbs");
});

mainRouter.use(require("./project-router"));
mainRouter.use(require("./comment-router"));
mainRouter.use(require("./question-router"));
mainRouter.use(require("./auth-router"));

mainRouter.use(function (req, res, next) {
	res.send("404");
});

module.exports = mainRouter;
