const router = require('express').Router();
const CV = require("../models/CV")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_cv = require('../Middleware/upload_cv')
const path = require('path');
const JD = require('../models/JD');
const CV_JD = require('../models/CV_JD');
const Users = require('../models/Users');

const CVController = {
    createCV: async (req, res) => {

        const user = await Users.findById(req.user.id)
            console.log(user._id)
            if (!user) return res.status(404).json({ error: { code: res.statusCode, msg: 'No user found' }, data: null })

        const new_CV = new CV({
            cv_url: req.file.path,
            position: req.body.position,
            department: req.body.department,
            skills: req.body.skills,
            experiance: req.body.experiance,
            qualification: req.body.qualification,
            links: req.body.links,
            email: req.body.email,
            phone_number: req.body.phone_number,
            full_name: req.body.full_name,
            uploaded_by: user._id
        });

        try {
            const savedCV = await new_CV.save()
            return res.status(200).json({ error: {code: null, msg: null}, data: "CV Saved" });
        } catch (err) {
            return res.status(500).json({ error: {code: null, msg: err}, data: null });
        }

    },

    getCV: async (req, res) => {
        try {
            console.log(req.params.id)

            if (!req.params.id) {
                const all_cvs = await CV.find();
                return res.status(200).json({ error: { code: null, msg: null }, data: { all_cvs: all_cvs } });
            }

            else {
                console.log(req.params.id)
                const selected_cv = await CV.findById({ _id: req.query.id })
                return res.status(200).json({ error: { code: null, msg: null }, data: { cv: selected_cv,  cvs: null} });
            }
        }
        catch (err){
            return res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null });
        }
    },

    updatCV: async (req, res) => {
        const selected_cv = await CV.findById({ _id: req.params.id })
        if (!selected_cv) {
            return res.status(404).json({ error: {code: res.statusCode, msg: "CV not found"}, data: null })
        }
        else {
            try {
                const updatedCV = await CV.findByIdAndUpdate(
                    req.params.id,
                    {
                        $set: req.body,
                    },
                    { new: true }
                );

                return res.status(200).json({ error: {code: null, msg: null}, data: updatedCV });
            } catch (err) {
                return res.status(500).json({ error: {code: res.statusCode, msg: err}, data: null });
            }
        }
    },
    
    create_rankings: async(req, res) =>{
        const new_CV_JD = new CV_JD({
            JD_ID: req.body.JD_ID,
            CV_ID: req.body.CV_ID,
            weighted_percentage: req.body.weighted_percentage,
            rank: req.body.rank,
            hire_status: req.body.hire_status
        });

        try {
            const savedCV_JD = await new_CV_JD.save()
            return res.status(200).json({ error: {code: null, msg: null}, data: "Rank Created" });
        } catch (err) {
            return res.status(500).json({ error: {code: null, msg: err}, data: null });
        }
    },

    update_rankings: async(req, res) =>{
        
    }
    

}

module.exports = CVController;

