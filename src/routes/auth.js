const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.patch('/me', auth, upload.single('avatar'), async (req, res, next) => {
  if (req.file) {
    req.body.avatar = `/uploads/${req.file.filename}`;
  }
  next();
}, updateProfile);

module.exports = router;
