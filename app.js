const express = require('express')
const expressHandlebars = require('express-handlebars')
const data = require('./data.js')
const bodyParser = require('body-parser')
const path = require('path')

const multer = require("multer")
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public")
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})

const projectRouter = require('./routers/project-router')

const app = express()

app.use(express.static('public'))

app.engine('hbs', expressHandlebars.engine({
    defaultLayout: 'main.hbs',
}))

app.use(express.static('public'))

// app.use(projectRouter)
app.use('/projects', projectRouter)

// using the bodyParser 
app.use(bodyParser.urlencoded({
    extended: false
}))

// uses and renders the Home page
app.get('/', function(request, response){
    response.render('home.hbs')
})

// uses and renders the Contact page
app.get('/contact', function(request, response){
    response.render('contact.hbs')
})

// uses and renders the About page
app.get('/about', function(request, response){
    response.render('about.hbs')
})

// UPLOAD PROJECT
app.get("/addProject", (req, res) => {
    res.render('addProject.hbs')
})

app.post("/addProject", upload.single("image"), (req,res) => {
    
    const image = req.body.image
    const title = req.body.title
    const description = req.body.description

    data.projects.push({
        id: data.projects.at(-1).id +1,
        title: title,
        description: description,
        image: image
    })
    /*
    const project = {
        image: image,
        title: title,
        description: description,
        id: projects.length + 1
    }
    
    projects.push(project)
    */

    res.redirect("/projects" )
  //  res.render('projects.hbs')
})
// FUNKAR INTE ATT LADDA UPP ETT HELT PROJEKT
app.listen(3000)

