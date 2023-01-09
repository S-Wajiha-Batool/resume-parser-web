const router = require('express').Router(); 
const CV = require("../models/CV")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_cv = require('../Middleware/upload_cv')
const path = require('path')

//Create CV

router.post("/createCV", upload_cv.single('CV') ,async(req,res)=>{
    var date_ob = new Date();
    var day = ("0" + date_ob.getDate()).slice(-2);
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var year = date_ob.getFullYear();
    var date = year + "-" + month + "-" + day;

    const new_CV = new CV({
        CV: req.file.path,
        position_name: req.body.position_name,
        upload_date: date
    });

    try{
        const savedcCV = await new_CV.save()
        res.status(201).json({status: 201, message: "CV Saved"});
    } catch(err){
        res.status(500).json({status: 500, message: err});
    } 

});

//Get CV(s)

router.get("/getCVs", async(req,res)=>{
    if(!req.query.id){
        const all_cvs = await CV.find();
        res.status(200).json({status: 200, message: all_cvs});
    }
    else{
        const selected_cv = await CV.findById({_id: req.query.id})
        res.status(200).json({status: 200, message: selected_cv});
    }

});

//Update CV

router.put("/updateCV/:id", async(req,res) =>{
    const selected_cv = await CV.findById({_id: req.params.id})
    if(!selected_cv){
        res.status(404).json({status: 404, message: "CV not found."})
    }
    else{
        try{
            const updatedCV = await CV.findByIdAndUpdate(
                req.params.id,
                {
                    $set: req.body,
                },
                { new: true }
            );
            
            res.status(200).json({status: 200, message: updatedCV});
        }catch(err){
            res.status(500).json({status: 500, message: err});
        }
    }
});

module.exports = router;

