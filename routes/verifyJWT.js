const jwt = require('jsonwebtoken')

module.exports = function(req,res,next){
    const token = req.cookies.jwt
    
    console.log(__dirname)
    if(!token) {
        return res.status(401).render('launch')
    }
    try {
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN)
        req.userID = verified.id;
        next();
    } catch (error) {
        res.status(401).render('launch')
    }
}