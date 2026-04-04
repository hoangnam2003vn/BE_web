const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoryController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', controller.getAllCategories);
router.get('/:id', controller.getCategory);

// Admin only
router.use(auth, authorize('admin'));
router.post('/', controller.createCategory);
router.patch('/:id', controller.updateCategory);
router.delete('/:id', controller.deleteCategory);

module.exports = router;
