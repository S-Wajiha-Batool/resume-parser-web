const router = require('express').Router(); 
const JD = require("../models/JD")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_jd = require('../Middleware/upload_jd')
const path = require('path')

//Create JD

router.post("/createJD", upload_jd.single('text') ,async(req,res)=>{
    var date_ob = new Date();
    var day = ("0" + date_ob.getDate()).slice(-2);
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var year = date_ob.getFullYear();
    var date = year + "-" + month + "-" + day;

    const new_jd = new JD({
        text: req.file.path,
        position_name: req.body.position_name,
        is_active: req.body.is_active,
        upload_date: date
    });

    try{
        const savedJD = await new_jd.save()
        res.status(201).json({status: 201, message: "JD Created"});
    } catch(err){
        res.status(500).json({status: 500, message: err});
    } 

});

//Get JD(s)

router.get("/getJDs", async(req,res)=>{
    if(!req.query.id){
        const all_jds = await JD.find();
        res.status(200).json({status: 200, message: all_jds});
    }
    else{
        const selected_jd = await JD.findById({_id: req.query.id})
        res.status(200).json({status: 200, message: selected_jd});
    }

});

//Update JD

router.put("/updateJD/:id", async(req,res) =>{
    const selected_jd = await JD.findById({_id: req.params.id})
    if(!selected_jd){
        res.status(404).json({status: 404, message:"JD not found"})
    }
    else{
        try{
            const updatedJD = await JD.findByIdAndUpdate(
                req.params.id,
                {
                    $set: req.body,
                },
                { new: true }
            );
            
            res.status(200).json({status: 200, message: updatedJD});
        }catch(err){
            res.status(500).json({status: 500, message: err});
        }
    }
});

module.exports = router;

