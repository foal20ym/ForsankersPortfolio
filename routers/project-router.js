const express = require('express')
const router = express.Router()

const data = require('../data.js')

// /projects
router.get('/', function(request, response){

    const model = {
        projects: data.projects
    }

    response.render('projects.hbs', model)

})

// /projects/:id
router.get("/projects/:id", function(request, response){

    const id = request.params.id

    const project = data.projects.find(m => m.id == id)

    const model = {
        project: project
    }

    response.render('project.hbs', model)

})

// ANVÄND DESSA I DIN APP.JS FIL OM DU VILL KÖRA ROUTER GREJER
//const projectRouter = require('./routers/project-router')
// app.use(projectRouter)
//app.use('/projects', projectRouter)

module.exports = router
