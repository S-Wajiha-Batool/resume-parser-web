const router = require('express').Router();
const JD = require("../models/JD")
const Users = require("../models/Users")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_jd = require('../Middleware/upload_jd')
const path = require('path')
//const JDController = require('../controllers/JDController')

const JDController = {
    createJD: async (req, res) => {
        try {

        const user = await Users.findById(req.user.id)
        if (!user) return res.status(404).json({ error: { code: res.statusCode, msg: 'No user found' }, data: null })

        const {position, department, experience, qualification, skills, universities} = req.body
            
        if (Object.keys(position, department, experience, qualification).length === 0) {
            return res.status(404).json({ error: { code: res.statusCode, msg: 'Input data missing' }, data: null })
        }

        // we dont need upload date, timestamps has it
        var date_ob = new Date();
        var day = ("0" + date_ob.getDate()).slice(-2);
        var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        var year = date_ob.getFullYear();
        var date = year + "-" + month + "-" + day;

        // const new_jd = new JD({
        //     jd_url: req.file.path,
        //     position_name: req.body.position,
        //     department_name: req.body.department,
        //     job_posted_by: req.user.id,
        //     upload_date: date
        // });

        //use this after db update
        //const newJd = new JD({position, department, experience, qualification, skills, universities, uploaded_by: user._id })
        //if (!newJd) return res.status(404).json({ error: { code: res.statusCode, msg: 'Job not posted' }, data: null })
            return res.status(200).json({ error: { code: null, msg: null }, data: {msg: "JD uploaded successfully"}});
        } catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null });
        }

    },

    getJD: async (req, res) => {
        try {
            console.log(req.params.id)

            if (!req.params.id) {
                const all_jds = await JD.find();
                return res.status(200).json({ error: { code: null, msg: null }, data: { all_jds: all_jds } });
            }

            else {
                console.log(req.params.id)
                const selected_jd = await JD.findById({ _id: req.params.id })
                return res.status(200).json({ error: { code: null, msg: null }, data: { jd: selected_jd,  cvs: null} });
            }
        }
        catch (err){
            return res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null });
        }
    },

    updateJD: async (req, res) => {
        const selected_jd = await JD.findById({ _id: req.params.id })
        if (!selected_jd) {
            res.status(404).json({ code: { code: res.statusCode, msg: "JD not found" }, data: null })
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

                res.status(200).json({ error: { code: null, msg: null }, data: updatedJD });
            } catch (err) {
                res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null });
            }
        }
    },

    delete_JD: async (req, res) => {
        const selected_jd = await JD.findById({ _id: req.params.id })
        if (!selected_jd) {
            res.status(404).json({ error: { code: res.statusCode, msg: "JD not found" }, data: null })
        }
        else {
            try {
                if (!req.body.is_active) {
                    res.status(403).json({ error: { code: res.statusCode, msg: "Permission Denied" }, data: null })
                }
                else {
                    const updatedJD = await JD.findByIdAndUpdate(
                        req.params.id,
                        {
                            $set: req.body,
                        },
                        { new: true }
                    );
                    res.status(200).json({ error: { code: null, msg: null }, data: updatedJD });
                }
            } catch (err) {
                res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null });
            }
        }
    }
}


module.exports = JDController;

