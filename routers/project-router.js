const express = require('express')
const router = express.Router()
const path = require('path')
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('portfolio-database.db')
const MAX_DESCRIPTION_LENGTH = 255
const MIN_DESCRIPTION_LENGTH = 10
const MAX_TITLE_LENGTH = 30
const MIN_TITLE_LENGTH = 4

const multer = require('multer')
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

router.get('/projects', function (request, response) {

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
router.get('/projects/:projectID', function (request, response) {

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
router.get('/add-project', function (request, response) {

    if (request.session.isLoggedIn) {

        response.render('add-project.hbs')

    } else {

        response.redirect('/login')

    }

})

// posts projects to the Add Projects page.
router.post('/add-project', upload.single('image'), function (request, response) {

    const image = request.filePath
    const title = request.body.title
    const description = request.body.description
    const errorMessages = []

    if (title.length == 0) {
        errorMessages.push("Title can't be null")
    }
    else if (MAX_TITLE_LENGTH < title.length) {
        errorMessages.push("Title can't be more than " + MAX_TITLE_LENGTH + " characters long.")
    }
    else if (title.length < MIN_TITLE_LENGTH) {
        errorMessages.push("Title can't be less than " + MIN_TITLE_LENGTH + " characters long.")
    }

    if (description.length == 0) {
        errorMessages.push("Description can't be null")
    }
    else if (MAX_DESCRIPTION_LENGTH < description.length) {
        errorMessages.push("Description can't be more than " + MAX_DESCRIPTION_LENGTH + " characters long.")
    }
    else if (description.length < MIN_DESCRIPTION_LENGTH) {
        errorMessages.push("Description can't be less than " + MIN_DESCRIPTION_LENGTH + " characters long.")
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

        response.render('add-project.hbs', model)

    }

})


router.get('/update-project/:projectID', function (request, response) {

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

router.post('/update-project/:projectID', function (request, response) {

    const projectID = request.params.projectID
    const title = request.body.title
    const description = request.body.description
    const errorMessages = []

    if (!request.session.isLoggedIn) {
        errorMessages.push('Not logged in.')
    }

    if (title.length == 0) {
        errorMessages.push("Title can't be null")
    }
    else if (MAX_TITLE_LENGTH < title.length) {
        errorMessages.push("Title can't be more than " + MAX_TITLE_LENGTH + " characters long.")
    }
    else if (title.length < MIN_TITLE_LENGTH) {
        errorMessages.push("Title can't be less than " + MIN_TITLE_LENGTH + " characters long.")
    }

    if (description.length == 0) {
        errorMessages.push("Description can't be null")
    }
    else if (MAX_DESCRIPTION_LENGTH < description.length) {
        errorMessages.push("Description can't be more than " + MAX_DESCRIPTION_LENGTH + " characters long.")
    }
    else if (description.length < MIN_DESCRIPTION_LENGTH) {
        errorMessages.push("Description can't be less than " + MIN_DESCRIPTION_LENGTH + " characters long.")
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

        if (request.session.isLoggedIn) {
            const projectID = request.params.projectID

            const query =
                `SELECT * FROM projects WHERE projectID = ?`
            const values = [projectID]

            db.get(query, values, function (error, project) {

                const model = {
                    errorMessages,
                    project
                }

                response.render('update-project.hbs', model)

            })

        } else {

            response.redirect('/login')

        }

    }

})
// KOLLA HÄR O GÖR LIKADANT PÅ ALLT ANNAT

router.post('/delete-project/:projectID', function (request, response) {

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

/*
// ANVÄND DESSA I DIN APP.JS FIL OM DU VILL KÖRA ROUTER GREJER
//const projectRouter = require('./routers/project-router')
// app.use(projectRouter)
//app.use('/projects', projectRouter) */

module.exports = router
