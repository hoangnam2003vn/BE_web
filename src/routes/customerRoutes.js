const express = require('express');
const router = express.Router();
const controller = require('../controllers/customerController');
const { auth, authorize } = require('../middleware/auth');

// Anyone can send a message
router.post('/', controller.createCustomer);

// Admin only
router.use(auth, authorize('admin'));
router.get('/', controller.getAllCustomers);
router.get('/:id', controller.getCustomer);
router.patch('/:id', controller.updateCustomer);
router.delete('/:id', controller.deleteCustomer);

module.exports = router;
