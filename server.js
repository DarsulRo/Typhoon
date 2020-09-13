const express = require('express')
const server  = express()
var verify = require('./routes/verifyJWT')
const cookieParser = require('cookie-parser')

//Mongo Connection
const {MongoConnection} = require('./mongoConnection')
async function connectMongo(){
    await MongoConnection.connectToMongo();
    DB = MongoConnection.db.db('typhoon')
    console.log('Connected to the Typhoon database')
}
connectMongo()

//SERVER MIDDLEWARE
server.set('view engine','ejs')
server.use('/public',express.static('public'))
server.use(express.static('public'))
server.use(express.urlencoded({extended:true}))
server.use(logger)
server.use(cookieParser())


//IMPORT ROUTES
const authRoute = require('./routes/auth');

//ROUTE MIDDLEWARE
server.use('',authRoute)



server.get('/',verify,function(req,res){
    res.render('home')
})


server.listen(8000,function(){
    console.log("Listening on port 8000")
})

function logger(req,res,next){
    console.log("["+req.method+"] Request made at [" + new Date().toLocaleTimeString() + "] by ["  + req.ip + "] for [" +req.url + "]")
    next();
}