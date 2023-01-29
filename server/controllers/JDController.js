const router = require('express').Router();
const JD = require("../models/JD")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_jd = require('../Middleware/upload_jd')
const path = require('path');
const upload = require('../Middleware/upload_cv');
const CV_JD = require("../models/CV_JD");
const CV = require('../models/CV');
//const JDController = require('../controllers/JDController')

const JDController = {
    createJD: async (req, res) => {


        var date_ob = new Date();
        var day = ("0" + date_ob.getDate()).slice(-2);
        var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        var year = date_ob.getFullYear();
        var date = year + "-" + month + "-" + day;

        var upload_date = date.toString();
        upload_date = upload_date.substring(0, 10);

        const new_jd = new JD({
            jd_url: req.file.path,
            position_name: req.body.position_name,
            upload_date: upload_date,
            department_name: req.body.department_name,
            uploaded_by: req.body.uploaded_by,
            skills: req.body.skills,
            experiance: req.body.experiance,
            qualification: req.body.qualification
        });

        try {
            const savedJD = await new_jd.save()
            res.status(200).json({ error: { code: null, msg: null }, data: "JD saved" });
        } catch (err) {
            res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null });
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
                return res.status(200).json({ error: { code: null, msg: null }, data: { jd: selected_jd, cvs: null } });
            }
        }
        catch (err) {
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
    },

    get_job_details: async (req, res) => {
        try {
            if (!req.params.id) { //jd id will be given in parameter
                return res.status(404).json({ error: { code: res.statusCode, msg: "JD not found" }, data: null });
            }
            else {
                const JD_detail = await CV_JD.find({ JD_ID: { $eq: req.params.id } });
                const cv_details = CV.aggregate([{
                    $lookup: {
                    From: JD_detail,
                    LocalField: CV_ID,
                    foreignField: CV_ID,
                    as: "CV_details"
                    }}]);
                console.log(CV_detail)
                
                // let CV_IDs = [];
                // for (var i=0; i < JD_detail.length; i++){
                //     CV_IDs.push(JD_detail[i].CV_ID)
                // }
                // console.log("cvvvvv", CV_IDs)
                // console.log(CV_IDs)

                // let CV_details = await CV.find({ id: CV_IDs._id })

                // console.log(CV_details)

                //const CV_details = await CV.find({ CV_ID: { $eq: }})
                //const { user_role, is_active, token, createdAt, updatedAt, __v, ...others } = user._doc;
                
                //console.log(JD_detail)
                return res.status(200).json({ error: {code: null, msg: null}, data: JD_detail})
                
            }
        } catch (err) {
    return res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null })
}
    }
}


module.exports = JDController;

