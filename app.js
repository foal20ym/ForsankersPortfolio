const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
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

const app = express();

app.use(express.static("public"));

app.engine(
	"hbs",
	expressHandlebars.engine({
		extname: "hbs",
		defaultLayout: "main",
		partialsDir: __dirname + "/views/partials",
	})
);

app.use(express.static("public"));

app.use(
	bodyParser.urlencoded({
		extended: false,
	})
);

app.use(
	expressSession({
		saveUninitialized: false,
		resave: false,
		secret: "yhvsbodiuv",
		store: new SQLiteStore(),
	})
);

app.use(function (request, response, next) {
	const isLoggedIn = request.session.isLoggedIn;

	response.locals.isLoggedIn = isLoggedIn;

	next();
});

app.use(require("./routers"));

app.listen(8080);
