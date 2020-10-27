var router = require('express').Router()
var { Mongo } = require('../mongoConnection')
var verify = require('./verifyJWT')
const { ObjectID, ObjectId } = require('mongodb')
const { renderFile } = require('ejs')


router.post('/post', verify, async function (req, res) {
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({ _id: ObjectId(req.userID) }, { projection: { _id: 0, username: 1, displayname: 1 } })
    var insert = await Mongo.db.db('typhoon').collection('posts').insertOne({
        userID: req.userID,
        username: logged_user.username,
        displayname: logged_user.displayname,
        content: req.body.message,
        likes: 0,
        date: new Date(),
    })
    res.redirect('/')
})

router.get('/deletepost/:postID', verify,async function (req, res) {
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id: ObjectId(req.userID)})
    var deleted = await Mongo.db.db('typhoon').collection('posts').deleteOne({_id: ObjectId(req.params.postID), username: logged_user.username})     
    return res.redirect('/')
})

router.post('/editpost/:postID',verify,async function(req,res){
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id: ObjectId(req.userID)})

    var query = {_id: ObjectId(req.params.postID), username:logged_user.username}
    var update = { $set: {content: req.body.editedContent}}

    var findandupdate = await Mongo.db.db('typhoon').collection('posts').findOneAndUpdate(query,update)
    res.redirect('..')
})

router.get('/getpostcontent/:postID',verify, async function(req,res){
    var postConent = await Mongo.db.db('typhoon').collection('posts').findOne({_id:ObjectId(req.params.postID)},{projection:{_id:0,content:1}})
    res.json(postConent)
   
})

router.get('/getallposts',async function(req,res){
    var allposts = await Mongo.db.db('typhoon').collection('posts').find({}).sort({date:1}).toArray()
    res.json(allposts)
})

router.get('/getmyposts',verify,async function(req,res){
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id: ObjectId(req.userID)})
    var myposts = await Mongo.db.db('typhoon').collection('posts').find({username:logged_user.username}).toArray()
    res.json(myposts)
})
router.get('/getloggeduser',verify, async function(req,res){
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id: ObjectId(req.userID)},{projection:{_id:0,password:0,email:0}})
    res.json(logged_user)
})
router.get('/getuserposts/:username',async function(req,res){
    var userposts = await Mongo.db.db('typhoon').collection('posts').find({username:req.params.username}).toArray()
    res.json(userposts)
})
module.exports = router