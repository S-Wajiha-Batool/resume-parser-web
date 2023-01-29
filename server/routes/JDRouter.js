const router = require('express').Router()
const JDController = require('../controllers/JDController')
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');
const upload_jd = require('../Middleware/upload_jd')
const path = require('path')

router.post('/upload_jd', verifyToken, JDController.createJD)

router.get('/get_jd/:id?',verifyToken, JDController.getJD)

router.put('/update_jd/:id', verifyToken, JDController.updateJD)

router.put('/delete_jd/:id', verifyToken, JDController.delete_JD)

module.exports = router;
