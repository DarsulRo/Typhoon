var router = require('express').Router()
var {Mongo} = require('../mongoConnection')
var verify = require('./verifyJWT')
const { ObjectID, ObjectId } = require('mongodb')


router.post('/post',verify,function(req,res){

    Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},{projection:{_id:0,username:1,displayname:1}},function(error1,user){
    
        if(error1) return res.status(404);

        Mongo.db.db('typhoon').collection('posts').insertOne({
            userID: req.userID,
            username: user.username,
            displayname: user.displayname,
            content: req.body.message,
            date: new Date(),
        },function(err,result){
            if(err) return res.status(500).send(err)
            else{
                res.redirect('/')
            }
         })

    })
     
})
router.get('/deletepost/:postID',verify,function(req,res){
    Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},function(userError,user){
        if(userError) return res.status(401).send(userError);

        Mongo.db.db('typhoon').collection('posts').deleteOne(
            {_id:ObjectId(req.params.postID), username:user.username},
            function(deleteError,result){

                if(deleteError) return res.status(404).send(deleteError);
                return res.redirect('/')
        })
    })
})

module.exports = router