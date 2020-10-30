const express = require('express')
const server  = express()
var verify = require('./routes/verifyJWT')
const cookieParser = require('cookie-parser')

//Create Server + Mongo connection
const {Mongo} = require('./mongoConnection.js')
async function createAndConnect(){
    await Mongo.connectToMongo();
    DB = Mongo.db.db('typhoon')
    console.log('Connected to the Typhoon database')

    let port = 8000
    server.listen(port,function(){
        console.log("Listening on port " + port)
    })
}
createAndConnect()

//SERVER MIDDLEWARE
server.set('view engine','ejs')
server.use('/public',express.static('public'))
server.use(express.static('public'))
server.use(express.urlencoded({extended:true}))
server.use(logger)
server.use(cookieParser())


//IMPORT ROUTES
const authRoute = require('./routes/authRoute');
const postRoute = require('./routes/postRoute')
const userRoute = require('./routes/userRoute')
const errorRoute = require('./routes/errorRoute')
const { ObjectID, ObjectId } = require('mongodb')

//ROUTE MIDDLEWARE
server.use('',postRoute)
server.use('',authRoute)
server.use('',userRoute)
server.use('',errorRoute)

server.get('/',verify,async function(req,res){
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},{projection:{password:0}})
    var posts =  await Mongo.db.db('typhoon').collection('posts').find({}).sort({date:-1}).toArray()
    return res.render('home',{logged_user, posts})
   
})


function logger(req,res,next){
    console.log("["+req.method+"] Request made at [" + new Date().toLocaleTimeString() + "] by ["  + req.ip + "] for [" +req.url + "]")
    next();
}