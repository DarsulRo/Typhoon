var router = require('express').Router()
var { Mongo } = require('../mongoConnection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const env = require('dotenv')
const cookie = require('cookie-parser')
env.config()

router.get('/register', (req, res) => {
    res.render('register', { error: null })
})

router.post('/register', async function (req, res) {
    var already_user = await Mongo.db.db('typhoon').collection('users').findOne({
        "$or": [{
            email: req.body.email
        }, {
            username: req.body.username
        }]
    })

    if (already_user == null) {
        //HASH PASSWORD
        const salt = bcrypt.genSaltSync(10)
        const hashedPass = bcrypt.hashSync(req.body.password1, salt)

        //INSERT USER
        var inserted = await Mongo.db.db('typhoon').collection('users').insertOne({ 
            email: req.body.email, 
            username: req.body.username, 
            displayname: req.body.displayname,
            password: hashedPass,
            personal: {
                bio: null,
                birthdate: null,
                phonenumber: null,
                adress: null,
                occupation: null,
                relationstatus: null
            },
            preferences:{
                email: false,
                birthdate: true,
                phonenumber: true,
                adress: true,
                occupation: true,
                relationstatus: true
            } 
        })
        res.redirect('/')

    } else {
        //EMAIL ALREADY USED
        res.status(404).render('register', { error: "The email or username is unavailable" })
    }
})

router.get('/login', (req, res) => {
    res.render('login', { error: null })
})
router.post('/login',async (req, res) => {
    var user_found = await Mongo.db.db('typhoon').collection('users').findOne({ email: req.body.email })

    //EMAIL NOT FOUND
    if (!user_found) return res.status(404).render('login', { error: "Email or password is incorrect" });

    //CHECKING HASHED PASSWORD
    var validPass = bcrypt.compareSync(req.body.password, user_found.password)
    if (validPass) {
        const maxAge = 1000 * 60 * 60 * 24
        const token = jwt.sign({ id: user_found._id }, process.env.ACCESS_TOKEN, { expiresIn: maxAge / 1000 })
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge })
        res.redirect('/')
    }

    //INCORRECT PASSWORD
    else return res.status(404).render('login', { error: "Email or password is incorrect" });
})


router.get('/logout', (req, res) => {
    res.cookie('jwt', "You're not logged in buddy", { maxAge: 1 })
    res.redirect('/')
})

module.exports = router