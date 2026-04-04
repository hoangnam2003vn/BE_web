const express = require('express');
const router = express.Router();
const controller = require('../controllers/serviceController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', controller.getAllServices);
router.get('/:id', controller.getService);

// Admin only
router.use(auth, authorize('admin'));
router.post('/', upload.single('icon'), (req, res, next) => {
  if (req.file) req.body.icon = `/uploads/${req.file.filename}`;
  next();
}, controller.createService);
router.patch('/:id', upload.single('icon'), (req, res, next) => {
  if (req.file) req.body.icon = `/uploads/${req.file.filename}`;
  next();
}, controller.updateService);
router.delete('/:id', controller.deleteService);

module.exports = router;
