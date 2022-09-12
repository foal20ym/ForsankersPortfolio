const express = require('express')
const expressHandlebars = require('express-handlebars')
const data = require('./data.js')

const app = express()

app.use(express.static('public'))

app.engine('hbs', expressHandlebars.engine({
    defaultLayout: 'main.hbs',
}))

app.use(
    express.static('public')
)

app.get('/', function(request, response){
    response.render('home.hbs')
})

app.get('/Projects', function(request, response){

    const model = {
        projects: data.projects
    }
    response.render('projects.hbs', model)
})

app.listen(8080)
