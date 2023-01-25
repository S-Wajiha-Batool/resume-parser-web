const router = require('express').Router();
const CV = require("../models/CV")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_cv = require('../Middleware/upload_cv')
const path = require('path');
const JD = require('../models/JD');

const CVController = {
    createCv: async (req, res) => {

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

        try {
            const savedcCV = await new_CV.save()
            res.status(200).json({ error: {code: null, msg: null}, data: "CV Saved" });
        } catch (err) {
            res.status(500).json({ error: {code: null, msg: err}, data: null });
        }

    },

    getCV: async (req, res) => {

        if (!req.query.id) {
            const all_cvs = await CV.find();
            res.status(200).json({ error: {code: null, msg: null}, data: all_cvs });
        }
        else {
            const selected_cv = await CV.findById({ _id: req.query.id })
            res.status(200).json({ error: {code: null, msg: null},data: selected_cv });
        }

    },

    updatCV: async (req, res) => {
        const selected_cv = await CV.findById({ _id: req.params.id })
        if (!selected_cv) {
            res.status(404).json({ error: {code: res.statusCode, msg: "CV not found"}, data: null })
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

                res.status(200).json({ error: {code: null, msg: null}, data: updatedCV });
            } catch (err) {
                res.status(500).json({ error: {code: res.statusCode, msg: err}, data: null });
            }
        }
    },
    getallCV: async(req, res) => {
        try{
            const cvs = await JD.find({ JD_ID: { $eq: req.params.id } });
            res.status(200).json({ error: {code: null, msg: null}, data: cvs });
        }
        catch(err){
            res.status(500).json({ error: {code: res.statusCode, msg: err}, data: null})
        }


    }

}

module.exports = CVController;

