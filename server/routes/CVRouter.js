const router = require('express').Router()
const CVController = require('../controllers/CVController')
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_cv = require('../Middleware/upload_cv')
const fileFilterMiddleware = require('../Middleware/fileSizeHandler')
const path = require('path');
const { Router } = require('express');

router.post('/parse_cv', verifyToken, upload_cv.array('files') , fileFilterMiddleware, CVController.parseCV)

router.post('/match_cv', verifyToken, CVController.matchCV)

router.get('/get_cv/:id?', verifyToken,CVController.getCv)

router.put('/updateCV/:id', CVController.updatCV)

router.post('/test_upload_cv', upload_cv.array('files'), CVController.test)
//router.get('/getallCV/:id', CVController.getallCV) //JD ID will be given


module.exports = router;
