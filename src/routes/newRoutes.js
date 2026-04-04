const express = require('express');
const router = express.Router();
const controller = require('../controllers/newModelsController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/products', controller.getAllProducts);
router.get('/products/:id', controller.getOneProduct);

// Admin Only
router.use(auth, authorize('admin'));

// Product CRUD
router.post('/products', upload.single('image'), (req, res, next) => {
  if (req.file) req.body.image = `/uploads/${req.file.filename}`;
  next();
}, controller.createProduct);
router.patch('/products/:id', upload.single('image'), (req, res, next) => {
  if (req.file) req.body.image = `/uploads/${req.file.filename}`;
  next();
}, controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);

// Orders
router.get('/orders', controller.getAllOrders);
router.get('/orders/:id', controller.getOneOrder);
router.post('/orders', controller.createOrder);
router.patch('/orders/:id', controller.updateOrder);
router.delete('/orders/:id', controller.deleteOrder);

// Roles
router.get('/roles', controller.getAllRoles);
router.post('/roles', controller.createRole);
router.patch('/roles/:id', controller.updateRole);
router.delete('/roles/:id', controller.deleteRole);

// Settings
router.get('/settings', controller.getAllSettings);
router.patch('/settings/:id', controller.updateSetting);

// AuditLogs
router.get('/auditlogs', controller.getAllAuditLogs);

module.exports = router;
