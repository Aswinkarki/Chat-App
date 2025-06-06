const express = require('express');
const multer = require('multer');
const registerUser = require('../controller/registerUser');
const checkEmail = require('../controller/checkEmail');
const checkPassword = require('../controller/checkPassword');
const userDetails = require('../controller/userDetails');
const logout = require('../controller/logout');
const updateUserDetails = require('../controller/updateUserDetails');
const searchUser = require('../controller/searchUser');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // Ensure this directory exists
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Apply multer middleware to the register route
router.post('/register', upload.single('profile_pic'), registerUser);

router.post('/email', checkEmail);
router.post('/password', checkPassword);
router.get('/user-details', userDetails);
router.get('/logout', logout);
router.post('/update-user', updateUserDetails);
router.post('/search', searchUser);

module.exports = router;