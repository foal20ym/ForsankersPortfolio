const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3");
const db = require("../db.js");
const MAX_QUESTION_LENGTH = 255;
const MIN_QUESTION_LENGTH = 5;
const MAX_ANSWER_LENGTH = 255;
const MIN_ANSWER_LENGTH = 5;

router.get("/contact/:pagesArray", function (request, response) {
	const currentPageNumber = request.params.pagesArray;
	const constQuestionsPerPage = 2;
	const relativeOffset = (currentPageNumber - 1) * constQuestionsPerPage;
	const errorMessages = [];

	db.getCountQuery(function (countQueryError, queryCountResult) {
		if (countQueryError) {
			errorMessages.push("countQueryError");

			const model = {
				errorMessages,
			};

			response.render("contact.hbs", model);
		} else {
			db.getQuestionsByPagenumber(
				constQuestionsPerPage,
				relativeOffset,
				function (showQuestionsError, questions) {
					if (showQuestionsError) {
						errorMessages.push("showQuestionsError");

						const model = {
							errorMessages,
						};

						response.render("contact.hbs", model);
					} else {
						const pagesArray = [];
						const numberOfPages = Math.ceil(
							queryCountResult.queryCountResult / constQuestionsPerPage
						);

						for (let i = 1; i <= numberOfPages; i += 1) {
							pagesArray.push(i);
						}

						const model = {
							questions,
							currentPageNumber,
							pagesArray,
						};

						response.render("contact.hbs", model);
					}
				}
			);
		}
	});
});

router.get("/add-question", function (request, response) {
	response.render("add-question.hbs");
});

router.post("/add-question", function (request, response) {
	const name = request.body.name;
	const email = request.body.email;
	const question = request.body.question;
	const answer = request.body.answer;
	const errorMessages = [];
	const date = new Date();
	date.toISOString().split("T")[0];

	if (name.length == 0) {
		errorMessages.push("Name can't be null");
	}
	if (email.length == 0) {
		errorMessages.push("Email can't be null");
	}
	if (question.length == 0) {
		errorMessages.push("Question can't be null");
	} else if (question.length < MIN_QUESTION_LENGTH) {
		errorMessages.push(
			"Question can't be less than " + MIN_QUESTION_LENGTH + " characters long."
		);
	} else if (MAX_QUESTION_LENGTH < question.length) {
		errorMessages.push(
			"Question can't be more than " + MAX_QUESTION_LENGTH + " characters long."
		);
	}

	if (errorMessages.length == 0) {
		db.addQuestion(name, email, question, answer, date, function (error) {
			if (error) {
				errorMessages.push("Internal server error");

				const model = {
					errorMessages,
					name,
					email,
					question,
					answer,
					date,
				};

				response.render("add-question.hbs", model);
			} else {
				response.redirect("/contact/1");
			}
		});
	} else {
		const model = {
			errorMessages,
			name,
			email,
			question,
			answer,
			date,
		};

		response.render("add-question.hbs", model);
	}
});

router.get("/manage-question/:questionID", function (request, response) {
	if (request.session.isLoggedIn) {
		const model = {
			question: {
				questionID: request.params.questionID,
			},
		};
		response.render("manage-question.hbs", model);
	} else {
		response.redirect("/login");
	}
});

router.get("/answer-question/:questionID", function (request, response) {
	const errorMessages = [];
	if (request.session.isLoggedIn) {
		const questionID = request.params.questionID;

		db.getUpdateQuestionPage(questionID, function (error, question) {
			if (error) {
				errorMessages.push("Internal Server Error");

				const model = {
					errorMessages,
					question,
				};

				response.render("answer-question.hbs", model);
			} else {
				const model = {
					question,
				};

				response.render("answer-question.hbs", model);
			}
		});
	} else {
		response.redirect("/login");
	}
});

router.post("/answer-question/:questionID", function (request, response) {
	const questionID = request.params.questionID;
	const answer = request.body.answer;
	const errorMessages = [];

	if (!request.session.isLoggedIn) {
		errorMessages.push("Not logged in.");
	}
	if (answer.length == 0) {
		errorMessages.push("Answer can't be null");
	} else if (answer.length < MIN_ANSWER_LENGTH) {
		errorMessages.push(
			"Answer can't be less than " + MIN_ANSWER_LENGTH + " characters long."
		);
	} else if (MAX_ANSWER_LENGTH < answer.length) {
		errorMessages.push(
			"Answer can't be more than " + MAX_ANSWER_LENGTH + " characters long."
		);
	}

	if (errorMessages.length == 0) {
		db.answerQuestionPage(questionID, answer, function (error) {
			if (error) {
				errorMessages.push("Internal Server Error");

				const model = {
					errorMessages,
					answer,
				};

				response.render("answer-question.hbs", model);
			} else {
				response.redirect("/contact/1");
			}
		});
	} else {
		if (request.session.isLoggedIn) {
			const questionID = request.params.questionID;

			db.answerQuestionPage(questionID, function (error, question) {
				const model = {
					errorMessages,
					question,
				};

				response.render("answer-question.hbs", model);
			});
		} else {
			response.redirect("/login");
		}
	}
});

router.get("/update-question/:questionID", function (request, response) {
	const errorMessages = [];
	if (request.session.isLoggedIn) {
		const questionID = request.params.questionID;

		db.getUpdateQuestionPage(questionID, function (error, question) {
			if (error) {
				errorMessages.push("Internal Server Error");
				const model = {
					errorMessages,
					question,
				};

				response.render("update-question.hbs", model);
			} else {
				const model = {
					question,
				};

				response.render("update-question.hbs", model);
			}
		});
	} else {
		response.redirect("/login");
	}
});

router.post("/update-question/:questionID", function (request, response) {
	const questionID = request.params.questionID;
	const name = request.body.name;
	const email = request.body.email;
	const question = request.body.question;
	const answer = request.body.answer;
	const errorMessages = [];

	if (!request.session.isLoggedIn) {
		errorMessages.push("Not logged in.");
	}
	if (name.length == 0) {
		errorMessages.push("Name can't be null");
	}
	if (email.length == 0) {
		errorMessages.push("Email can't be null");
	}
	if (question.length == 0) {
		errorMessages.push("Answer can't be null");
	} else if (question.length < MIN_QUESTION_LENGTH) {
		errorMessages.push(
			"Question can't be less than " + MIN_QUESTION_LENGTH + " characters long."
		);
	} else if (MAX_QUESTION_LENGTH < question.length) {
		errorMessages.push(
			"Question can't be more than " + MAX_QUESTION_LENGTH + " characters long."
		);
	}

	if (errorMessages.length == 0) {
		db.updateQuestion(name, email, question, questionID, function (error) {
			if (error) {
				errorMessages.push("Internal Server Error");

				const model = {
					errorMessages,
					name,
					email,
					question,
					answer,
					date,
				};

				response.render("update-question.hbs", model);
			} else {
				response.redirect("/contact/1");
			}
		});
	} else {
		if (request.session.isLoggedIn) {
			const questionID = request.params.questionID;

			db.getUpdateQuestionPage(questionID, function (error, question) {
				const model = {
					errorMessages,
					question,
				};

				response.render("update-question.hbs", model);
			});
		} else {
			response.redirect("/login");
		}
	}
});

router.post("/delete-question/:questionID", function (request, response) {
	const questionID = request.params.questionID;
	const errorMessages = [];

	if (!request.session.isLoggedIn) {
		errorMessages.push("Not logged in.");
	}

	if (errorMessages == 0) {
		db.deleteQuestion(questionID, function (error) {
			if (error) {
				errorMessages.push("Internal Server Error");
				response.redirect("/login");
			} else {
				response.redirect("/contact/1");
			}
		});
	} else {
		response.redirect("/");
	}
});

router.get("/update-answer/:questionID", function (request, response) {
	const errorMessages = [];
	if (request.session.isLoggedIn) {
		const questionID = request.params.questionID;

		db.getUpdateAnswerPage(questionID, function (error, question) {
			if (error) {
				errorMessages.push("Internal Server Error");
				const model = {
					errorMessages,
					question,
				};

				response.render("update-answer.hbs", model);
			} else {
				const model = {
					question,
				};

				response.render("update-answer.hbs", model);
			}
		});
	} else {
		response.redirect("/login");
	}
});

router.post("/update-answer/:questionID", function (request, response) {
	const questionID = request.params.questionID;
	const answer = request.body.answer;
	const errorMessages = [];

	if (!request.session.isLoggedIn) {
		errorMessages.push("Not logged in.");
	}
	if (answer.length == 0) {
		errorMessages.push("Answer can't be null");
	} else if (answer.length < MIN_ANSWER_LENGTH) {
		errorMessages.push(
			"Answer can't be less than " + MIN_ANSWER_LENGTH + " characters long."
		);
	} else if (MAX_ANSWER_LENGTH < answer.length) {
		errorMessages.push(
			"Answer can't be more than " + MAX_ANSWER_LENGTH + " characters long."
		);
	}

	if (errorMessages.length == 0) {
		db.updateAnswer(answer, questionID, function (error) {
			if (error) {
				errorMessages.push("Internal Server Error");

				const model = {
					errorMessages,
					answer,
				};

				response.render("update-answer.hbs", model);
			} else {
				response.redirect("/contact/1");
			}
		});
	} else {
		if (request.session.isLoggedIn) {
			const questionID = request.params.questionID;

			db.getUpdateAnswerPage(questionID, function (error, question) {
				const model = {
					errorMessages,
					question,
				};

				response.render("update-answer.hbs", model);
			});
		} else {
			response.redirect("/login");
		}
	}
});

router.post("/delete-answer/:questionID", function (request, response) {
	const questionID = request.params.questionID;
	const answer = null;
	const errorMessages = [];

	if (!request.session.isLoggedIn) {
		errorMessages.push("Not logged in.");
	}

	if (errorMessages == 0) {
		db.deleteAnswer(answer, questionID, function (error) {
			if (error) {
				errorMessages.push("Internal Server Error");
				response.redirect("/login");
			} else {
				response.redirect("/contact/1");
			}
		});
	} else {
		response.redirect("/");
	}
});

router.get("/search", function (request, response) {
	const search = request.query.query;

	const errorMessages = [];
	const value = [search];
	let resultsExist = false;

	if (search.length == 0) {
		errorMessages.push("Your search cannot be null or empty");
	}

	if (errorMessages.length == 0) {
		db.projectsSearchQuery(value, function (projectsError, projectsResults) {
			if (projectsError) {
				errorMessages.push("Projects Query Error");

				const model = {
					errorMessages,
				};

				response.render("search.hbs", model);
			} else {
				db.questionsSearchQuery(
					value,
					function (questionsError, questionsResults) {
						if (questionsError) {
							errorMessages.push("Questions Query Error");

							const model = {
								errorMessages,
							};

							response.render("search.hbs", model);
						} else {
							db.commentsSearchQuery(
								value,
								function (commentsError, commentsResults) {
									if (commentsError) {
										errorMessages.push("Comments Query Error");

										const model = {
											errorMessages,
										};
										response.render("search.hbs", model);
									} else {
										if (
											projectsResults.length ||
											questionsResults.length ||
											commentsResults.length
										) {
											resultsExist = true;
										}

										const model = {
											errorMessages,
											projectsResults,
											questionsResults,
											commentsResults,
											resultsExist,
										};
										response.render("search.hbs", model);
									}
								}
							);
						}
					}
				);
			}
		});
	} else {
		const model = {
			errorMessages,
		};

		response.render("search.hbs", model);
	}
});

module.exports = router;
