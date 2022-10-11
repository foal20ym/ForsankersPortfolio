const express = require("express");
const sqlite3 = require("sqlite3");
const expressSession = require("express-session");
const SQLiteStore = require("connect-sqlite3")(expressSession);
const db = new sqlite3.Database("portfolio-database.db");

db.run(`
    CREATE TABLE IF NOT EXISTS projects (
        projectID INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        image TEXT
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS questions (
        questionID INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        question TEXT,
        answer TEXT,
        date TEXT
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS comments (
        commentID INTEGER PRIMARY KEY AUTOINCREMENT,
        comment TEXT,
        projectID INTEGER,
        FOREIGN KEY(projectID) REFERENCES projects (projectID)
    )
`);

exports.addCommentToProject = function (comment, projectID, callback) {
	const query = `INSERT INTO comments (comment,projectID) VALUES (?,?)`;
	const values = [comment, projectID];

	db.run(query, values, function (error) {
		callback(error);
	});
};

exports.getCommentByID = function (commentID, callback) {
	const query = `SELECT * FROM comments WHERE commentID = ?`;
	const values = [commentID];

	db.get(query, values, function (error, comment) {
		callback(error, comment);
	});
};

exports.updateCommentByID = function (comment, commentID, callback) {
	const query = `UPDATE comments SET (comment) = (?) WHERE commentID = ?`;
	const values = [comment, commentID];

	db.run(query, values, function (error) {
		callback(error);
	});
};

exports.deleteCommentByID = function (commentID, callback) {
	const query = `DELETE FROM comments WHERE commentID = ?`;
	const values = [commentID];

	db.run(query, values, function (error) {
		callback(error);
	});
};

exports.getAllProjects = function (callback) {
	const query = `SELECT * FROM projects`;

	db.all(query, function (error, projects) {
		callback(error, projects);
	});
};

exports.getProjectByID = function (projectID, callback) {
	const projectQuery = `SELECT * FROM projects WHERE projectID = ?`;
	const projectValues = [projectID];

	db.get(projectQuery, projectValues, function (projectError, project) {
		callback(projectError, project);
	});
};

exports.getAllCommentsForProjectByID = function (projectID, callback) {
	const commentQuery = `SELECT * FROM comments WHERE projectID = ?`;
	const commentValues = [projectID];

	db.all(commentQuery, commentValues, function (commentError, comments) {
		callback(commentError, comments);
	});
};

exports.addProject = function (title, description, image, callback) {
	const query = `INSERT INTO  projects (title, description, image) VALUES (?, ?, ?)`;
	const values = [title, description, image];

	db.run(query, values, function (error) {
		callback(error);
	});
};

exports.updateProjectByID = function (
	title,
	description,
	image,
	projectID,
	callback
) {
	const query = `UPDATE projects SET (title, description, image) = (?, ?, ?) WHERE projectID = ?`;
	const values = [title, description, image, projectID];

	db.run(query, values, function (error) {
		callback(error);
	});
};

exports.deleteProjectByID = function (projectID, callback) {
	const query = `DELETE FROM projects WHERE projectID = ?`;
	const values = [projectID];

	db.run(query, values, function (error) {
		callback(error);
	});
};

exports.getCountQuery = function (callback) {
	const countQuestionsQuery = `SELECT COUNT(*) AS queryCountResult FROM questions`;

	db.get(countQuestionsQuery, function (countQueryError, queryCountResult) {
		callback(countQueryError, queryCountResult);
	});
};

exports.getQuestionsByPagenumber = function (
	constQuestionsPerPage,
	relativeOffset,
	callback
) {
	const showSpecificQuestionsQuery = `SELECT * FROM questions ORDER BY (date) ASC LIMIT "${constQuestionsPerPage}" OFFSET "${relativeOffset}"`;

	db.all(showSpecificQuestionsQuery, function (showQuestionsError, questions) {
		callback(showQuestionsError, questions);
	});
};

exports.addQuestion = function (name, email, question, answer, date, callback) {
	const query = `INSERT INTO questions (name, email, question, answer, date) VALUES (?, ?, ?, ?, ?)`;
	const values = [
		name,
		email,
		question,
		answer,
		date.toISOString().split("T")[0],
	];

	db.run(query, values, function (error) {
		callback(error);
	});
};

exports.getUpdateQuestionPage = function (questionID, callback) {
	const query = `SELECT * FROM questions WHERE questionID = ?`;
	const values = [questionID];

	db.get(query, values, function (error, question) {
		callback(error, question);
	});
};

exports.answerQuestionPage = function (questionID, answer, callback) {
	const query = `UPDATE questions SET (answer) = (?) WHERE questionID = ?`;
	const values = [answer, questionID];

	db.run(query, values, function (error) {
		callback(error);
	});
};

exports.updateQuestion = function (
	name,
	email,
	question,
	questionID,
	callback
) {
	const query = `UPDATE questions SET (name, email, question) = (?,?,?) WHERE questionID = ?`;
	const values = [name, email, question, questionID];

	db.run(query, values, function (error) {
		callback(error);
	});
};

exports.deleteQuestion = function (questionID, callback) {
	const query = `DELETE FROM questions WHERE questionID = ?`;
	const values = [questionID];

	db.run(query, values, function (error) {
		callback(error);
	});
};

exports.getUpdateAnswerPage = function (questionID, callback) {
	const query = `SELECT answer FROM questions WHERE questionID = ?`;
	const values = [questionID];

	db.get(query, values, function (error, question) {
		callback(error, question);
	});
};

exports.updateAnswer = function (answer, questionID, callback) {
	const query = `UPDATE questions SET (answer) = (?) WHERE questionID = ?`;
	const values = [answer, questionID];

	db.run(query, values, function (error) {
		callback(error);
	});
};

exports.deleteAnswer = function (answer, questionID, callback) {
	const query = `UPDATE questions SET (answer) = (?) WHERE questionID = ?`;
	const values = [answer, questionID];

	db.run(query, values, function (error) {
		callback(error);
	});
};

exports.projectsSearchQuery = function (value, callback) {
	const projectsQuery = `SELECT * FROM projects WHERE title LIKE '%' || ? || '%'`;

	db.all(projectsQuery, value, function (projectsError, projectsResults) {
		callback(projectsError, projectsResults);
	});
};

exports.questionsSearchQuery = function (value, callback) {
	const questionsQuery = `SELECT * FROM questions WHERE question LIKE '%' || ? || '%'`;

	db.all(questionsQuery, value, function (questionsError, questionsResults) {
		callback(questionsError, questionsResults);
	});
};

exports.commentsSearchQuery = function (value, callback) {
	const commentsQuery = `SELECT * FROM comments WHERE comment LIKE '%' || ? || '%'`;

	db.all(commentsQuery, value, function (commentsError, commentsResults) {
		callback(commentsError, commentsResults);
	});
};
