const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('portfolio-database.db')
const MAX_QUESTION_LENGTH = 255
const MIN_QUESTION_LENGTH = 5
const MAX_ANSWER_LENGTH = 255
const MIN_ANSWER_LENGTH = 5

// uses and renders the Contact page
router.get('/contact', function (request, response) {

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

router.get('/add-question', function (request, response) {

    response.render('add-question.hbs')

})

router.post('/add-question', function (request, response) {

    const name = request.body.name
    const email = request.body.email
    const question = request.body.question
    const answer = request.body.answer
    const errorMessages = []
    const date = new Date()
    date.toISOString().split('T')[0]


    if (name.length == 0) {
        errorMessages.push("Name can't be null")
    }
    if (email.length == 0) {
        errorMessages.push("Email can't be null")
    }
    if (question.length == 0) {
        errorMessages.push("Question can't be null")
    }
    else if (question.length < MIN_QUESTION_LENGTH) {
        errorMessages.push("Question can't be less than " + MIN_QUESTION_LENGTH + " characters long.")
    }
    else if (MAX_QUESTION_LENGTH < question.length) {
        errorMessages.push("Question can't be more than " + MAX_QUESTION_LENGTH + " characters long.")
    }

    if (errorMessages.length == 0) {

        const query = `INSERT INTO questions (name, email, question, answer, date) VALUES (?, ?, ?, ?, ?)`

        const values = [name, email, question, answer, date.toISOString().split('T')[0]]

        db.run(query, values, function (error) {

            if (error) {

                errorMessages.push('Internal server error')

                const model = {
                    errorMessages,
                    name,
                    email,
                    question,
                    answer,
                    date,
                }

                response.render('add-question.hbs', model)
            }

            else {

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
            date,
        }

        response.render('add-question.hbs', model)

    }

})

router.get('/manage-question/:questionID', function (request, response) {

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

router.get('/answer-question/:questionID', function (request, response) {

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

router.post('/answer-question/:questionID', function (request, response) {

    const questionID = request.params.questionID
    const answer = request.body.answer
    const errorMessages = []

    if (!request.session.isLoggedIn) {
        errorMessages.push('Not logged in.')
    }
    if (answer.length == 0) {
        errorMessages.push("Answer can't be null")
    }
    else if (answer.length < MIN_ANSWER_LENGTH) {
        errorMessages.push("Answer can't be less than " + MIN_ANSWER_LENGTH + " characters long.")
    }
    else if (MAX_ANSWER_LENGTH < answer.length) {
        errorMessages.push("Answer can't be more than " + MAX_ANSWER_LENGTH + " characters long.")
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
                    answer,
                }

                response.render('answer-question.hbs', model)

            } else {

                response.redirect('/contact')

            }

        })

    } else {
        if (request.session.isLoggedIn) {
            const questionID = request.params.questionID

            const query = `SELECT answer FROM questions WHERE questionID = ?`
            const values = [questionID]

            db.get(query, values, function (error, question) {

                const model = {
                    errorMessages,
                    question,
                }

                response.render('answer-question.hbs', model)

            })

        } else {

            response.redirect('/login')

        }

    }

})

router.get('/update-question/:questionID', function (request, response) {

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

router.post('/update-question/:questionID', function (request, response) {

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
    if (name.length == 0) {
        errorMessages.push("Name can't be null")
    }
    if (email.length == 0) {
        errorMessages.push("Email can't be null")
    }
    if (question.length == 0) {
        errorMessages.push("Answer can't be null")
    }
    else if (question.length < MIN_QUESTION_LENGTH) {
        errorMessages.push("Question can't be less than " + MIN_QUESTION_LENGTH + " characters long.")
    }
    else if (MAX_QUESTION_LENGTH < question.length) {
        errorMessages.push("Question can't be more than " + MAX_QUESTION_LENGTH + " characters long.")
    }
    /*    if (answer.length == 0) {
            errorMessages.push("Answer can't be null")
        }
        else if (answer.length < MIN_ANSWER_LENGTH) {
            errorMessages.push("Answer can't be less than " + MIN_ANSWER_LENGTH + " characters long.")
        }
        else if (MAX_ANSWER_LENGTH < answer.length) {
            errorMessages.push("Answer can't be more than " + MAX_ANSWER_LENGTH + " characters long.")
        } */

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

        if (request.session.isLoggedIn) {
            const questionID = request.params.questionID

            const query = `SELECT * FROM questions WHERE questionID = ?`
            const values = [questionID]

            db.get(query, values, function (error, question) {

                const model = {
                    errorMessages,
                    question,
                }

                response.render('update-question.hbs', model)

            })

        } else {

            response.redirect('/login')

        }

    }

})

router.post('/delete-question/:questionID', function (request, response) {

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

router.get('/update-answer/:questionID', function (request, response) {

    if (request.session.isLoggedIn) {
        const questionID = request.params.questionID

        const query = `SELECT answer FROM questions WHERE questionID = ?`
        const values = [questionID]

        db.get(query, values, function (error, question) {

            const model = {
                question,
            }

            response.render('update-answer.hbs', model)

        })

    } else {

        response.redirect('/login')

    }

})

router.post('/update-answer/:questionID', function (request, response) {

    const questionID = request.params.questionID
    const answer = request.body.answer
    const errorMessages = []

    if (!request.session.isLoggedIn) {
        errorMessages.push('Not logged in.')
    }
    if (answer.length == 0) {
        errorMessages.push("Answer can't be null")
    }
    else if (answer.length < MIN_ANSWER_LENGTH) {
        errorMessages.push("Answer can't be less than " + MIN_ANSWER_LENGTH + " characters long.")
    }
    else if (MAX_ANSWER_LENGTH < answer.length) {
        errorMessages.push("Answer can't be more than " + MAX_ANSWER_LENGTH + " characters long.")
    }

    if (errorMessages.length == 0) {

        const query =
            `UPDATE questions SET (answer) = (?) WHERE questionID = ?`

        const values = [answer,questionID]

        db.run(query, values, function (error) {

            if (error) {

                errorMessages.push('Internal Server Error')

                const model = {
                    errorMessages,
                    answer,

                }

                response.render('update-answer.hbs', model)

            } else {

                response.redirect('/contact')

            }

        })

    } else {

        if (request.session.isLoggedIn) {
            const questionID = request.params.questionID
    
            const query = `SELECT answer FROM questions WHERE questionID = ?`
            const values = [questionID]
    
            db.get(query, values, function (error, question) {
    
                const model = {
                    errorMessages,
                    question,
                }
    
                response.render('update-answer.hbs', model)
    
            })
    
        } else {
    
            response.redirect('/login')
    
        }

    }

})

router.post('/delete-answer/:questionID', function (request, response) {

    const questionID = request.params.questionID
    const answer = null
    const errorMessages = []

    if (!request.session.isLoggedIn) {
        errorMessages.push('Not logged in.')
    }

    if (errorMessages == 0) {

        const query =
            `UPDATE questions SET (answer) = (?) WHERE questionID = ?`
        const values = [answer, questionID]

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

module.exports = router