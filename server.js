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

    server.listen(8000,function(){
        console.log("Listening on port 8000")
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
const { ObjectID, ObjectId } = require('mongodb')

//ROUTE MIDDLEWARE
server.use('',postRoute)
server.use('',authRoute)
server.use('',userRoute)

server.get('/',verify,function(req,res){
    Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},{projection:{password:0}},function(error,user){
        if(error) return res.status(404);

        Mongo.db.db('typhoon').collection('posts').find({}).sort({date:-1}).toArray(function(err,posts){
            if(err) return res.status(400);
            return res.render('home',{user, posts})
        })
    })
    
})



function logger(req,res,next){
    console.log("["+req.method+"] Request made at [" + new Date().toLocaleTimeString() + "] by ["  + req.ip + "] for [" +req.url + "]")
    next();
}