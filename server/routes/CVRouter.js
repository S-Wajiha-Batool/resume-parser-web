const router = require('express').Router()
const CVController = require('../controllers/CVController')
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_cv = require('../Middleware/upload_cv')
const path = require('path');
const { Router } = require('express');

router.post('/createCV', upload_cv.single('CV') , CVController.createCv)

router.get('/getCV/:id?', CVController.getCV)

router.put('/updateCV/:id', CVController.updatCV)

router.get('/getallCV/:id', CVController.getallCV) //JD ID will be given

module.exports = router;
