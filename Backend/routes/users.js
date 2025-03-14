const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadSingleImage, handleMulterErrors } = require('../middleware/upload');


router.get('/profile/:id', userController.getProfileById);
router.get('/stats/:id', userController.getUserStats);

router.use(protect);

router.get('/stats', userController.getUserStats);
router.get('/profile', userController.getProfileById);
router.put('/profile', userController.updateProfile);
router.put('/profile-picture', uploadSingleImage, handleMulterErrors, userController.updateProfilePicture);
router.put('/change-password', userController.changePassword);
router.delete('/account', userController.deleteAccount);
router.delete('/profile-picture', userController.resetProfilePicture);

module.exports = router;