const router = require('express').Router()
const CVController = require('../controllers/CVController')
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_cv = require('../Middleware/upload_cv')
const path = require('path')

router.post('/createCV', upload_cv.single('CV') , CVController.createCV)

router.get('/getCV', CVController.getCV)

router.put('updateCV/:id', CVController.updateCV)

module.exports = router;
