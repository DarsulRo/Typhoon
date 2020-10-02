var router = require('express').Router()
var { Mongo } = require('../mongoConnection')
var verify = require('./verifyJWT')
const { ObjectID, ObjectId } = require('mongodb')


router.post('/post', verify, async function (req, res) {
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({ _id: ObjectId(req.userID) }, { projection: { _id: 0, username: 1, displayname: 1 } })
    var insert = await Mongo.db.db('typhoon').collection('posts').insertOne({
        userID: req.userID,
        username: logged_user.username,
        displayname: logged_user.displayname,
        content: req.body.message,
        date: new Date(),
    })
    res.redirect('/')
})

router.get('/deletepost/:postID', verify,async function (req, res) {
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id: ObjectId(req.userID)})
    var deleted = await Mongo.db.db('typhoon').collection('posts').deleteOne({_id: ObjectId(req.params.postID), username: logged_user.username})     
    return res.redirect('/')
})

router.get('/getpost/:postID',verify, async function(req,res){
    var postConent = await Mongo.db.db('typhoon').collection('posts').findOne({_id:ObjectId(req.params.postID)},{projection:{_id:0,content:1}})
    res.json(postConent)
})

router.post('/editpost/:postID',verify,async function(req,res){
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id: ObjectId(req.userID)})

    var query = {_id: ObjectId(req.params.postID), username:logged_user.username}
    var update = { $set: {content: req.body.editedContent}}

    var findandupdate = await Mongo.db.db('typhoon').collection('posts').findOneAndUpdate(query,update)
    res.redirect('..')
})
module.exports = router