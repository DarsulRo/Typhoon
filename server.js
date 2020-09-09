const express = require('express')
const server  = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {MongoConnection} = require('./mongoConnection')

async function connectMongo(){
    await MongoConnection.connectToMongo();
    DB = MongoConnection.db.db('typhoon')
    console.log('Connected to the Typhoon database')
}
connectMongo()



server.use(express.urlencoded({extended:true}))
server.set('view engine','ejs')
server.use(express.static('public'))
server.use(logger)
function logger(req,res,next){
    console.log("["+req.method+"] Request made at [" + new Date().toLocaleTimeString() + "] by ["  + req.ip + "] for [" +req.url + "]")
    next();
}


server.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html")
})
server.get('/register',(req,res)=>{
    res.render('register',{error:null})
})
server.post('/register',function(req,res){
    DB.collection('users').findOne({email:req.body.email},function(err,result){
        if(err) throw err;
        else if(result == null){
            DB.collection('users').insertOne({email: req.body.email, username: req.body.username, password: req.body.password1},function(err2,result2){
                if(err2) throw err2;
                else{
                    res.redirect('/login')
                }
            })
        }
        else{
            res.render('register',{error: "This email is already in use"})
        }
    })
})
server.get('/login',(req, res)=>{
    res.render('login',{error:null})
})
server.post('/login',(req,res)=>{
    DB.collection('users').findOne({email:req.body.email, password: req.body.password},function(err,result){
        if(err) throw err;
        else if(result){
            //User found
            res.redirect('/')
        }
        else {
            res.render('login',{error:"Email or password is wrong"})
        }
    })
})



server.listen(80,function(){
    console.log("Listening on port 80")
})