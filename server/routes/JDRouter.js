const router = require('express').Router()
const JDController = require('../controllers/JDController')
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_jd = require('../Middleware/upload_jd')
const path = require('path')
const { Router } = require('express');

router.post('/upload_jd', verifyToken, JDController.createJD)

router.get('/get_jd/:id?',verifyToken, JDController.getJD)

router.patch('/update_jd/:id', verifyToken, JDController.updateJD)

router.patch('/delete_jd/:id', verifyToken, JDController.delete_JD)

router.get('/get_job_details/:id', JDController.get_job_details)

router.get('/increased_jds', verifyToken, JDController.increased_JD)

router.get('/highest_rank', JDController.highest_rank)

router.get('/JD_count', JDController.JD_count)

router.get('/JD_distribution', JDController.JD_distribution)

module.exports = router;
