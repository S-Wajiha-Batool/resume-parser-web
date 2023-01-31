const router = require('express').Router()
const CVController = require('../controllers/CVController')
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_cv = require('../Middleware/upload_cv')
const fileFilterMiddleware = require('../Middleware/fileSizeHandler')
const path = require('path');
const { Router } = require('express');

router.post('/parse_cv', verifyToken , upload_cv.array('files') , fileFilterMiddleware, CVController.parseCV)

router.get('/getCV/:id?', CVController.getCV)

router.put('/updateCV/:id', CVController.updatCV)

//router.get('/getallCV/:id', CVController.getallCV) //JD ID will be given

router.post('/create_rankings', CVController.create_rankings)

module.exports = router;
