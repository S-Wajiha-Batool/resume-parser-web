const jwt = require('jsonwebtoken');

const verifyToken = (req,res,next)=>{
    
    const authHeader = req.headers.token;
    if(authHeader){
        const token = authHeader.split(" ")[1];
        if (!token)  
        return res.status(401).json({
            error: { code: res.statusCode, msg: 'Invalid Authorization: token missing'},
            data: null,
        })
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) =>{
            if(err){
                return res.status(403).json({ error: { code: res.statusCode, msg: err.message }, data: null })

            }
            req.user = user;
            next();
        })

    }
};

const verifyTokenAndAuth = (req,res,next)=>{
    verifyToken(req,res,()=>{
        if(req.user.id === req.params.id){
            next()
        }
        else{
            res.status(403).json("Permission Denied")
        }
    })
}
module.exports = {verifyToken, verifyTokenAndAuth};