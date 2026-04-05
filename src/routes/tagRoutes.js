const express = require('express');
const router = express.Router();
const controller = require('../controllers/tagController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', controller.getAllTags);
router.get('/:id', controller.getTag);

// Admin only
router.use(auth, authorize('admin'));
router.post('/', controller.createTag);
router.patch('/:id', controller.updateTag);
router.delete('/:id', controller.deleteTag);

module.exports = router;
