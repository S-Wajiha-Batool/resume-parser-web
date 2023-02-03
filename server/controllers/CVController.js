const router = require('express').Router();
const CV = require("../models/CV")
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_cv = require('../middleware/upload_cv')
const path = require('path');
const JD = require('../models/JD');
const CV_JD = require('../models/CV_JD');
const Users = require('../models/Users');
const { spawn } = require("child_process");
var request = require('request-promise');

const CVController = {
    parseCV: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id)
            console.log(user._id)
            if (!user) return res.status(404).json({ error: { code: res.statusCode, msg: 'No user found' }, data: null })

            var data = []//parsedcv
            var files = []//files
            console.log(req.files)
            const promises = req.files.map(async (file) => new Promise(async (resolve, reject) => {
                resolve(files.push(file.filename))
            }))

            await Promise.all(promises)
            console.log(files)

            var options = {
                method: 'POST',
                uri: 'http://127.0.0.1:5000/parse_cv',
                body: files,
                json: true
            };

            //api call to flask to get parsed CVs
            await new Promise(async (resolve, reject) => {
                await request(options)
                    .then(function (parsedBody) {
                        console.log(parsedBody);
                        resolve(data = parsedBody)
                        //return res.status(200).json({ error: { code: res.statusCode, msg: err }, data: parsedBody })
                    })
                    .catch(function (err) {
                        console.log(err)
                        return res.status(500).json({ error: { code: res.statusCode, msg: "Error in CV parsing" }, data: null })
                    });
            })

            //uploading data to mongoDB
            const promisess = data.map(async (cv, index) => new Promise(async (resolve, reject) => {
                const new_CV = new CV({
                    uploaded_by: user._id,
                    full_name: cv.full_name,
                    phone_number: cv.phone_number,
                    emails: cv.emails,
                    experience: cv.experience,
                    qualification: cv.qualification,
                    skills: cv.skills,
                    universities: cv.universities,
                    links: cv.links,
                    cv_path: req.files[index].path
                });

                // if (newJd(position, department, experience, qualification, skills, universities).length === 0) {
                //     return res.status(404).json({ error: { code: res.statusCode, msg: 'Input data missing' }, data: null })
                // }
                resolve(await new_CV.save())
            }))

            await Promise.all(promisess)

            return res.status(200).json({ error: { code: null, msg: null }, data: { msg: "CVs parsed successfully" } });


            // const childPython = spawn('python', ['./parse_cv.py', '1675098578460.pdf']);
            // childPython.stderr.pipe(process.stderr)

            // childPython.stdout.on('data', (data) => {
            //     //console.log(data)
            //     return res.status(200).json({ error: { code: null, msg: null }, data: data.toString() })
            // });

            // childPython.stderr.on('data', (data) => {
            //     console.error(`There was an error: ${data.toString}`);
            //     return res.status(200).json({ error: { code: null, msg: null }, data: data.toString() })
            // });

            // await new Promise( (resolve) => {
            //     childPython.on('close', (code) => {
            //         console.log(`child process exited with code ${code}`);
            //     });
            // })


            // const new_CV = new CV({
            //     CV: req.file.path,
            //     position_name: req.body.position_name,
            //     upload_date: date
            // });
            console.log(ids[0].name)

            //const savedcCV = await new_CV.save()
            return res.status(200).json({ error: { code: null, msg: null }, data: { data: data } });
        } catch (err) {
            return res.status(500).json({ error: { code: null, msg: err.message }, data: null });
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
                return res.status(200).json({ error: { code: null, msg: null }, data: { cv: selected_cv, cvs: null } });
            }
        }
        catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null });
        }
    },

    updatCV: async (req, res) => {
        const selected_cv = await CV.findById({ _id: req.params.id })
        if (!selected_cv) {
            return res.status(404).json({ error: { code: res.statusCode, msg: "CV not found" }, data: null })
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

                return res.status(200).json({ error: { code: null, msg: null }, data: updatedCV });
            } catch (err) {
                return res.status(500).json({ error: { code: res.statusCode, msg: err }, data: null });
            }
        }
    },

    create_rankings: async (req, res) => {
        const new_CV_JD = new CV_JD({
            JD_ID: req.body.JD_ID,
            CV_ID: req.body.CV_ID,
            weighted_percentage: req.body.weighted_percentage,
            rank: req.body.rank,
            hire_status: req.body.hire_status
        });

        try {
            const savedCV_JD = await new_CV_JD.save()
            return res.status(200).json({ error: { code: null, msg: null }, data: "Rank Created" });
        } catch (err) {
            return res.status(500).json({ error: { code: null, msg: err }, data: null });
        }
    },

    update_rankings: async (req, res) => {

    }


}

const removeFiles = () => {
    fs.unlink('fileToBeRemoved', function (err) {
        if (err && err.code == 'ENOENT') {
            // file doens't exist
            console.info("File doesn't exist, won't remove it.");
        } else if (err) {
            // other errors, e.g. maybe we don't have enough permission
            console.error("Error occurred while trying to remove file");
        } else {
            console.info(`removed`);
        }
    });
}

module.exports = CVController;

