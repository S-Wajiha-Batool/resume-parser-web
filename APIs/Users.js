const router = require('express').Router(); 
const User = require("../models/Users")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { verifyToken, verifyTokenAndAuth } = require('./verifyToken');
// const { validate } = require('../models/Users');


//Login

router.post("/login", async(req,res)=>{
    try{
        const user = await User.findOne({email:req.body.email});
        if(!user){
            res.status(401).json({status: 401, message: "Wrong Credentials"})
        }
        const decrypted_password = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
       
		const pass = decrypted_password.toString(CryptoJS.enc.Utf8);

        if(pass != req.body.password){
            res.status(401).json({status: 401, message: "Wrong Credentials"})
        }
        const accessToken = jwt.sign({
            id: user._id
        }, process.env.JWT_KEY,
        {expiresIn: "1d"}
        );
        console.log(accessToken)
        user.token = accessToken;
        user.save()
        
        const {password, ...others} = user._doc;
        res.status(200).json({status: 200, message: {accessToken}});

    }
    catch(err){
    res.status(500).json({status: 500, message:  err});
    }
});

//Signup

router.post("/signup",  verifyToken, async(req,res) => {
    
    const loggedin_user =  await User.findOne({_id:req.user.id});
     const newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY),
        user_role: req.body.user_role,
        is_active: req.body.is_active
});
     if(loggedin_user.user_role == 0){
        try{
   
            const savedUser = await newUser.save()
            res.status(201).json({status: 201, message: "User Registered"});
        } catch(err){
            res.status(500).json({status: 500, message: err});
        } 
    }
    else if(loggedin_user.user_role == 1){
        if(newUser.user_role !== 2){
            res.status(403).json({status: 403, message: "Permission Denied"})
        }
        else{
            try{
                const savedUser = await newUser.save()
                res.status(201).json({status: 201, message: "User Registered"});
            } catch(err){
                res.status(500).json({status: 500, message: err});
            } 

        }
    }
    else if(loggedin_user.user_role == 2){
        res.status(403).json({status: 403, message: "Permission Denied"})
    }
}); 

//Get Your Profile

router.get("/profile", verifyToken, async (req, res) => {
	const user = await User.findOne({ _id: req.user.id });
    const {user_role, is_active, token, createdAt, updatedAt, __v, ...others} = user._doc;
    res.status(200).json({status: 200, message: others});
});

router.get("/users", verifyToken, async(req,res) => {
    const user = await User.findOne({_id: req.user.id});
    if(user.user_role == 0){
        if(!req?.query?.id){
            const all_users = await User.find();
			res.status(200).json({status: 200, message: all_users});
        }
        else{
            const selected_user = await User.findById({_id: req.query.id});
            res.status(200).json({status: 200, message: selected_user})
        }
    }
    else if(user.user_role == 1){
        if(!req?.query?.id){
            const all_users = await User.find({user_role: {$eq: 2}})
            res.status(200).json({status: 200, message: all_users})
        }
        else{
            const selected_user = await User.findById({_id: req.query.id});
            if(selected_user.user_role !== 2){
                res.status(403).json({status: 403, message: "Permission Denied"});
            }
            else{
                res.status(200).json({status: 200, message: selected_user});
            }
        }
    }
    else if(user.user_role == 2){
        if(req.query.id){
            res.status(403).json({status: 403, message: "Permission Denied"})
        }
        else{
            const {user_role, is_active, token, createdAt, updatedAt, __v, ...others} = user._doc;
            res.status(200).json({status: 200, message: others});
        }
    }
    else{
        res.status(403).json({status: 403, message: "Permission Denied"});
    }
});

//Update

router.put("/updateUser/:id",  verifyToken, async(req,res) => {
    const loggedin_user = await User.findOne({_id: req.user.id})
    if(loggedin_user.user_role == 0){
        try {
            if (req.body.password) {
                req.body.password = CryptoJS.AES.encrypt(
                    req.body.password,
                    process.env.SECRET_KEY
                ).toString();
            }
			const updatedUser = await User.findByIdAndUpdate(
				req.params.id,
				{
					$set: req.body,
				},
				{ new: true }
			);
			res.status(200).json({status: 200, message: updatedUser});
		} catch (err) {
			res.status(500).json({status: 500, message: err});
		}
    }
    else if(loggedin_user.user_role == 1){  
        const selected_user = await User.findById(req.params.id);
        if(selected_user.user_role !== 2){
            if(req.params.id == loggedin_user.id){
                if(req.body.email || req.body.is_active || req.body.user_role){
                    res.status(403).json({status: 403, message: "Permission Denied"});
                }
                else{
                    try {
                        if (req.body.password) {
                            req.body.password = CryptoJS.AES.encrypt(
                                req.body.password,
                                process.env.SECRET_KEY
                            ).toString();
                        }
                        const updatedUser = await User.findByIdAndUpdate(
                            req.params.id,
                            {
                                $set: req.body,
                            },
                            { new: true }
                        );
                        res.status(200).json({status: 200, message: updatedUser});
                    } catch (err) {
                        res.status(500).json({status: 500, message: err});
                    }
                }
            }
            else{
                res.status(403).json({status: 403, message: "Permission Denied"})
            }
        }
        else{
            try {
                const updatedUser = await User.findByIdAndUpdate(
                    req.params.id,
                    {
                        $set: req.body,
                    },
                    { new: true }
                );
                res.status(200).json({status: 200, message: updatedUser});
            } catch (err) {
                res.status(500).json({status: 500, message: err});
            }

        }
    }
    else if(loggedin_user.user_role == 2){
        if(req.params.id == loggedin_user.id){
            if(req.body.email || req.body.is_active || req.body.user_role){
                res.status(403).json({status: 403, message: "Permission Denied"})
            }
            
            else{ 
                if (req.body.password) {
                    req.body.password = CryptoJS.AES.encrypt(
                        req.body.password,
                        process.env.SECRET_KEY 
                    ).toString();
                }
    
                try {
                    const updatedUser = await User.findByIdAndUpdate(
                        req.params.id,
                        {
                            $set: req.body,
                        },
                        { new: true }
                    );
                  res.status(200).json({status: 200, message: updatedUser});
                } catch (err) {
                    res.status(500).json({status: 500, message: err}); 
                }
            }
        }
        else{
            res.status(403).json({status: 403, message: "Permission Denied"})
        }
        
    }
    else{
        res.status(403).json({status: 403, message: "Permission Denied"})
    }
    
});

module.exports = router;
