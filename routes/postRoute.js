var router = require('express').Router()
var { Mongo } = require('../mongoConnection')
var verify = require('./verifyJWT')
const { ObjectId } = require('mongodb')


router.post('/newpost', verify, async function (req, res) {
    var insert = await Mongo.db.db('typhoon').collection('posts').insertOne({
        userID: ObjectId(req.userID),
        content: req.body.message,
        likes: 0,
        commentcount: 0,
        date: new Date(),
    })
    res.redirect('/')
})

router.post('/deletepost', verify,async function (req, res) {
    let query = {_id: ObjectId(req.body.actionID), userID: ObjectId(req.userID)}
    let result = await Mongo.db.db('typhoon').collection('posts').deleteOne(query)
    
    return res.status(300).json({
        result: result.result.n
    })
})

router.post('/editpost',verify,async function(req,res){
    var query = {_id: ObjectId(req.body.actionID),userID: ObjectId(req.userID)}
    var update = { $set: {content: req.body.newcontent}}
    let result = await Mongo.db.db('typhoon').collection('posts').findOneAndUpdate(query,update)
    return res.status(200).json(result.lastErrorObject.n)
})
router.post('/reportpost',verify,async function(req,res){
    Mongo.db.db('typhoon').collection('post_reports').insertOne({
        userID:ObjectId(req.userID),
        postID:ObjectId(req.body.actionID),
        reason:req.body.reason,
        message: req.body.reasonText,
        date: new Date()
    })
    res.sendStatus(201)
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
                let madeby_loggeduser = JSON.stringify(req.userID)==JSON.stringify(post.userID)?true:false
                newpost = {
                    postID: post._id,
                    content: post.content,
                    likes: post.likes,
                    commentcount: post.commentcount,
                    date: post.date,
                    username: user.username,
                    displayname: user.displayname,
                    saved: saved,
                    liked: liked,
                    madeby_loggeduser
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
    let madeby_loggeduser = JSON.stringify(post.userID)==JSON.stringify(req.userID)?true:false

    post = {
        ...post,
        postID:post._id,
        username: post_user.username,
        displayname: post_user.displayname,
        saved: post_save,
        liked: liked,
        madeby_loggeduser: madeby_loggeduser
    }
    res.json(post)
})
router.get('/getmyposts',verify,async function(req,res){
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id: ObjectId(req.userID)})
    var myposts = await Mongo.db.db('typhoon').collection('posts').find({userID:ObjectId(req.userID)}).toArray()
    let post_likes = await Mongo.db.db('typhoon').collection('post_likes').find({userID:ObjectId(req.userID)}).toArray()

    myposts = myposts.map(post => {

        let liked = 0;
        post_likes.forEach(post_like =>{
            if(JSON.stringify(post_like.postID) == JSON.stringify(post._id)){
                liked= post_like.like
            }
        })

        return {
            postID: post._id,
            content: post.content,
            likes: post.likes,
            date: post.date,
            commentcount: post.commentcount,
            username: logged_user.username,
            displayname: logged_user.displayname,
            liked: liked,
            madeby_loggeduser:true
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
    let post_likes = await Mongo.db.db('typhoon').collection('post_likes').find({userID:ObjectId(req.userID)}).toArray()
    let post_saves = await Mongo.db.db('typhoon').collection('post_saves').find({userID:ObjectId(req.userID)}).toArray()
    let madeby_loggeduser = JSON.stringify(req_user._id)==JSON.stringify(req.userID)?true:false
    

    userposts = userposts.map(post => {

        let liked = 0
        post_likes.forEach(post_like => {
            if(JSON.stringify(post_like.postID)==JSON.stringify(post._id))
                liked=post_like.like
        })
        
        let saved = false;
        post_saves.forEach(post_save=>{
            if(JSON.stringify(post_save.postID)==JSON.stringify(post._id))
            {
                saved=true;
            }
        })

        return{
            postID: post._id,
            content: post.content,
            likes: post.likes,
            commentcount: post.commentcount,
            date: post.date,
            commentcount: post.commentcount,
            username: req_user.username,
            displayname: req_user.displayname,
            saved: saved,
            liked: liked,
            madeby_loggeduser: madeby_loggeduser
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
        let madeby_loggeduser = JSON.stringify(req.userID)==JSON.stringify(savedpost.userID)?true:false

        newpost = {
            ...newpost,
            liked: liked,
            madeby_loggeduser: madeby_loggeduser
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

router.post('/addcomment',verify, async function(req,res){
    
    let nush = await Mongo.db.db('typhoon').collection('post_comments').insertOne({
        userID: ObjectId(req.userID),
        postID: ObjectId(req.body.postID),
        content: req.body.comment,
        likes: 0,
        date: new Date()
    })

    let old_commentcount = await Mongo.db.db('typhoon').collection('posts').findOne({_id:ObjectId(req.body.postID)})
    let new_commentcount = old_commentcount.commentcount + 1;
    await Mongo.db.db('typhoon').collection('posts').findOneAndUpdate({_id:ObjectId(req.body.postID)},{$set:{commentcount: new_commentcount}})
    res.status(201).json(new_commentcount)

})
router.get('/getpostcomments/:postID',verify, async function(req,res){
    let allcomments = await Mongo.db.db('typhoon').collection('post_comments').find({postID:ObjectId(req.params.postID)}).toArray()
    let allusers = await Mongo.db.db('typhoon').collection('users').find({},{projection:{username:1,displayname:1}}).toArray()
    let comment_likes = await Mongo.db.db('typhoon').collection('post_comments_likes').find({userID:ObjectId(req.userID)}).toArray()
    
    allcomments = allcomments.map(comment => {
        let new_comment
        allusers.forEach(user => {
            if(JSON.stringify(user._id)==JSON.stringify(comment.userID)){

                let madeby_loggeduser= false;
                if(JSON.stringify(req.userID)==JSON.stringify(user._id))
                {
                    madeby_loggeduser=true
                }

                let liked = 0;
                comment_likes.forEach(comment_like=>{
                    if(JSON.stringify(comment_like.commentID)==JSON.stringify(comment._id))
                    {
                        liked = comment_like.like
                    }
                })

                new_comment={
                    ...comment,
                    commentID: comment._id,
                    username:user.username,
                    displayname:user.displayname,
                    liked: liked,
                    madeby_loggeduser: madeby_loggeduser
                }
            }
        })
       
        
        return new_comment
    })
    res.json(allcomments)
})
router.post('/deletepostcomment', verify,async function (req,res){
    let query = {_id: ObjectId(req.body.actionID), userID: ObjectId(req.userID)}
    let comment = await Mongo.db.db('typhoon').collection('post_comments').findOne(query)
    let result = await Mongo.db.db('typhoon').collection('post_comments').deleteOne(query)
    let new_commentcount
    if(result.result.n){
        let postID = comment.postID
        let post = await Mongo.db.db('typhoon').collection('posts').findOne({_id:ObjectId(postID)})
        new_commentcount = post.commentcount
        new_commentcount -= 1
        await Mongo.db.db('typhoon').collection('posts').findOneAndUpdate({_id:postID},{$set:{commentcount:new_commentcount}})
    }
    res.status(300).json({
        result: result.result.n,
        commentcount: new_commentcount
    })

})
router.post('/editpostcomment', verify, async function(req,res){
    let query = {_id:ObjectId(req.body.actionID), userID: ObjectId(req.userID)}
    let update = { $set: {content: req.body.newcontent}}
    let result = await Mongo.db.db('typhoon').collection('post_comments').findOneAndUpdate(query,update)
    return res.status(200).json(result.lastErrorObject.n)
})
router.post('/reportpostcomment', verify, async function(req,res){
    await Mongo.db.db('typhoon').collection('post_comments_reports').insertOne({
        userID: ObjectId(req.userID),
        commentID: ObjectId(req.body.actionID),
        reason: req.body.reason,
        message: req.body.reasonText,
        date: new Date()
    })
    res.sendStatus(201)
})
router.post('/likepostcomment',verify, async function(req,res){
    let query = {
        commentID: ObjectId(req.body.commentID),
        userID: ObjectId(req.userID)
    }
    let like_type = req.body.like_type //Which like button the user clicked
    let deltaLike //Change post likecount by this much
    let like_result = 0  //What will the like be after

    let comment_like = await Mongo.db.db('typhoon').collection('post_comments_likes').findOne(query)
    let old_like_type 

    if(comment_like==null){  //ADD LIKE
        await Mongo.db.db('typhoon').collection('post_comments_likes').insertOne({
            ...query,
            like: like_type
        })
        deltaLike = like_type
        like_result = like_type
    }
    else{

        old_like_type = comment_like.like
        if(old_like_type==like_type){ //REMOVE LIKE
            deltaLike = -like_type
            like_result = 0
            await Mongo.db.db('typhoon').collection('post_comments_likes').deleteOne(query)
        }
        else{  //SWITCH LIKE
            deltaLike = 2*like_type
            like_result = like_type
            await Mongo.db.db('typhoon').collection('post_comments_likes').findOneAndUpdate(query,{$set:{like:like_type}})
        }
    }

    let comment = await Mongo.db.db('typhoon').collection('post_comments').findOne({_id:ObjectId(req.body.commentID)})
    let current_likecount = comment.likes
    let new_likecount = current_likecount + deltaLike
    await Mongo.db.db('typhoon').collection('post_comments').findOneAndUpdate({_id:ObjectId(req.body.commentID)},{
        $set:{likes:new_likecount}
    })

    res.json({
        likecount: new_likecount,
        like_result: like_result
    })
})
router.get('/getcommentcontent/:commentID',verify,async function(req,res){
    let comment_content = await Mongo.db.db('typhoon').collection('post_comments').findOne({_id:ObjectId(req.params.commentID)},{projection:{_id:0,content:1}})
    res.json(comment_content)
})


module.exports = router