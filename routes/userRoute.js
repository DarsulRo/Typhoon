var router = require('express').Router()
var {Mongo} = require('../mongoConnection')
var verify = require('./verifyJWT')
const { ObjectId } = require('mongodb')
const bcrypt = require('bcrypt')

router.get('/user',verify,async function(req,res){
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},{projection:{_id:0,password:0}})

    res.redirect('/user/'+logged_user.username)
})

router.get('/user/:username',verify, async function(req,res){
    var req_user = await Mongo.db.db('typhoon').collection('users').findOne({username:req.params.username},{projection:{_id:0,password:0}})
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},{projection:{_id:0,password:0}})
    
    if(req_user==null)return res.status(404).render('error',{
        status:404,
        message:'User "'+ req.params.username+'" not found'
    })
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
router.post('/user/:username/updatesettings',verify,async function(req,res){
    var logged_user = await Mongo.db.db('typhoon').collection('users').findOne({_id:ObjectId(req.userID)},{projection:{_id:0}})
    
    let new_email = req.body.email
    let current_password= req.body.currentpassword
    let new_password = req.body.newpassword
    if(new_password=="")new_password=current_password

    let salt = bcrypt.genSaltSync()
    let hashed_new_password = bcrypt.hashSync(new_password,salt)

    if(bcrypt.compareSync(current_password,logged_user.password)){
        var req_user = await Mongo.db.db('typhoon').collection('users').findOne({email:new_email})
        if(req_user == null || logged_user.email==new_email){
            let query = {_id:ObjectId(req.userID)}
            let update = { $set: {password: hashed_new_password, email: new_email}}
            let doneupdate = await Mongo.db.db('typhoon').collection('users').findOneAndUpdate(query,update)
        }
        else{
            res.status(409).render('error',{
                status: 409,
                message: 'The new email is unavailable'
            })
        }
    }
    else{
        res.status(401).render('error',{
            status:401,
            message:'Wrong current password'
        })
    }
    res.redirect('back')
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
