const router = require('express').Router();
const JD = require("../models/JD")
const Users = require("../models/Users")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_jd = require('../Middleware/upload_jd')
const path = require('path');
const upload = require('../Middleware/upload_cv');
const CV_JD = require("../models/CV_JD");
const CV = require('../models/CV');
const { Console } = require('console');
const { type } = require('os');
//let ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
//const JDController = require('../controllers/JDController')

class cv_details {
    constructor(weighted_percentage, fullname, email, upload_date) {
        this.weighted_percentage = weighted_percentage;
        this.fullname = fullname;
        this.email = email;
        this.upload_date = upload_date;
    }
}

const JDController = {
    createJD: async (req, res) => {
        try {

            const user = await Users.findById(req.user.id)
            console.log(user._id)
            if (!user) return res.status(404).json({ error: { code: res.statusCode, msg: 'No user found' }, data: null })

            const { position, department, experience, qualification, skills, universities } = req.body

            if (Object.keys(position, department, experience, qualification).length === 0) {
                return res.status(404).json({ error: { code: res.statusCode, msg: 'Input data missing' }, data: null })
            }

            // const {position, department, experience, qualification, skills, universities} = req.body

            // we dont need upload date, timestamps has it
            var date_ob = new Date();
            var day = ("0" + date_ob.getDate()).slice(-2);
            var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            var year = date_ob.getFullYear();
            var date = year + "-" + month + "-" + day;

            const newJd = new JD({
                position: position,
                department: department,
                experience: experience,
                qualification: qualification,
                skills: skills,
                universities: universities,
                uploaded_by: user._id
            });

            // if (newJd(position, department, experience, qualification, skills, universities).length === 0) {
            //     return res.status(404).json({ error: { code: res.statusCode, msg: 'Input data missing' }, data: null })
            // }
            if (!newJd)
                return res.status(404).json({ error: { code: res.statusCode, msg: 'Job not posted' }, data: null })
            else {
                const savedJD = await newJd.save()
                return res.status(200).json({ error: { code: null, msg: null }, data: { msg: "JD uploaded successfully" } });
            }

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
                //console.log("JD_Details", JD_detail)
                console.log(req.params.id)
                //const id = new mongoose.Types.ObjectID(req.params.id)

                const id = ObjectId(req.params.id);

                CV_JD.aggregate([
                    {
                        $match: { JD_ID: id }
                    },
                    {
                        $lookup: {
                            from: "cvs",
                            localField: "CV_ID",
                            foreignField: "_id",
                            as: "matchlist"
                        }
                    }
                ],
                    async function async(err, comments) {
                        if (err) {
                            return res.status(404).json({ error: { code: res.statusCode, msg: 'Error in loading comments' }, data: null })
                        } else {
                            console.log(comments.length)
                            const temp_list = [];
                            for (var i = 0; i < comments.length; i++) {
                               // for (var j = 0; j < comments[i].matchlist.length; j++) {
                                    console.log(comments[i].matchlist.length)
                                    const new_comments = new cv_details({
                                        weighted_percentage: comments[i].weighted_percentage,
                                        fullname: comments[i].matchlist[0].full_name,
                                        email: comments[i].matchlist[0].email,
                                        upload_date: comments[i].matchlist[0].createdAt
                                    });
                                    //const job = await new_comments.save();
                                    temp_list.push(new_comments)
                                    // console.log(comments[i].weighted_percentage)
                                    // console.log(comments[i].matchlist[i].full_name)
                                    console.log(temp_list)
                                //}

                            }

                            // const new_comments = new cv_details({
                            //     weighted_percentage : 
                            // });
                            //console.log(JSON.stringify(comments.matchlist))

                            return res.status(200).json({ comments })
                        }
                    });

                // JD_detail.aggregate([
                //     // {
                //     //     $match: { "JD_ID": req.params.id }
                //     // },
                //     {
                //         $lookup: {
                //             from: 'cvs',
                //             localField: 'CV_ID',
                //             foreignField: '_id',
                //             as: 'matchesList',
                //         },
                //     }
                // ], function (err, comments) {
                //     if (err) {
                //         return res.status(404).json({ "success": false, "message": 'Error in loading comments' })
                //     } else {
                //         console.log(JSON.stringify(comments))

                //         return res.status(200).json({ comments })
                //     }
                // })
                // const updated = await CV.aggregate([
                //     {
                //         $match: {"CV_ID": CV.CV_ID}
                //       },
                //     {
                //       $lookup: {
                //         from: 'CV_JD',
                //         localField: 'CV_ID',
                //         foreignField: 'CV_ID',
                //         as: 'matchesList',
                //       },
                //     },
                //   ]);
                //   console.log("updated" ,updated)
                //   const updated1 = await updated.find();
                //   console.log("updated1", updated1)
                //   const result = JSON.parse(JSON.stringify(updated1));
                //   console.log(result)

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
                //return res.status(200).json({ error: {code: null, msg: null}, data: CV_details})

            }
        } catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null })
        }
    }
}


module.exports = JDController;

