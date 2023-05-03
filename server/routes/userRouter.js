const router = require('express').Router()
const userController = require('../controllers/userController')
const { verifyToken, verifyTokenAndAuth } = require('../middleware/verifyToken');



router.post('/login', userController.login)

router.get('/logout', verifyToken, userController.logout)

router.get('/profile/:id?', verifyToken , userController.profile) 

router.post('/send_email', userController.sendEmail)

router.post('/change_password',userController.changePassword)

router.get('/users', verifyToken, userController.getAllUsers) 

router.get('/refresh_token', userController.refreshToken)

router.post('/create_user', verifyToken, userController.createUser)

router.patch('/update_user_info/:id?', verifyToken, userController.updateUser)


module.exports = router;
