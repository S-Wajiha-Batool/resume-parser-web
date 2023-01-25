const router = require('express').Router();
const JD = require("../models/JD")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_jd = require('../Middleware/upload_jd')
const path = require('path')
//const JDController = require('../controllers/JDController')

const JDController = {
    createJD: async (req, res) => {

        
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

        try {
            const savedJD = await new_jd.save()
            res.status(200).json({ error: {code: null, msg: null}, data: "JD saved" });
        } catch (err) {
            res.status(500).json({ error: {code: res.statusCode, msg: err}, data: null });
        }

    },

    getJD: async (req, res) => {
        if (!req.query.id) {
            const all_jds = await JD.find();
            res.status(200).json({ error: {code: null, msg: null}, data: {all_jds: all_jds} });
        }
        else {
            const selected_jd = await JD.findById({ _id: req.query.id })
            res.status(200).json({ error: {code: null, msg: null}, data: {jd: selected_jd} });
        }
    },

    updateJD: async (req, res) => {
        const selected_jd = await JD.findById({ _id: req.params.id })
        if (!selected_jd) {
            res.status(404).json({ code: {code: res.statusCode, msg: "JD not found"}, data: null })
        }
        else {
            try {
                const updatedJD = await JD.findByIdAndUpdate(
                    req.params.id,
                    {
                        $set: req.body,
                    },
                    { new: true }
                );

                res.status(200).json({ error: {code: null, msg: null}, data: updatedJD });
            } catch (err) {
                res.status(500).json({ error: {code: res.statusCode, msg: err}, data: null });
            }
        }
    },

    delete_JD: async (req, res) => {
        const selected_jd = await JD.findById({ _id: req.params.id })
        if (!selected_jd) {
            res.status(404).json({ error: {code: res.statusCode, msg: "JD not found"}, data: null })
        }
        else {
            try {
                if(!req.body.is_active){
                    res.status(403).json({ error: {code: res.statusCode, msg: "Permission Denied"}, data: null })
                }
                else{
                    const updatedJD = await JD.findByIdAndUpdate(
                        req.params.id,
                        {
                            $set: req.body,
                        },
                        { new: true }
                    );
                    res.status(200).json({ error: {code: null, msg: null}, data: updatedJD });
                }
            } catch (err) {
                res.status(500).json({ error: {code: res.statusCode, msg: err}, data: null });
            }
        }
    }
}


module.exports = JDController;

