const express = require('express')
const expressHandlebars = require('express-handlebars')
const fileUpload = require('express-fileupload')
const data = require('./data.js')
const bodyParser = require('body-parser')


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

app.get('/addProject', function(request, response){
    response.render('addProject.hbs')
})

app.post('/addProject', function(request, response){
    const image = request.body.image
    const title = request.body.title
    const description = request.body.description

    const project = {
        image: image,
        title: title,
        description: description,
        id: projects.length + 1
    }
    
    projects.push(project)

    response.redirect("/projects" + project.id )

})

app.get('/addProject', function(request, response){
    response.render('addProject.hbs')
})

app.listen(3000)

