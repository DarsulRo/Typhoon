var express = require('express')
var server  = express()

server.set('view engine','ejs')
server.use(express.json())
server.use(express.static('public'))
server.use(logger)

server.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html")
    
})

server.get('/register',(req,res)=>{
    
    res.render('register')
})

server.listen(80,function(){
    console.log("Listening on port 80")
})


function logger(req,res,next){
    console.log("Request ["+req.method+"] made at [" + new Date().toLocaleTimeString() + "] by ["  + req.ip + "] for [" +req.url + "]")
    next();
}