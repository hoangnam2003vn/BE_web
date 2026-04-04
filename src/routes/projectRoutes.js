const express = require('express');
const router = express.Router();
const controller = require('../controllers/projectController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', controller.getAllProjects);
router.get('/:id', controller.getProject);

// Protected routes (Admin only)
router.use(auth, authorize('admin'));
router.post('/', upload.single('image'), (req, res, next) => {
  if (req.file) req.body.image = `/uploads/${req.file.filename}`;
  next();
}, controller.createProject);
router.patch('/:id', upload.single('image'), (req, res, next) => {
  if (req.file) req.body.image = `/uploads/${req.file.filename}`;
  next();
}, controller.updateProject);
router.delete('/:id', controller.deleteProject);

module.exports = router;
