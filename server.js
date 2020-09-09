const express = require('express')
const server  = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

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
server.use(express.urlencoded({extended:true}))
server.use(express.static('public'))
server.use(logger)
function logger(req,res,next){
    console.log("["+req.method+"] Request made at [" + new Date().toLocaleTimeString() + "] by ["  + req.ip + "] for [" +req.url + "]")
    next();
}


//IMPORT ROUTES
const authRoute = require('./routes/auth')
//ROUTE MIDDLEWARE
server.use('',authRoute)



server.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html")
})


server.listen(80,function(){
    console.log("Listening on port 80")
})