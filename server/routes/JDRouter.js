const router = require('express').Router()
const JDController = require('../controllers/JDController')
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_jd = require('../Middleware/upload_jd')
const path = require('path')

router.post('/createJD', upload_jd.single('JD') , JDController.createCV)

router.get('/getJD', JDController.getJD)

router.put('updateJD/:id', JDController.updateCV)

module.exports = router;
