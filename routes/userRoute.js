var router = require('express').Router()
var {Mongo} = require('../mongoConnection')
var verify = require('./verifyJWT')
const { ObjectId } = require('mongodb')


router.get('/user/:username',verify, async function(req,res){
    var req_user = await Mongo.db.db('typhoon').collection('users').findOne({username:req.params.username},{projection:{_id:0,password:0}})
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},{projection:{_id:0,password:0}})
    
    if(req_user==null)return res.status(404).render('error',{error:{
        status:404,
        msg:'User not found'
    }})
    return res.render('profile.ejs',{logged_user,req_user})
})

router.post('/user/:username/update',verify, async function(req,res){
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},{projection:{_id:0,password:0}})
    
    var personaldata={
        bio: req.body.bio,
        birthdate: req.body.birthdate,
        adress: req.body.adress,
        phonenumber: req.body.phonenumber,
        occupation: req.body.occupation,
        relationstatus: req.body.relationstatus,
    }
    let query = {_id:ObjectId(req.userID)}
    let update = { $set : {personal: personaldata, displayname: req.body.displayname}}

    var findandupdate = await Mongo.db.db('typhoon').collection('users').findOneAndUpdate(query,update)
    res.status(200).redirect('back')
})
router.post('/user/:username/updatepreferences',verify,async function(req,res){
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},{projection:{_id:0,password:0}})
    
    let preferences = {
        email: req.body.email === 'true',
        birthdate: req.body.birthdate === 'true',
        phonenumber: req.body.phonenumber === 'true',
        adress: req.body.adress === 'true',
        occupation: req.body.occupation === 'true',
        relationstatus: req.body.relationstatus === 'true'
    } 

    let query={_id:ObjectId(req.userID)}
    let update = {$set:{preferences: preferences}}

    let findandupdatepreferences = await Mongo.db.db('typhoon').collection('users').findOneAndUpdate(query,update)
    res.status(2002).redirect('back')
})


module.exports= router
