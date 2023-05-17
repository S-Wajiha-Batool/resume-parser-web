const router = require('express').Router();
const JD = require("../models/JD")
const Users = require("../models/Users")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_jd = require('../Middleware/upload_jd')
const path = require('path');
const upload = require('../middleware/upload_cv');
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
            //console.log(user._id)
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
            //var date = year + "-" + month + "-" + day;

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
            // console.log(req.params.id)
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

                return res.status(200).json({ error: { code: null, msg: null }, data: { msg: "JD updated successfully" } });
            } catch (err) {
                return res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null });
            }
        }
    },

    delete_JD: async (req, res) => {
        try {
            // console.log(req.body)
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
            //console.log(dict)
            const formated_response = [];
            jds.forEach(jd => {

                //formated_response.push( { x: jd.department, y: dict[jd.department] + 1 } )

                dict[jd.department] = dict[jd.department] + 1;
            })

            for (const [key, value] of Object.entries(dict)) {
                formated_response.push({ x: key, y: value })
            }
            return res.status(200).json({ error: { code: null, msg: null }, data: formated_response });


        }
        catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null })
        }
    },

    highest_rank: async (req, res) => {
        try {
            const ranks = [];
            var count = 0;
            const active_cvs = await CV.find({ is_active: { $eq: true } })
            const active_jds = await JD.find({ is_active: { $eq: true } })
            const active_cvs_jds = await CV_JD.find({ is_active_cv_jd: { $eq: true } })
            const active_positions = [];
            active_cvs_jds.forEach(active_cv_jd => {
                active_jds.forEach(active_jd => {
                    active_cvs.forEach(active_cv => {
                        if (active_cv_jd.JD_ID.equals(active_jd._id) && active_cv_jd.CV_ID.equals(active_cv._id)) {

                            active_positions.push(active_cv_jd)
                        }
                    })
                })
            })

            var count = 0;
            const total_cvs = await CV.find();
            active_positions.forEach(active_position => {
                if (active_position.weighted_percentage > 80) {
                    count++;
                }
            })
            var highest_percentage = (count / total_cvs.length) * 100;

            return res.status(200).json({ error: { code: null, msg: null }, data: count, highest_percentage });

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
        const currentDate = new Date();
        
        var lastWeekStart = new Date();
        var lastWeekEnd = new Date();
        var currentWeekStart = new Date();
        var currentWeekEnd = new Date();
        const currentHour = currentDate.getHours();

        console.log("current", currentDate);
        console.log("Day", currentDate.getDay());
        if (currentDate.getDay() === 0) {
            lastWeekStart = new Date(currentDate.getTime() - 6 * 24 * 3600 * 1000);
            lastWeekEnd = new Date(currentDate.getTime() - 1 * 24 * 3600 * 1000);
            
            currentWeekStart = new Date(currentDate.getTime() + 1 * 24 * 3600 * 1000);
            currentWeekEnd = new Date(currentDate.getTime() + 6 * 24 * 3600 * 1000);
        }
        else if (currentDate.getDay() === 1) {
            lastWeekStart = new Date(currentDate.getTime() - 7 * 24 * 3600 * 1000);
            lastWeekEnd = new Date(currentDate.getTime() - 2 * 24 * 3600 * 1000);
            currentWeekStart = new Date(currentDate.getTime());
            currentWeekEnd = new Date(currentDate.getTime() + 5 * 24 * 3600 * 1000);
        }
        else if (currentDate.getDay() === 2) {
            lastWeekStart = new Date(currentDate.getTime() - 8 * 24 * 3600 * 1000);
            lastWeekEnd = new Date(currentDate.getTime() - 3 * 24 * 3600 * 1000);
            currentWeekStart = new Date(currentDate.getTime() - 1 * 24 * 3600 * 1000);
            currentWeekEnd = new Date(currentDate.getTime() + 4 * 24 * 3600 * 1000);
        }
        else if (currentDate.getDay() === 3) {
            lastWeekStart = new Date(currentDate.getTime() - 9 * 24 * 3600 * 1000);
            lastWeekEnd = new Date(currentDate.getTime() - 4 * 24 * 3600 * 1000);
            currentWeekStart = new Date(currentDate.getTime() - 2 * 24 * 3600 * 1000);
            currentWeekEnd = new Date(currentDate.getTime() + 3 * 24 * 3600 * 1000);
            console.log("l start", lastWeekStart);
            console.log("l end", lastWeekEnd);
            console.log("c start", currentWeekStart);
            console.log("c end", currentWeekEnd);

        }
        else if (currentDate.getDay() === 4) {
            lastWeekStart = new Date(currentDate.getTime() - 10 * 24 * 3600 * 1000);
            lastWeekEnd = new Date(currentDate.getTime() - 5 * 24 * 3600 * 1000);
            currentWeekStart = new Date(currentDate.getTime() - 3 * 24 * 3600 * 1000);
            currentWeekEnd = new Date(currentDate.getTime() + 2 * 24 * 3600 * 1000);
        }
        else if (currentDate.getDay() === 5) {
            lastWeekStart = new Date(currentDate.getTime() - 11 * 24 * 3600 * 1000);
            lastWeekEnd = new Date(currentDate.getTime() - 6 * 24 * 3600 * 1000);
            currentWeekStart = new Date(currentDate.getTime() - 4 * 24 * 3600 * 1000);
            currentWeekEnd = new Date(currentDate.getTime() + 1 * 24 * 3600 * 1000);
        }
        else if (currentDate.getDay() === 6) {
            lastWeekStart = new Date(currentDate.getTime() - 12 * 24 * 3600 * 1000);
            lastWeekEnd = new Date(currentDate.getTime() - 7 * 24 * 3600 * 1000);
            currentWeekStart = new Date(currentDate.getTime() -7 * 24 * 3600 * 1000);
            currentWeekEnd = new Date(currentDate.getTime());
        }
        try {
            const JDs = await JD.find();

            var l_count = 0;
            var c_count = 0;
            JDs.forEach(JD => {
                if (JD.createdAt >=lastWeekStart && JD.createdAt <= lastWeekEnd) {
                    l_count++;
                }
                if(JD.createdAt >= currentWeekStart && JD.createdAt <= currentWeekEnd) {
                    c_count++;
                }
                 }
            );
            console.log("c_count", c_count);
            console.log("l_count", l_count);
            if (JDs.length == 0) {
                return res.status(200).json({ error: { code: null, msg: null }, data: 0 });
            }
        
            const increased_percentage = ((c_count - l_count) / (l_count)) * 100;
            const total_jds = JDs.length;
            console.log("percentage", increased_percentage);
            return res.status(200).json({ error: { code: null, msg: null }, data: increased_percentage });

        }
        catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null })
        }
    }



}
module.exports = JDController;

