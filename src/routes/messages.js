const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const controller = require('../controllers/messageController');

// All routes require auth header x-user-id
router.use(auth);

// GET /messages/:userId - get all messages between current user and userId
router.get('/:userId', controller.getConversation);

// POST /messages - send a message. For file upload, use multipart/form-data and field name 'file'
router.post('/', upload.single('file'), controller.postMessage);

// GET /messages - get last message per conversation (other user)
router.get('/', controller.getLatestPerUser);

module.exports = router;
