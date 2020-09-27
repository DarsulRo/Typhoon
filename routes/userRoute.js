var router = require('express').Router()
var {Mongo} = require('../mongoConnection')
var verify = require('./verifyJWT')
const { ObjectID, ObjectId, Server } = require('mongodb')


router.get('/user/:userID',verify,function(req,res){

    
    Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID),username:req.params.userID},{projection:{password:0}},function(userError,user){
        if(userError) return res.status(404).send(userError)
        res.send(user)
    })


})

module.exports= router