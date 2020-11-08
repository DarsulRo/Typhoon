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
router.post('/reportpost/:postID',verify,async function(req,res){
    console.log(req.body)
    Mongo.db.db('typhoon').collection('post_reports').insertOne({
        userID:ObjectId(req.userID),
        postID:ObjectId(req.params.postID),
        reason:req.body.reason,
        message: req.body.reasonText,
        date: new Date()
    })
    res.redirect(301, 'back')
})
router.get('/getpostcontent/:postID',verify, async function(req,res){
    var postConent = await Mongo.db.db('typhoon').collection('posts').findOne({_id:ObjectId(req.params.postID)},{projection:{_id:0,content:1}})
    res.json(postConent)
})

router.get('/getallposts',verify, async function(req,res){
    let allposts = await Mongo.db.db('typhoon').collection('posts').find({}).sort({date:1}).toArray()
    let allusers = await Mongo.db.db('typhoon').collection('users').find({}).toArray()
    let post_saves = await Mongo.db.db('typhoon').collection('post_saves').find({userID: ObjectId(req.userID)}).toArray()
    let post_likes = await Mongo.db.db('typhoon').collection('post_likes').find({userID:ObjectId(req.userID)}).toArray()

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

                let liked = 0;
                post_likes.forEach(post_like =>{
                    if(JSON.stringify(post_like.postID)==JSON.stringify(post._id)){
                        liked = post_like.like
                    }
                })

                newpost = {
                    postID: post._id,
                    content: post.content,
                    likes: post.likes,
                    date: post.date,
                    username: user.username,
                    displayname: user.displayname,
                    saved: saved,
                    liked: liked
                }
            }
        });
        return newpost
    })
    res.json(allposts)
})
router.get('/getpost/:postID',verify,async function(req,res){
    let post = await Mongo.db.db('typhoon').collection('posts').findOne({_id:ObjectId(req.params.postID)})
    let post_user = await Mongo.db.db('typhoon').collection('users').findOne({_id:post.userID})
    let post_save = await Mongo.db.db('typhoon').collection('post_saves').findOne({postID:ObjectId(post._id),userID:ObjectId(req.userID)})
    let post_like = await Mongo.db.db('typhoon').collection('post_likes').findOne({postID:ObjectId(post._id),userID:ObjectId(req.userID)})
    let liked = post_like==undefined?0:post_like.like
    post_save=post_save==undefined?false:true

    post = {
        ...post,
        username: post_user.username,
        displayname: post_user.displayname,
        saved: post_save,
        liked: liked    
    }
    res.json(post)
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
    let post_likes = await Mongo.db.db('typhoon').collection('post_likes').find({userID:ObjectId(req.userID)}).toArray()

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

        let liked = 0;
            post_likes.forEach(post_like =>{
                if(JSON.stringify(post_like.postID)==JSON.stringify(savedpost._id)){
                    liked = post_like.like
            }
        })
        newpost = {
            ...newpost,
            liked: liked
        }

        return newpost;
    })

    res.json(savedposts)
})

router.post('/likepost',verify, async function(req,res){
    let like_type = req.body.liketype // 1=like, -1=dislike, 0=none
    let postID = req.body.postID
    let query={
        postID:ObjectId(postID),
        userID:ObjectId(req.userID)
    }

    let post_like = await Mongo.db.db('typhoon').collection('post_likes').findOne(query)
    let like_result =0

    if(post_like==undefined){ //Not liked/disliked
        await Mongo.db.db('typhoon').collection('post_likes').insertOne({...query,like:like_type})
        like_result=like_type
    }
    else if(like_type != post_like.like){ //Like or dislike post (different likes)
        await Mongo.db.db('typhoon').collection('post_likes').findOneAndUpdate(query,{ $set: {like:like_type}})
        like_result = like_type
        like_type = 2*like_type
    }
    else{ //Remove like from post (same like type)
        await Mongo.db.db('typhoon').collection('post_likes').findOneAndDelete(query)
        like_result = 0
        like_type =-like_type 
    }

    let current_post = await Mongo.db.db('typhoon').collection('posts').findOne({_id:ObjectId(postID)})
    await Mongo.db.db('typhoon').collection('posts').findOneAndUpdate({_id:ObjectId(postID)},{$set: {likes: current_post.likes + like_type}})
    
    res.status(201).json({
        likes: like_type+current_post.likes,
        like_result: like_result
    })
    
})



module.exports = router