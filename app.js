const express = require('express')
const expressHandlebars = require('express-handlebars')
const data = require('./data.js')

const projectRouter = require('./routers/project-router')

const app = express()

app.use(express.static('public'))

app.engine('hbs', expressHandlebars.engine({
    defaultLayout: 'main.hbs',
}))

app.use(
    express.static('public')
)

// app.use(projectRouter)
app.use('/projects', projectRouter)

app.get('/', function(request, response){
    response.render('home.hbs')
})

app.get('/contact', function(request, response){
    response.render('contact.hbs')
})

app.get('/about', function(request, response){
    response.render('about.hbs')
})

app.listen(3000)

