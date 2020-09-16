var router = require('express').Router()
var {Mongo} = require('../mongoConnection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const env = require('dotenv')
const cookie = require('cookie-parser')
env.config()

router.get('/register',(req,res)=>{
    res.render('register',{error:null})
})
router.post('/register', function(req,res){
    Mongo.db.db('typhoon').collection('users').findOne({email:req.body.email},function(err,result){
        if(err) throw err;
        else if(result == null){
            
            //HASH PASSWORD
            const salt =  bcrypt.genSaltSync(10)
            const hashedPass = bcrypt.hashSync(req.body.password1,salt)

            //INSERT USER
            Mongo.db.db('typhoon').collection('users').insertOne({email: req.body.email, username: req.body.username, password: hashedPass},function(err2,result2){
                if(err2) throw err2;
                else{
                    res.redirect('/')
                }
            })
        }
        else{
            //EMAIL ALREADY USED
            res.status(404).render('register',{error: "This email is unavailable"})
            
        }
    })
})



router.get('/login',(req, res)=>{
    res.render('login',{error:null})
})
router.post('/login',(req,res)=>{
    Mongo.db.db('typhoon').collection('users').findOne({email:req.body.email},function(err,result){
        //EMAIL NOT FOUND
        if(err||!result) return res.status(404).render('login',{error:"Email or password is incorrect"});

        //CHECKING HASHED PASSWORD
        var validPass = bcrypt.compareSync(req.body.password, result.password)
        if(validPass) {
            const maxAge = 1000*60*30
            const token = jwt.sign({id:result._id},process.env.ACCESS_TOKEN,{expiresIn:maxAge/1000})
            res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge})
            res.redirect('/')
        }
        //INCORRECT PASSWORD
        else return res.status(404).render('login',{error:"Email or password is incorrect"});

        
    })
})


router.get('/logout',(req,res)=>{
    res.cookie('jwt',"You're not logged in buddy",{maxAge:1})
    res.redirect('/')
})

module.exports = router