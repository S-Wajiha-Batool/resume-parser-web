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
    // weighted_percentage = 0;
    // full_name = "";
    // emails = [];
    // uploaded_by = ObjectId;
    constructor(weighted_percentage, full_name, emails, uploaded_by) {
        this.weighted_percentage = weighted_percentage;
        this.full_name = full_name;
        this.emails = emails;
        this.uploaded_by = uploaded_by;
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

            const savedJD = await newJd.save()
            if (!savedJD)
                return res.status(404).json({ error: { code: res.statusCode, msg: 'Job not posted' }, data: null })

            return res.status(200).json({ error: { code: null, msg: null }, data: { msg: "JD uploaded successfully" } });

        } catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null });
        }

    },

    getJD: async (req, res) => {
        try {
            console.log(req.params.id)
            //const uploaded_by = await Users.find(req.params.id)
            //console.log(ObjectId(uploaded_by))

            if (!req.params.id) {
                const all_jds = await JD.find({ is_active: { $eq: true } });

                return res.status(200).json({ error: { code: null, msg: null }, data: { all_jds: all_jds } });
            }

            else {

                const selected_jd = await JD.findById({ _id: req.params.id })
                const id = ObjectId(req.params.id);
                //getCvs
                CV_JD.aggregate([
                    {
                        $match: { JD_ID: id }
                    },
                    {
                        $match: { "is_active_cv_jd": true }
                    },
                    {
                        $lookup: {
                            from: "cvs",
                            localField: "CV_ID",
                            foreignField: "_id",
                            as: "matchlist"
                        }
                    },
                    {
                        $unset: ["matchlist._id", "createdAt", "updatedAt"]
                    },
                    {
                        $match: { "matchlist.is_active": true }
                    },
                    { $unwind: "$matchlist" },
                    {
                        $replaceRoot: {
                            newRoot: {
                                $mergeObjects: [
                                    {
                                        $arrayToObject: {
                                            $filter: {
                                                input: { "$objectToArray": "$$ROOT" },
                                                cond: { "$not": { "$in": ["$$this.k", ["matchlist"]] } },
                                            },
                                        },
                                    },
                                    "$matchlist"
                                ]
                            }
                        }
                    },
                ],
                    async function (err, result) {

                        if (err) {
                            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null })
                        } else {
                            JSON.stringify(result.sort(function (x, y) {
                                return y.weighted_percentage - x.weighted_percentage;
                            }))
                            // result = JSON.stringify(result.sort(function (x, y) {
                            //     return y.weighted_percentage - x.weighted_percentage;
                            // }))
                            //console.log(result.weighted_percentage)
                            return res.status(200).json({ error: { code: null, msg: null }, data: { jd: selected_jd, cvs: result } });
                        }
                    });

            }
        }
        catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null });
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
        try {
            console.log(req.body)
            const updatedJD = await JD.findByIdAndUpdate(
                ObjectId(req.params.id),
                {
                    $set: req.body,
                },
                { new: true }
            );
            res.status(200).json({ error: { code: null, msg: null }, data: updatedJD });


        } catch (err) {
            res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null });
        }

    },

    JD_count: async (req, res) => {
        try {
            var dict = {};
            const jds = await JD.find();
            jds.forEach(jd => {
                dict[jd.department] = 0;
            })
            console.log(dict)

            jds.forEach(jd => {
                
                dict[jd.department] = dict[jd.department] + 1;
            })
            return res.status(200).json({ error: { code: null, msg: null }, data: dict });

        }
        catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null })
        }
    },

    get_job_details: async (req, res) => {
        try {
            if (!req.params.id) { //jd id will be given in parameter
                return res.status(404).json({ error: { code: res.statusCode, msg: "JD not found" }, data: null });
            }
            else {

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
                    },
                    {
                        $unset: ["matchlist._id", "createdAt", "updatedAt"]
                    },
                    { $unwind: "$matchlist" },
                    {
                        $replaceRoot: {
                            newRoot: {
                                $mergeObjects: [
                                    {
                                        $arrayToObject: {
                                            $filter: {
                                                input: { "$objectToArray": "$$ROOT" },
                                                cond: { "$not": { "$in": ["$$this.k", ["matchlist"]] } },
                                            }
                                        },
                                    },
                                    "$matchlist"
                                ]
                            }
                        }
                    },
                ],
                    function (err, result) {
                        if (err) {
                            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null })
                        } else {
                            console.log(JSON.stringify(result.sort(function (x, y) {
                                return y.weighted_percentage - x.weighted_percentage;
                            })))

                            return res.status(200).json({ result })
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
    },
    increased_JD: async (req, res) => {
        try {
            const JDs = await JD.find();
            var date_ob = new Date();
            var count = 0;
            JDs.forEach(JD => {
                const diff = Math.abs(date_ob - JD.createdAt)
                console.log(date_ob)
                console.log(JD.createdAt)
                const d = diff / (1000 * 3600 * 24)
                console.log(d)
                if (d > 7) {
                    count++;
                }
            });
            const increased_percentage = (count / JDs.length) * 100;
            return res.status(200).json({ error: { code: null, msg: null }, data: increased_percentage });

        }
        catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null })
        }
    },
    JD_distribution: async(req, res) => {
        try{
            var dict = {
                "0% - 10%" : 0,
                "10% - 20%" : 0,
                "20% - 30%" : 0,
                "30% - 40%" : 0,
                "40% - 50%" : 0,
                "50% - 60%" : 0,
                "60% - 70%" : 0,
                "70% - 80%" : 0,
                "80% - 90%" : 0,
                "90% - 100%" : 0,
            }
            const all_cv_jd = await CV_JD.find();
            all_cv_jd.forEach(each_cv_jd => {
                if(Math.round(each_cv_jd.weighted_percentage) >=0 && Math.round(each_cv_jd.weighted_percentage) <10){
                    dict["0% - 10%"] = dict["0% - 10%"] + 1; 
                }
                else if(Math.round(each_cv_jd.weighted_percentage) >=10 && Math.round(each_cv_jd.weighted_percentage) <20){
                    dict["10% - 20%"] = dict["10% - 20%"] + 1; 
                }
                else if(Math.round(each_cv_jd.weighted_percentage) >=20 && Math.round(each_cv_jd.weighted_percentage) <30){
                    dict["20% - 30%"] = dict["20% - 30%"] + 1; 
                }
                else if(Math.round(each_cv_jd.weighted_percentage) >=30 && Math.round(each_cv_jd.weighted_percentage) <40){
                    dict["30% - 40%"] = dict["30% - 40%"] + 1; 
                }
                else if(Math.round(each_cv_jd.weighted_percentage) >=40 && Math.round(each_cv_jd.weighted_percentage) <50){
                    dict["40% - 50%"] = dict["40% - 50%"] + 1; 
                }
                else if(Math.round(each_cv_jd.weighted_percentage) >=50 && Math.round(each_cv_jd.weighted_percentage) <60){
                    dict["50% - 60%"] = dict["50% - 60%"] + 1; 
                }
                else if(Math.round(each_cv_jd.weighted_percentage) >=60 && Math.round(each_cv_jd.weighted_percentage) <70){
                    dict["60% - 70%"] = dict["60% - 70%"] + 1; 
                }
                else if(Math.round(each_cv_jd.weighted_percentage) >=70 && Math.round(each_cv_jd.weighted_percentage) <80){
                    dict["70% - 80%"] = dict["70% - 80%"] + 1; 
                }
                else if(Math.round(each_cv_jd.weighted_percentage) >=80 && Math.round(each_cv_jd.weighted_percentage) <90){
                    dict["80% - 90%"] = dict["80% - 90%"] + 1; 
                }
                else if(Math.round(each_cv_jd.weighted_percentage) >=90 && Math.round(each_cv_jd.weighted_percentage) <100){
                    dict["90% - 100%"] = dict["90% - 100%"] + 1; 
                }
                
            });
            return res.status(200).json({ error: { code: null, msg: null }, data: dict });
        }
        catch(err){
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null })
        }

    }
}



module.exports = JDController;

