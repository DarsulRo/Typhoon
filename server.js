var express = require('express')
var server  = express()

server.use(express.static('public'))


server.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html")
})


server.listen(80,function(){
    console.log("Listening on port 80")
})