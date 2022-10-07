const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const sqlite3 = require('sqlite3')
const expressSession = require('express-session')
const SQLiteStore = require('connect-sqlite3')(expressSession)
const db = new sqlite3.Database('portfolio-database.db')

db.run(`
    CREATE TABLE IF NOT EXISTS projects (
        projectID INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        image TEXT
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS questions (
        questionID INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        question TEXT,
        answer TEXT,
        date TEXT
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS comments (
        commentID INTEGER PRIMARY KEY AUTOINCREMENT,
        comment TEXT,
        projectID INTEGER,
        FOREIGN KEY(projectID) REFERENCES projects (projectID)
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS searches (
        searchID INTEGER PRIMARY KEY AUTOINCREMENT,
        search TEXT
    )
`)


const storage = multer.diskStorage({

    destination: (request, file, cb) => {
        cb(null, 'public')
    },
    filename: (request, file, cb) => {
        const fileName = Date.now() + path.extname(file.originalname)
        request.filePath = fileName // create a new key in request object
        cb(null, fileName)
    }
})

const upload = multer({ storage: storage })

const app = express()

app.use(express.static('public'))

app.engine('hbs', expressHandlebars.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    partialsDir: __dirname + '/views/partials'

}))

app.use(express.static('public'))

app.use(bodyParser.urlencoded({

    extended: false

}))

app.use(

    expressSession({
        saveUninitialized: false,
        resave: false,
        secret: 'yhvsbodiuv',
        store: new SQLiteStore()
    })

)

app.use(function (request, response, next) {

    const isLoggedIn = request.session.isLoggedIn

    response.locals.isLoggedIn = isLoggedIn

    next()

})

app.use(require('./routers'))


app.listen(8080)
/*
[nodemon] 2.0.19
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node app.js`
node:events:491
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (node:net:1432:16)
    at listenInCluster (node:net:1480:12)
    at Server.listen (node:net:1568:7)
    at Function.listen (/Users/alexanderforsanker/ptest/project_test/node_modules/express/lib/application.js:635:24)
    at Object.<anonymous> (/Users/alexanderforsanker/ptest/project_test/app.js:105:5)
    at Module._compile (node:internal/modules/cjs/loader:1126:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1180:10)
    at Module.load (node:internal/modules/cjs/loader:1004:32)
    at Function.Module._load (node:internal/modules/cjs/loader:839:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
Emitted 'error' event on Server instance at:
    at emitErrorNT (node:net:1459:8)
    at processTicksAndRejections (node:internal/process/task_queues:83:21) {
  code: 'EADDRINUSE',
  errno: -48,
  syscall: 'listen',
  address: '::',
  port: 3000
}
[nodemon] app crashed - waiting for file changes before starting...
*/

