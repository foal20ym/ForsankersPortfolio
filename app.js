const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require('path')
const sqlite3 = require('sqlite3')
const expressSession = require('express-session')
const SQLiteStore = require('connect-sqlite3')(expressSession)

// Encryption 
const bcrypt = require('bcrypt')
const saltRounds = 10
const ADMIN_USERNAME = 'Alice'
const ADMIN_PASSOWRD = '$2b$10$VasTmOYbHU9agU4.0XwS8uRnxnNqo/R8Z5OZy2UxSsYEUxEQ848Ga'
// abc123
// Hasha detta, sen ta bort det som står nu (abc123) och ersätt 
// det med det hadhade som står i console.log(hash)

const MAX_TITLE_LENGTH = 40
const MIN_TITLE_LENGTH = 6
const MAX_DESCRIPTION_LENTGH = 255
const MIN_DESCRIPTION_LENTGH = 6

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


const multer = require('multer')
const { response } = require('express')
const { request } = require('http')
const { nextTick } = require('process')
const session = require('express-session')
const { Store } = require('express-session')


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
        secret: 'yhvsbodiuv',
        store: new SQLiteStore()
    })

)

app.use(function (request, response, next) {

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

    const query = `SELECT * FROM questions`

    db.all(query, function (error, questions) { // this is asyncronius

        const errorMessages = []

        if (error) {

            errorMessages.push('Internal server error')

        }

        const model = {
            errorMessages,
            questions
        }

        response.render('contact.hbs', model)

    })

})

app.get('/add-question', function (request, response) {

    response.render('add-question.hbs')

})

app.post('/add-question', function (request, response) {

    const name = request.body.name
    const email = request.body.email
    const question = request.body.question
    const answer = request.body.answer
    const errorMessages = []

    const date = new Date()
    date.toISOString().split('T')[0]

    const query = `INSERT INTO questions (name, email, question, answer, date) VALUES (?, ?, ?, ?, ?)`

    const values = [name, email, question, answer, date.toISOString().split('T')[0]]

    db.run(query, values, function (error) {

        if (error) {

            errorMessages.push('Internal Server Error')
            response.redirect('/')

        }

        else {

            response.redirect('/contact')

        }

    })

})

app.get('/manage-question/:questionID', function (request, response) {

    if (request.session.isLoggedIn) {
        const model = {

            question: {
                questionID: request.params.questionID
            }

        }

        response.render('manage-question.hbs', model)

    } else {

        response.redirect('/login')

    }


})

app.get('/answer-question/:questionID', function (request, response) {

    if (request.session.isLoggedIn) {
        const questionID = request.params.questionID

        const query = `SELECT * FROM questions WHERE questionID = ?`
        const values = [questionID]

        db.get(query, values, function (error, question) {

            const model = {
                question,
            }

            response.render('answer-question.hbs', model)

        })

    } else {

        response.redirect('/login')

    }

})

app.post('/answer-question/:questionID', function (request, response) {

    const questionID = request.params.questionID
    const name = request.body.name
    const email = request.body.email
    const question = request.body.question
    const answer = request.body.answer
    const errorMessages = []

    const date = new Date()
    date.toISOString().split('T')[0]

    if (!request.session.isLoggedIn) {
        errorMessages.push('Not logged in.')
    }

    if (errorMessages.length == 0) {

        const query =
            `UPDATE questions SET (answer) = (?) WHERE questionID = ?`

        const values = [answer, questionID]

        db.run(query, values, function (error) {

            if (error) {

                errorMessages.push('Internal Server Error')

                const model = {
                    errorMessages,
                    name,
                    email,
                    question,
                    answer,
                    date
                }

                response.render('answer-question.hbs', model)

            } else {

                response.redirect('/contact')

            }

        })

    } else {

        const model = {
            errorMessages,
            name,
            email,
            question,
            answer,
            date
        }

        response.render('answer-question.hbs', model)

    }

})

app.get('/update-question/:questionID', function (request, response) {

    if (request.session.isLoggedIn) {
        const questionID = request.params.questionID

        const query = `SELECT * FROM questions WHERE questionID = ?`
        const values = [questionID]

        db.get(query, values, function (error, question) {

            const model = {
                question,
            }

            response.render('update-question.hbs', model)

        })

    } else {

        response.redirect('/login')

    }

})

app.post('/update-question/:questionID', function (request, response) {

    const questionID = request.params.questionID
    const name = request.body.name
    const email = request.body.email
    const question = request.body.question
    const answer = request.body.answer
    const errorMessages = []

    const date = new Date()
    date.toISOString().split('T')[0]

    if (!request.session.isLoggedIn) {
        errorMessages.push('Not logged in.')
    }

    if (errorMessages.length == 0) {

        const query =
            `UPDATE questions SET (name, email, question, date) = (?,?,?,?) WHERE questionID = ?`

        const values = [name, email, question, date.toISOString().split('T')[0], questionID]

        db.run(query, values, function (error) {

            if (error) {

                errorMessages.push('Internal Server Error')

                const model = {
                    errorMessages,
                    name,
                    email,
                    question,
                    answer,
                    date
                }

                response.render('update-question.hbs', model)

            } else {

                response.redirect('/contact')

            }

        })

    } else {

        const model = {
            errorMessages,
            name,
            email,
            question,
            answer,
            date
        }

        response.render('update-question.hbs', model)

    }

})

app.post('/delete-question/:questionID', function (request, response) {

    const questionID = request.params.questionID
    const errorMessages = []

    if (!request.session.isLoggedIn) {
        errorMessages.push('Not logged in.')
    }

    if (errorMessages == 0) {

        const query =
            `DELETE FROM questions WHERE questionID = ?`
        const values = [questionID]

        db.run(query, values, function (error) {

            if (error) {
                errorMessages.push('Internal Server Error')
                response.redirect('/login')
            }

            else {
                response.redirect('/contact')
            }

        })

    }

    else {
        response.redirect('/')
    }

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
            errorMessages.push('Internal server error')
        }

        const model = {
            errorMessages,
            projects
        }

        response.render('projects.hbs', model)

    })

})

// renders the specific project the user clicks on
app.get('/projects/:projectID', function (request, response) {

    const projectID = request.params.projectID
    const errorMessages = []

    const projectQuery = `SELECT * FROM projects WHERE projectID = ?`
    const projectValues = [projectID]

    const commentQuery = `SELECT * FROM comments WHERE projectID = ?`
    const commentValues = [projectID]


    db.get(projectQuery, projectValues, function (projectError, project) {

        if (projectError) {

            errorMessages.push('projectError')

            const model = {
                errorMessages,
                project,
                projectID
            }

            response.render('project.hbs', model)

        }
        else {
            db.all(commentQuery, commentValues, function (commentError, comments) {
                if (commentError) {

                    errorMessages.push('commentError')
                    const model = {
                        errorMessages,
                        comments,
                        projectID
                    }

                    response.render('project.hbs', model)
                }

                else {
                    const model = {
                        errorMessages,
                        project,
                        comments,
                        projectID
                    }

                    response.render('project.hbs', model)
                }
            })
        }
    })

})

// renders the Add Project page
app.get('/add-project', function (request, response) {

    if (request.session.isLoggedIn) {

        response.render('add-project.hbs')

    } else {

        response.redirect('/login')

    }

})

// posts projects to the Add Projects page.
app.post('/add-project', upload.single('image'), function (request, response) {

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
        errorMessages.push('Not logged in.')
    }

    if (errorMessages.length == 0) {

        const query =
            `INSERT INTO  projects (title, description, image) VALUES (?, ?, ?)`

        const values = [title, description, image]

        db.run(query, values, function (error) {

            if (error) {

                errorMessages.push('Internal server error')

                const model = {
                    errorMessages,
                    title,
                    description,
                    image
                }

                response.render('add-project.hbs', model)
            }

            else {

                response.redirect('/projects')

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


app.get('/update-project/:projectID', function (request, response) {

    if (request.session.isLoggedIn) {
        const projectID = request.params.projectID

        const query =
            `SELECT * FROM projects WHERE projectID = ?`
        const values = [projectID]

        db.get(query, values, function (error, project) {

            const model = {
                project,
            }

            response.render('update-project.hbs', model)

        })

    } else {

        response.redirect('/login')

    }

})


// Updates the info && takes the user back to the project page
app.post('/update-project/:projectID', function (request, response) {

    // UPDATE projects SET (title, description, image) = ('Taxi Service app', 'The app was made for the company Lyft. I was very inexperienced as a developer at the time and i did learn a lot of new technologies and skills such as Java and React.','app2unsplash.jpg') WHERE id = 2

    const projectID = request.params.projectID
    const title = request.body.title
    const description = request.body.description
    const errorMessages = []

    if (!request.session.isLoggedIn) {
        errorMessages.push('Not logged in.')
    }

    if (errorMessages.length == 0) {

        const query =
            `UPDATE projects SET (title, description) = (?, ?) WHERE projectID = ?`

        const values = [title, description, projectID]

        db.run(query, values, function (error) {

            if (error) {

                errorMessages.push('Internal Server Error')

                const model = {
                    errorMessages,
                    title,
                    description
                }

                response.render('update-project.hbs', model)

            } else {

                response.redirect('/projects')

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


app.post('/delete-project/:projectID', function (request, response) {

    const projectID = request.params.projectID
    const errorMessages = []

    if (!request.session.isLoggedIn) {
        errorMessages.push('Not logged in.')
    }

    if (errorMessages == 0) {

        const query =
            `DELETE FROM projects WHERE projectID = ?`
        const values = [projectID]

        db.run(query, values, function (error) {

            if (error) {
                errorMessages.push('Internal Server Error')
                response.redirect('/login')
            }

            else {
                response.redirect('/projects')
            }

        })

    }

    else {
        response.redirect('/login')
    }

})

app.get('/add-comment/:projectID', function (request, response) {

    const model = {
        project: {
            projectID: request.params.projectID
        }
    }
    response.render('add-comment.hbs', model)

})

app.post('/add-comment/:projectID', function (request, response) {


    const comment = request.body.comment
    const projectID = request.params.projectID
    const errorMessages = []

    const query =
        `INSERT INTO comments (comment,projectID) VALUES (?,?)`

    const values = [comment, projectID]

    db.run(query, values, function (error) {

        if (error) {

            errorMessages.push('Internal server error')

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

app.get('/manage-comment/:commentID', function (request, response) {

    if (request.session.isLoggedIn) {
        const model = {
            comment: {
                commentID: request.params.commentID
            }
        }

        response.render('manage-comment.hbs', model)

    } else {

        response.redirect('/login')

    }

})

app.get('/update-comment/:commentID', function (request, response) {

    if (request.session.isLoggedIn) {
        const commentID = request.params.commentID

        const query =
            `SELECT * FROM comments WHERE commentID = ?`
        const values = [commentID]

        db.get(query, values, function (error, comment) {

            const model = {
                comment,
            }

            response.render('update-comment.hbs', model)

        })

    } else {

        response.redirect('/login')

    }

})

app.post('/update-comment/:commentID', function (request, response) {

    const commentID = request.params.commentID
    const comment = request.body.comment
    const errorMessages = []

    if (!request.session.isLoggedIn) {
        errorMessages.push('Not logged in.')
    }

    if (errorMessages.length == 0) {

        const query =
            `UPDATE comments SET (comment) = (?) WHERE commentID = ?`

        const values = [comment, commentID]

        db.run(query, values, function (error) {

            if (error) {

                errorMessages.push('Internal Server Error')

                const model = {
                    errorMessages,
                    comment
                }

                response.render('update-comment.hbs', model)

            } else {

                response.redirect('/projects')

            }

        })

    } else {

        const model = {
            errorMessages,
            comment
        }

        response.render('update-comment.hbs', model)

    }

})

app.post('/delete-comment/:commentID', function (request, response) {

    const commentID = request.params.commentID
    const errorMessages = []

    if (!request.session.isLoggedIn) {
        errorMessages.push('Not logged in.')
    }

    if (errorMessages == 0) {

        const query =
            `DELETE FROM comments WHERE commentID = ?`
        const values = [commentID]

        db.run(query, values, function (error) {

            if (error) {
                errorMessages.push('Internal Server Error')
                response.redirect('/login')
            }

            else {
                response.redirect('/projects')
            }

        })

    }

    else {
        response.redirect('/')
    }

})

app.get('/login', function (request, response) {

    response.render('login.hbs')

})

app.post('/login', function (request, response) {
    const username = request.body.username
    //const password = request.body.password

    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(ADMIN_PASSOWRD, salt, function (err, hash) {
            console.log("HASH")
            console.log("PASSWORD: " + ADMIN_PASSOWRD)
            console.log("Salt: "+ salt)
            console.log("Hash: "+ hash)

            bcrypt.compare(ADMIN_PASSOWRD, hash, function (err, result) {
                console.log("COMPARE")
                console.log("PASSWORD: " + ADMIN_PASSOWRD )
                console.log("Result: "+result)

                if (username == ADMIN_USERNAME && (result)) {

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
        })
    })

})

app.post('/logout', function (request, response) {

    request.session.isLoggedIn = false
    response.redirect('/')

})


app.listen(3000)

