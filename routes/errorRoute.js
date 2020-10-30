let router = require('express').Router()
var {Mongo} = require('../mongoConnection')
const { ObjectId } = require('mongodb')
var verify = require('./verifyJWT')


router.get('/:url1',function(req,res){
    res.render('error',{
        status: 404,
        message: "Can't find " +req.url
    })
})
router.get('/:url1/:url2',function(req,res){
    res.render('error',{
        status: 404,
        message: "Can't find " +req.url
    })
})
router.get('/:url1/:url2/:url3',function(req,res){
    res.render('error',{
        status: 404,
        message: "Can't find " +req.url
    })
})


module.exports=router