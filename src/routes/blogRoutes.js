const express = require('express');
const router = express.Router();
const controller = require('../controllers/blogController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', controller.getAllBlogs);
router.get('/:id', controller.getBlog);

// Protected routes (Admin only)
router.use(auth, authorize('admin'));
router.post('/', upload.single('thumbnail'), (req, res, next) => {
  if (req.file) req.body.thumbnail = `/uploads/${req.file.filename}`;
  if (!req.body.author) req.body.author = req.user._id;
  next();
}, controller.createBlog);
router.patch('/:id', upload.single('thumbnail'), (req, res, next) => {
  if (req.file) req.body.thumbnail = `/uploads/${req.file.filename}`;
  next();
}, controller.updateBlog);
router.delete('/:id', controller.deleteBlog);

module.exports = router;
