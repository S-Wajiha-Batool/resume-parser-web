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
//const { promisify } = require('bluebird');
//const libre = require('libreoffice-convert');
const fs = require('fs').promises;
//let lib_convert = promisify(libre.convert)
//var unoconv = require('unoconv');
const { ObjectId } = require('mongodb');


const CVController = {

    getCv: async (req, res) => {
        try {
            if (!req.params.id) {
                const all_cvs = await CV.find({ is_active: { $eq: true } });
                return res.status(200).json({ error: { code: null, msg: null }, data: { all_cvs: all_cvs } });
            }

            else {
                console.log(req.params.id)
                const selected_cv = await CV.findById({ _id: req.params.id })
                console.log(selected_cv)
                const id = ObjectId(req.params.id);

                //getJds
                CV_JD.aggregate([
                    {
                        $match: { CV_ID: id }
                    },
                    {
                        $match: { "is_active_cv_jd": true }
                    },
                    {
                        $lookup: {
                            from: "jds",
                            localField: "JD_ID",
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
                                            }
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
                            return res.status(200).json({ error: { code: null, msg: null }, data: { cv: selected_cv, jds: result } });
                        }
                    });
            
            }
        }
        catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null });
        }
    },

    parseCV: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id)
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

            var saved_CVs = [];
            //uploading data to mongoDB
            const promisess = data.map(async (cv, index) => new Promise(async (resolve, reject) => {
                console.log(req.files[index].name)
                const new_CV = new CV({
                    uploaded_by: user._id,
                    full_name: cv.full_name,
                    phone_number: cv.phone_number,
                    emails: cv.emails,
                    experience: cv.experience,
                    //qualification: cv.qualification,
                    skills: cv.skills,
                    //universities: cv.universities,
                    links: cv.links,
                    cv_path: req.files[index].path,
                    cv_original_name: req.files[index].originalname
                    //cv_name: req.files[index].name
                });

                // if (newJd(position, department, experience, qualification, skills, universities).length === 0) {
                //     return res.status(404).json({ error: { code: res.statusCode, msg: 'Input data missing' }, data: null })
                // }
                const saved_CV = await new_CV.save();
                resolve(saved_CVs.push(saved_CV))
            }))

            await Promise.all(promisess)

            return res.status(200).json({ error: { code: null, msg: null }, data: { cvs: saved_CVs } });


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
            //console.log(ids[0].name)

            //const savedcCV = await new_CV.save()
           // return res.status(200).json({ error: { code: null, msg: null }, data: { data: data } });
        } catch (err) {
            return res.status(500).json({ error: { code: null, msg: err.message }, data: null });
        }

    },


    matchCV: async (req, res) => {
        try {
            var data = [] //array for scores after matching
            console.log('body', req.body)
            const jd = req.body.jd
            const cvs = req.body.cvs
            var options = {
                method: 'POST',
                uri: 'http://127.0.0.1:5000/match_cv',
                body: { jd, cvs },
                json: true
            };

            //api call to flask to get scores
            await new Promise(async (resolve, reject) => {
                await request(options)
                    .then(function (scores) {
                        console.log(scores);
                        resolve(data = scores)
                    })
                    .catch(function (err) {
                        console.log(err)
                        return res.status(500).json({ error: { code: res.statusCode, msg: "Error in CV matching" }, data: null })
                    });
            })

            const promises = cvs.map(async (cv, index) => new Promise(async (resolve, reject) => {
                const new_CV_JD = new CV_JD({
                    JD_ID: jd._id,
                    CV_ID: cv._id,
                    weighted_percentage: data[index]
                });
                resolve(await new_CV_JD.save())
            }))

            await Promise.all(promises)
            return res.status(200).json({ error: { code: null, msg: null }, data: data });

        } catch (err) {
            return res.status(500).json({ error: { code: null, msg: err.message }, data: null });
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

    deleteCvAgainstJd: async (req, res) => {
        try {
            console.log(req.body)
                const updatedCV = await CV_JD.findByIdAndUpdate(
                    ObjectId(req.params.id),
                    {
                        $set:  req.body, 
                    },
                    { new: true }
                );
                res.status(200).json({ error: { code: null, msg: null }, data: updatedCV });

            
        } catch (err) {
            res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null });
        }

    },

    delete_CV: async (req, res) => {
        try {
                const updatedCV = await CV.findByIdAndUpdate(
                    ObjectId(req.params.id),
                    {
                        $set:  req.body, 
                    },
                    { new: true }
                );
                res.status(200).json({ error: { code: null, msg: null }, data: updatedCV });            
        } catch (err) {
            res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null });
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

            return res.status(200).json({ error: { code: null, msg: null }, data: {count: count, highest_percentage: highest_percentage} });

        }
        catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null })
        }
    },

    increased_CV: async (req, res) => {
        try {
            const CVs = await CV.find();
            var date_ob = new Date();
            var count = 0;
            CVs.forEach(CV => {
                const diff = Math.abs(date_ob - CV.createdAt)
                console.log(date_ob)
                console.log(CV.createdAt)
                const d = diff / (1000 * 3600 * 24)
                console.log(d)
                if (d > 7){
                    count ++;
                }
            });
            const increased_percentage = (count / CVs.length) * 100;
            return res.status(200).json({ error: { code: null, msg: null }, data: increased_percentage });

        }
        catch (err) {
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null })
        }
    },

    test: async (req, res) => {
        try {
            let arr = req.files[0].filename.split('.')
            const sourceFilePath = path.resolve(`./uploaded_CVs/${req.files[0].filename}`);
        const outputFilePath = path.resolve(`./uploaded_CVs/${arr[0]}.pdf`);
        unoconv
            .convert(`./uploaded_CVs/${req.files[0].filename}`, `./uploaded_CVs/${arr[0]}.pdf`)
            .then(result => {
                console.log(result); // return outputFilePath
                return res.status(200).json({ error: { code: null, msg: null }, data: result });

            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null });

            });
// unoconv.convert(`./uploaded_CVs/${req.files[0].filename}`, 'pdf', function (err, result) {
// 	// result is returned as a Buffer
// 	fs.writeFile(`./uploaded_CVs/${arr[0]}.pdf`, result);
// });
            // console.log(req.files)
            // let arr = req.files[0].filename.split('.')
            
            // const enterPath = `./uploaded_CVs/${req.files[0].filename}`

            // const outputPath = `./uploaded_CVs/${arr[0]}.pdf`;
            // // Read file
            // let data = await fs.readFile(enterPath)
            // let done = await lib_convert(data, '.pdf', undefined)
            // await fs.writeFile(outputPath, done)
        } catch (err) {
            console.log(err)
            return res.status(500).json({ error: { code: res.statusCode, msg: err.message }, data: null });
        }
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

