const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('portfolio-database.db')

const MAX_COMMENT_LENGTH = 255
const MIN_COMMENT_LENGTH = 5

router.get('/add-comment/:projectID', function (request, response) {

    const model = {
        project: {
            projectID: request.params.projectID
        }
    }

    response.render('add-comment.hbs', model)

})

router.post('/add-comment/:projectID', function (request, response) {

    const comment = request.body.comment
    const projectID = request.params.projectID
    const errorMessages = []

    if (comment.length == 0) {
        errorMessages.push("Comment can't be empty")
    }
    else if (comment.length < MIN_COMMENT_LENGTH) {
        errorMessages.push("Comment can't be less than " + MIN_COMMENT_LENGTH + " characters long.")
    }
    else if (MAX_COMMENT_LENGTH < comment.length) {
        errorMessages.push("Comment can't be more than " + MAX_COMMENT_LENGTH + " characters long.")
    }

    if (errorMessages.length == 0) {

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

                response.render('add-comment.hbs', model)
            }

            else {

                response.redirect('/projects')

            }

        })

    } else {

        const model = {
            errorMessages,
            comment,
            project: {
                projectID: request.params.projectID
            }
        }

        response.render('add-comment.hbs', model)

    }

})

router.get('/manage-comment/:commentID', function (request, response) {

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

router.get('/update-comment/:commentID', function (request, response) {

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

router.post('/update-comment/:commentID', function (request, response) {

    const commentID = request.params.commentID
    const comment = request.body.comment
    const errorMessages = []

    if (!request.session.isLoggedIn) {
        errorMessages.push('Not logged in.')
    }
    if (comment.length == 0) {
        errorMessages.push("Comment can't be empty")
    }
    else if (comment.length < MIN_COMMENT_LENGTH) {
        errorMessages.push("Comment can't be less than " + MIN_COMMENT_LENGTH + " characters long.")
    }
    else if (MAX_COMMENT_LENGTH < comment.length) {
        errorMessages.push("Comment can't be more than " + MAX_COMMENT_LENGTH + " characters long.")
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

        if (request.session.isLoggedIn) {
            const commentID = request.params.commentID

            const query =
                `SELECT * FROM comments WHERE commentID = ?`
            const values = [commentID]

            db.get(query, values, function (error, comment) {

                const model = {
                    errorMessages,
                    comment,
                }

                response.render('update-comment.hbs', model)

            })

        } else {

            response.redirect('/login')

        }

    }

})

router.post('/delete-comment/:commentID', function (request, response) {

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

module.exports = router
