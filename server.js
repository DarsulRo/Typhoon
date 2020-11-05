const express = require('express')
const server  = express()
var verify = require('./routes/verifyJWT')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

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
server.use(express.json())
server.use(cookieParser())
server.use(logger)


//IMPORT ROUTES
const authRoute = require('./routes/authRoute');
const postRoute = require('./routes/postRoute')
const userRoute = require('./routes/userRoute')
const errorRoute = require('./routes/errorRoute')
const { ObjectId } = require('mongodb')


//ROUTES
server.get('/todo',function(req,res){
    res.render('todo')
})
server.post('/addtodo',async function(req,res){
    await Mongo.db.db('typhoon').collection('todos').insertOne({
        task:req.body.task,
        date: new Date()
    })
    res.status(201).send('created')
})
server.get('/getalltodos',async function(req,res){
    let alltodos = await Mongo.db.db('typhoon').collection('todos').find({}).sort({date:1}).toArray()
    res.status(200).json(alltodos)
})
server.get('/deletetodo/:taskID', async function(req,res){
    await Mongo.db.db('typhoon').collection('todos').deleteOne({_id:ObjectId(req.params.taskID)})
    res.status(200).json({result:'done'})
})



server.get('/',verify,async function(req,res){
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},{projection:{password:0}})
    var posts =  await Mongo.db.db('typhoon').collection('posts').find({}).sort({date:-1}).toArray()
    
    return res.render('home',{logged_user, posts})
})

server.use('',postRoute)
server.use('',authRoute)
server.use('',userRoute)
server.use('',errorRoute)


function logger(req,res,next){
    console.log("["+req.method+"] Request made at [" + new Date().toLocaleTimeString() + "] by ["  + req.ip + "] for [" +req.url + "]")
    next();
}