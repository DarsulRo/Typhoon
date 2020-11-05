var router = require('express').Router()
var { Mongo } = require('../mongoConnection')
var verify = require('./verifyJWT')
const { ObjectId } = require('mongodb')


router.post('/newpost', verify, async function (req, res) {
    var insert = await Mongo.db.db('typhoon').collection('posts').insertOne({
        userID: ObjectId(req.userID),
        content: req.body.message,
        likes: 0,
        date: new Date(),
    })
    res.redirect('/')
})

router.get('/deletepost/:postID', verify,async function (req, res) {
    let query = {_id: ObjectId(req.params.postID), userID: ObjectId(req.userID)}
    var deleted = await Mongo.db.db('typhoon').collection('posts').deleteOne(query)
    return res.redirect('back')
})

router.post('/editpost/:postID',verify,async function(req,res){
    var query = {_id: ObjectId(req.params.postID),userID: ObjectId(req.userID)}
    var update = { $set: {content: req.body.editedContent}}
    var findandupdate = await Mongo.db.db('typhoon').collection('posts').findOneAndUpdate(query,update)
    return res.redirect('back')
})

router.get('/getpostcontent/:postID',verify, async function(req,res){
    var postConent = await Mongo.db.db('typhoon').collection('posts').findOne({_id:ObjectId(req.params.postID)},{projection:{_id:0,content:1}})
    res.json(postConent)
})

router.get('/getallposts',verify, async function(req,res){
    let allposts = await Mongo.db.db('typhoon').collection('posts').find({}).sort({date:1}).toArray()
    let allusers = await Mongo.db.db('typhoon').collection('users').find({}).toArray()
    let post_saves = await Mongo.db.db('typhoon').collection('post_saves').find({userID: ObjectId(req.userID)}).toArray()
    
    allposts = allposts.map(function(post){
        let newpost = null
        allusers.forEach(user => {
            if(JSON.stringify(post.userID) === JSON.stringify(user._id)){

                let saved= false;
                post_saves.forEach(post_save=>{
                    if((JSON.stringify(post_save.postID)==JSON.stringify(post._id))&&(JSON.stringify(post_save.userID)==JSON.stringify(req.userID))){
                        saved = true;
                    }
                })
                newpost = {
                    postID: post._id,
                    content: post.content,
                    likes: post.likes,
                    date: post.date,
                    username: user.username,
                    displayname: user.displayname,
                    saved: saved
                }
            }
        });
        return newpost
    })
    res.json(allposts)
})

router.get('/getmyposts',verify,async function(req,res){
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id: ObjectId(req.userID)})
    var myposts = await Mongo.db.db('typhoon').collection('posts').find({userID:ObjectId(req.userID)}).toArray()
    
    myposts = myposts.map(post => {
        return {
            postID: post._id,
            content: post.content,
            likes: post.likes,
            date: post.date,
            username: logged_user.username,
            displayname: logged_user.displayname
        }
    })
    res.json(myposts)
})
router.get('/getloggeduser',verify, async function(req,res){
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id: ObjectId(req.userID)},{projection:{_id:0,password:0,email:0}})
    res.json(logged_user)
})
router.get('/getuserposts/:username',verify,async function(req,res){
    let req_user = await Mongo.db.db('typhoon').collection('users').findOne({username: req.params.username},{projection:{password:0,email:0}})
    let userposts = await Mongo.db.db('typhoon').collection('posts').find({userID: ObjectId(req_user._id)}).toArray()
    
    userposts = userposts.map(post => {
        return{
            postID: post._id,
            content: post.content,
            likes: post.likes,
            date: post.date,
            username: req_user.username,
            displayname: req_user.displayname
        }
    })
    res.json(userposts)
})

router.post('/savepost',verify, async (req,res)=>{
    let logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id: ObjectId(req.userID)},{projection:{password:0,email:0}})
    let count = await Mongo.db.db('typhoon').collection('post_saves').countDocuments({userID:logged_user._id,postID:ObjectId(req.body.postID)})
    if(count == 0){
        await Mongo.db.db('typhoon').collection('post_saves').insertOne({userID:logged_user._id,postID:ObjectId(req.body.postID)})
        res.status(201).json('saved')
    }
    else{
        await Mongo.db.db('typhoon').collection('post_saves').deleteOne({userID:logged_user._id,postID:ObjectId(req.body.postID)})
        res.status(202).json('unsaved')
    }
    
})

router.get('/getsavedposts',verify,async(req,res)=>{
    let post_saves = await Mongo.db.db('typhoon').collection('post_saves').find({userID:ObjectId(req.userID)}).toArray()
    let allposts = await Mongo.db.db('typhoon').collection('posts').find({}).sort({date:1}).toArray()
    let allusers = await Mongo.db.db('typhoon').collection('users').find({}).toArray()
    
    let savedposts = []
    allposts.forEach(post=>{
        post_saves.forEach(post_save =>{
            if(JSON.stringify(post_save.postID) == JSON.stringify(post._id))
            {
                savedposts.push(post)
            }
        })
    })
    savedposts = savedposts.map(savedpost => {
        allusers.forEach(user => {
            if(JSON.stringify(savedpost.userID)==JSON.stringify(user._id)){
                newpost =  {...savedpost,username:user.username,displayname:user.displayname,postID:savedpost._id}
            }
        })
        return newpost;
    })
    res.json(savedposts)
})

module.exports = router