const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require('path')
const sqlite3 = require('sqlite3')
const expressSession = require('express-session')

const MAX_TITLE_LENGTH = 40
const MIN_TITLE_LENGTH = 6
const MAX_DESCRIPTION_LENTGH = 255
const MIN_DESCRIPTION_LENTGH = 6
const ADMIN_USERNAME = "Alice"
const ADMIN_PASSOWRD = "abc123"


const db = new sqlite3.Database("portfolio-database.db")

db.run(`
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        image TEXT
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        message TEXT
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS comments (
        cID INTEGER PRIMARY KEY AUTOINCREMENT,
        comment TEXT,
        id INTEGER,
        FOREIGN KEY(id) REFERENCES projects (id)
    )
`)


const multer = require("multer")
const { response } = require('express')
const { request } = require('http')
const { nextTick } = require('process')
const storage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, "public")
    },
    filename: (request, file, cb) => {
        const fileName = Date.now() + path.extname(file.originalname)
        request.filePath = fileName // create a new key in request object
        cb(null, fileName)
    }
})

const upload = multer({ storage: storage })

//const projectRouter = require('./routers/project-router')
// app.use(projectRouter)
//app.use('/projects', projectRouter)

const app = express()

app.use(express.static('public'))

app.engine('hbs', expressHandlebars.engine({
    defaultLayout: 'main.hbs',
}))

app.use(express.static('public'))


// using the bodyParser 
app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(
    expressSession({
        saveUninitialized: false,
        resave: false,
        secret: "yhvsbodiuv"
    })
)

app.use( function(request, response, next){
    const isLoggedIn = request.session.isLoggedIn

    response.locals.isLoggedIn = isLoggedIn

    next()
})

// uses and renders the Home page
app.get('/', function (request, response) {

    const model = {
        session: request.session
    }

    response.render('home.hbs', model)

})


// uses and renders the Contact page
app.get('/contact', function (request, response) {

    response.render('contact.hbs')

})

app.post('/contact', function (request, response) {

    const name = request.body.name
    const email = request.body.email
    const message = request.body.message
    const errorMessages = []

    const query =
        `INSERT INTO messages (name, email, message) VALUES (?, ?, ?)
        `

    const values = [name, email, message]

    db.run(query, values, function (error) {

        if (error) {
            errorMessages.push("Internal Server Error")
        }
        else {
            response.redirect('/contact')
        }
    })

})

// uses and renders the About page
app.get('/about', function (request, response) {

    response.render('about.hbs')

})

// renders the projects page
app.get('/projects', function (request, response) {

    const query = `SELECT * FROM projects`

    db.all(query, function (error, projects) { // this is asyncronius

        const errorMessages = []

        if (error) {
            errorMessages.push("Internal server error")
        }

        const model = {
            errorMessages,
            projects
        }

        response.render('projects.hbs', model)

    })

})

// renders the specific project the user clicks on
app.get("/projects/:id", function (request, response) {

    const id = request.params.id
    const errorMessages = []

    const projectQuery = `SELECT * FROM projects WHERE id = ?`
    const projectValues = [id]

    const commentQuery = `SELECT * FROM comments WHERE id = ?` // project ID
    const commentValues = [id]


    db.get(projectQuery, projectValues, function (projectError, project) {

        if (projectError) {

            errorMessages.push("projectError")

            const model = {
                errorMessages,
                project,
                id
            }

            response.render('project.hbs', model)

        }
        else {
            db.all(commentQuery, commentValues, function (commentError, comments) {
                if (commentError) {

                    errorMessages.push("commentError")
                    const model = {
                        errorMessages,
                        comments,
                        id
                    }

                    response.render('project.hbs', model)
                }

                else {
                    const model = {
                        errorMessages,
                        project,
                        comments,
                        id
                    }

                    response.render('project.hbs', model)
                }
            })
        }
    })

})

// renders the Add Project page
app.get("/add-project", function (request, response) {

    response.render('add-project.hbs')

})

// posts projects to the Add Projects page.
app.post("/add-project", upload.single("image"), function (request, response) {

    const image = request.filePath
    const title = request.body.title
    const description = request.body.description
    const errorMessages = []

    if (title == "") {
        errorMessages.push("Title can't be empty")
    }
    else if (MAX_TITLE_LENGTH < title.length) {
        errorMessages.push("Title can't be more than " + MAX_TITLE_LENGTH + " characters long.")
    }
    else if (title.length < MIN_TITLE_LENGTH) {
        errorMessages.push("Title can't be less than " + MIN_TITLE_LENGTH + " characters long.")
    }

    if (description == "") {
        errorMessages.push("Description can't be empty")
    }
    else if (MAX_DESCRIPTION_LENTGH < description.length) {
        errorMessages.push("Description can't be more than " + MAX_DESCRIPTION_LENTGH + " characters long.")
    }
    else if (description.length < MIN_DESCRIPTION_LENTGH) {
        errorMessages.push("Description can't be less than " + MIN_DESCRIPTION_LENTGH + " characters long.")
    }

    if (!request.session.isLoggedIn) {
        errorMessages.push("Not logged in.")
    }

    if (errorMessages.length == 0) {

        const query =
            `INSERT INTO  projects (title, description, image) VALUES (?, ?, ?)`

        const values = [title, description, image]

        db.run(query, values, function (error) {

            if (error) {

                errorMessages.push("Internal server error")

                const model = {
                    errorMessages,
                    title,
                    description,
                    image
                }

                response.render('add-project.hbs', model)
            }

            else {

                response.redirect("/projects")

            }

        })

    } else {

        const model = {
            errorMessages,
            title,
            description,
            image
        }

        response.render('/add-projects.hbs', model)

    }

})


app.get("/update-project/:id", function (request, response) {

    const id = request.params.id

    const query =
        `SELECT * FROM projects WHERE id = ?`
    const values = [id]

    db.get(query, values, function (error, project) {

        const model = {
            project,
        }

        response.render('update-project.hbs', model)

    })

})

// FIXA DENNA SAMMA SOM ADD-PROJECT
// Updates the info && takes the user back to the project page
app.post("/update-project/:id", function (request, response) {

    // UPDATE projects SET (title, description, image) = ("Taxi Service app", "The app was made for the company Lyft. I was very inexperienced as a developer at the time and i did learn a lot of new technologies and skills such as Java and React.","app2unsplash.jpg") WHERE id = 2

    const id = request.params.id
    const title = request.body.title
    const description = request.body.description
    const errorMessages = []

    if (!request.session.isLoggedIn) {
        errorMessages.push("Not logged in.")
    }

    if (errorMessages.length == 0) {

        const query =
            `UPDATE projects SET (title, description) = (?, ?) WHERE id = ?`

        const values = [title, description, id]

        db.run(query, values, function (error) {

            if (error) {

                errorMessages.push("Internal Server Error")

                const model = {
                    errorMessages,
                    title,
                    description
                }

                response.render('update-project.hbs', model)

            } else {

                response.redirect("/projects")

            }

        })

    } else {

        const model = {
            errorMessages,
            title,
            description
        }

        response.render('update-project.hbs', model)

    }

})


app.post("/delete-project/:id", function (request, response) {

    const id = request.params.id
    const errorMessages = []

    if (!request.session.isLoggedIn) {
        errorMessages.push("Not logged in.")
    }

    if (errorMessages == 0) {

        const query =
            `DELETE FROM projects WHERE id = ?`
        const values = [id]

        db.run(query, values, function (error) {

            if (error) {
                errorMessages.push("Internal Server Error")
                response.redirect("/login")
            }

            else {
                response.redirect("/projects")
            }

        })

    }

    else {
        response.redirect("/login")
    }

})

app.get("/add-comment/:id", function (request, response) {

    const model = {
        project: {
            id: request.params.id
        }
    }
    response.render('add-comment.hbs', model)

})

app.post("/add-comment/:id", function (request, response) {

    const comment = request.body.comment
    const id = request.params.id
    const errorMessages = []

    const query =
        `INSERT INTO comments (comment,id) VALUES (?,?)`

    const values = [comment, id]

    db.run(query, values, function (error) {

        if (error) {

            console.log(error)
            errorMessages.push("Internal server error")

            const model = {
                errorMessages,
                comment
            }

            response.render('login.hbs', model)
        }

        else {

            response.redirect('/projects')

        }

    })

})



app.get("/login", function (reguest, response) {

    response.render('login.hbs')

})

app.post("/login", function (request, response) {
    const username = request.body.username
    const password = request.body.password

    if (username == ADMIN_USERNAME && password == ADMIN_PASSOWRD) {

        request.session.isLoggedIn = true

        response.redirect('/')

    }
    else {

        const model = {
            failedToLogin: true
        }

        response.render('login.hbs', model)

    }

})


app.listen(3000)

