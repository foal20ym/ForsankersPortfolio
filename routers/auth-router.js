const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const ADMIN_USERNAME = "Admin";
const ADMIN_PASSOWRD = "$2b$10$/IeXPX4k5RycJVc99LyHbeWxILuihI4QjpPgzNg8foobgydYWJd82"; // Forsankerportfoliopassword77

router.get("/login", function (request, response) {
	response.render("login.hbs");
});

router.post("/login", function (request, response) {
	const username = request.body.username;
	const errorMessages = [];

	bcrypt.genSalt(saltRounds, function (err, salt) {
		bcrypt.hash(ADMIN_PASSOWRD, salt, function (err, hash) {
			bcrypt.compare(ADMIN_PASSOWRD, hash, function (err, result) {
				if (username == ADMIN_USERNAME && result) {
					request.session.isLoggedIn = true;

					response.redirect("/");
				} else {
					errorMessages.push("Wrong login credentials!");

					const model = {
						errorMessages,
					};

					response.render("login.hbs", model);
				}
			});
		});
	});
});

router.post("/logout", function (request, response) {
  request.session.isLoggedIn = false;
  response.redirect("/");
});

module.exports = router;
