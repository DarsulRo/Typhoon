var router = require('express').Router()
var {Mongo} = require('../mongoConnection')
var verify = require('./verifyJWT')
const { ObjectId } = require('mongodb')


router.get('/user/:username',verify, async function(req,res){

    var req_user = await Mongo.db.db('typhoon').collection('users').findOne({username:req.params.username},{projection:{_id:0,password:0}})
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},{projection:{_id:0,password:0}})
  
    res.render('profile.ejs',{logged_user,req_user})
})

module.exports= router