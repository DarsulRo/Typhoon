const express = require('express')
const server  = express()
var verify = require('./routes/verifyJWT')
const cookieParser = require('cookie-parser')

//Mongo Connection
const {Mongo} = require('./mongoConnection.js')
async function connectMongo(){
    await Mongo.connectToMongo();
    DB = Mongo.db.db('typhoon')
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
const authRoute = require('./routes/authRoute');
const { ObjectID, ObjectId } = require('mongodb')

//ROUTE MIDDLEWARE
server.use('',authRoute)



server.get('/',verify,function(req,res){
    Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},{projection:{password:0}},function(error,user){
        if(error) return res.status(404);

        Mongo.db.db('typhoon').collection('posts').find({}).sort({date:-1}).toArray(function(err,posts){
            if(err) return res.status(400);
            return res.render('home',{user, posts})
        })
    })
    
})

server.post('/post',verify,function(req,res){

    Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},{projection:{_id:0,username:1,displayname:1}},function(error1,user){
    
        if(error1) return res.status(404);

        Mongo.db.db('typhoon').collection('posts').insertOne({
            userID: req.userID,
            username: user.username,
            displayname: user.displayname,
            content: req.body.message,
            date: new Date().toLocaleString(),
        },function(err,result){
            if(err) return res.status(500).send(err)
            else{
                res.redirect('/')
            }
         })

    })
     
})
server.get('/deletepost/:postID',verify,function(req,res){
    Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},function(userError,user){
        if(userError) return res.status(401);

        Mongo.db.db('typhoon').collection('posts').deleteOne(
            {_id:ObjectId(req.params.postID), username:user.username},
            function(deleteError,result){

                if(deleteError) return res.status(404);
                return res.redirect('/')
        })
    })
})
server.listen(8000,function(){
    console.log("Listening on port 8000")
})

function logger(req,res,next){
    console.log("["+req.method+"] Request made at [" + new Date().toLocaleTimeString() + "] by ["  + req.ip + "] for [" +req.url + "]")
    next();
}