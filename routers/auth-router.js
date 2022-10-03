const express = require('express')
const router = express.Router()

const bcrypt = require('bcrypt')
const saltRounds = 10
const ADMIN_USERNAME = 'Alice'
const ADMIN_PASSOWRD = '$2b$10$VasTmOYbHU9agU4.0XwS8uRnxnNqo/R8Z5OZy2UxSsYEUxEQ848Ga'

router.get('/login', function(request, response) {
    response.render('login.hbs')
})

router.post('/login', function (request, response) {
    const username = request.body.username
    //const password = request.body.password

    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(ADMIN_PASSOWRD, salt, function (err, hash) {
            console.log("HASH")
            console.log("PASSWORD: " + ADMIN_PASSOWRD)
            console.log("Salt: " + salt)
            console.log("Hash: " + hash)

            bcrypt.compare(ADMIN_PASSOWRD, hash, function (err, result) {
                console.log("COMPARE")
                console.log("PASSWORD: " + ADMIN_PASSOWRD )
                console.log("Result: " + result)

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

router.post('/logout', function (request, response) {

    request.session.isLoggedIn = false
    response.redirect('/')

})

module.exports = router