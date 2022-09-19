const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require('path')

const sqlite3 = require('sqlite3')

const db = new sqlite3.Database("portfolio-database.db")

db.run(`
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        image TEXT
    )
`)


const multer = require("multer")
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public")
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + path.extname(file.originalname)
        req.filePath = fileName // create a new key in request object
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

// uses and renders the Home page
app.get('/', function (request, response) {
    response.render('home.hbs')
})

// uses and renders the Contact page
app.get('/contact', function (request, response) {
    response.render('contact.hbs')
})

// uses and renders the About page
app.get('/about', function (request, response) {
    response.render('about.hbs')
})

// renders the projects page
app.get('/projects', function (request, response) {

    const query = `SELECT * FROM projects`

    db.all(query, function (error, projects) { // this is asyncronius

        const model = {
            projects
        }

        response.render('projects.hbs', model)
    })

})

// renders the specific project the user clicks on
app.get("/projects/:id", function (request, response) {

    const id = request.params.id

    const query = `SELECT * FROM projects WHERE id = ?`
    const values = [id]

    db.get(query, values, function (error, project) {

        const model = {
            project,
        }

        response.render('project.hbs', model)

    })

})

// renders the Add Project page
app.get("/addProject", (req, res) => {
    res.render('addProject.hbs')
})

// posts projects to the Add Projects page.
app.post("/addProject", upload.single("image"), (req, res) => {

    const image = req.filePath
    const title = req.body.title
    const description = req.body.description

    const query = `
    INSERT INTO  projects (title, description, image) VALUES (?, ?, ?)
    `

    const values = [title, description, image]

    db.run(query, values, function (error) {
        if (error) console.log
        res.redirect("/projects")

    })

})

app.get("/update-project/:id", function (request, response) {

    const id = request.params.id

    const query = `SELECT * FROM projects WHERE id = ?`
    const values = [id]

    db.get(query, values, function (error, project) {

        const model = {
            project,
        }

        response.render('update-project.hbs', model)

    })
})

// Updates the info && takes the user back to the project page
app.post("/update-project/:id", function (request, response) {

    // UPDATE projects SET (title, description, image) = ("Taxi Service app", "The app was made for the company Lyft. I was very inexperienced as a developer at the time and i did learn a lot of new technologies and skills such as Java and React.","app2unsplash.jpg") WHERE id = 2
    
    const id = request.params.id
    const title = request.body.title
    const description = request.body.description
    // const image = request.filePath

    const query = `
    UPDATE projects SET (title, description) = (?, ?) WHERE id = ?
    `

    const values = [title, description ,id]

    db.run(query, values, function (error) {
        if (error) console.log
        response.redirect("/projects")

    })

})

app.post("/delete-project/:id", function (request, response) {

    const id = request.params.id

    const query = `DELETE FROM projects WHERE id = ?`
    const values = [id]

    db.run(query, values, function (error, project) {
        if (error) console.log
        response.redirect("/projects")
    })

})

app.listen(3000)

