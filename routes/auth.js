var server = require('express').Router()


server.get('/register',(req,res)=>{
    res.render('register',{error:null})
})
server.post('/register',function(req,res){
    DB.collection('users').findOne({email:req.body.email},function(err,result){
        if(err) throw err;
        else if(result == null){
            DB.collection('users').insertOne({email: req.body.email, username: req.body.username, password: req.body.password1},function(err2,result2){
                if(err2) throw err2;
                else{
                    res.redirect('/login')
                }
            })
        }
        else{
            res.render('register',{error: "This email is already in use"})
        }
    })
})
server.get('/login',(req, res)=>{
    res.render('login',{error:null})
})
server.post('/login',(req,res)=>{
    DB.collection('users').findOne({email:req.body.email, password: req.body.password},function(err,result){
        if(err) throw err;
        else if(result){
            //User found
            res.redirect('/')
        }
        else {
            res.render('login',{error:"Email or password is wrong"})
        }
    })
})
